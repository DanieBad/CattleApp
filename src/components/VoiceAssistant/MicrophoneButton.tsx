import React, { useState, useEffect } from 'react';
import { Mic, StopCircle } from 'lucide-react';
import { VoiceService } from '../../services/voiceService';

interface MicrophoneButtonProps {
  onTranscriptComplete: (text: string) => void;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({ onTranscriptComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [voiceService, setVoiceService] = useState<VoiceService | null>(null);

  useEffect(() => {
    const service = new VoiceService({
      onStart: () => {
        setIsListening(true);
        setError(null);
      },
      onResult: (text) => {
        onTranscriptComplete(text);
      },
      onError: (err) => {
        setError(err);
        setIsListening(false);
        alert(err); // Simple error display for now
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    setVoiceService(service);

    return () => {
      service.stop();
    };
  }, [onTranscriptComplete]);

  if (!voiceService || !voiceService.isSupported()) {
    // Hide button if browser doesn't support Web Speech API
    return null; 
  }

  const toggleListening = () => {
    if (isListening) {
      voiceService.stop();
    } else {
      voiceService.start();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse-ring {
            0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
            100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
          .listening-anim {
            animation: pulse-ring 2s infinite;
          }
        `}
      </style>
      <button 
        onClick={toggleListening}
        className={isListening ? 'listening-anim' : ''}
        title="Voice Command"
        style={{
          position: 'fixed',
          bottom: '100px', // Placed above the Help FAB
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: isListening ? 'var(--danger, #ef4444)' : 'var(--primary, #10b981)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 50,
          transition: 'background-color 0.3s ease',
        }}
      >
        {isListening ? <StopCircle size={30} /> : <Mic size={30} />}
      </button>
    </>
  );
};
