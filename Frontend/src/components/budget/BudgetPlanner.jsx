import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Shield, Target, Coffee, ShoppingBag, RefreshCw } from 'lucide-react';

export function BudgetPlanner() {
  const { t, currentLanguage } = useLanguage();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customInflow, setCustomInflow] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const loadBudget = async () => {
    setLoading(true);
    try {
      const data = await api.getCurrentBudget();
      setBudget(data);
      if (data?.total_income_expected) {
        setCustomInflow(data.total_income_expected);
      }
    } catch (e) {
      console.warn('Budget load fallback:', e);
      setBudget({
        total_income_expected: 15000,
        allocations: {
          essentials: 7500,
          lean_month_reserve: 3000,
          savings_goals: 2500,
          discretionary: 2000
        },
        percentages: {
          essentials: 50,
          lean_month_reserve: 20,
          savings_goals: 17,
          discretionary: 13
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudget();
  }, [currentLanguage]);

  const handleRegenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const updated = await api.generateBudget({
        monthly_inflow: customInflow ? Number(customInflow) : undefined
      });
      setBudget(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const total = budget?.total_income_expected || 15000;
  const allocations = budget?.allocations || {
    essentials: 7500,
    lean_month_reserve: 3000,
    savings_goals: 2500,
    discretionary: 2000
  };
  const percentages = budget?.percentages || {
    essentials: 50,
    lean_month_reserve: 20,
    savings_goals: 17,
    discretionary: 13
  };

  const categories = [
    {
      key: 'essentials',
      title: t('budget.essentials'),
      amount: allocations.essentials,
      percentage: percentages.essentials,
      icon: ShoppingBag,
      variant: 'bg-[#DDEDE7] text-[#176B5B]'
    },
    {
      key: 'lean',
      title: t('budget.lean_cushion'),
      amount: allocations.lean_month_reserve,
      percentage: percentages.lean_month_reserve,
      icon: Shield,
      variant: 'bg-[#FCFAF2] text-[#8A6D1C]'
    },
    {
      key: 'goals',
      title: t('budget.goals_share'),
      amount: allocations.savings_goals,
      percentage: percentages.savings_goals,
      icon: Target,
      variant: 'bg-[#F0F6F4] text-[#176B5B]'
    },
    {
      key: 'discretionary',
      title: t('budget.discretionary'),
      amount: allocations.discretionary,
      percentage: percentages.discretionary,
      icon: Coffee,
      variant: 'bg-[#F2F4F7] text-[#475467]'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3E7E4]">
        <div>
          <h1 className="text-xl font-bold text-[#263238]">
            {t('budget.title')}
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {t('budget.subtitle')}
          </p>
        </div>
      </div>

      {/* Inflow Adjustment Form */}
      <Card>
        <form onSubmit={handleRegenerate} className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-[#263238] mb-1">
              {t('budget.monthly_income_label')}
            </label>
            <input
              type="number"
              min="1000"
              step="500"
              value={customInflow}
              onChange={(e) => setCustomInflow(e.target.value)}
              placeholder="15000"
              className="w-full p-2.5 rounded-xl border border-[#E3E7E4] text-sm text-[#263238] focus:border-[#176B5B] focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isGenerating}
            icon={RefreshCw}
            className="shrink-0 cursor-pointer"
          >
            {isGenerating ? t('budget.updating') : t('budget.generate_plan')}
          </Button>
        </form>
      </Card>

      {/* Total Overview & Allocation Bar */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
            {t('budget.recommended_allocation')}
          </span>
          <span className="text-base font-bold text-[#263238]">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Stacked bar */}
        <div className="w-full h-3 bg-[#EFEFEA] rounded-full flex overflow-hidden">
          <div style={{ width: `${percentages.essentials}%` }} className="bg-[#176B5B]" title={`Essentials: ${percentages.essentials}%`} />
          <div style={{ width: `${percentages.lean_month_reserve}%` }} className="bg-[#D4B04C]" title={`Lean Reserve: ${percentages.lean_month_reserve}%`} />
          <div style={{ width: `${percentages.savings_goals}%` }} className="bg-[#5CA696]" title={`Goals: ${percentages.savings_goals}%`} />
          <div style={{ width: `${percentages.discretionary}%` }} className="bg-[#CBD5E1]" title={`Discretionary: ${percentages.discretionary}%`} />
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#E3E7E4] bg-white flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cat.variant}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-[#667085]">
                      {cat.title}
                    </div>
                    <div className="text-sm font-bold text-[#263238]">
                      {formatCurrency(cat.amount)}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F7F8F5] border border-[#E3E7E4] text-[#667085]">
                  {cat.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
