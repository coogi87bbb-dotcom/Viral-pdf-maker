import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  currentValue?: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  currentValue = '',
  label = 'Voice Input',
  size = 'md',
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const initialValueRef = useRef<string>('');
  const onTranscriptRef = useRef(onTranscript);

  // Keep onTranscript ref synchronized
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const toggleListening = () => {
    setErrorMessage(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Browser Speech API not supported. Please type or use Chrome/Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      setTranscriptPreview('');
      return;
    }

    // Save current input value as fixed baseline BEFORE starting speech session
    initialValueRef.current = currentValue || '';

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
        setTranscriptPreview('');
      };

      recognition.onresult = (event: any) => {
        let finalText = '';
        let interimText = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcriptChunk + ' ';
          } else {
            interimText += transcriptChunk;
          }
        }

        const newSpokenText = (finalText + interimText).trim();
        setTranscriptPreview(newSpokenText);

        if (newSpokenText) {
          const base = initialValueRef.current.trim();
          const combined = base ? `${base} ${newSpokenText}` : newSpokenText;
          onTranscriptRef.current(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone permission denied. Please allow mic access in your browser.');
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
        setTranscriptPreview('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setTranscriptPreview('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition start error:', err);
      setErrorMessage('Could not access microphone. Please check browser permissions.');
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
          isListening
            ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse ring-2 ring-red-400'
            : 'bg-violet-600/90 hover:bg-violet-500 text-white border border-violet-400/30'
        } ${
          size === 'sm'
            ? 'px-2.5 py-1 text-xs'
            : 'px-3.5 py-2 text-xs sm:text-sm'
        }`}
        title={isListening ? 'Click to Stop Speaking' : 'Click to Speak Voice Instructions'}
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 text-white animate-bounce" />
            <span>Listening... (Click to Stop)</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 text-amber-300" />
            <span>{label}</span>
          </>
        )}
      </button>

      {isListening && transcriptPreview && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-lg mt-1 animate-fade-in">
          <Volume2 className="h-3.5 w-3.5 animate-pulse text-amber-400 shrink-0" />
          <span className="truncate max-w-xs font-mono">&quot;{transcriptPreview}&quot;</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1 text-[11px] text-red-300 bg-red-950/50 border border-red-800/40 px-2 py-1 rounded-lg mt-1">
          <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

