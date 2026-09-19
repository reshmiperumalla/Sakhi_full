import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Globe, ArrowRight, ShieldCheck, TrendingUp, HeartHandshake, Sparkles } from 'lucide-react';

export function LandingPage({ onGetStarted, onExplore, onGoToDashboard, hasSession = true }) {
  const { currentLanguage, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-full py-6 sm:py-12 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col justify-center animate-fadeIn">
      {/* Top Language Switcher Bar on Landing */}
      <div className="flex justify-center sm:justify-end mb-8">
        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-[#E3E7E4] shadow-subtle">
          <Globe className="w-4 h-4 text-[#176B5B]" />
          <button
            onClick={() => setLanguage('en')}
            className={`text-xs px-2.5 py-1 rounded-xl font-medium transition cursor-pointer ${
              currentLanguage === 'en' ? 'bg-[#DDEDE7] text-[#176B5B] font-bold' : 'text-[#667085] hover:text-[#263238]'
            }`}
          >
            English
          </button>
          <span className="text-[#E3E7E4]">|</span>
          <button
            onClick={() => setLanguage('hi')}
            className={`text-xs px-2.5 py-1 rounded-xl font-medium transition cursor-pointer ${
              currentLanguage === 'hi' ? 'bg-[#DDEDE7] text-[#176B5B] font-bold' : 'text-[#667085] hover:text-[#263238]'
            }`}
          >
            हिंदी
          </button>
          <span className="text-[#E3E7E4]">|</span>
          <button
            onClick={() => setLanguage('te')}
            className={`text-xs px-2.5 py-1 rounded-xl font-medium transition cursor-pointer ${
              currentLanguage === 'te' ? 'bg-[#DDEDE7] text-[#176B5B] font-bold' : 'text-[#667085] hover:text-[#263238]'
            }`}
          >
            తెలుగు
          </button>
        </div>
      </div>

      {/* Main Friendly Hero Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3E7E4] shadow-card text-center relative overflow-hidden">
        {/* Soft Background Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-[#DDEDE7]/50 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Friendly Character / Floral Mascot Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#DDEDE7] border-2 border-[#176B5B]/20 flex items-center justify-center mx-auto mb-5 text-3xl sm:text-4xl shadow-subtle">
          🌸
        </div>

        {/* Headline & Subtitle */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#263238] tracking-tight max-w-xl mx-auto leading-snug">
          {t('landing.headline')}
        </h1>
        <p className="text-sm sm:text-base text-[#667085] mt-3 max-w-lg mx-auto leading-relaxed">
          {t('landing.subtitle')}
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
          {hasSession ? (
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={onGoToDashboard || onGetStarted}
              className="w-full sm:w-auto text-base px-7"
            >
              {t('landing.go_to_dashboard')}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={onGetStarted}
              className="w-full sm:w-auto text-base px-7"
            >
              {t('landing.get_started')}
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={onExplore}
            className="w-full sm:w-auto text-base px-7"
          >
            {t('landing.explore')}
          </Button>
        </div>

        {/* Trust Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-8 pt-6 border-t border-[#E3E7E4]/60 text-xs font-medium text-[#475467]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F8F5] border border-[#E3E7E4]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#176B5B]" />
            {t('landing.trust_badge_1')}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F8F5] border border-[#E3E7E4]">
            <TrendingUp className="w-3.5 h-3.5 text-[#176B5B]" />
            {t('landing.trust_badge_2')}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F8F5] border border-[#E3E7E4]">
            <HeartHandshake className="w-3.5 h-3.5 text-[#176B5B]" />
            {t('landing.trust_badge_3')}
          </span>
        </div>
      </div>

      {/* 3 Storytelling Cards Below Hero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#DDEDE7] text-[#176B5B] flex items-center justify-center text-xl mb-3">
              📝
            </div>
            <h3 className="text-sm font-bold text-[#263238] mb-1">
              {t('landing.feature_card_1_title')}
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              {t('landing.feature_card_1_desc')}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center text-xl mb-3">
              🌾
            </div>
            <h3 className="text-sm font-bold text-[#263238] mb-1">
              {t('landing.feature_card_2_title')}
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              {t('landing.feature_card_2_desc')}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center text-xl mb-3">
              🛡️
            </div>
            <h3 className="text-sm font-bold text-[#263238] mb-1">
              {t('landing.feature_card_3_title')}
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              {t('landing.feature_card_3_desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
