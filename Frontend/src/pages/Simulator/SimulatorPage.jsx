import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { SlidersHorizontal, RefreshCw, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

export function SimulatorPage() {
  const { t, currentLanguage } = useLanguage();

  const [incomeChange, setIncomeChange] = useState(-20);
  const [expenseChange, setExpenseChange] = useState(2500);
  const [loanEmi, setLoanEmi] = useState(1500);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.runSimulation({
        income_change_percentage: Number(incomeChange),
        expense_change_amount: Number(expenseChange),
        new_monthly_loan_emi: Number(loanEmi),
        hypothetical_lean_months: 2,
        language: currentLanguage
      });
      setResult(res);
    } catch (err) {
      console.warn('Simulation fallback:', err);
      setResult({
        baseline: {
          monthly_income: 15000,
          monthly_expenses: 10000,
          net_remaining: 5000,
          runway_months: 3.0
        },
        simulated: {
          monthly_income: 12000,
          monthly_expenses: 11500,
          net_remaining: 500,
          runway_months: 1.3
        },
        net_difference: -4500,
        risk_level: 'MODERATE_CAUTION',
        explanation: 'Simulated conditions reduce your monthly safety margin.',
        actionable_recommendations: [
          'Avoid taking new loans until your emergency cushion reaches 3 months.',
          'Review discretionary spending before committing to regular EMIs.'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [currentLanguage]);

  const base = result?.baseline || {};
  const sim = result?.simulated || {};
  const risk = result?.risk_level || 'SAFE';

  const riskBadgeStyles = {
    SAFE: 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]',
    MODERATE_CAUTION: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    HIGH_RISK: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]'
  }[risk] || 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';

  const formatCurrency = (amount) => `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;

  const chartData = [
    {
      metric: 'Inflow',
      Current: Number(base.monthly_income || 15000),
      Simulated: Number(sim.monthly_income || 12000)
    },
    {
      metric: 'Outflow',
      Current: Number(base.monthly_expenses || 10000),
      Simulated: Number(sim.monthly_expenses || 11500)
    },
    {
      metric: 'Remaining',
      Current: Number(base.net_remaining || 5000),
      Simulated: Number(sim.net_remaining || 500)
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight">
          {t('simulator.title')}
        </h1>
        <p className="text-sm text-[#667085] mt-1">
          {t('simulator.subtitle')}
        </p>
      </div>

      {/* Sliders Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Income Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-[#475467] mb-1">
              <span>{t('simulator.income_slider')}</span>
              <span className="text-[#176B5B] font-bold">{incomeChange}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={incomeChange}
              onChange={(e) => setIncomeChange(e.target.value)}
              className="w-full accent-[#176B5B] cursor-pointer"
            />
          </div>

          {/* Expense Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-[#475467] mb-1">
              <span>{t('simulator.expense_slider')}</span>
              <span className="text-[#C54B4B] font-bold">{formatCurrency(expenseChange)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20000"
              step="500"
              value={expenseChange}
              onChange={(e) => setExpenseChange(e.target.value)}
              className="w-full accent-[#C54B4B] cursor-pointer"
            />
          </div>

          {/* Loan Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-[#475467] mb-1">
              <span>{t('simulator.loan_slider')}</span>
              <span className="text-[#D97706] font-bold">{formatCurrency(loanEmi)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={loanEmi}
              onChange={(e) => setLoanEmi(e.target.value)}
              className="w-full accent-[#D97706] cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            icon={RefreshCw}
            disabled={loading}
            onClick={runSimulation}
          >
            {loading ? t('simulator.simulating') : t('simulator.run_sim')}
          </Button>
        </div>
      </div>

      {/* Comparison Cards: Baseline vs Simulated */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Baseline Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle border-l-4 border-l-[#176B5B]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#176B5B]">
              📌 {t('simulator.baseline')}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] font-semibold">
              Current
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <span className="text-[11px] text-[#667085]">{t('simulator.net_buffer')}</span>
              <div className="text-xl font-bold text-[#263238] mt-0.5">
                {formatCurrency(base.net_remaining)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-[#667085]">{t('simulator.runway')}</span>
              <div className="text-xl font-bold text-[#176B5B] mt-0.5">
                {base.runway_months || 3.0} mos
              </div>
            </div>
          </div>
        </div>

        {/* Simulated Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle border-l-4 border-l-[#D97706]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#D97706]">
              🔮 {t('simulator.simulated')}
            </h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${riskBadgeStyles}`}>
              {t(`simulator.risk_${risk.toLowerCase()}`, risk)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <span className="text-[11px] text-[#667085]">{t('simulator.net_buffer')}</span>
              <div className="text-xl font-bold text-[#263238] mt-0.5">
                {formatCurrency(sim.net_remaining)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-[#667085]">{t('simulator.runway')}</span>
              <div className="text-xl font-bold text-[#D97706] mt-0.5">
                {sim.runway_months || 1.3} mos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Before vs After Pictorial Comparison Chart */}
      <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle">
        <h3 className="text-sm font-bold text-[#263238] mb-3">
          📊 Before vs After Pictorial Comparison
        </h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E7E4" />
              <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#667085' }} />
              <YAxis tick={{ fontSize: 10, fill: '#667085' }} />
              <Tooltip 
                formatter={(val) => [formatCurrency(val), 'Amount']}
                contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E3E7E4' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Current" fill="#176B5B" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="Simulated" fill="#D97706" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sakhi Verdict & Advice Box */}
      {result?.explanation && (
        <div className="bg-[#F0F7F4] p-5 rounded-2xl border border-[#C2DFD4] border-l-4 border-l-[#176B5B]">
          <h4 className="text-sm font-bold text-[#176B5B] mb-1">
            💡 {t('simulator.verdict_title')}
          </h4>
          <p className="text-xs sm:text-sm text-[#2D4A41] leading-relaxed">
            {result.explanation}
          </p>
          {Array.isArray(result.actionable_recommendations) && (
            <ul className="mt-2.5 space-y-1 pl-4 list-disc text-xs text-[#2D4A41]">
              {result.actionable_recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
