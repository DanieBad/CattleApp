/**
 * VoiceService handles audio recording and uses OpenAI Whisper for transcription,
 * then GPT-4o-mini for intent extraction.
 * 
 * Includes a fallback to native SpeechRecognition if Whisper API is blocked.
 */

const SpeechRecognitionFallback = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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
  private recognitionFallback: any = null;

  constructor(options: VoiceServiceOptions) {
    this.options = options;
    
    if (SpeechRecognitionFallback) {
      this.recognitionFallback = new SpeechRecognitionFallback();
      this.recognitionFallback.continuous = false;
      this.recognitionFallback.interimResults = false;
      this.recognitionFallback.lang = options.language || 'en-ZA';
      
      this.recognitionFallback.onresult = (event: any) => {
        const textToSubmit = event.results[0][0].transcript;
        if (textToSubmit && this.options.onResult) {
          this.options.onResult(textToSubmit);
        }
      };
      
      this.recognitionFallback.onerror = (event: any) => {
        if (this.options.onError) this.options.onError(`Fallback Error: ${event.error}`);
      };
      
      this.recognitionFallback.onend = () => {
        this.isListening = false;
        if (this.options.onEnd) this.options.onEnd();
      };
    }
  }

  public async start() {
    if (this.isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
      
      this.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstart = () => {
        this.isListening = true;
        if (this.options.onStart) this.options.onStart();
      };

      this.mediaRecorder.onstop = async () => {
        const actualMimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, actualMimeType ? { type: actualMimeType } : {});
        
        try {
          const extension = actualMimeType.includes('mp4') ? 'm4a' : 'webm';
          const transcript = await transcribeAudioWithWhisper(audioBlob, extension);
          if (transcript && this.options.onResult) {
            this.options.onResult(transcript);
          }
        } catch (err: any) {
          console.warn("Whisper failed, falling back to native engine...", err);
          if (this.recognitionFallback) {
            this.isListening = false;
            this.startFallback(); 
          } else {
            if (this.options.onError) this.options.onError("Failed to connect to voice engine.");
          }
        }

        this.isListening = false;
        if (this.options.onEnd) this.options.onEnd();
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
    } catch (err: any) {
      console.warn("MediaRecorder start failed, using native fallback", err);
      this.startFallback();
    }
  }

  private startFallback() {
    if (this.recognitionFallback && !this.isListening) {
      this.isListening = true;
      if (this.options.onStart) this.options.onStart();
      this.recognitionFallback.start();
    }
  }

  public stop() {
    if (this.mediaRecorder && this.isListening) {
      this.mediaRecorder.stop();
    } else if (this.recognitionFallback && this.isListening) {
      this.recognitionFallback.stop();
    }
  }

  public isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || !!SpeechRecognitionFallback;
  }
}

/**
 * Transcribes audio using OpenAI Whisper API.
 */
export const transcribeAudioWithWhisper = async (audioBlob: Blob, extension: string = 'webm'): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API Key is missing!');

  const formData = new FormData();
  formData.append('file', audioBlob, `recording.${extension}`);
  formData.append('model', 'whisper-1');
  formData.append('prompt', 'A farmer talking about cattle, cows, bulls, calves, vaccinations, and all my cattle.');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "API Error");
  }

  const data = await response.json();
  return data.text;
};

/**
 * Uses OpenAI GPT-4o-mini to parse the voice transcript into a structured JSON intent.
 */
export const extractIntentFromText = async (transcript: string): Promise<any> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API Key is missing!');

  const today = new Date().toISOString().split('T')[0];
  const prompt = `You are an AI assistant for a Cattle Management app.
Extract the intended action and data from the farmer's voice transcript.
Today's Date: ${today}

### RULES:
1. **LITERAL TAGS ONLY**: IDs must only be digits/letters (e.g. "315").
2. **BATCH ACTIONS**: Recognize "all my cattle", "the whole herd", "entire herd", "everything".
3. **BATCH SCHEMA**: If a batch action is detected, set "isBatch": true.
4. **DAM/MOTHER**: "to cow 315" means 315 is motherTag.
5. **PHONETIC CORRECTION**: "bull golf" -> bull calf, "Go 315" -> Cow 315.

Expected JSON Format:
{
  "action": "add_animal" | "add_health_log",
  "isBatch": boolean,
  "data": {
    "tagNumber": "[ID]",
    "motherTag": "[DAM_ID]",
    "species": "Cattle",
    "sex": "Male" | "Female" | "Unknown",
    "dateOfBirth": "YYYY-MM-DD",
    "treatmentType": "Vaccination" | "Deworming" | "Other",
    "medication": "[MED]",
    "dosage": "[DOSE]",
    "dateAdministered": "YYYY-MM-DD"
  }
}

Transcript: "${transcript}"`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You extract JSON from cattle transcripts. Handle "all cattle" commands.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) throw new Error("AI Intent Extraction Failed");
  const result = await response.json();
  const parsed = JSON.parse(result.choices[0].message.content);
  
  // Flatten isBatch into the data object for easier modal handling
  if (parsed.isBatch) {
    parsed.data.isBatch = true;
    parsed.data.tagNumber = "ALL ACTIVE HERD";
  }
  
  return parsed;
};
