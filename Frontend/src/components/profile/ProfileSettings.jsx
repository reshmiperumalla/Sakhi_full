import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle2 } from 'lucide-react';

export function ProfileSettings() {
  const { currentLanguage, setLanguage, t } = useLanguage();

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const [profile, setProfile] = useState({
    preferred_language: currentLanguage,
    income_pattern: 'irregular_seasonal',
    income_sources: ['farming', 'tailoring'],
    financial_literacy_level: 'beginner',
    primary_goal: 'emergency_savings',
    dependents_count: 3,
    monthly_target_savings: 2000
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getProfile();
        if (data && data.profile) {
          setProfile(data.profile);
        }
      } catch (err) {
        console.warn('Profile load:', err.message);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await api.updateProfile(profile);
      setSaveSuccess(true);
      if (profile.preferred_language !== currentLanguage) {
        setLanguage(profile.preferred_language);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleSource = (sourceId) => {
    const current = profile.income_sources || [];
    if (current.includes(sourceId)) {
      setProfile({ ...profile, income_sources: current.filter((s) => s !== sourceId) });
    } else {
      setProfile({ ...profile, income_sources: [...current, sourceId] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3E7E4]">
        <div>
          <h1 className="text-xl font-bold text-[#263238]">
            {t('profile.title')}
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {t('profile.subtitle')}
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-[#DDEDE7] border border-[#B8D8CE] text-[#176B5B] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t('profile.saved_success')}</span>
        </div>
      )}

      {/* Step Tabs */}
      <div className="flex rounded-xl bg-[#F7F8F5] p-1 border border-[#E3E7E4]">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeStep === 1 ? 'bg-white text-[#176B5B] shadow-xs' : 'text-[#667085]'
          }`}
        >
          {t('profile.step1')}
        </button>
        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeStep === 2 ? 'bg-white text-[#176B5B] shadow-xs' : 'text-[#667085]'
          }`}
        >
          {t('profile.step2')}
        </button>
        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeStep === 3 ? 'bg-white text-[#176B5B] shadow-xs' : 'text-[#667085]'
          }`}
        >
          {t('profile.step3')}
        </button>
      </div>

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          {/* Step 1: Language & Literacy */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1.5">
                  {t('profile.language')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'hi', label: 'हिंदी' },
                    { id: 'te', label: 'తెలుగు' }
                  ].map((l) => (
                    <button
                      type="button"
                      key={l.id}
                      onClick={() => setProfile({ ...profile, preferred_language: l.id })}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        profile.preferred_language === l.id
                          ? 'bg-[#DDEDE7] border-[#B8D8CE] text-[#176B5B]'
                          : 'bg-white border-[#E3E7E4] text-[#667085]'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1.5">
                  {t('profile.literacy_level')}
                </label>
                <select
                  value={profile.financial_literacy_level}
                  onChange={(e) => setProfile({ ...profile, financial_literacy_level: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E3E7E4] text-xs text-[#263238] bg-white focus:outline-none focus:border-[#176B5B] cursor-pointer"
                >
                  <option value="beginner">{t('profile.levels.beginner')}</option>
                  <option value="intermediate">{t('profile.levels.intermediate')}</option>
                  <option value="advanced">{t('profile.levels.advanced')}</option>
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" onClick={() => setActiveStep(2)}>
                  {t('profile.step2')} →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Income Pattern & Sources */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1.5">
                  {t('profile.income_pattern')}
                </label>
                <select
                  value={profile.income_pattern}
                  onChange={(e) => setProfile({ ...profile, income_pattern: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E3E7E4] text-xs text-[#263238] bg-white focus:outline-none focus:border-[#176B5B] cursor-pointer"
                >
                  <option value="irregular_seasonal">{t('profile.patterns.irregular_seasonal')}</option>
                  <option value="irregular_daily">{t('profile.patterns.irregular_daily')}</option>
                  <option value="regular_monthly">{t('profile.patterns.regular_monthly')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1.5">
                  {t('transactions.category')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'farming', label: t('dashboard.categories.agriculture') },
                    { id: 'dairy', label: t('dashboard.categories.dairy') },
                    { id: 'tailoring', label: t('dashboard.categories.tailoring') },
                    { id: 'salary', label: t('dashboard.categories.salary') },
                    { id: 'small_business', label: t('dashboard.categories.small_business') },
                    { id: 'other', label: t('dashboard.categories.other') }
                  ].map((src) => {
                    const selected = (profile.income_sources || []).includes(src.id);
                    return (
                      <button
                        type="button"
                        key={src.id}
                        onClick={() => toggleSource(src.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          selected
                            ? 'bg-[#DDEDE7] border-[#B8D8CE] text-[#176B5B]'
                            : 'bg-white border-[#E3E7E4] text-[#667085]'
                        }`}
                      >
                        {src.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(1)}>
                  ← {t('common.back')}
                </Button>
                <Button variant="primary" size="sm" onClick={() => setActiveStep(3)}>
                  {t('profile.step3')} →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Family & Savings Target */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1">
                  {t('profile.dependents')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={profile.dependents_count}
                  onChange={(e) => setProfile({ ...profile, dependents_count: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-[#E3E7E4] text-xs text-[#263238] focus:outline-none focus:border-[#176B5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1">
                  {t('profile.target_savings')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={profile.monthly_target_savings}
                  onChange={(e) => setProfile({ ...profile, monthly_target_savings: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-[#E3E7E4] text-xs text-[#263238] focus:outline-none focus:border-[#176B5B]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(2)}>
                  ← {t('common.back')}
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={saving}>
                  {saving ? t('profile.saving') : t('profile.save')}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
