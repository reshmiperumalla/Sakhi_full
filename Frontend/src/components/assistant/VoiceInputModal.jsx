import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { speechService } from '../../services/speech';
import { Button } from '../ui/Button';
import { Mic, MicOff, X, Check } from 'lucide-react';

export function VoiceInputModal({ isOpen, onClose, onTranscriptReady }) {
  const { currentLanguage, t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      startVoiceSession();
    } else {
      speechService.stopSpeaking?.();
      speechService.stopListening?.();
      setIsRecording(false);
    }
    return () => {
      speechService.stopListening?.();
    };
  }, [isOpen]);

  const startVoiceSession = () => {
    setIsRecording(true);
    speechService.startListening({
      language: currentLanguage,
      onResult: ({ transcript: text, isFinal }) => {
        setTranscript(text);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      onError: () => setIsRecording(false),
      onEnd: () => setIsRecording(false)
    });
  };

  const handleConfirm = () => {
    if (transcript.trim()) {
      onTranscriptReady(transcript);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-card border border-[#E3E7E4] text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#667085] hover:text-[#263238] rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-[#263238] mb-1">
          {t('assistant.title')}
        </h3>
        <p className="text-xs text-[#667085] mb-5">
          {t('transactions.natural_input_placeholder')}
        </p>

        {/* Microphone Button (Clean deep teal ring, not bright orange) */}
        <div className="flex justify-center my-4">
          <button
            type="button"
            onClick={isRecording ? () => { speechService.stopListening?.(); setIsRecording(false); } : startVoiceSession}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-subtle cursor-pointer ${
              isRecording
                ? 'bg-[#FEF2F2] border-2 border-[#C54B4B] text-[#C54B4B] animate-pulse'
                : 'bg-[#DDEDE7] border-2 border-[#B8D8CE] text-[#176B5B] hover:bg-[#C8E0D7]'
            }`}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>

        <div className="text-xs font-semibold text-[#176B5B] mb-3">
          {isRecording ? t('assistant.listening') : t('assistant.tap_to_speak')}
        </div>

        {/* Real-time transcript box */}
        <div className="min-h-[60px] p-3 rounded-xl bg-[#F7F8F5] border border-[#E3E7E4] text-xs text-[#263238] font-medium text-left mb-4">
          {transcript || <span className="text-[#94A3B8]">{t('assistant.words_appear')}</span>}
        </div>

        {/* Action button */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!transcript.trim()}
            onClick={handleConfirm}
            icon={Check}
          >
            {t('assistant.use_this_text')}
          </Button>
        </div>
      </div>
    </div>
  );
}
