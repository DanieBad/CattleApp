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
          const transcript = await transcribeAudioWithWhisper(audioBlob, extension, this.options.language);
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
export const transcribeAudioWithWhisper = async (audioBlob: Blob, extension: string = 'webm', language: string = 'en-ZA'): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API Key is missing!');

  const isAfrikaans = language.startsWith('af');
  const whisperPrompt = isAfrikaans 
    ? ' n Boer wat praat oor beeste, skape, koeie, bulle, kalwers, skaap, inentings, ontwurming, en al my diere.'
    : 'A farmer talking about cattle, sheep, cows, bulls, calves, vaccinations, deworming, and all my animals.';

  const formData = new FormData();
  formData.append('file', audioBlob, `recording.${extension}`);
  formData.append('model', 'whisper-1');
  formData.append('prompt', whisperPrompt);
  if (isAfrikaans) formData.append('language', 'af');

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
export const extractIntentFromText = async (transcript: string, language: string = 'en-ZA'): Promise<any> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API Key is missing!');

  const today = new Date().toISOString().split('T')[0];
  const isAfrikaans = language.startsWith('af');

  const systemMessage = isAfrikaans
    ? 'Jy is \'n assistent vir \'n bees- en skaapbestuur-toepassing. Jy onttrek JSON uit transkripsies.'
    : 'You are an AI assistant for a Cattle and Sheep Management app. You extract JSON from transcripts.';

  const prompt = `Today's Date: ${today}
Extract the intended action and data from the transcript.

### RULES:
1. **BATCH ACTIONS**: Recognize "all my cattle", "all my sheep", "all skape", "al my beeste", "whole herd", "everything in camp X".
2. **BATCH FILTERS**: If batch action, set "isBatch": true.
3. **SPECIES**: If transcript mentions "sheep" or "skape", set "targetSpecies" to "Sheep". If "cattle" or "beeste", set to "Cattle".
4. **TREATMENTS**: "dewormed" or "ontwurm" -> treatmentType: "Deworming". "vaccinated" or "ingeënt" -> Vaccination. "checkup" -> Checkup.
5. **FALLBACK TAGS**: If adding animal and no tag spoken, set "tagNumber" to "[motherTag]-C1".

Expected JSON Format:
{
  "action": "add_animal" | "add_health_log",
  "isBatch": boolean,
  "data": {
    "tagNumber": "[ID or Group Name]",
    "targetSpecies": "Cattle" | "Sheep" | null,
    "motherTag": "[DAM_ID]",
    "species": "Cattle" | "Sheep",
    "sex": "Male" | "Female" | "Unknown",
    "dateOfBirth": "YYYY-MM-DD",
    "treatmentType": "Vaccination" | "Deworming" | "Other" | "Checkup",
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
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) throw new Error("AI Intent Extraction Failed");
  const result = await response.json();
  const parsed = JSON.parse(result.choices[0].message.content);
  
  if (parsed.isBatch) {
    parsed.data.isBatch = true;
    
    // Normalize targetSpecies if AI missed it but it was in the text
    const textLower = transcript.toLowerCase();
    if (!parsed.data.targetSpecies) {
      if (textLower.includes('sheep') || textLower.includes('skaap') || textLower.includes('skape')) {
        parsed.data.targetSpecies = 'Sheep';
      } else if (textLower.includes('cattle') || textLower.includes('beeste')) {
        parsed.data.targetSpecies = 'Cattle';
      }
    }

    const speciesText = parsed.data.targetSpecies === 'Sheep' ? (isAfrikaans ? "AL MY SKAPE" : "ALL MY SHEEP") : (isAfrikaans ? "AL MY BEESTE" : "ALL ACTIVE HERD");
    parsed.data.tagNumber = speciesText;
  }

  // Force Fallback Tag naming convention
  if (parsed.action === 'add_animal') {
    const rawTag = parsed.data.tagNumber ? parsed.data.tagNumber.toString().toUpperCase() : 'UNKNOWN';
    const isGenericTag = ['UNKNOWN', 'C1', 'CALF', 'PENDING', 'LAMB'].includes(rawTag);
    
    if (isGenericTag && parsed.data.motherTag) {
      parsed.data.tagNumber = `${parsed.data.motherTag}-C1`;
    } else if (!parsed.data.tagNumber) {
      parsed.data.tagNumber = "PENDING";
    }
  }
  
  return parsed;
};
