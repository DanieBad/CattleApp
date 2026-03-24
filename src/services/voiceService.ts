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
  
  // Handle STT misinterpretations like "book golf" (bull calf) or "car" (cow)
  const hasAnimalType = lower.includes('calf') || lower.includes('cow') || lower.includes('bull') || lower.includes('golf') || lower.includes('book');
  
  if (isAddAction && hasAnimalType) {
    const isBull = lower.includes('bull') || lower.includes('book');
    const isCalf = lower.includes('calf') || lower.includes('golf');
    
    // Improved regex to capture tags with hyphens or numbers (like c-1098 or car number 1098)
    let motherTag = 'UNKNOWN';
    const match = lower.match(/(?:cow|to|tag|mother|car(?:\s+number)?)\s*([a-z0-9\-]+)/i);
    if (match && match[1]) {
      motherTag = match[1].toUpperCase();
      // If it heard "car number 1098", we might want to manually prepend the 'C-' if it missed the letter
      if (motherTag.match(/^[0-9]+$/)) {
        motherTag = 'C-' + motherTag; 
      }
    }
    
    return {
      action: 'add_animal',
      data: {
        species: 'Cattle',
        sex: isBull ? 'Male' : 'Female',
        tagNumber: motherTag + (isCalf ? '-CALF' : ''),
        dateOfBirth: lower.includes('today') ? new Date().toISOString().split('T')[0] : undefined,
        status: 'Active',
      }
    };
  }
  
  // Health / Treatment Action
  const isTreatAction = lower.includes('give') || lower.includes('treat') || lower.includes('dose') || lower.includes('medicate') || lower.includes('inject') || lower.includes('giffgaff');
  if (isTreatAction) {
    let targetTag = 'UNKNOWN';
    
    // Try strict match first
    let matchTag = lower.match(/(?:cow|calf|bull|heifer|to|tag|animal)\s+([a-z0-9\-]+)/i);
    if (!matchTag) {
        // Fallback: look for exactly something like c - 1098 or c-1098 anywhere
        matchTag = lower.match(/([a-z]\s*-\s*[0-9]+)/i);
    }

    if (matchTag && matchTag[1]) {
      targetTag = matchTag[1].replace(/\s+/g, '').toUpperCase();
      if (targetTag.match(/^[0-9]+$/)) targetTag = 'C-' + targetTag;
    }

    let dosage = '';
    const doseMatch = lower.match(/([0-9\.]+\s*(?:ml|cc|mg|g|tablets?|pills?))/i);
    if (doseMatch) dosage = doseMatch[1].replace(/\s+/g, '');

    let medication = 'Unknown';
    const medMatch = lower.match(/(?:of|with)\s+([a-z\s]+?)(?:\s+today|\s+yesterday|$)/i);
    if (medMatch && medMatch[1]) medication = medMatch[1].trim();

    // Capitalize medication nicely
    medication = medication.charAt(0).toUpperCase() + medication.slice(1);

    return {
      action: 'add_health_log',
      data: {
        tagNumber: targetTag,
        treatmentType: 'Medication',
        dosage: dosage,
        medication: medication,
        dateAdministered: lower.includes('yesterday') ? new Date(Date.now() - 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }
    };
  }

  throw new Error(`Could not clearly understand the intent from what ran: "${transcript}". Please try saying 'Add a bull calf to cow C-1098' or 'Give cow C-1098 5ml of oxytetracycline'.`);
};
