import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { User, Users, Check, Save, Sparkles, Heart } from 'lucide-react';

export function ProfilePage() {
  const { t, currentLanguage } = useLanguage();

  const [activeStep, setActiveStep] = useState(1);
  const [selectedSource, setSelectedSource] = useState('farming');
  const [frequency, setFrequency] = useState('seasonal');
  const [typicalIncome, setTypicalIncome] = useState(15000);
  const [dependents, setDependents] = useState(3);
  const [targetSavings, setTargetSavings] = useState(2000);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load existing profile if available
  useEffect(() => {
    async function loadProfile() {
      try {
        const p = await api.getProfile();
        if (p?.profile) {
          if (p.profile.income_pattern) setFrequency(p.profile.income_pattern);
          if (p.profile.dependents_count) setDependents(p.profile.dependents_count);
          if (p.profile.monthly_target_savings) setTargetSavings(p.profile.monthly_target_savings);
          if (p.profile.typical_income) setTypicalIncome(p.profile.typical_income);
        }
      } catch (e) {
        console.warn('Profile fetch fallback:', e);
      }
    }
    loadProfile();

    const handleSync = () => loadProfile();
    window.addEventListener('mitra_financial_mutation', handleSync);
    return () => window.removeEventListener('mitra_financial_mutation', handleSync);
  }, [currentLanguage]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.updateProfile({
        income_pattern: frequency,
        income_sources: [selectedSource],
        dependents_count: Number(dependents),
        monthly_target_savings: Number(targetSavings),
        typical_income: Number(typicalIncome),
        preferred_language: currentLanguage
      });
      api.dispatchFinancialMutation();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save profile:', e);
    } finally {
      setSaving(false);
    }
  };

  const incomeSources = [
    { id: 'farming', label: t('profile.source_farming'), icon: '🌾' },
    { id: 'dairy', label: t('profile.source_dairy'), icon: '🐄' },
    { id: 'tailoring', label: t('profile.source_tailoring'), icon: '🧵' },
    { id: 'labor', label: t('profile.source_labor'), icon: '🔨' },
    { id: 'business', label: t('profile.source_business'), icon: '🏪' }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight flex items-center gap-2">
          <span>🏡</span> {t('profile.title')}
        </h1>
        <p className="text-sm text-[#667085] mt-0.5">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* Step Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-[#E3E7E4] shadow-subtle">
        <button
          onClick={() => setActiveStep(1)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeStep === 1 ? 'bg-[#DDEDE7] text-[#176B5B]' : 'text-[#667085] hover:text-[#263238]'
          }`}
        >
          {t('profile.step1_title')}
        </button>
        <button
          onClick={() => setActiveStep(2)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeStep === 2 ? 'bg-[#DDEDE7] text-[#176B5B]' : 'text-[#667085] hover:text-[#263238]'
          }`}
        >
          {t('profile.step2_title')}
        </button>
        <button
          onClick={() => setActiveStep(3)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeStep === 3 ? 'bg-[#DDEDE7] text-[#176B5B]' : 'text-[#667085] hover:text-[#263238]'
          }`}
        >
          {t('profile.step3_title')}
        </button>
      </div>

      {/* Step Content Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3E7E4] shadow-card space-y-6">
        {/* Step 1: Income Source & Rhythm */}
        {activeStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label className="block text-sm font-bold text-[#263238] mb-2.5">
                {t('profile.income_source_label')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {incomeSources.map((src) => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSelectedSource(src.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                      selectedSource === src.id
                        ? 'bg-[#DDEDE7] border-[#176B5B] text-[#176B5B] font-bold shadow-xs'
                        : 'bg-white border-[#E3E7E4] text-[#374151] hover:bg-[#FAFBF9]'
                    }`}
                  >
                    <span className="text-xl">{src.icon}</span>
                    <span className="text-xs leading-tight">{src.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#263238] mb-2">
                {t('profile.frequency_label')}
              </label>
              <div className="space-y-2">
                {[
                  { id: 'seasonal', label: t('profile.freq_seasonal') },
                  { id: 'daily', label: t('profile.freq_daily') },
                  { id: 'monthly', label: t('profile.freq_monthly') }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      frequency === item.id ? 'bg-[#F0F7F4] border-[#176B5B]' : 'border-[#E3E7E4] hover:bg-[#FAFBF9]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="freq"
                      checked={frequency === item.id}
                      onChange={() => setFrequency(item.id)}
                      className="text-[#176B5B] focus:ring-[#176B5B]"
                    />
                    <span className="text-xs font-semibold text-[#263238]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Household Setup & Family */}
        {activeStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-[#475467] mb-1.5">
                {t('profile.typical_monthly')}
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={typicalIncome}
                onChange={(e) => setTypicalIncome(e.target.value)}
                className="w-full bg-[#F7F8F5] border border-[#E3E7E4] rounded-xl px-4 py-2.5 text-sm font-bold text-[#263238] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475467] mb-1.5">
                {t('profile.dependents_label')}
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDependents(num)}
                    className={`w-10 h-10 rounded-xl font-bold text-xs transition cursor-pointer ${
                      dependents === num
                        ? 'bg-[#176B5B] text-white'
                        : 'bg-[#F7F8F5] border border-[#E3E7E4] text-[#475467] hover:bg-[#EFEFEA]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475467] mb-1.5">
                {t('profile.target_savings')}
              </label>
              <input
                type="number"
                min="500"
                step="500"
                value={targetSavings}
                onChange={(e) => setTargetSavings(e.target.value)}
                className="w-full bg-[#F7F8F5] border border-[#E3E7E4] rounded-xl px-4 py-2.5 text-sm font-bold text-[#263238] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Seasonal Calendar */}
        {activeStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="text-sm font-bold text-[#263238]">
              🗓️ Typical Rural Indian Seasonal Cycle
            </h4>
            <div className="p-4 rounded-2xl bg-[#F0F7F4] border border-[#C2DFD4] text-xs text-[#2D4A41] leading-relaxed space-y-2">
              <p>
                <strong>🌾 Harvest Peak (October – December & March – April):</strong> Highest cash inflows from crop marketing, seasonal contracts, and festival business.
              </p>
              <p>
                <strong>☀️ Lean Months (May – June & August):</strong> Dry spells, intense agricultural sowing investments, and limited wage opportunities.
              </p>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="pt-4 border-t border-[#E3E7E4] flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-xs text-[#137333] font-bold">
                ✓ {t('profile.saved_success')}
              </span>
            )}
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Save}
            disabled={saving}
            onClick={handleSaveProfile}
          >
            {saving ? t('profile.saving') : t('profile.save_profile')}
          </Button>
        </div>
      </div>
    </div>
  );
}
