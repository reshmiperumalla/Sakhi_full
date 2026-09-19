import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Home,
  Wallet,
  PieChart,
  Target,
  GraduationCap,
  MessageCircle,
  MoreHorizontal,
  ShieldAlert,
  SlidersHorizontal,
  Gamepad2,
  User,
  Settings,
  Compass,
  ChevronDown,
  ChevronRight,
  Shield
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }) {
  const { t } = useLanguage();
  const [moreExpanded, setMoreExpanded] = useState(false);

  const primaryNav = [
    { id: 'dashboard', label: t('nav.home'), icon: Home },
    { id: 'transactions', label: t('nav.my_money'), icon: Wallet },
    { id: 'budget', label: t('nav.budget'), icon: PieChart },
    { id: 'goals', label: t('nav.goals'), icon: Target },
    { id: 'learn', label: t('nav.learn'), icon: GraduationCap },
    { id: 'assistant', label: t('nav.ask_saheli'), icon: MessageCircle }
  ];

  const secondaryNav = [
    { id: 'features', label: t('nav.features'), icon: Compass },
    { id: 'scam', label: t('nav.scam_detective'), icon: ShieldAlert },
    { id: 'games', label: t('nav.games'), icon: Gamepad2 },
    { id: 'simulator', label: t('nav.simulator'), icon: SlidersHorizontal },
    { id: 'irregular', label: t('nav.irregular_income'), icon: Shield },
    { id: 'profile', label: t('nav.profile'), icon: User },
    { id: 'settings', label: t('nav.settings'), icon: Settings }
  ];

  const isSecondaryActive = secondaryNav.some((item) => item.id === activeTab);

  return (
    <aside className="hidden md:flex w-64 bg-[#F7F8F5] border-r border-[#E3E7E4] flex-col justify-between shrink-0 select-none">
      <div className="p-3 sm:p-4 space-y-2">
        {/* Primary Nav List */}
        <nav className="flex flex-col gap-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#DDEDE7] text-[#176B5B] font-semibold shadow-subtle'
                    : 'text-[#263238] hover:bg-[#EFEFEA] hover:text-[#176B5B]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#176B5B]' : 'text-[#667085]'}`} />
                <span className="leading-snug">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Collapsible "More" Section */}
        <div className="pt-2 border-t border-[#E3E7E4]">
          <button
            onClick={() => setMoreExpanded(!moreExpanded)}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#667085] hover:text-[#263238] hover:bg-[#EFEFEA] transition cursor-pointer ${
              isSecondaryActive ? 'text-[#176B5B]' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <MoreHorizontal className="w-4 h-4" />
              <span>{t('nav.more')}</span>
            </span>
            {moreExpanded || isSecondaryActive ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {(moreExpanded || isSecondaryActive) && (
            <div className="mt-1 space-y-1 pl-2 border-l-2 border-[#DDEDE7] ml-3">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#DDEDE7] text-[#176B5B] font-semibold'
                        : 'text-[#667085] hover:bg-[#EFEFEA] hover:text-[#263238]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#176B5B]' : 'text-[#667085]'}`} />
                    <span className="leading-snug">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Brand Info */}
      <div className="p-4 border-t border-[#E3E7E4] text-xs text-[#667085]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#176B5B]"></span>
          <p className="font-semibold text-[#263238]">{t('app_name')}</p>
        </div>
        <p className="text-[11px] text-[#667085] mt-1">{t('app_tagline')}</p>
      </div>
    </aside>
  );
}
