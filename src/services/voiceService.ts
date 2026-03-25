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
 * Uses OpenAI GPT-4o-mini to parse the voice transcript into a structured JSON intent.
 * Note: For this Phase 1 prototype, the API key is used client-side for immediate testing.
 */
export const extractIntentFromText = async (transcript: string): Promise<any> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API Key is missing! Please add VITE_OPENAI_API_KEY to your .env.local file.');
  }

  const today = new Date().toISOString().split('T')[0];
  const prompt = `You are an AI assistant for a Cattle Management app.
Extract the intended action and data from the farmer's voice transcript.
Today's Date: ${today}

- "buu golf", "buclz", "bucles", "bul kalf", "book called", "book calf", "book a table" -> "bull calf"
- "0985", "c1006", "315" -> BE LITERAL. Only use the exact digits/letters spoken. Do NOT add extra hyphens, zeros, or "C-" prefixes.
- "at a", "adder" -> "add a"
- "porn", "pawn" -> "born"
- "koei", "vers" -> "cow" (Female)
- "bul", "os" -> "bull" (Male)
- "gister" -> "yesterday"
- "vandag" -> "today"
- "gee", "giff" -> "give"
- "dose", "dosis" -> "dosage"

Note: "to cow [X]" ALWAYS means X is the mother (dam_id), NOT the animal being added.

Expected JSON Format:
{
  "action": "add_animal" | "add_health_log",
  "data": {
    "tagNumber": "[LITERAL_TAG]" (The UNIQUE tag for the NEW animal. If not spoken, generate one like [MotherTag]-C1),
    "motherTag": "[LITERAL_TAG]" (The tag of the cow that gave birth, if mentioned),
    "species": "Cattle",
    "sex": "Male" | "Female" | "Unknown",
    "dateOfBirth": "YYYY-MM-DD"
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
          { role: 'system', content: 'You extract structured JSON from cattle farm voice transcripts.' },
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
    return JSON.parse(responseText);
  } catch (error: any) {
    console.error("OpenAI API Error, falling back to local parser:", error);
    return parseLocalFallback(transcript);
  }
};

/**
 * A robust local regex-based parser that acts as a fallback when AI is unavailable.
 * It handles common cattle management phrases and formatting.
 */
const parseLocalFallback = (transcript: string): any => {
  const lower = transcript.toLowerCase();
  
  // 1. ADD ANIMAL Intent
  const isAdd = lower.includes('add') || lower.includes('new') || lower.includes('born') || lower.includes('at a') || lower.includes('porn');
  const isAnimal = lower.includes('calf') || lower.includes('cow') || lower.includes('bull') || lower.includes('heifer') || lower.includes('golf') || lower.includes('book');
  
  if (isAdd && isAnimal) {
    const isBull = lower.includes('bull') || lower.includes('male') || lower.includes('buu') || lower.includes('book');
    let motherTag = '';
    const motherMatch = lower.match(/(?:to\s+cow|mother|dam)\s*([a-z0-9\-]+)/i);
    if (motherMatch) motherTag = motherMatch[1].toUpperCase();

    let tag = 'PENDING';
    const tagMatch = lower.match(/(?:tag|number|is)\s*([a-z0-9\-]+)/i);
    if (tagMatch && tagMatch[1].toUpperCase() !== motherTag) {
      tag = tagMatch[1].toUpperCase();
    } else if (motherTag) {
      tag = `${motherTag}-C1`; // Standard pending tag for calves
    }

    return {
      action: 'add_animal',
      data: {
        tagNumber: tag,
        motherTag: motherTag,
        species: 'Cattle',
        sex: isBull ? 'Male' : 'Female',
        dateOfBirth: lower.includes('yesterday') ? new Date(Date.now() - 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }
    };
  }

  // 2. HEALTH LOG Intent
  const isHealth = lower.includes('give') || lower.includes('treat') || lower.includes('dose') || lower.includes('medication') || lower.includes('giffgaff');
  if (isHealth) {
    let tag = 'UNKNOWN';
    const tagMatch = lower.match(/(?:cow|calf|bull|to|tag)\s*([a-z0-9\-]+)/i);
    if (tagMatch) tag = tagMatch[1].toUpperCase();

    let dosage = '';
    const doseMatch = lower.match(/([0-9\.]+\s*(?:ml|cc|mg|g))/i);
    if (doseMatch) dosage = doseMatch[1].replace(/\s+/g, '');

    let med = 'Unknown Medication';
    const medMatch = lower.match(/(?:of|with)\s+([a-z\s]+?)(?:\s+today|\s+yesterday|$)/i);
    if (medMatch) med = medMatch[1].trim();
    med = med.charAt(0).toUpperCase() + med.slice(1);

    return {
      action: 'add_health_log',
      data: {
        tagNumber: tag,
        treatmentType: 'Medication',
        dosage: dosage,
        medication: med,
        dateAdministered: lower.includes('yesterday') ? new Date(Date.now() - 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }
    };
  }

  throw new Error(`Could not understand intent locally: "${transcript}". Please check your internet/billing or try phrasing it directly.`);
};
