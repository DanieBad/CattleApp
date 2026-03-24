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
      if (!event.results || event.results.length === 0) return;
      const transcript = event.results[0][0].transcript;
      if (options.onResult) options.onResult(transcript);
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
  
  // Relaxing "add" requirement since STT often hears "at", "had", or "new"
  const isAddAction = lower.includes('add') || lower.includes('at') || lower.includes('had') || lower.includes('new');
  const hasAnimalType = lower.includes('calf') || lower.includes('cow') || lower.includes('bull');
  
  if (isAddAction && hasAnimalType) {
    const isBull = lower.includes('bull');
    
    // Improved regex to capture tags with hyphens or numbers (like c-1098)
    let motherTag = 'UNKNOWN';
    const match = lower.match(/(?:cow|to|tag|mother)\s+([a-z0-9\-]+)/);
    if (match && match[1]) {
      motherTag = match[1].toUpperCase();
    }
    
    return {
      action: 'add_animal',
      data: {
        species: 'Cattle',
        sex: isBull ? 'Male' : 'Female',
        tagNumber: motherTag + (lower.includes('calf') ? '-CALF' : ''),
        dateOfBirth: lower.includes('today') ? new Date().toISOString().split('T')[0] : undefined,
        status: 'Active',
      }
    };
  }
  
  throw new Error(`Could not clearly understand the intent from what ran: "${transcript}". Please try saying 'Add a bull calf to cow C-1098'.`);
};
