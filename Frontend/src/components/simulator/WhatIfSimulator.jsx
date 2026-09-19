import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { formatCurrency } from '../../lib/utils';
import { speechService } from '../../services/speech';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  SlidersHorizontal,
  Volume2,
  RotateCcw
} from 'lucide-react';

export function WhatIfSimulator() {
  const { currentLanguage, t } = useLanguage();

  const [incomeChange, setIncomeChange] = useState(0);
  const [expenseChange, setExpenseChange] = useState(0);
  const [loanEmi, setLoanEmi] = useState(0);
  const [leanMonths, setLeanMonths] = useState(2);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runSim = async (inc = incomeChange, exp = expenseChange, emi = loanEmi, lean = leanMonths) => {
    setLoading(true);
    try {
      const res = await api.runSimulation({
        income_change_percentage: Number(inc),
        expense_change_amount: Number(exp),
        new_monthly_loan_emi: Number(emi),
        hypothetical_lean_months: Number(lean),
        language: currentLanguage
      });
      setResult(res);
    } catch (err) {
      console.warn('Simulation fallback:', err);
      const baseInc = 15000;
      const baseExp = 10000;
      const simInc = baseInc * (1 + inc / 100);
      const simExp = baseExp + exp + emi;
      const baseNet = baseInc - baseExp;
      const simNet = simInc - simExp;
      const isSafe = simNet >= 0;

      setResult({
        baseline: {
          monthly_income: baseInc,
          monthly_expenses: baseExp,
          net_remaining: baseNet,
          runway_months: 3.5
        },
        simulated: {
          monthly_income: simInc,
          monthly_expenses: simExp,
          net_remaining: simNet,
          runway_months: Math.max(0.5, (35000 / Math.max(1, simExp)).toFixed(1))
        },
        net_difference: simNet - baseNet,
        risk_level: isSafe ? 'SAFE' : 'HIGH_RISK',
        explanation: isSafe
          ? t('dashboard.saheli_tip_body')
          : t('assistant.q3'),
        actionable_recommendations: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSim();
  }, [currentLanguage]);

  const resetValues = () => {
    setIncomeChange(0);
    setExpenseChange(0);
    setLoanEmi(0);
    setLeanMonths(2);
    runSim(0, 0, 0, 2);
  };

  const speakAdvice = () => {
    if (!result) return;
    speechService.speak(result.explanation, currentLanguage);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      {/* Clean Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3E7E4]">
        <div>
          <h1 className="text-xl font-bold text-[#263238]">
            {t('simulator.title')}
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {t('simulator.subtitle')}
          </p>
        </div>

        <button
          onClick={resetValues}
          title={t('common.new_session')}
          className="p-2 rounded-xl text-[#667085] hover:text-[#263238] hover:bg-[#EFEFEA] transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Levers Card */}
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-[#263238] flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#176B5B]" />
          <span>{t('simulator.title')}</span>
        </h2>

        {/* Lever 1: Income Change */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-[#263238]">{t('simulator.income_slider')}</span>
            <span className={incomeChange > 0 ? 'text-[#176B5B] font-bold' : incomeChange < 0 ? 'text-[#C54B4B] font-bold' : 'text-[#667085]'}>
              {incomeChange > 0 ? `+${incomeChange}%` : `${incomeChange}%`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={incomeChange}
            onChange={(e) => setIncomeChange(Number(e.target.value))}
            onMouseUp={() => runSim(incomeChange, expenseChange, loanEmi, leanMonths)}
            onTouchEnd={() => runSim(incomeChange, expenseChange, loanEmi, leanMonths)}
            className="w-full h-2 bg-[#EFEFEA] rounded-lg appearance-none cursor-pointer accent-[#176B5B]"
          />
        </div>

        {/* Lever 2: Expense Spike */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-[#263238]">{t('simulator.expense_slider')}</span>
            <span className="text-[#263238] font-bold">
              {expenseChange > 0 ? `+${formatCurrency(expenseChange)}` : '₹0'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="500"
            value={expenseChange}
            onChange={(e) => setExpenseChange(Number(e.target.value))}
            onMouseUp={() => runSim(incomeChange, expenseChange, loanEmi, leanMonths)}
            onTouchEnd={() => runSim(incomeChange, expenseChange, loanEmi, leanMonths)}
            className="w-full h-2 bg-[#EFEFEA] rounded-lg appearance-none cursor-pointer accent-[#176B5B]"
          />
        </div>

        {/* Lever 3: Loan EMI */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-[#263238]">{t('simulator.loan_slider')}</span>
            <span className="text-[#263238] font-bold">
              {loanEmi > 0 ? `+${formatCurrency(loanEmi)}` : '₹0'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="8000"
            step="500"
            value={loanEmi}
            onChange={(e) => setLoanEmi(Number(e.target.value))}
            onMouseUp={() => runSim(incomeChange, expenseChange, loanEmi, leanMonths)}
            onTouchEnd={() => runSim(incomeChange, expenseChange, loanEmi, leanMonths)}
            className="w-full h-2 bg-[#EFEFEA] rounded-lg appearance-none cursor-pointer accent-[#176B5B]"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => runSim(incomeChange, expenseChange, loanEmi, leanMonths)}
          disabled={loading}
          className="w-full"
        >
          {loading ? t('common.loading') : t('simulator.run_sim')}
        </Button>
      </Card>

      {/* Comparison & Results */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Baseline Card */}
            <Card className="space-y-2">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wide">
                {t('simulator.baseline')}
              </span>
              <div className="text-xs text-[#667085]">
                {t('transactions.total_in')} <strong className="text-[#263238]">{formatCurrency(result.baseline.monthly_income)}</strong>
              </div>
              <div className="text-xs text-[#667085]">
                {t('transactions.total_out')} <strong className="text-[#263238]">{formatCurrency(result.baseline.monthly_expenses)}</strong>
              </div>
              <div className="pt-2 border-t border-[#E3E7E4] text-xs font-semibold text-[#263238] flex justify-between">
                <span>{t('transactions.balance')}</span>
                <span className="text-[#176B5B]">{formatCurrency(result.baseline.net_remaining)}</span>
              </div>
            </Card>

            {/* Simulated Card */}
            <Card className="space-y-2 bg-[#F2F7F5] border-[#D3E5DE]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#176B5B] uppercase tracking-wide">
                  {t('simulator.simulated')}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  result.risk_level === 'SAFE'
                    ? 'bg-[#DDEDE7] text-[#176B5B]'
                    : 'bg-[#FEF2F2] text-[#C54B4B]'
                }`}>
                  {result.risk_level === 'SAFE' ? t('scam.safe_verdict') : t('scam.danger_verdict')}
                </span>
              </div>
              <div className="text-xs text-[#667085]">
                {t('transactions.total_in')} <strong className="text-[#263238]">{formatCurrency(result.simulated.monthly_income)}</strong>
              </div>
              <div className="text-xs text-[#667085]">
                {t('transactions.total_out')} <strong className="text-[#263238]">{formatCurrency(result.simulated.monthly_expenses)}</strong>
              </div>
              <div className="pt-2 border-t border-[#D3E5DE] text-xs font-semibold text-[#263238] flex justify-between">
                <span>{t('transactions.balance')}</span>
                <span className={result.simulated.net_remaining >= 0 ? 'text-[#176B5B]' : 'text-[#C54B4B]'}>
                  {formatCurrency(result.simulated.net_remaining)}
                </span>
              </div>
            </Card>
          </div>

          {/* Advice */}
          <Card className="bg-[#FCFAF2] border-[#ECE6D5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8A6D1C] uppercase tracking-wide">
                {t('simulator.ai_verdict')}
              </span>
              <button
                onClick={speakAdvice}
                className="text-xs text-[#8A6D1C] hover:text-[#5A450C] flex items-center gap-1 cursor-pointer"
                title={t('dashboard.read_aloud')}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t('dashboard.read_aloud')}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#263238] leading-relaxed">
              {result.explanation}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
