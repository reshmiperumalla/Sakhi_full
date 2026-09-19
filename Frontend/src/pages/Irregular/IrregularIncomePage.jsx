import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Shield, TrendingUp, Calendar, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Legend
} from 'recharts';

export function IrregularIncomePage() {
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
        console.warn('Irregular income analysis fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [currentLanguage]);

  const volatility = data?.volatility_metrics || {};
  const safeBaseline = volatility.safe_baseline_income || 12000;
  const targetBuffer = data?.target_emergency_buffer || (safeBaseline * 3);
  const currentBuffer = data?.current_estimated_buffer || 8500;
  const runwayMonths = Math.max(0.5, (currentBuffer / (safeBaseline * 0.75))).toFixed(1);

  // Format monthly history for Recharts
  const historyList = data?.monthly_history || [
    { month: 'Month 1', income: 12000 },
    { month: 'Month 2', income: 18000 },
    { month: 'Month 3', income: 9000 },
    { month: 'Month 4', income: 14000 }
  ];

  const formatCurrency = (amt) => `₹${Math.round(amt || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight">
          {t('irregular.title')}
        </h1>
        <p className="text-sm text-[#667085] mt-1">
          {t('irregular.subtitle')}
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            {t('irregular.safe_baseline')}
          </span>
          <div className="text-2xl font-bold text-[#176B5B] mt-1">
            {formatCurrency(safeBaseline)}
          </div>
          <p className="text-xs text-[#667085] mt-1">
            {t('irregular.safe_baseline_desc')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            {t('irregular.current_cushion')}
          </span>
          <div className="text-2xl font-bold text-[#263238] mt-1">
            {formatCurrency(currentBuffer)}
          </div>
          <p className="text-xs text-[#667085] mt-1">
            {t('irregular.target_cushion')}: {formatCurrency(targetBuffer)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            {t('irregular.runway_title')}
          </span>
          <div className="text-2xl font-bold text-[#D97706] mt-1">
            {runwayMonths} {t('irregular.months_unit')}
          </div>
          <p className="text-xs text-[#667085] mt-1">
            {t('irregular.runway_desc')}
          </p>
        </div>
      </div>

      {/* Visual Income Volatility Chart */}
      <div className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#263238]">
              {t('irregular.pattern_title')}
            </h3>
            <p className="text-xs text-[#667085] mt-0.5">
              {t('irregular.pattern_desc')}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-[#176B5B]">
              <span className="w-3 h-3 rounded-full bg-[#176B5B]"></span>
              Income Received
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#D97706]">
              <span className="w-3 h-0.5 bg-[#D97706]"></span>
              Safe Baseline
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E7E4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667085' }} />
              <YAxis tick={{ fontSize: 10, fill: '#667085' }} />
              <Tooltip 
                formatter={(val) => [`₹${val.toLocaleString()}`, 'Income']}
                contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E3E7E4' }}
              />
              <ReferenceLine y={safeBaseline} stroke="#D97706" strokeDasharray="4 4" strokeWidth={2} />
              <Bar dataKey="income" fill="#176B5B" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3 Visual Rhythm Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#E3E7E4] shadow-subtle">
          <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] text-[#137333] flex items-center justify-center font-bold text-sm mb-2">
            🌾
          </div>
          <h4 className="text-xs font-bold text-[#263238]">
            {t('transactions.freq_seasonal')}
          </h4>
          <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
            Agriculture harvests, festive market sales, or wool shearing. High cash surges twice a year.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E3E7E4] shadow-subtle">
          <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center font-bold text-sm mb-2">
            🔨
          </div>
          <h4 className="text-xs font-bold text-[#263238]">
            {t('transactions.freq_occasional')}
          </h4>
          <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
            Construction labor, tailoring orders, or village catering. Fluctuates by season and local demand.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E3E7E4] shadow-subtle">
          <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold text-sm mb-2">
            🥛
          </div>
          <h4 className="text-xs font-bold text-[#263238]">
            {t('transactions.freq_regular')}
          </h4>
          <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
            Daily dairy milk cooperative sales, poultry eggs, or fixed pension payments. Provides baseline cash.
          </p>
        </div>
      </div>

      {/* Sakhi Seasonal Strategy Box */}
      <div className="bg-[#F0F7F4] rounded-2xl p-5 border border-[#C2DFD4] border-l-4 border-l-[#176B5B] flex items-start gap-3.5 shadow-subtle">
        <span className="text-2xl shrink-0">💡</span>
        <div>
          <h4 className="text-sm font-bold text-[#176B5B] mb-1">
            {t('irregular.advice_title')}
          </h4>
          <p className="text-xs sm:text-sm text-[#2D4A41] leading-relaxed">
            {t('irregular.advice_body')}
          </p>
        </div>
      </div>
    </div>
  );
}
