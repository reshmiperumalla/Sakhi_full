import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { speechService } from '../../services/speech';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Sparkles
} from 'lucide-react';

export function ChatBot() {
  const { t, currentLanguage } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingIdx, setActiveSpeakingIdx] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: t('assistant.greeting_message'),
        suggestions: [
          t('assistant.q1'),
          t('assistant.q2'),
          t('assistant.q3')
        ]
      }
    ]);
  }, [currentLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend = input) => {
    const query = textToSend.trim();
    if (!query || loading) return;

    const userMessage = { role: 'user', content: query };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = newHistory
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await api.sendChatMessage(query, currentLanguage, historyPayload);

      const assistantMessage = {
        role: 'assistant',
        content: res.answer,
        suggestions: res.suggested_followups || []
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (res.voice_audio_text) {
        speechService.speak(res.voice_audio_text, currentLanguage);
        setActiveSpeakingIdx(newHistory.length);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('assistant.error_message')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening({
        language: currentLanguage,
        onResult: ({ transcript, isFinal }) => {
          setInput(transcript);
          if (isFinal) {
            setIsListening(false);
            handleSend(transcript);
          }
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false)
      });
    }
  };

  const handleSpeak = (text, idx) => {
    if (activeSpeakingIdx === idx) {
      speechService.stopSpeaking();
      setActiveSpeakingIdx(null);
    } else {
      speechService.speak(text, currentLanguage);
      setActiveSpeakingIdx(idx);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3E7E4]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#DDEDE7] flex items-center justify-center text-[#176B5B] shadow-subtle">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#263238] flex items-center gap-2">
              <span>{t('assistant.title')}</span>
              <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-[#DDEDE7] text-[#176B5B]">
                AI
              </span>
            </h1>
            <p className="text-xs text-[#667085]">
              {t('assistant.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <Card className="min-h-[420px] max-h-[550px] flex flex-col justify-between p-4 bg-white">
        <div className="overflow-y-auto space-y-4 pr-1 scrollbar-none flex-1">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#DDEDE7] text-[#176B5B] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#176B5B] text-white rounded-tr-xs'
                        : 'bg-[#F7F8F5] text-[#263238] border border-[#E3E7E4] rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {!isUser && (
                      <div className="pt-2 mt-2 border-t border-[#E3E7E4]/60 flex justify-end">
                        <button
                          onClick={() => handleSpeak(msg.content, idx)}
                          className="text-[#667085] hover:text-[#176B5B] text-xs flex items-center gap-1 cursor-pointer"
                          title={activeSpeakingIdx === idx ? t('assistant.stop_speaking') : t('assistant.read_aloud')}
                        >
                          {activeSpeakingIdx === idx ? (
                            <VolumeX className="w-3.5 h-3.5 text-[#C54B4B]" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[11px]">
                            {activeSpeakingIdx === idx ? t('assistant.stop_speaking') : t('assistant.read_aloud')}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggested Followups */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          className="text-xs px-2.5 py-1 rounded-full bg-[#DDEDE7] hover:bg-[#C8E0D7] text-[#176B5B] font-medium transition cursor-pointer text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#EFEFEA] text-[#667085] flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2.5 items-center text-xs text-[#667085] p-2">
              <div className="w-6 h-6 rounded-lg bg-[#DDEDE7] text-[#176B5B] flex items-center justify-center animate-spin">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>{t('assistant.thinking')}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-[#E3E7E4] space-y-2">
          {isListening && (
            <div className="p-2 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-xs font-semibold text-[#C54B4B] flex items-center justify-between animate-pulse">
              <span>{t('assistant.listening')}</span>
              <button
                onClick={toggleMic}
                className="text-[11px] underline cursor-pointer"
              >
                {t('common.cancel')}
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleMic}
              title={isListening ? t('assistant.stop_speaking') : t('assistant.tap_to_speak')}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isListening
                  ? 'bg-[#FEF2F2] border-[#C54B4B] text-[#C54B4B]'
                  : 'bg-[#F7F8F5] border-[#E3E7E4] text-[#667085] hover:text-[#176B5B]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('assistant.placeholder')}
              className="flex-1 p-2.5 text-sm rounded-xl border border-[#E3E7E4] focus:border-[#176B5B] focus:outline-none text-[#263238] bg-[#F7F8F5]"
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!input.trim() || loading}
              icon={Send}
            >
              {t('assistant.send')}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
