import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Target, Plus, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { getLocalizedGoalTitle } from '../../utils/goalUtils';

export function GoalsPage() {
  const { t, currentLanguage } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('1000');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('emergency');
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await api.getGoals();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Goals fetch fallback:', err);
      setGoals([
        {
          id: 'def_goal_1',
          title: t('dashboard.savings_goal_title'),
          target_amount: 25000,
          current_amount: 12000,
          monthly_contribution_planned: 1500,
          category: 'emergency'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [currentLanguage]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    setSubmitting(true);
    try {
      await api.createGoal({
        title,
        target_amount: Number(targetAmount),
        current_amount: 0,
        monthly_contribution_planned: Number(monthlyContribution) || 1000,
        target_date: targetDate || undefined,
        category
      });
      setTitle('');
      setTargetAmount('');
      setShowAddModal(false);
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAddFunds = async (goalId, currentAmt) => {
    try {
      const updatedAmt = (Number(currentAmt) || 0) + 500;
      await api.updateGoal(goalId, { current_amount: updatedAmt });
      fetchGoals();
    } catch (err) {
      console.error('Failed to add funds to goal:', err);
    }
  };

  const formatCurrency = (val) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  const categoryIcons = {
    emergency: '🛡️',
    education: '📚',
    farming: '🌾',
    home: '🏠',
    medical: '💊',
    other: '🎯'
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight">
            {t('goals.title')}
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            {t('goals.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setShowAddModal(true)}
        >
          {t('goals.new_goal_btn')}
        </Button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-[#667085]">
          {t('common.loading')}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={t('goals.empty_goals')}
          description={t('goals.empty_goals_desc')}
          actionLabel={t('goals.empty_goals_btn')}
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const goalId = goal.id || goal._id;
            const curAmt = Number(goal.current_amount ?? goal.current_saved ?? 0);
            const tgtAmt = Math.max(1, Number(goal.target_amount ?? 1));
            const progress = Math.min(100, Math.round((curAmt / tgtAmt) * 100));
            const remaining = Math.max(0, tgtAmt - curAmt);
            const icon = categoryIcons[goal.category] || '🎯';
            const isCompleted = progress >= 100;

            return (
              <div
                key={goalId}
                className="bg-white p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <h3 className="text-base font-bold text-[#263238] leading-snug">
                          {getLocalizedGoalTitle(goal.title, goal.category, t)}
                        </h3>
                        <span className="text-[11px] text-[#667085]">
                          {t(`goals.cat_${goal.category}`, goal.category)}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isCompleted ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#DDEDE7] text-[#176B5B]'
                    }`}>
                      {progress}%
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-[#263238]">
                        {formatCurrency(curAmt)}
                      </span>
                      <span className="text-xs text-[#667085]">
                        / {formatCurrency(tgtAmt)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#F0F2EE] rounded-full h-2.5 mt-2 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-[#137333]' : 'bg-[#176B5B]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-[#667085] mt-2">
                      <span>
                        {isCompleted ? t('goals.achieved') : `${formatCurrency(remaining)} ${t('goals.remaining')}`}
                      </span>
                      <span>
                        Plan: {formatCurrency(goal.monthly_contribution_planned || 1000)}/mo
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F0F2EE] flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAddFunds(goalId, curAmt)}
                    className="text-xs font-bold text-[#176B5B] border-[#B8D8CE] hover:bg-[#DDEDE7]/30"
                  >
                    {t('goals.btn_add_500')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-[#E3E7E4] animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E7E4] mb-4">
              <h3 className="text-base font-bold text-[#263238]">
                {t('goals.create_goal_title')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#667085] hover:text-[#263238] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#475467] mb-1">
                  {t('goals.goal_name')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('goals.goal_name_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F7F8F5] border border-[#E3E7E4] rounded-xl px-3.5 py-2 text-sm text-[#263238] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475467] mb-1">
                    {t('goals.target_amount')}
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    required
                    placeholder="e.g. 20000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-[#F7F8F5] border border-[#E3E7E4] rounded-xl px-3.5 py-2 text-sm text-[#263238] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475467] mb-1">
                    {t('goals.monthly_contribution')}
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="w-full bg-[#F7F8F5] border border-[#E3E7E4] rounded-xl px-3.5 py-2 text-sm text-[#263238] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475467] mb-1">
                  {t('goals.category')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#F7F8F5] border border-[#E3E7E4] rounded-xl px-3.5 py-2 text-sm text-[#263238] focus:bg-white focus:outline-none"
                >
                  <option value="emergency">{t('goals.cat_emergency')}</option>
                  <option value="education">{t('goals.cat_education')}</option>
                  <option value="farming">{t('goals.cat_farming')}</option>
                  <option value="home">{t('goals.cat_home')}</option>
                  <option value="medical">{t('goals.cat_medical')}</option>
                  <option value="other">{t('goals.cat_other')}</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? t('common.loading') : t('goals.btn_create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
