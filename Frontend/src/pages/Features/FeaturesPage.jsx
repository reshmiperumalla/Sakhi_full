import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import {
  Wallet,
  PieChart,
  Target,
  Shield,
  ShieldAlert,
  GraduationCap,
  Gamepad2,
  MessageCircle,
  SlidersHorizontal,
  User,
  Settings,
  ArrowRight
} from 'lucide-react';

export function FeaturesPage({ onNavigate }) {
  const { t } = useLanguage();

  const sections = [
    {
      categoryKey: 'sec_manage_money',
      icon: '💰',
      items: [
        {
          id: 'transactions',
          titleKey: 'card_my_money_title',
          descKey: 'card_my_money_desc',
          icon: Wallet,
          color: 'bg-[#DDEDE7] text-[#176B5B]'
        },
        {
          id: 'budget',
          titleKey: 'card_budget_title',
          descKey: 'card_budget_desc',
          icon: PieChart,
          color: 'bg-[#EBF5FB] text-[#2980B9]'
        },
        {
          id: 'goals',
          titleKey: 'card_goals_title',
          descKey: 'card_goals_desc',
          icon: Target,
          color: 'bg-[#E8F8F5] text-[#16A085]'
        },
        {
          id: 'irregular',
          titleKey: 'card_irregular_title',
          descKey: 'card_irregular_desc',
          icon: Shield,
          color: 'bg-[#FEF9E7] text-[#D4AC0D]'
        }
      ]
    },
    {
      categoryKey: 'sec_learn_safe',
      icon: '🛡️',
      items: [
        {
          id: 'scam',
          titleKey: 'card_scam_title',
          descKey: 'card_scam_desc',
          icon: ShieldAlert,
          color: 'bg-[#FDEDEC] text-[#E74C3C]'
        },
        {
          id: 'learn',
          titleKey: 'card_learn_title',
          descKey: 'card_learn_desc',
          icon: GraduationCap,
          color: 'bg-[#F4ECF7] text-[#8E44AD]'
        },
        {
          id: 'games',
          titleKey: 'card_games_title',
          descKey: 'card_games_desc',
          icon: Gamepad2,
          color: 'bg-[#E8F6F3] text-[#1ABC9C]'
        }
      ]
    },
    {
      categoryKey: 'sec_get_help',
      icon: '🤝',
      items: [
        {
          id: 'assistant',
          titleKey: 'card_assistant_title',
          descKey: 'card_assistant_desc',
          icon: MessageCircle,
          color: 'bg-[#DDEDE7] text-[#176B5B]'
        },
        {
          id: 'simulator',
          titleKey: 'card_simulator_title',
          descKey: 'card_simulator_desc',
          icon: SlidersHorizontal,
          color: 'bg-[#FDF2E9] text-[#E67E22]'
        }
      ]
    },
    {
      categoryKey: 'sec_family',
      icon: '🏡',
      items: [
        {
          id: 'profile',
          titleKey: 'card_profile_title',
          descKey: 'card_profile_desc',
          icon: User,
          color: 'bg-[#EAECEE] text-[#5D6D7E]'
        },
        {
          id: 'settings',
          titleKey: 'card_settings_title',
          descKey: 'card_settings_desc',
          icon: Settings,
          color: 'bg-[#F2F4F4] text-[#7F8C8D]'
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight">
          {t('features.title')}
        </h1>
        <p className="text-sm text-[#667085] mt-1">
          {t('features.subtitle')}
        </p>
      </div>

      {/* Sections Grid */}
      {sections.map((sec) => (
        <div key={sec.categoryKey} className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#E3E7E4] pb-2">
            <span className="text-lg">{sec.icon}</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#475467]">
              {t(`features.${sec.categoryKey}`)}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle hover:shadow-card transition flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#263238]">
                        {t(`features.${item.titleKey}`)}
                      </h3>
                      <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                        {t(`features.${item.descKey}`)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F0F2EE] flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ArrowRight}
                      onClick={() => onNavigate(item.id)}
                      className="text-xs font-semibold"
                    >
                      {t('features.open_feature')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
