import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { Globe, Wifi, WifiOff, Volume2, RotateCcw, LogIn, LogOut, User, PhoneCall } from 'lucide-react';
import { speechService } from '../../services/speech';
import { SimpleLoginModal } from '../auth/SimpleLoginModal';

export function Navbar({ onNavigate }) {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { user, logout, resetSession } = useAuth();
  const { isOnline, pendingCount, syncNow } = useOffline();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isAuthenticated = Boolean(localStorage.getItem('mitra_token'));

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setTimeout(() => {
      const msg = t('common.language_switched');
      speechService.speak(msg, newLang);
    }, 100);
  };

  const handleSpeakOverview = () => {
    const msg = t('assistant.greeting_message');
    speechService.speak(msg, currentLanguage);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F8F5]/95 backdrop-blur-md border-b border-[#E3E7E4] px-4 py-2.5 sm:px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-3">
        {/* Brand */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer select-none"
          onClick={() => onNavigate && onNavigate('dashboard')}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#176B5B] flex items-center justify-center text-white font-bold text-base shadow-subtle">
            🌸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-[#263238]">
                {t('app_name')}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-[#DDEDE7] text-[#176B5B]">
                {t('app_tagline')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Audio Overview Button */}
          <button
            onClick={handleSpeakOverview}
            title={t('dashboard.read_aloud')}
            className="p-2 rounded-xl bg-white border border-[#E3E7E4] hover:border-[#CBD5E1] text-[#667085] hover:text-[#263238] transition shadow-subtle cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#176B5B]" />
          </button>

          {/* Centralized Language Selector */}
          <div className="relative flex items-center bg-white rounded-xl px-2 py-1 border border-[#E3E7E4] shadow-subtle">
            <Globe className="w-3.5 h-3.5 text-[#667085] mr-1.5 hidden sm:block" />
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#263238] focus:outline-none cursor-pointer py-1 pr-1"
              aria-label="Select Language"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>

          {/* Offline / Online Status */}
          <div className="hidden sm:flex items-center">
            {isOnline ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#137333] bg-[#E6F4EA] px-2 py-0.5 rounded-full border border-[#CEEAD6]">
                <Wifi className="w-3 h-3" />
                <span className="hidden md:inline">{t('common.online')}</span>
              </span>
            ) : (
              <button
                onClick={syncNow}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A] hover:bg-[#FDE68A] transition cursor-pointer"
              >
                <WifiOff className="w-3 h-3" />
                <span>{t('common.offline')}</span>
                {pendingCount > 0 && <span className="font-bold">({pendingCount})</span>}
              </button>
            )}
          </div>

          {/* New Session Reset */}
          <button
            onClick={() => {
              if (window.confirm('Start a fresh guest session?')) {
                resetSession();
                window.location.reload();
              }
            }}
            title={t('common.new_session')}
            className="p-2 rounded-xl bg-white border border-[#E3E7E4] hover:bg-[#F7F8F5] text-[#667085] hover:text-[#263238] transition shadow-subtle cursor-pointer hidden sm:block"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Reach-out Helpline Contact */}
          <a
            href="tel:18001201930"
            title={`${t('auth.help_sub')}: 1800-120-1930`}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white border border-[#E3E7E4] hover:bg-[#F7F8F5] text-[#176B5B] hover:text-[#125447] transition shadow-subtle cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden md:inline">1800-120-1930</span>
          </a>

          {/* Simple Login / Logout Control */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 pl-1">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#E3E7E4] shadow-subtle text-xs font-semibold text-[#263238]">
                <User className="w-3.5 h-3.5 text-[#176B5B]" />
                <span className="max-w-[120px] truncate">{user?.name || user?.email || 'User'}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  window.location.reload();
                }}
                title={t('auth.logout_btn')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#E3E7E4] hover:bg-[#FEF2F2] hover:text-[#C54B4B] text-xs font-semibold text-[#667085] transition shadow-subtle cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('auth.logout_btn')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#176B5B] hover:bg-[#125447] text-white text-xs font-semibold transition shadow-subtle cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('auth.login_btn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Simple Login Modal */}
      <SimpleLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}
