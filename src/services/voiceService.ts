/**
 * VoiceService handles audio recording and uses OpenAI Whisper for transcription,
 * then GPT-4o-mini for intent extraction.
 */

export interface VoiceServiceOptions {
  onStart?: () => void;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  language?: string;
}

export class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isListening = false;
  private options: VoiceServiceOptions;

  constructor(options: VoiceServiceOptions) {
    this.options = options;
  }

  public async start() {
    if (this.isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // iOS Safari support: prefer audio/mp4 if webm isn't available
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
      
      this.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isListening = true;
        if (this.options.onStart) this.options.onStart();
      };

      this.mediaRecorder.onstop = async () => {
        this.isListening = false;
        const actualMimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: actualMimeType });
        
        try {
          // Use appropriate extension based on mimeType
          const extension = actualMimeType.includes('mp4') ? 'm4a' : 'webm';
          const transcript = await transcribeAudioWithWhisper(audioBlob, extension);
          if (transcript && this.options.onResult) {
            this.options.onResult(transcript);
          }
        } catch (err: any) {
          if (this.options.onError) this.options.onError(err.message);
        }

        if (this.options.onEnd) this.options.onEnd();
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
    } catch (err: any) {
      console.error("Failed to start audio recording:", err);
      let message = "Could not access microphone.";
      if (err.name === 'NotAllowedError') {
        message = "Microphone access denied. Please check your browser settings.";
      }
      if (this.options.onError) this.options.onError(message);
    }
  }

  public stop() {
    if (this.mediaRecorder && this.isListening) {
      this.mediaRecorder.stop();
    }
  }

  public isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}

/**
 * Transcribes audio using OpenAI Whisper API.
 */
export const transcribeAudioWithWhisper = async (audioBlob: Blob, extension: string = 'webm'): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API Key is missing! (Check Vercel Env Vars)');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, `recording.${extension}`);
  formData.append('model', 'whisper-1');
  
  // prompt helps with specific terminology
  formData.append('prompt', 'A farmer talking about cattle, cows, bulls, calves, and medical treatments like penicillin.');

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Whisper API Error (${response.status})`);
    }

    const data = await response.json();
    return data.text;
  } catch (error: any) {
    console.error("Whisper Transcription Error:", error);
    throw error;
  }
};

/**
 * Uses OpenAI GPT-4o-mini to parse the voice transcript into a structured JSON intent.
 */
export const extractIntentFromText = async (transcript: string): Promise<any> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API Key is missing!');
  }

  const today = new Date().toISOString().split('T')[0];
  const prompt = `You are an AI assistant for a Cattle Management app.
Extract the intended action and data from the farmer's voice transcript.
Today's Date: ${today}

### RULES:
1. **LITERAL TAGS ONLY**: Tag numbers must only contain digits and letters (e.g., "315", "C102"). 
2. **NO TEMPORAL TAGS**: Never use words like "MORNING", "TODAY", "YESTERDAY", "NOW" as a tag number.
3. **MOTHER RELATIONSHIP**: Phrases like "to cow 315", "cow 315 gave birth", "from 315" mean 315 is the mother (dam_id).
4. **GENERATED TAGS**: If the new animal's tag is not spoken, generate one as [MotherTag]-C1 (e.g., "315-C1").
5. **SEX DETECTION**: "bull calf" -> Male, "heifer" -> Female, "cow" -> Female, "bull" -> Male.

Expected JSON Format:
{
  "action": "add_animal" | "add_health_log",
  "data": {
    "tagNumber": "[CLEAN_TAG]",
    "motherTag": "[MOTHER_TAG_IF_ANY]",
    "species": "Cattle",
    "sex": "Male" | "Female" | "Unknown",
    "dateOfBirth": "YYYY-MM-DD",
    "treatmentType": "Medication" (for health logs),
    "medication": "[MED_NAME]",
    "dosage": "[DOSAGE]",
    "dateAdministered": "YYYY-MM-DD"
  }
}

Transcript: "${transcript}"`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You extract structured JSON from cattle farm transcripts. Be extremely strict about tag numbers.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenAI API Error (${response.status})`);
    }

    const result = await response.json();
    const responseText = result.choices[0].message.content.trim();
    const parsedData = JSON.parse(responseText);
    
    console.log("Voice Assistant Diagnostic:", {
      transcript: transcript,
      interpretedJSON: parsedData
    });

    return parsedData;
  } catch (error: any) {
    console.error("Intent Extraction Error:", error);
    // Return a basic fallback if AI parsing fails
    return {
      action: transcript.toLowerCase().includes('give') ? 'add_health_log' : 'add_animal',
      data: { tagNumber: 'UNKNOWN', transcript_raw: transcript }
    };
  }
};
