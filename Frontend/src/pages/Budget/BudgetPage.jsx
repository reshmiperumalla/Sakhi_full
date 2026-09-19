import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { 
  PieChart as PieIcon, 
  RefreshCw, 
  ShieldCheck, 
  ShoppingBag, 
  Target, 
  Coffee, 
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export function BudgetPage() {
  const { t, currentLanguage } = useLanguage();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customInflow, setCustomInflow] = useState(15000);
  const [isLeanMonth, setIsLeanMonth] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const data = await api.getCurrentBudget();
      setBudget(data);
      if (data?.total_income_expected) {
        setCustomInflow(data.total_income_expected);
      }
      if (data?.is_lean_month !== undefined) {
        setIsLeanMonth(Boolean(data.is_lean_month));
      }
    } catch (err) {
      console.warn('Budget fetch fallback:', err);
      setBudget({
        total_income_expected: 15000,
        safe_spending_limit: 12000,
        lean_month_buffer_allocation: 3000,
        savings_goal_allocation: 2500,
        category_allocations: {
          household: 7500,
          food: 3000,
          education: 1500,
          healthcare: 1000,
          other: 1000
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
    const handleSync = () => fetchBudget();
    window.addEventListener('mitra_financial_mutation', handleSync);
    return () => window.removeEventListener('mitra_financial_mutation', handleSync);
  }, [currentLanguage]);

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updated = await api.generateBudget({
        monthly_inflow: Number(customInflow) || 15000,
        is_lean_month: isLeanMonth
      });
      setBudget(updated);
      api.dispatchFinancialMutation();
    } catch (err) {
      console.error('Failed to update budget:', err);
    } finally {
      setUpdating(false);
    }
  };

  const expectedInflow = Number(customInflow) || budget?.total_income_expected || 15000;
  const leanReserve = budget?.lean_month_buffer_allocation ?? (expectedInflow * (isLeanMonth ? 0.05 : 0.20));
  const savingsGoals = budget?.savings_goal_allocation ?? (expectedInflow * (isLeanMonth ? 0.10 : 0.15));
  const essentials = budget?.safe_spending_limit ? Math.round(budget.safe_spending_limit * 0.75) : Math.round(expectedInflow * (isLeanMonth ? 0.70 : 0.50));
  const discretionary = Math.max(0, expectedInflow - essentials - leanReserve - savingsGoals);
  const dailyLimit = Math.round(essentials / 30);

  const formatCurrency = (amount) => `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;

  const pieData = [
    { name: t('budget.essentials_title'), value: essentials, color: '#176B5B' },
    { name: t('budget.lean_reserve_title'), value: leanReserve, color: '#D97706' },
    { name: t('budget.goals_title'), value: savingsGoals, color: '#2563EB' },
    { name: t('budget.discretionary_title'), value: discretionary, color: '#9CA3AF' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight">
          {t('budget.title')}
        </h1>
        <p className="text-sm text-[#667085] mt-1">
          {t('budget.subtitle')}
        </p>
      </div>

      {/* Input Inflow & Lean Month Card */}
      <form onSubmit={handleUpdateBudget} className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-[#475467] mb-1.5">
              {t('budget.inflow_label')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#667085]">₹</span>
              <input
                type="number"
                min="1000"
                max="300000"
                step="500"
                value={customInflow}
                onChange={(e) => setCustomInflow(e.target.value)}
                className="w-full bg-[#F7F8F5] border border-[#E3E7E4] rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-[#263238] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 pb-2">
            <input
              type="checkbox"
              id="leanMonthToggle"
              checked={isLeanMonth}
              onChange={(e) => setIsLeanMonth(e.target.checked)}
              className="w-4 h-4 rounded text-[#176B5B] focus:ring-[#176B5B] cursor-pointer"
            />
            <label htmlFor="leanMonthToggle" className="text-xs font-medium text-[#475467] cursor-pointer">
              {t('budget.is_lean_month')}
            </label>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={RefreshCw}
              disabled={updating}
              className="w-full text-xs font-semibold"
            >
              {updating ? t('budget.updating') : t('budget.update_plan')}
            </Button>
          </div>
        </div>
      </form>

      {/* 4 Pillar Allocation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Essentials */}
        <div className="bg-white p-4 rounded-2xl border border-[#E3E7E4] shadow-subtle border-t-4 border-t-[#176B5B]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#176B5B]">50%</span>
            <ShoppingBag className="w-4 h-4 text-[#176B5B]" />
          </div>
          <div className="text-xl font-bold text-[#176B5B]">
            {formatCurrency(essentials)}
          </div>
          <h4 className="text-xs font-bold text-[#263238] mt-1">{t('budget.essentials_title')}</h4>
          <p className="text-[10px] text-[#667085] mt-0.5 leading-tight">{t('budget.essentials_desc')}</p>
        </div>

        {/* Lean Reserve */}
        <div className="bg-white p-4 rounded-2xl border border-[#E3E7E4] shadow-subtle border-t-4 border-t-[#D97706]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#D97706]">20%</span>
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-xl font-bold text-[#D97706]">
            {formatCurrency(leanReserve)}
          </div>
          <h4 className="text-xs font-bold text-[#263238] mt-1">{t('budget.lean_reserve_title')}</h4>
          <p className="text-[10px] text-[#667085] mt-0.5 leading-tight">{t('budget.lean_reserve_desc')}</p>
        </div>

        {/* Goals */}
        <div className="bg-white p-4 rounded-2xl border border-[#E3E7E4] shadow-subtle border-t-4 border-t-[#2563EB]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#2563EB]">17%</span>
            <Target className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-xl font-bold text-[#2563EB]">
            {formatCurrency(savingsGoals)}
          </div>
          <h4 className="text-xs font-bold text-[#263238] mt-1">{t('budget.goals_title')}</h4>
          <p className="text-[10px] text-[#667085] mt-0.5 leading-tight">{t('budget.goals_desc')}</p>
        </div>

        {/* Discretionary */}
        <div className="bg-white p-4 rounded-2xl border border-[#E3E7E4] shadow-subtle border-t-4 border-t-[#9CA3AF]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#6B7280]">13%</span>
            <Coffee className="w-4 h-4 text-[#6B7280]" />
          </div>
          <div className="text-xl font-bold text-[#4B5563]">
            {formatCurrency(discretionary)}
          </div>
          <h4 className="text-xs font-bold text-[#263238] mt-1">{t('budget.discretionary_title')}</h4>
          <p className="text-[10px] text-[#667085] mt-0.5 leading-tight">{t('budget.discretionary_desc')}</p>
        </div>
      </div>

      {/* Visual Donut Chart & Daily Safe Limit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle">
          <h3 className="text-sm font-bold text-[#263238] mb-2">
            📊 Recommended Monthly Distribution
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [formatCurrency(val), 'Allocation']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E3E7E4' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Spending Limit Card & Wisdom */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                  {t('budget.daily_spending_limit')}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#15803D] mt-1">
                  {formatCurrency(dailyLimit)} / day
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] text-[#137333] flex items-center justify-center text-xl">
                🗓️
              </div>
            </div>
            <p className="text-xs text-[#667085] mt-2">
              {t('budget.daily_limit_desc')}
            </p>
          </div>

          <div className="bg-[#F0F7F4] p-4 rounded-2xl border border-[#C2DFD4] border-l-4 border-l-[#176B5B]">
            <h4 className="text-xs font-bold text-[#176B5B] mb-1">
              💡 {t('budget.wisdom_title')}
            </h4>
            <p className="text-xs text-[#2D4A41] leading-relaxed">
              {t('budget.wisdom_body')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
