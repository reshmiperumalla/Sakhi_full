import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { Button } from '../../components/ui/Button';
import { Globe, Volume2, RotateCcw, Wifi, WifiOff, Check } from 'lucide-react';
import { speechService } from '../../services/speech';

export function SettingsPage() {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { resetSession } = useAuth();
  const { isOnline, pendingCount, syncNow } = useOffline();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setTimeout(() => {
      const msg = t('common.language_switched');
      speechService.speak(msg, lang);
    }, 100);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight flex items-center gap-2">
          <span>⚙️</span> {t('settings.title')}
        </h1>
        <p className="text-sm text-[#667085] mt-0.5">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* 1. Language Selection Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E3E7E4] shadow-card space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#F0F2EE]">
          <Globe className="w-5 h-5 text-[#176B5B]" />
          <h3 className="text-base font-bold text-[#263238]">
            {t('settings.lang_section')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'en', label: 'English', sub: 'Default' },
            { id: 'hi', label: 'हिंदी', sub: 'Hindi' },
            { id: 'te', label: 'తెలుగు', sub: 'Telugu' }
          ].map((item) => {
            const isSelected = currentLanguage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleLanguageChange(item.id)}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#DDEDE7] border-[#176B5B] text-[#176B5B] font-bold shadow-xs'
                    : 'bg-[#F7F8F5] border-[#E3E7E4] text-[#374151] hover:bg-white'
                }`}
              >
                <div>
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className="text-[11px] text-[#667085] mt-0.5">{item.sub}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#176B5B]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Voice & Audio Guidance Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E3E7E4] shadow-card space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#F0F2EE]">
          <Volume2 className="w-5 h-5 text-[#176B5B]" />
          <h3 className="text-base font-bold text-[#263238]">
            {t('settings.audio_section')}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-[#475467] leading-relaxed">
          {t('settings.audio_desc')}
        </p>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              speechService.speak(t('assistant.greeting_message'), currentLanguage);
            }}
          >
            🔊 Test Voice Narration
          </Button>
        </div>
      </div>

      {/* 3. Session & Offline Management Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E3E7E4] shadow-card space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#F0F2EE]">
          <RotateCcw className="w-5 h-5 text-[#D97706]" />
          <h3 className="text-base font-bold text-[#263238]">
            {t('settings.session_section')}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-[#475467] leading-relaxed">
          {t('settings.session_desc')}
        </p>

        <div className="pt-1">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Reset this session and start fresh?')) {
                resetSession();
                window.location.reload();
              }
            }}
          >
            🔄 {t('settings.btn_reset')}
          </Button>
        </div>
      </div>
    </div>
  );
}
