import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  BookOpen,
  X
} from 'lucide-react';

const FALLBACK_ACTIVITIES = {
  en: [
    {
      activity_id: 'act_budget_basics',
      title: 'Smart Budget Rule',
      description: 'When earning ₹10,000 this month, what should be prioritized first?',
      xp_reward: 20,
      options: [
        { id: 'A', text: 'Unnecessary luxury purchases' },
        { id: 'B', text: 'Basic essentials & small emergency buffer' },
        { id: 'C', text: 'Borrowing to spend on non-essentials' }
      ],
      correct_option_id: 'B',
      takeaway: 'Always secure your family essentials and emergency reserve first.'
    },
    {
      activity_id: 'act_lean_planning',
      title: 'Harvest Surplus Management',
      description: 'You received ₹25,000 from crop harvest. The next 3 months will bring zero farm income. What is safest?',
      xp_reward: 25,
      options: [
        { id: 'A', text: 'Spend everything in the first month on celebrations' },
        { id: 'B', text: 'Set aside money into 3 equal monthly envelopes for lean season survival' },
        { id: 'C', text: 'Lend the full amount to an acquaintance without paperwork' }
      ],
      correct_option_id: 'B',
      takeaway: 'Envelope budgeting during surplus months protects families during lean months.'
    }
  ],
  hi: [
    {
      activity_id: 'act_budget_basics',
      title: 'बजट का सरल नियम',
      description: 'महीने में ₹10,000 आमदनी मिलने पर सबसे पहले किसे अलग रखना चाहिए?',
      xp_reward: 20,
      options: [
        { id: 'A', text: 'अनावश्यक विलासिता और महंगे सामान' },
        { id: 'B', text: 'ज़रूरी राशन व थोड़ी आपातकालीन बचत' },
        { id: 'C', text: 'उधार लेकर गैर-जरूरी खर्च करना' }
      ],
      correct_option_id: 'B',
      takeaway: 'पहले ज़रूरी राशन और छोटी बचत को प्राथमिकता दें।'
    },
    {
      activity_id: 'act_lean_planning',
      title: 'फसल की कमाई का प्रबंधन',
      description: 'फसल बेचकर ₹25,000 मिले हैं। अगले 3 महीने खेत से कोई कमाई नहीं होगी। सबसे सुरक्षित कदम क्या है?',
      xp_reward: 25,
      options: [
        { id: 'A', text: 'पहले ही महीने सारा पैसा उत्सव व खरीदारी में खर्च कर दें' },
        { id: 'B', text: 'पैसों को तीन बराबर हिस्सों में बांटकर मंदी के महीनों के राशन के लिए सुरक्षित रख लें' },
        { id: 'C', text: 'बिना किसी लिखा-पढ़ी के किसी परिचित को पूरा पैसा उधार दे दें' }
      ],
      correct_option_id: 'B',
      takeaway: 'अच्छी कमाई वाले महीने में बचाकर रखना ही मंदी के दिनों में परिवार का सबसे बड़ा सहारा होता है।'
    }
  ],
  te: [
    {
      activity_id: 'act_budget_basics',
      title: 'బడ్జెట్ ప్రాథమిక నియమం',
      description: 'ఈ నెల రూ.10,000 వచ్చినప్పుడు ముందుగా ఏది కేటాయించాలి?',
      xp_reward: 20,
      options: [
        { id: 'A', text: 'అనవసరమైన విలాసాలు మరియు ఖరీదైన వస్తువులు' },
        { id: 'B', text: 'ముఖ్యమైన నిత్యావసరాలు & కొద్దిగా అత్యవసర పొదుపు' },
        { id: 'C', text: 'అప్పులు తీసుకుని ఖర్చు చేయడం' }
      ],
      correct_option_id: 'B',
      takeaway: 'మొదట నిత్యావసరాలు మరియు చిన్న పొదుపునకు ప్రాధాన్యత ఇవ్వండి.'
    },
    {
      activity_id: 'act_lean_planning',
      title: 'పంట ఆదాయం నిర్వహణ',
      description: 'పంట అమ్మకం ద్వారా రూ.25,000 వచ్చాయి. రాబోయే 3 నెలలు వ్యవసాయ ఆదాయం ఉండదు. సురక్షితమైన నిర్ణయం ఏది?',
      xp_reward: 25,
      options: [
        { id: 'A', text: 'మొదటి నెలలోనే పండుగలు, షాపింగ్‌లకు అంతా ఖర్చు చేయడం' },
        { id: 'B', text: 'రాబోయే 3 నెలల ఖర్చుల కోసం డబ్బును సమాన భాగాలుగా పక్కన పెట్టడం' },
        { id: 'C', text: 'ఎటువంటి పత్రాలు లేకుండా ఇతరులకు అప్పుగా ఇవ్వడం' }
      ],
      correct_option_id: 'B',
      takeaway: 'ఆదాయం ఎక్కువగా ఉన్నప్పుడు దాచుకున్న డబ్బే తక్కువ ఆదాయం ఉన్న రోజుల్లో రక్షణగా ఉంటుంది.'
    }
  ]
};

export function GamifiedLearningHub() {
  const { t, currentLanguage } = useLanguage();
  const [activities, setActivities] = useState(FALLBACK_ACTIVITIES[currentLanguage] || FALLBACK_ACTIVITIES.en);
  const [stats, setStats] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [userChoice, setUserChoice] = useState('');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const list = FALLBACK_ACTIVITIES[currentLanguage] || FALLBACK_ACTIVITIES.en;
    setActivities(list);
    try {
      const acts = await api.getLearningActivities(currentLanguage);
      if (Array.isArray(acts) && acts.length > 0) {
        setActivities(acts);
      }
      const userStats = await api.getGameStats();
      setStats(userStats);
    } catch (e) {
      console.warn('Learning API fallback:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentLanguage]);

  const handleStartActivity = (act) => {
    setSelectedActivity(act);
    setUserChoice('');
    setResult(null);
  };

  const handleSubmitChoice = async () => {
    if (!userChoice || !selectedActivity || submitting) return;
    setSubmitting(true);

    try {
      const res = await api.submitGameAnswer(
        selectedActivity.activity_id,
        selectedActivity.activity_type || 'single_choice',
        userChoice,
        currentLanguage
      );
      setResult(res);
      if (res.is_correct) {
        confetti({ particleCount: 40, spread: 50 });
      }
      const userStats = await api.getGameStats();
      setStats(userStats);
    } catch (e) {
      const isCorrect = userChoice === (selectedActivity.correct_option_id || 'B');
      const fallbackRes = {
        is_correct: isCorrect,
        xp_earned: isCorrect ? (selectedActivity.xp_reward || 20) : 0,
        explanation: selectedActivity.takeaway || 'Prioritize family essentials before flexible spending.',
        badge_unlocked: isCorrect ? 'Smart Saver' : null
      };
      setResult(fallbackRes);
      if (isCorrect) {
        confetti({ particleCount: 40, spread: 50 });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3E7E4]">
        <div>
          <h1 className="text-xl font-bold text-[#263238]">
            {t('games.title')}
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {t('games.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#DDEDE7] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#176B5B]">
          <Award className="w-4 h-4" />
          <span>{stats?.total_xp || 140} {t('games.points')}</span>
        </div>
      </div>

      {/* Activities Grid */}
      {!selectedActivity ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {activities.map((act) => (
            <Card key={act.activity_id} className="flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wide">
                    +{act.xp_reward || 20} {t('games.points')}
                  </span>
                  <BookOpen className="w-4 h-4 text-[#176B5B]" />
                </div>
                <h3 className="text-sm font-semibold text-[#263238] mt-1.5">
                  {act.title}
                </h3>
                <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E3E7E4]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartActivity(act)}
                  className="w-full justify-center"
                >
                  {t('games.play_now')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Active Challenge Card */
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E7E4]">
            <span className="text-xs font-semibold text-[#176B5B] uppercase tracking-wide">
              {selectedActivity.title}
            </span>
            <button
              onClick={() => setSelectedActivity(null)}
              className="text-xs text-[#667085] hover:text-[#263238] cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>

          <p className="text-sm text-[#263238] bg-[#F7F8F5] border border-[#E3E7E4] p-3.5 rounded-xl font-medium">
            {selectedActivity.description}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {(selectedActivity.options || []).map((opt) => {
              const isSelected = userChoice === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => !result && setUserChoice(opt.id)}
                  disabled={!!result}
                  className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm font-medium border transition flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#DDEDE7] border-[#B8D8CE] text-[#176B5B]'
                      : 'bg-white border-[#E3E7E4] text-[#263238] hover:bg-[#F7F8F5]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? 'bg-[#176B5B] text-white' : 'bg-[#EFEFEA] text-[#667085]'
                  }`}>
                    {opt.id}
                  </span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {!result ? (
            <Button
              variant="primary"
              size="md"
              disabled={!userChoice || submitting}
              onClick={handleSubmitChoice}
              className="w-full"
            >
              {submitting ? t('common.loading') : t('games.check_answer')}
            </Button>
          ) : (
            <div className={`p-4 rounded-xl border space-y-2.5 ${
              result.is_correct
                ? 'bg-[#F0F6F4] border-[#D3E5DE] text-[#263238]'
                : 'bg-[#FEF2F2] border-[#FEE2E2] text-[#263238]'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {result.is_correct ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#176B5B]" />
                    <span className="text-[#176B5B]">{t('games.correct')}</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-[#C54B4B]" />
                    <span className="text-[#C54B4B]">{t('games.incorrect')}</span>
                  </>
                )}
              </div>

              <p className="text-xs sm:text-sm leading-relaxed">
                {result.explanation || selectedActivity.takeaway}
              </p>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedActivity(null)}
                  className="w-full"
                >
                  {t('common.back')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
