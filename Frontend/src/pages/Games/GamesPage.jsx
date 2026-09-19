import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Trophy, CheckCircle2, XCircle, Sparkles, RefreshCw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const fallbackChallenges = [
  {
    id: 1,
    title: "Bank & OTP Safety",
    question: "Which of these requests is legitimate from a real bank official?",
    choices: [
      "Calling you and asking you to read out the OTP to verify your Aadhaar.",
      "Sending an SMS asking you to visit the official bank branch to submit KYC documents.",
      "Sending an urgent WhatsApp link asking you to enter your ATM card CVV number."
    ],
    correct_index: 1,
    feedback_correct: "Correct! Real banks notify you to visit the official branch in person. They never ask for OTP or CVV over the phone.",
    feedback_wrong: "Remember: Real banks never ask for OTP, PIN, or CVV over phone or WhatsApp."
  },
  {
    id: 2,
    title: "Harvest & Seasonal Inflow",
    question: "You just received a large lump-sum payment after selling your crop harvest. What is the smartest first move?",
    choices: [
      "Spend it all immediately on non-essential purchases before prices rise.",
      "Set aside 20% into your Lean-Season Cushion first, then budget the rest for family needs.",
      "Lend it out to informal borrowers without any receipt or written agreement."
    ],
    correct_index: 1,
    feedback_correct: "Superb! Setting aside a cushion during peak harvest shields your family during lean, dry months.",
    feedback_wrong: "Harvest earnings happen only a few times a year. Always protect your lean months first."
  },
  {
    id: 3,
    title: "Loan Traps vs SHG / Bank",
    question: "You need ₹10,000 for unexpected home repairs. Who is the safest source to approach?",
    choices: [
      "A local informal moneylender charging 5% interest per month (60% annually).",
      "Your Self-Help Group (SHG) or registered bank with transparent, low interest rates.",
      "An unknown caller offering instant cash on WhatsApp without identity checks."
    ],
    correct_index: 1,
    feedback_correct: "Spot on! SHGs and registered banks provide fair, low-interest credit without trapping you in vicious debt cycles.",
    feedback_wrong: "Informal moneylenders and instant loan apps charge predatory interest that can trap families for years."
  },
  {
    id: 4,
    title: "Receiving UPI & QR Payments",
    question: "A buyer claims they sent you ₹2,000 for your crafts and sends a QR code saying: 'Scan and enter your UPI PIN to collect the money'. What should you do?",
    choices: [
      "Refuse and never enter your PIN! Entering a UPI PIN is only for sending money, never for receiving.",
      "Scan the QR code quickly and enter your UPI PIN so the money reaches your account.",
      "Send them your ATM debit card details and expiry date instead."
    ],
    correct_index: 0,
    feedback_correct: "Excellent! You never need to enter a UPI PIN or scan a QR code to receive money. PIN is solely for paying.",
    feedback_wrong: "Danger! Entering your UPI PIN transfers money OUT of your bank account. Real payments go directly to your account without your PIN."
  },
  {
    id: 5,
    title: "Daily Savings Habit",
    question: "Your household earns irregular daily wages of ₹300–₹500. How can you best build an emergency buffer?",
    choices: [
      "Wait until you have a huge lump sum like ₹50,000 before you start saving anything.",
      "Consistently set aside ₹20 to ₹50 into a safe savings gullak or account each day you earn.",
      "Spend everything daily because small coins are too minor to bother saving."
    ],
    correct_index: 1,
    feedback_correct: "Wonderful! Small coins saved steadily create a strong safety cushion that protects your family from unexpected shocks.",
    feedback_wrong: "Even ₹20 or ₹30 set aside daily adds up to ₹700–₹900 a month. Small steady steps build lasting safety."
  }
];

export function GamesPage() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [solvedMap, setSolvedMap] = useState({});
  const [baseXp] = useState(150);

  const rawChallenges = t('games.challenges');
  const challenges = Array.isArray(rawChallenges) && rawChallenges.length > 0 ? rawChallenges : fallbackChallenges;

  const currentChallenge = challenges[currentIndex] || challenges[0];
  const challengeState = answers[currentChallenge.id] || { selected: null, submitted: false };

  const solvedCount = Object.values(solvedMap).filter(Boolean).length;
  const totalXp = baseXp + (solvedCount * 50);

  const handleSelectChoice = (idx) => {
    if (challengeState.submitted) return;
    setAnswers(prev => ({
      ...prev,
      [currentChallenge.id]: {
        ...prev[currentChallenge.id],
        selected: idx
      }
    }));
  };

  const handleSubmit = () => {
    if (challengeState.selected === null) return;
    const isCorrect = challengeState.selected === currentChallenge.correct_index;

    setAnswers(prev => ({
      ...prev,
      [currentChallenge.id]: {
        selected: challengeState.selected,
        submitted: true
      }
    }));

    if (isCorrect && !solvedMap[currentChallenge.id]) {
      setSolvedMap(prev => ({ ...prev, [currentChallenge.id]: true }));
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }
  };

  const handleResetCurrent = () => {
    setAnswers(prev => ({
      ...prev,
      [currentChallenge.id]: {
        selected: null,
        submitted: false
      }
    }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < challenges.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const isSubmitted = challengeState.submitted;
  const isCorrect = challengeState.selected === currentChallenge.correct_index;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn pb-12">
      {/* Header with Score Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight flex items-center gap-2">
            <span>🎮</span> {t('games.title')}
          </h1>
          <p className="text-sm text-[#667085] mt-1">
            {t('games.subtitle')}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFFBEB] border border-[#FCD34D] shadow-subtle">
          <Trophy className="w-5 h-5 text-[#D97706]" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#92400E] block">{t('games.score_label')}</span>
            <span className="text-base font-extrabold text-[#78350F]">{totalXp} {t('games.points_unit')}</span>
          </div>
        </div>
      </div>

      {/* Challenge Navigation Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-[#E3E7E4] shadow-subtle">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
            {t('games.challenge_nav_label') || 'Challenges'} ({solvedCount}/{challenges.length} {t('games.completed_badge') || 'Completed'})
          </span>
          <span className="text-xs font-bold text-[#176B5B]">
            {Math.round((solvedCount / challenges.length) * 100)}%
          </span>
        </div>

        {/* Navigation Pills */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {challenges.map((ch, idx) => {
            const isCurrent = idx === currentIndex;
            const isSolved = solvedMap[ch.id];
            return (
              <button
                key={ch.id}
                onClick={() => setCurrentIndex(idx)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                  isCurrent
                    ? 'bg-[#176B5B] text-white border-[#176B5B] shadow-subtle'
                    : isSolved
                    ? 'bg-[#E6F4EA] text-[#137333] border-[#A8DAB5]'
                    : 'bg-[#F7F8F5] text-[#667085] border-[#E3E7E4] hover:bg-[#EEF2ED]'
                }`}
              >
                <span>{idx + 1}</span>
                {isSolved && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Challenge Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3E7E4] shadow-card space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DDEDE7] text-[#176B5B] uppercase tracking-wide">
              {currentChallenge.title || `Challenge ${currentIndex + 1}`}
            </span>
            <span className="text-xs text-[#667085]">
              ({currentIndex + 1} of {challenges.length})
            </span>
          </div>
          <span className="text-xs font-bold text-[#D97706] bg-[#FFFBEB] px-2.5 py-1 rounded-full border border-[#FDE68A]">
            +50 XP
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-[#263238] leading-snug">
          {currentChallenge.question}
        </h2>

        {/* Choices */}
        <div className="space-y-3">
          {currentChallenge.choices.map((choiceText, idx) => {
            const isSelected = challengeState.selected === idx;
            let btnStyle = 'bg-white border-[#E3E7E4] text-[#263238] hover:border-[#176B5B] hover:bg-[#FAFBF9]';

            if (isSubmitted) {
              if (idx === currentChallenge.correct_index) {
                btnStyle = 'bg-[#E6F4EA] border-[#34A853] text-[#137333] font-bold';
              } else if (isSelected) {
                btnStyle = 'bg-[#FEF2F2] border-[#EA4335] text-[#C54B4B]';
              }
            } else if (isSelected) {
              btnStyle = 'bg-[#DDEDE7] border-[#176B5B] text-[#176B5B] font-bold';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectChoice(idx)}
                disabled={isSubmitted}
                className={`w-full p-4 rounded-2xl border text-left text-sm transition flex items-start gap-3 cursor-pointer ${btnStyle}`}
              >
                <span className="w-6 h-6 rounded-full bg-[#F0F2EE] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{choiceText}</span>
              </button>
            );
          })}
        </div>

        {/* Submit & Result Section */}
        {!isSubmitted ? (
          <div className="pt-2 flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#667085] hover:text-[#263238] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('games.prev_challenge') || 'Previous'}</span>
            </button>

            <Button
              variant="primary"
              size="md"
              disabled={challengeState.selected === null}
              onClick={handleSubmit}
            >
              {t('games.try_challenge') || 'Submit Answer'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-4 border-t border-[#E3E7E4] animate-fadeIn">
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                isCorrect ? 'bg-[#E6F4EA] border-[#A8DAB5] text-[#137333]' : 'bg-[#FEF2F2] border-[#F5C2C7] text-[#842029]'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#137333] mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0 text-[#C5221F] mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-bold mb-1">
                  {isCorrect ? '🎉 Correct Answer! (+50 XP)' : 'Keep this in mind:'}
                </h4>
                <p className="text-xs sm:text-sm text-[#374151]">
                  {isCorrect ? currentChallenge.feedback_correct : currentChallenge.feedback_wrong}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={handleResetCurrent}
              >
                {t('games.try_another') || 'Try Again'}
              </Button>

              {currentIndex < challenges.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  icon={ChevronRight}
                >
                  {t('games.next_challenge') || 'Next Challenge →'}
                </Button>
              ) : (
                solvedCount === challenges.length && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#137333] bg-[#E6F4EA] px-3 py-1.5 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                    All 5 Challenges Mastered! 🏆
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
