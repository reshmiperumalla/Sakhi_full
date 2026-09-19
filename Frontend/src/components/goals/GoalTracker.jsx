import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { GoalSimulatorModal } from './GoalSimulatorModal';
import { Target, Plus, X } from 'lucide-react';
import { getLocalizedGoalTitle } from '../../utils/goalUtils';

export function GoalTracker() {
  const { t, currentLanguage } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoalForSim, setSelectedGoalForSim] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New goal form state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyPlanned, setMonthlyPlanned] = useState('1500');
  const [category, setCategory] = useState('emergency');

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (e) {
      console.warn('Goals load fallback:', e);
      setGoals([
        {
          id: 'goal_emergency',
          title: t('dashboard.savings_goal_title'),
          target_amount: 20000,
          current_saved: 8000,
          monthly_planned: 1500,
          progress_percentage: 40
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [currentLanguage]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    try {
      await api.createGoal({
        title,
        target_amount: Number(targetAmount),
        monthly_contribution_planned: Number(monthlyPlanned) || 1000,
        category
      });
      setTitle('');
      setTargetAmount('');
      setShowAddModal(false);
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAdd = async (goal, increment = 500) => {
    try {
      const updatedSaved = (goal.current_saved || 0) + increment;
      await api.updateGoal(goal.id || goal._id, { current_saved: updatedSaved });
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3E7E4]">
        <div>
          <h1 className="text-xl font-bold text-[#263238]">
            {t('goals.title')}
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {t('goals.subtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setShowAddModal(true)}
        >
          {t('goals.add_goal')}
        </Button>
      </div>

      {/* Goal Cards List */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const target = goal.target_amount || 20000;
          const saved = goal.current_saved || 0;
          const pct = Math.min(100, Math.round((saved / target) * 100));
          const remaining = Math.max(0, target - saved);

          return (
            <Card key={goal.id || goal._id} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#DDEDE7] flex items-center justify-center text-[#176B5B] shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#263238]">
                      {getLocalizedGoalTitle(goal.title, goal.category, t)}
                    </h2>
                    <span className="text-xs text-[#667085]">
                      {t('goals.saved')}: <strong className="text-[#263238]">{formatCurrency(saved)}</strong> / {formatCurrency(target)}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#176B5B]">
                  {pct}%
                </span>
              </div>

              <ProgressBar progress={pct} />

              <div className="flex items-center justify-between pt-1 text-xs text-[#667085]">
                <span>
                  {formatCurrency(remaining)} {t('dashboard.remaining')}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickAdd(goal, 500)}
                    className="px-2.5 py-1 rounded-lg bg-[#F7F8F5] border border-[#E3E7E4] hover:border-[#176B5B] text-[#263238] hover:text-[#176B5B] font-medium transition cursor-pointer"
                  >
                    {t('goals.add_funds')}
                  </button>

                  <button
                    onClick={() => setSelectedGoalForSim(goal)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#E3E7E4] hover:border-[#CBD5E1] text-[#667085] hover:text-[#263238] font-medium transition cursor-pointer"
                  >
                    {t('goals.simulate_timeline')}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal: New Goal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-card border border-[#E3E7E4]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E7E4]">
              <h3 className="text-sm font-bold text-[#263238]">
                {t('goals.modal_title')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#667085] hover:text-[#263238] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1">
                  {t('goals.goal_title')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('goals.goal_title_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E7E4] text-xs text-[#263238] focus:border-[#176B5B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1">
                  {t('goals.target_amount')}
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  placeholder={t('goals.target_placeholder')}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E7E4] text-xs text-[#263238] focus:border-[#176B5B] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
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
                >
                  {t('goals.create_button')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {selectedGoalForSim && (
        <GoalSimulatorModal
          goal={selectedGoalForSim}
          onClose={() => setSelectedGoalForSim(null)}
        />
      )}
    </div>
  );
}
