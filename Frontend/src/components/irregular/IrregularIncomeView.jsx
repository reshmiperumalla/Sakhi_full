import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { TrendingUp, ShieldCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';

export function IrregularIncomeView() {
  const { t, currentLanguage } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalysis() {
      setLoading(true);
      try {
        const res = await api.getIrregularIncomeAnalysis();
        setData(res);
      } catch (err) {
        console.warn('Irregular income fallback:', err);
        setData({
          safe_spending_baseline: 8500,
          lean_month_cushion: 34000,
          current_reserve: 18000,
          monthly_cashflows: [
            { month: 'May', income: 6000, expense: 7000 },
            { month: 'Jun', income: 5500, expense: 6500 },
            { month: 'Jul', income: 14000, expense: 8000 },
            { month: 'Aug', income: 12000, expense: 7500 },
            { month: 'Sep', income: 18000, expense: 9000 }
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [currentLanguage]);

  const safeBaseline = data?.safe_spending_baseline || 8500;
  const currentReserve = data?.current_reserve || 18000;
  const targetReserve = data?.lean_month_cushion || 34000;
  const chartData = data?.monthly_cashflows || [
    { month: 'May', income: 6000, expense: 7000 },
    { month: 'Jun', income: 5500, expense: 6500 },
    { month: 'Jul', income: 14000, expense: 8000 },
    { month: 'Aug', income: 12000, expense: 7500 },
    { month: 'Sep', income: 18000, expense: 9000 }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3E7E4]">
        <div>
          <h1 className="text-xl font-bold text-[#263238]">
            {t('irregular.title')}
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {t('irregular.subtitle')}
          </p>
        </div>
      </div>

      {/* 2 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <StatCard
          title={t('irregular.safe_baseline')}
          amount={safeBaseline}
          subtitle={t('irregular.subtitle')}
          icon={ShieldCheck}
          variant="sage"
        />

        <StatCard
          title={t('irregular.cushion_fund')}
          amount={currentReserve}
          subtitle={`${t('goals.target')}: ${formatCurrency(targetReserve)}`}
          icon={TrendingUp}
          variant="warm"
        />
      </div>

      {/* Cashflow Chart */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
            {t('irregular.title')}
          </span>
          <span className="text-xs text-[#667085] flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#176B5B]" /> {t('transactions.income')}
            <span className="w-2.5 h-2.5 rounded bg-[#CBD5E1] ml-2" /> {t('transactions.expense')}
          </span>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E7E4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667085' }} />
              <YAxis tick={{ fontSize: 11, fill: '#667085' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3E7E4', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val) => formatCurrency(val)}
              />
              <ReferenceLine y={safeBaseline} stroke="#176B5B" strokeDasharray="4 4" label={{ value: t('irregular.safe_baseline'), fill: '#176B5B', fontSize: 10 }} />
              <Bar dataKey="income" fill="#176B5B" radius={[4, 4, 0, 0]} name={t('transactions.income')} />
              <Bar dataKey="expense" fill="#CBD5E1" radius={[4, 4, 0, 0]} name={t('transactions.expense')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
