import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { speechService } from '../../services/speech';
import { Button } from '../../components/ui/Button';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Bot
} from 'lucide-react';

export function AssistantPage() {
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
          t('assistant.q3'),
          t('assistant.q4')
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
      const replyText = res.response || res.answer || res.reply || t('assistant.greeting_message');

      if (res.action_performed) {
        api.dispatchFinancialMutation();
      }

      const assistantMessage = {
        role: 'assistant',
        content: replyText,
        suggestions: res.suggestions || res.suggested_followups || [],
        pending_action: res.pending_action,
        action_performed: res.action_performed
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Auto read-aloud first sentence if speech enabled
      const firstSentence = replyText.split(/[।.\n]/)[0];
      if (firstSentence && firstSentence.length > 5) {
        speechService.speak(firstSentence, currentLanguage);
      }
    } catch (err) {
      console.warn('AI response fallback:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('assistant.greeting_message')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (option) => {
    if (loading || !option) return;
    const userMessage = { role: 'user', content: option.label };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setLoading(true);

    try {
      const historyPayload = newHistory
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await api.sendChatMessage(option.label, currentLanguage, historyPayload, option);
      const replyText = res.response || res.answer || res.reply;

      if (res.action_performed) {
        api.dispatchFinancialMutation();
      }

      const assistantMessage = {
        role: 'assistant',
        content: replyText,
        suggestions: res.suggestions || [],
        action_performed: res.action_performed
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const firstSentence = replyText.split(/[।.\n]/)[0];
      if (firstSentence && firstSentence.length > 5) {
        speechService.speak(firstSentence, currentLanguage);
      }
    } catch (err) {
      console.warn('Action confirm failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API Voice Recognition
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      speechService.stop();
      setIsListening(false);
      return;
    }

    const langCodeMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
    const recognition = new SpeechRecognition();
    recognition.lang = langCodeMap[currentLanguage] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      setIsListening(false);
    };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (transcript) {
        setInput(transcript);
        handleSend(transcript);
      }
    };

    recognition.start();
  };

  const handleSpeakMessage = (text, idx) => {
    if (activeSpeakingIdx === idx) {
      speechService.stop();
      setActiveSpeakingIdx(null);
    } else {
      speechService.speak(text, currentLanguage);
      setActiveSpeakingIdx(idx);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto animate-fadeIn pb-12 flex flex-col h-[calc(100vh-140px)]">
      {/* Header & Safety Warning Alert */}
      <div className="shrink-0 space-y-2.5">
        <div>
          <h1 className="text-2xl font-bold text-[#263238] tracking-tight flex items-center gap-2">
            <span>💬</span> {t('assistant.title')}
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {t('assistant.subtitle')}
          </p>
        </div>

        {/* Integrated Reassuring Safety Alert Card */}
        <div className="bg-[#FFFBEB] p-3 rounded-xl border border-[#FCD34D] border-l-4 border-l-[#D97706] flex items-start gap-2.5 text-xs text-[#92400E]">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
          <div>
            <span className="font-bold">🛡️ {t('assistant.safety_reminder')}</span>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 bg-white rounded-2xl border border-[#E3E7E4] shadow-subtle p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#176B5B] text-white rounded-br-xs'
                    : 'bg-[#F7F8F5] text-[#263238] border border-[#E3E7E4] rounded-bl-xs'
                }`}
              >
                <div>{msg.content}</div>

                {/* Interactive Clarification Action Buttons */}
                {!isUser && msg.pending_action?.options && (
                  <div className="mt-3 pt-2.5 border-t border-[#E3E7E4] space-y-2">
                    <div className="text-[11px] font-bold text-[#176B5B] uppercase tracking-wider">
                      {t('common.choose_action', 'Choose an action:')}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {msg.pending_action.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleConfirmAction(opt)}
                          className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-[#176B5B] hover:bg-[#125447] text-white transition shadow-xs cursor-pointer text-center"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio Read-Aloud for Assistant */}
                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-[#E3E7E4] flex items-center justify-between">
                    <button
                      onClick={() => handleSpeakMessage(msg.content, idx)}
                      className="text-[11px] font-semibold text-[#176B5B] hover:text-[#125447] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {activeSpeakingIdx === idx ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{activeSpeakingIdx === idx ? t('dashboard.stop_audio') : t('dashboard.read_aloud')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Follow-up Suggestion Chips on latest assistant reply */}
              {!isUser && idx === messages.length - 1 && Array.isArray(msg.suggestions) && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                  {msg.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(sug)}
                      className="text-xs bg-[#DDEDE7] hover:bg-[#C8E0D7] text-[#176B5B] font-medium px-3 py-1 rounded-full border border-[#B8D8CE] transition cursor-pointer text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#667085] p-2">
            <span className="animate-spin text-sm">🌸</span>
            <span>Sakhi is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Toolbar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="shrink-0 flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#E3E7E4] shadow-subtle"
      >
        <button
          type="button"
          onClick={toggleListening}
          title={isListening ? 'Stop listening' : t('assistant.tap_to_speak')}
          className={`p-2.5 rounded-xl transition cursor-pointer ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#F7F8F5] text-[#176B5B] hover:bg-[#DDEDE7]'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? t('assistant.listening') : t('assistant.input_placeholder')}
          className="flex-1 bg-transparent text-sm text-[#263238] px-2 focus:outline-none"
        />

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={loading || !input.trim()}
          icon={Send}
        >
          {t('assistant.send')}
        </Button>
      </form>
    </div>
  );
}
