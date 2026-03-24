// Support for both standard and WebKit-prefixed implementations
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VoiceServiceOptions {
  onStart?: () => void;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  language?: string;
}

export class VoiceService {
  private recognition: any = null;
  private isListening = false;

  constructor(options: VoiceServiceOptions) {
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      if (options.onError) options.onError("Browser not supported");
      return;
    }

    this.recognition = new SpeechRecognition();
    
    // Chrome does well with continuous listening (allowing pauses without cutting off), 
    // but iOS Safari requires continuous=false to work reliably.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    this.recognition.continuous = !isIOS; 
    this.recognition.interimResults = false;
    this.recognition.lang = options.language || 'en-ZA'; // default to SA English, but handles local accents well

    let finalTranscript = '';

    this.recognition.onstart = () => {
      this.isListening = true;
      finalTranscript = '';
      if (options.onStart) options.onStart();
    };

    this.recognition.onresult = (event: any) => {
      if (!event.results || event.results.length === 0) return;
      let currentResult = '';
      for (let i = 0; i < event.results.length; i++) {
        currentResult += event.results[i][0].transcript + ' ';
      }
      finalTranscript = currentResult;
    };

    this.recognition.onerror = (event: any) => {
      let message = `Speech recognition error: ${event.error}`;
      if (event.error === 'not-allowed') {
        message = "Microphone access denied. Please check your iPhone Settings > Safari > Microphone.";
      } else if (event.error === 'no-speech') {
        // It's common on iOS to time out if no speech is detected immediately
        message = "No speech was detected. Please try again.";
      } else if (event.error === 'aborted') {
        return; // Ignore manual aborts
      }
      if (options.onError) options.onError(message);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      
      const textToSubmit = finalTranscript.trim();
      if (textToSubmit.length > 0) {
        if (options.onResult) options.onResult(textToSubmit);
      }
      finalTranscript = '';

      if (options.onEnd) options.onEnd();
    };
  }

  public start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error("Failed to start speech recognition", e);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public isSupported() {
    return !!SpeechRecognition;
  }
}

/**
 * Uses Google Gemini AI to parse the voice transcript into a structured JSON intent.
 * Note: For this Phase 1 prototype, the API key is used client-side for immediate testing.
 * In a full production environment, this exact prompt logic should be moved to a Supabase Edge Function!
 */
export const extractIntentFromText = async (transcript: string): Promise<any> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Google Gemini API Key is missing! Please add VITE_GEMINI_API_KEY to your .env.local file.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-pro (1.0) to ensure 100% availability on all free-tier accounts regardless of region
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are an AI assistant for a Cattle Management app.
Extract the intended action and data from the farmer's voice transcript.
Correct any obvious speech-to-text spelling errors (e.g., "0985" -> "C-1098", "book golf" -> "bull calf", "oxy tetra cycline" -> "oxytetracycline", "giffgaff" -> "give cow").

Return ONLY a valid JSON object. Do not wrap it in markdown or backticks.

Expected JSON Format:
{
  "action": "add_animal" | "add_health_log",
  "data": {
    "tagNumber": "C-123" (Extract and format the tag nicely, e.g., C-1098),
    "species": "Cattle",
    "sex": "Male" | "Female" | "Unknown",
    "dateOfBirth": "YYYY-MM-DD" (calculate relative to today if they say "today" or "yesterday"),
    "treatmentType": "Medication" | "Vaccine" | "Procedure",
    "medication": "Name of drug",
    "dosage": "5ml" (keep unit),
    "dateAdministered": "YYYY-MM-DD"
  }
}

Transcript: "${transcript}"`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Fallback cleanup in case the LLM wraps it in markdown despite instructions
    if (responseText.startsWith('\`\`\`json')) {
      responseText = responseText.replace(/^\`\`\`json/g, '').replace(/\`\`\`$/g, '').trim();
    } else if (responseText.startsWith('\`\`\`')) {
      responseText = responseText.replace(/^\`\`\`/g, '').replace(/\`\`\`$/g, '').trim();
    }

    return JSON.parse(responseText);
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    let errorMsg = error.message || String(error);
    throw new Error(`AI Error: ${errorMsg}`);
  }
};
