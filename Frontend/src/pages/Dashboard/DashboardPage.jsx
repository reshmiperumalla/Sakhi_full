import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Plus, 
  Minus, 
  MessageCircle, 
  PiggyBank, 
  Compass, 
  TrendingUp,
  Volume2,
  ChevronRight
} from 'lucide-react';
import { speechService } from '../../services/speech';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getLocalizedGoalTitle } from '../../utils/goalUtils';

export function DashboardPage({ onNavigate, onOpenAddModal }) {
  const { currentLanguage, t } = useLanguage();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    total_income: 0,
    total_expenses: 0,
    net_balance: 0,
    typical_income: 15000,
    top_expense: { category: 'Household', amount: 0 },
    savings_goal: { title: 'Emergency Savings', saved: 0, target: 15000, progress_percentage: 0 },
    spending_by_category: {}
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboard() {
      try {
        const res = await api.getDashboardSummary();
        if (isMounted && res) {
          const metrics = res.metrics || {};
          const inc = res.total_income ?? metrics.income?.amount ?? 0;
          const exp = res.total_expenses ?? metrics.expenses?.amount ?? 0;
          const bal = res.net_balance ?? metrics.available?.amount ?? (inc - exp);

          setSummaryData({
            total_income: inc,
            total_expenses: exp,
            net_balance: bal,
            typical_income: res.typical_income ?? 15000,
            top_expense: res.top_expense || { category: 'Household', amount: 0 },
            savings_goal: res.savings_goal || { title: 'Emergency Savings', saved: 0, target: 15000, progress_percentage: 0 },
            spending_by_category: res.spending_by_category || {}
          });
        }
      } catch (err) {
        console.warn('Dashboard summary fetch failed:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboard();

    const handleFinancialMutation = () => {
      fetchDashboard();
    };
    window.addEventListener('mitra_financial_mutation', handleFinancialMutation);

    return () => {
      isMounted = false;
      window.removeEventListener('mitra_financial_mutation', handleFinancialMutation);
    };
  }, [currentLanguage]);

  // Time-of-day greeting
  const hour = new Date().getHours();
  let greetingKey = 'greeting_morning';
  if (hour >= 12 && hour < 17) greetingKey = 'greeting_afternoon';
  else if (hour >= 17) greetingKey = 'greeting_evening';

  const userName = user?.name || (currentLanguage === 'hi' ? 'लक्ष्मी' : currentLanguage === 'te' ? 'లక్ష్మి' : 'Lakshmi');

  const formatCurrency = (amount) => {
    return `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;
  };

  const handleReadAloud = () => {
    const text = t('dashboard.audio_overview')
      .replace('{inflow}', formatCurrency(summaryData.total_income))
      .replace('{outflow}', formatCurrency(summaryData.total_expenses))
      .replace('{balance}', formatCurrency(summaryData.net_balance));
    speechService.speak(text, currentLanguage);
  };

  // Spending data for Recharts
  const chartData = Object.entries(summaryData.spending_by_category || {}).map(([key, val]) => ({
    name: t(`dashboard.categories.${key}`, key.charAt(0).toUpperCase() + key.slice(1)),
    amount: val
  }));

  const goalSaved = summaryData.savings_goal?.saved || 0;
  const goalTarget = summaryData.savings_goal?.target || 1;
  const goalProgress = Math.min(100, Math.round((goalSaved / goalTarget) * 100));

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* ------------------------------------------------ */}
      {/* TOP: Greeting & Overview */}
      {/* ------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight">
            {t(`dashboard.${greetingKey}`)}, {userName} 👋
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <button
          onClick={handleReadAloud}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E3E7E4] hover:bg-[#F7F8F5] text-xs font-semibold text-[#176B5B] transition shadow-subtle cursor-pointer self-start sm:self-center"
        >
          <Volume2 className="w-4 h-4" />
          <span>{t('dashboard.read_aloud')}</span>
        </button>
      </div>

      {/* ------------------------------------------------ */}
      {/* SECTION 1 — MONEY SUMMARY (Exactly 3 Cards) */}
      {/* ------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Money In */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex flex-col justify-between transition hover:shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              {t('dashboard.money_in')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] text-[#137333] flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#137333]">
              {formatCurrency(summaryData.total_income)}
            </div>
            <p className="text-[11px] text-[#667085] mt-1">
              {t('dashboard.money_in_desc')}
            </p>
          </div>
        </div>

        {/* Money Out */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex flex-col justify-between transition hover:shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              {t('dashboard.money_out')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] text-[#C54B4B] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#C54B4B]">
              {formatCurrency(summaryData.total_expenses)}
            </div>
            <p className="text-[11px] text-[#667085] mt-1">
              {t('dashboard.money_out_desc')}
            </p>
          </div>
        </div>

        {/* Available */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex flex-col justify-between transition hover:shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              {t('dashboard.money_left')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#DDEDE7] text-[#176B5B] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#176B5B]">
              {formatCurrency(summaryData.net_balance)}
            </div>
            <p className="text-[11px] text-[#667085] mt-1">
              {t('dashboard.money_left_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* SECTION 2 — QUICK ACTIONS (Large Touch Buttons) */}
      {/* ------------------------------------------------ */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-2.5">
          {t('dashboard.quick_actions')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={Plus}
            onClick={() => onOpenAddModal ? onOpenAddModal('income') : onNavigate('transactions')}
            className="w-full text-xs sm:text-sm font-semibold py-3 bg-white text-[#137333] border-[#CEEAD6] hover:bg-[#E6F4EA]/40"
          >
            {t('dashboard.add_income')}
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={Minus}
            onClick={() => onOpenAddModal ? onOpenAddModal('expense') : onNavigate('transactions')}
            className="w-full text-xs sm:text-sm font-semibold py-3 bg-white text-[#C54B4B] border-[#FECACA] hover:bg-[#FEF2F2]/40"
          >
            {t('dashboard.add_expense')}
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={MessageCircle}
            onClick={() => onNavigate('assistant')}
            className="w-full text-xs sm:text-sm font-semibold py-3"
          >
            {t('dashboard.ask_saheli')}
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={PiggyBank}
            onClick={() => onNavigate('goals')}
            className="w-full text-xs sm:text-sm font-semibold py-3"
          >
            {t('dashboard.plan_savings')}
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* SECTION 3 & 4 — ONE INSIGHT & SAVINGS GOAL */}
      {/* ------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Section 3: One Insight */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                {t('dashboard.insight_title')}
              </span>
              <TrendingUp className="w-4 h-4 text-[#176B5B]" />
            </div>
            <p className="text-sm font-bold text-[#263238]">
              {t('dashboard.insight_most_spent').replace('{category}', summaryData.top_expense?.category || 'Household')}
            </p>

            {/* Small simple chart */}
            <div className="h-32 mt-3 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#667085' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#667085' }} />
                  <Tooltip 
                    formatter={(val) => [`₹${val}`, 'Spent']}
                    contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E3E7E4' }}
                  />
                  <Bar dataKey="amount" fill="#176B5B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E3E7E4]">
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-[#176B5B] hover:text-[#125447] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t('dashboard.insight_view_spending')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Section 4: Savings Goal */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                {t('dashboard.savings_goal_title')}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#DDEDE7] text-[#176B5B]">
                {goalProgress}%
              </span>
            </div>

            <h4 className="text-base font-bold text-[#263238] mt-1">
              {getLocalizedGoalTitle(summaryData.savings_goal?.title, summaryData.savings_goal?.category, t)}
            </h4>
            <p className="text-sm text-[#475467] mt-0.5">
              {formatCurrency(goalSaved)} <span className="text-xs text-[#667085] font-normal">{t('dashboard.saved_of')} {formatCurrency(goalTarget)}</span>
            </p>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#F0F2EE] rounded-full h-3 mt-4 overflow-hidden">
              <div
                className="bg-[#176B5B] h-3 rounded-full transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E3E7E4]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('goals')}
              className="w-full text-xs font-semibold"
            >
              {t('dashboard.continue_saving')}
            </Button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* SECTION 5 — PERSONALIZED TIP */}
      {/* ------------------------------------------------ */}
      <div className="bg-[#F0F7F4] rounded-2xl p-4 sm:p-5 border border-[#C2DFD4] border-l-4 border-l-[#176B5B] flex items-start gap-3.5 shadow-subtle">
        <span className="text-2xl shrink-0">💡</span>
        <div>
          <h4 className="text-sm font-bold text-[#176B5B] mb-0.5">
            {t('dashboard.saheli_tip_title')}
          </h4>
          <p className="text-xs sm:text-sm text-[#2D4A41] leading-relaxed">
            {t('dashboard.saheli_tip_body')}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* BOTTOM — EXPLORE ALL FEATURES CTA */}
      {/* ------------------------------------------------ */}
      <div className="pt-2">
        <button
          onClick={() => onNavigate('features')}
          className="w-full bg-white hover:bg-[#FAFBF9] border border-[#E3E7E4] hover:border-[#CBD5E1] p-4 rounded-2xl text-center text-sm font-bold text-[#176B5B] shadow-subtle transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Compass className="w-4 h-4 text-[#176B5B]" />
          <span>{t('dashboard.explore_all_features')}</span>
        </button>
      </div>
    </div>
  );
}
