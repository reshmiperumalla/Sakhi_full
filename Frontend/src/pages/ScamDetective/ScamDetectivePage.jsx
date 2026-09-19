import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, ShieldCheck, AlertTriangle, PhoneCall, QrCode, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export function ScamDetectivePage() {
  const { t, currentLanguage } = useLanguage();
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Scenarios defined in translations
  const scenarios = t('scam.scenarios') || [];
  const currentScenario = scenarios[currentScenarioIdx] || scenarios[0];

  const handleSelectOption = (optionId) => {
    if (hasSubmitted) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setHasSubmitted(true);
    if (selectedOption === currentScenario.correct_id) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setCurrentScenarioIdx((prev) => (prev + 1) % (scenarios.length || 1));
  };

  const isCorrect = selectedOption === currentScenario?.correct_id;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight flex items-center gap-2">
            <span>🛡️</span> {t('scam.title')}
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            {t('scam.subtitle')}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FCD34D] text-xs font-bold text-[#92400E]">
          <span>📞</span>
          <span>{t('scam.stat_helpline')}</span>
        </div>
      </div>

      {/* Interactive Scenario Card */}
      {currentScenario && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3E7E4] shadow-card space-y-5">
          {/* Scenario Badge & Title */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] uppercase tracking-wider">
                {t('scam.scenario_badge')} {currentScenarioIdx + 1} / {scenarios.length}
              </span>
              <span className="text-xs font-semibold text-[#667085]">
                {currentScenario.category}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#263238]">
              {currentScenario.title}
            </h2>
          </div>

          {/* Situation Box */}
          <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E3E7E4] text-sm text-[#374151] leading-relaxed flex items-start gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <p>{currentScenario.situation}</p>
          </div>

          {/* Question & Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#263238]">
              {t('scam.question_prompt')}
            </h4>

            <div className="space-y-2.5">
              {currentScenario.options?.map((opt) => {
                const isSelected = selectedOption === opt.id;
                let optionStyle = 'bg-white border-[#E3E7E4] text-[#263238] hover:border-[#176B5B] hover:bg-[#FAFBF9]';

                if (hasSubmitted) {
                  if (opt.id === currentScenario.correct_id) {
                    optionStyle = 'bg-[#E6F4EA] border-[#34A853] text-[#137333] font-bold';
                  } else if (isSelected) {
                    optionStyle = 'bg-[#FEF2F2] border-[#EA4335] text-[#C5221F]';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-[#DDEDE7] border-[#176B5B] text-[#176B5B] font-bold shadow-xs';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={hasSubmitted}
                    className={`w-full p-4 rounded-2xl border text-left text-sm transition flex items-start gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-[#F0F2EE] shrink-0 mt-0.5">
                      {opt.id}
                    </span>
                    <span className="flex-1 leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Bar */}
          {!hasSubmitted ? (
            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="md"
                disabled={!selectedOption}
                onClick={handleSubmit}
              >
                {t('scam.submit_choice')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-3 border-t border-[#E3E7E4] animate-fadeIn">
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isCorrect
                    ? 'bg-[#E6F4EA] border-[#A8DAB5] text-[#137333]'
                    : 'bg-[#FEF2F2] border-[#F5C2C7] text-[#842029]'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-[#137333] mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0 text-[#C5221F] mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-bold mb-1">
                    {isCorrect ? t('scam.safe_feedback') : t('scam.unsafe_feedback')}
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#374151]">
                    {currentScenario.explanation}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  icon={ArrowRight}
                  onClick={handleNext}
                >
                  {t('scam.next_scenario')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
