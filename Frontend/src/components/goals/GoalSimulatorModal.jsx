import React, { useState } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../lib/utils';
import { X, Sparkles, Clock, ArrowRight, Zap } from 'lucide-react';

export function GoalSimulatorModal({ isOpen, onClose, goal }) {
  const { language } = useLanguage();
  const [savingsInput, setSavingsInput] = useState(goal ? goal.monthly_contribution_planned * 1.5 : 2000);
  const [simulation, setSimulation] = useState(null);
  const [simulating, setSimulating] = useState(false);

  if (!isOpen || !goal) return null;

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await api.simulateGoal(goal.id, Number(savingsInput));
      setSimulation(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Savings Impact Simulator
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          See how saving just a bit more each month accelerates '{goal.title}'.
        </p>

        {/* Current status */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 flex justify-between items-center mb-4">
          <span>Current Monthly Plan:</span>
          <span className="font-bold text-slate-900">{formatCurrency(goal.monthly_contribution_planned)}/mo</span>
        </div>

        {/* Hypothetical Savings Slider / Input */}
        <div className="space-y-2 mb-5">
          <label className="block text-xs font-bold text-slate-700">
            What if you save each month:
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
            <input
              type="number"
              value={savingsInput}
              onChange={(e) => {
                setSavingsInput(e.target.value);
                setSimulation(null);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-7 pr-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleSimulate}
            disabled={simulating || !savingsInput}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs mt-2"
          >
            {simulating ? 'Calculating...' : 'Simulate Timeline'}
          </button>
        </div>

        {/* Simulation Output Card */}
        {simulation && (
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-indigo-900">New Timeline:</span>
              <span className="text-sm font-black text-indigo-700">
                {simulation.new_months_to_complete} months
              </span>
            </div>

            <div className="text-xs text-emerald-700 font-bold bg-emerald-100/60 p-2 rounded-xl flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Saves you {simulation.months_saved} whole months of waiting!</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed pt-1">
              {simulation.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
