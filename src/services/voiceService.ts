// Support for both standard and WebKit-prefixed implementations
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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
    this.recognition.continuous = false; // Stop listening after one phrase
    this.recognition.interimResults = false;
    this.recognition.lang = options.language || 'en-ZA'; // default to SA English, but handles local accents well

    this.recognition.onstart = () => {
      this.isListening = true;
      if (options.onStart) options.onStart();
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (options.onResult) options.onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      let message = "An error occurred with speech recognition.";
      if (event.error === 'not-allowed') {
        message = "Microphone access denied. Please allow microphone permissions.";
      }
      if (options.onError) options.onError(message);
    };

    this.recognition.onend = () => {
      this.isListening = false;
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
 * Mocks an AI / LLM intent extraction call.
 * In production (Phase 1), this would call a Supabase Edge Function to parse text with OpenAI/Gemini.
 * In Phase 2, this could run a WASM local model.
 */
export const extractIntentFromText = async (transcript: string): Promise<any> => {
  // Simulate network or AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const lower = transcript.toLowerCase();
  
  if (lower.includes('add') && (lower.includes('calf') || lower.includes('cow') || lower.includes('bull'))) {
    const isBull = lower.includes('bull');
    
    // Very rudimentary regex for the mock "cow xyz" -> extract "xyz"
    let motherTag = 'UNKNOWN';
    const match = lower.match(/(?:cow|tag)\s+([a-z0-9]+)/);
    if (match && match[1]) {
      motherTag = match[1].toUpperCase();
    }
    
    return {
      action: 'add_animal',
      data: {
        species: 'Cattle',
        sex: isBull ? 'Male' : 'Female',
        tagNumber: motherTag + '-CALF', // Just simulating a tag generation for now
        dateOfBirth: lower.includes('today') ? new Date().toISOString().split('T')[0] : undefined,
        status: 'Active',
      }
    };
  }
  
  throw new Error("Could not clearly understand the intent. Please try saying 'Add a bull calf to cow XYZ, born today'.");
};
