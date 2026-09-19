import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Home, Wallet, PieChart, Target, Compass, MessageCircle } from 'lucide-react';

export function MobileBottomNav({ activeTab, setActiveTab, onOpenAssistant }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav.home'), icon: Home },
    { id: 'transactions', label: t('nav.my_money'), icon: Wallet },
    { id: 'budget', label: t('nav.budget'), icon: PieChart },
    { id: 'goals', label: t('nav.goals'), icon: Target },
    { id: 'features', label: t('nav.more'), icon: Compass }
  ];

  return (
    <>
      {/* Floating Ask Sakhi Button for Mobile */}
      <div className="md:hidden fixed bottom-18 right-4 z-40">
        <button
          onClick={onOpenAssistant || (() => setActiveTab('assistant'))}
          title={t('dashboard.ask_saheli')}
          className="w-13 h-13 rounded-full bg-[#176B5B] text-white flex items-center justify-center shadow-lg border-2 border-white transition active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Bottom Fixed Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E3E7E4] px-2 py-1.5 flex items-center justify-around shadow-subtle">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
                isActive
                  ? 'text-[#176B5B] font-semibold'
                  : 'text-[#667085] hover:text-[#263238]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#176B5B]' : 'text-[#667085]'}`} />
              <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
