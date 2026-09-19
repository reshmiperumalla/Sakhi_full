import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { speechService } from '../../services/speech';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Minus,
  MessageCircle,
  Lightbulb,
  ArrowRight,
  Volume2
} from 'lucide-react';

export function SimpleDashboard({ onNavigate, onOpenAddModal }) {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (e) {
      console.warn('Dashboard summary load fallback:', e);
      setSummary({
        metrics: {
          income: { amount: 11500 },
          expenses: { amount: 6000 },
          available: { amount: 5500 }
        },
        spending_breakdown: [
          { category: 'household', amount: 2500, percentage: 42 },
          { category: 'food', amount: 1500, percentage: 25 },
          { category: 'education', amount: 1000, percentage: 17 },
          { category: 'other', amount: 1000, percentage: 16 }
        ],
        savings_goal: {
          title: t('dashboard.savings_goal_title'),
          target: 20000,
          saved: 8000,
          remaining: 12000,
          progress_percentage: 40
        },
        actionable_tip: t('dashboard.saheli_tip_body')
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [currentLanguage]);

  const speakDashboard = () => {
    if (!summary) return;
    const inc = formatCurrency(summary.metrics?.income?.amount || 11500);
    const exp = formatCurrency(summary.metrics?.expenses?.amount || 6000);
    const avail = formatCurrency(summary.metrics?.available?.amount || 5500);

    let template = t('dashboard.audio_overview');
    const speechText = template
      .replace('{inflow}', inc)
      .replace('{outflow}', exp)
      .replace('{balance}', avail);

    speechService.speak(speechText, currentLanguage);
  };

  // Determine greeting based on local time
  const currentHour = new Date().getHours();
  const greetingKey = currentHour < 12
    ? 'dashboard.greeting_morning'
    : currentHour < 17
    ? 'dashboard.greeting_afternoon'
    : 'dashboard.greeting_evening';

  const userName = user?.name ? user.name.split(' ')[0] : 'Lakshmi';
  const metrics = summary?.metrics || {};
  const incomeAmount = metrics.income?.amount ?? 11500;
  const expenseAmount = metrics.expenses?.amount ?? 6000;
  const availableAmount = metrics.available?.amount ?? 5500;

  const rawBreakdown = summary?.spending_breakdown || [
    { category: 'household', amount: 2500, percentage: 42 },
    { category: 'food', amount: 1500, percentage: 25 },
    { category: 'education', amount: 1000, percentage: 17 },
    { category: 'other', amount: 1000, percentage: 16 }
  ];

  // Map category to centralized translation key
  const breakdown = rawBreakdown.map(item => ({
    ...item,
    label: t(`dashboard.categories.${item.category}`, item.category)
  }));

  const goal = summary?.savings_goal || {
    title: t('dashboard.savings_goal_title'),
    target: 20000,
    saved: 8000,
    remaining: 12000,
    progress_percentage: 40
  };

  const tipText = t('dashboard.saheli_tip_body');

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* 1. HEADER (Simple greeting & subtitle, minimal vertical space) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#263238]">
            {t(greetingKey)}, {userName}
          </h1>
          <p className="text-sm text-[#667085] mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <button
          onClick={speakDashboard}
          title={t('dashboard.read_aloud')}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3E7E4] bg-white text-xs font-semibold text-[#667085] hover:text-[#263238] transition shadow-subtle cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-[#176B5B]" />
          <span>{t('dashboard.read_aloud')}</span>
        </button>
      </div>

      {/* 2. MONEY SUMMARY (3 cards with the SAME visual style, subtle neutral backgrounds) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Money In */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E3E7E4] shadow-subtle transition flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#667085]">
              {t('dashboard.money_in')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#DDEDE7] flex items-center justify-center text-[#176B5B]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#263238]">
            {formatCurrency(incomeAmount)}
          </div>
          <p className="text-[11px] text-[#667085] mt-1">
            {t('dashboard.money_in_desc')}
          </p>
        </div>

        {/* Money Out */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E3E7E4] shadow-subtle transition flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#667085]">
              {t('dashboard.money_out')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#F2F4F7] flex items-center justify-center text-[#667085]">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#263238]">
            {formatCurrency(expenseAmount)}
          </div>
          <p className="text-[11px] text-[#667085] mt-1">
            {t('dashboard.money_out_desc')}
          </p>
        </div>

        {/* Money Left */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E3E7E4] shadow-subtle transition flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#667085]">
              {t('dashboard.money_left')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#DDEDE7] flex items-center justify-center text-[#176B5B]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#263238]">
            {formatCurrency(availableAmount)}
          </div>
          <p className="text-[11px] text-[#667085] mt-1">
            {t('dashboard.money_left_desc')}
          </p>
        </div>
      </div>

      {/* 3. QUICK ACTIONS (Simple buttons, NOT huge colorful cards) */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => onOpenAddModal && onOpenAddModal('income')}
        >
          {t('dashboard.add_income')}
        </Button>

        <Button
          variant="outline"
          size="md"
          icon={Minus}
          onClick={() => onOpenAddModal && onOpenAddModal('expense')}
          className="border-[#E3E7E4] text-[#263238] hover:border-[#176B5B] hover:text-[#176B5B]"
        >
          {t('dashboard.add_expense')}
        </Button>

        <Button
          variant="secondary"
          size="md"
          icon={MessageCircle}
          onClick={() => onNavigate && onNavigate('assistant')}
          className="bg-[#DDEDE7] text-[#176B5B] hover:bg-[#C8E0D7]"
        >
          {t('dashboard.ask_saheli')}
        </Button>
      </div>

      {/* 4. SPENDING INSIGHT (Where did your money go? Simple visualization) */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E3E7E4]">
          <h2 className="text-sm font-semibold text-[#263238]">
            {t('dashboard.spending_title')}
          </h2>
          <span className="text-xs font-semibold text-[#667085]">
            {t('dashboard.spending_total')}: {formatCurrency(expenseAmount)}
          </span>
        </div>

        {/* Simple single stacked proportion bar */}
        <div className="w-full h-2.5 bg-[#EFEFEA] rounded-full flex overflow-hidden">
          {breakdown.map((item, idx) => {
            const colors = ['bg-[#176B5B]', 'bg-[#3A8B7B]', 'bg-[#6CAFA1]', 'bg-[#A8D1C7]'];
            return (
              <div
                key={idx}
                className={colors[idx % colors.length]}
                style={{ width: `${item.percentage}%` }}
                title={`${item.label}: ${formatCurrency(item.amount)}`}
              />
            );
          })}
        </div>

        {/* Clean categorized items list */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {breakdown.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="text-xs text-[#667085] truncate">
                {item.label}
              </div>
              <div className="text-sm font-semibold text-[#263238]">
                {formatCurrency(item.amount)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 5. SAVINGS GOAL (Emergency Savings, single goal card) */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#263238]">
            {goal.title || t('dashboard.savings_goal_title')}
          </h3>
          <span className="text-xs font-bold text-[#176B5B]">
            {goal.progress_percentage}%
          </span>
        </div>

        <div className="text-xs text-[#667085]">
          <span className="font-semibold text-[#263238]">{formatCurrency(goal.saved)}</span> {t('dashboard.saved_of')} {formatCurrency(goal.target)}
        </div>

        <ProgressBar progress={goal.progress_percentage} />

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onNavigate && onNavigate('goals')}
            className="text-xs font-semibold text-[#176B5B] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{t('dashboard.view_goal')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>

      {/* 6. SAHELI'S TIP (One small personalized insight) */}
      <Card className="bg-[#FCFAF2] border-[#ECE6D5] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#8A6D1C] flex items-center gap-1.5 uppercase tracking-wide">
            <Lightbulb className="w-3.5 h-3.5 text-[#D4B04C]" />
            {t('dashboard.saheli_tip_title')}
          </span>
          <button
            onClick={() => speechService.speak(tipText, currentLanguage)}
            className="text-xs text-[#8A6D1C] hover:text-[#5A450C] p-1 cursor-pointer"
            title={t('dashboard.read_aloud')}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#263238] leading-relaxed">
          {tipText}
        </p>

        <div className="pt-2 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate && onNavigate('assistant')}
            className="border-[#D4B04C]/50 text-[#8A6D1C] hover:bg-[#F5EDD5]"
          >
            {t('dashboard.ask_saheli')}
          </Button>
        </div>
      </Card>

      {/* END OF DASHBOARD - Zero extra sections */}
    </div>
  );
}
