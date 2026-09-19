import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { speechService } from '../../services/speech';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  PhoneForwarded,
  Award,
  Volume2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const FALLBACK_SCENARIOS = {
  hi: [
    {
      scenario_id: 'scam_bank_otp',
      title: 'बैंक अधिकारी बनकर फोन - "एटीएम ब्लॉक हो गया है"',
      description: 'आपको एक फोन आता है। कॉलर कहता है: "नमस्ते, मैं आपके बैंक के मुख्य कार्यालय से बोल रहा हूं। आपका एटीएम कार्ड और खाता ब्लॉक होने वाला है। तुरंत अनब्लॉक करने के लिए आपके मोबाइल पर आया 6 अंकों का ओटीपी (OTP) बताएं।"',
      category: 'phone_call',
      options: [
        { id: 'A', text: 'डरकर तुरंत अपने फोन पर आया 6 अंकों का ओटीपी बता दें।' },
        { id: 'B', text: 'कॉलर से कहें कि बैंक कभी ओटीपी नहीं मांगता, तुरंत फोन काटें और पास की बैंक शाखा जाएं।' },
        { id: 'C', text: 'ओटीपी के साथ-साथ अपने एटीएम कार्ड का 4 अंकों वाला गुप्त पिन भी बता दें।' }
      ],
      correct_option_id: 'B',
      explanation_correct: 'सुरक्षित निर्णय! बैंक, डाकघर या कोई भी सरकारी अधिकारी कभी भी आपका पासवर्ड, पिन या ओटीपी फोन पर नहीं मांगते।',
      explanation_wrong: 'सावधान! किसी को भी ओटीपी या पिन बताना मतलब अपने बैंक खाते की चाबी चोर को दे देना है। इससे पैसे कट जाएंगे।',
      red_flags: [
        'खाता तुरंत बंद होने का डर दिखाना',
        'फोन पर 6 अंकों का ओटीपी या एटीएम पिन मांगना',
        'जल्दबाजी करने का दबाव बनाना'
      ]
    },
    {
      scenario_id: 'scam_qr_receive',
      title: 'पैसे पाने के लिए क्यूआर कोड स्कैन करने का झांसा',
      description: 'सामान या काम के पैसे भेजने के नाम पर एक अज्ञात व्यक्ति आपको क्यूआर कोड भेजता है और कहता है: "इस कोड को स्कैन करें और अपना यूपीआई पिन डालें, आपके खाते में ₹2,000 तुरंत आ जाएंगे।"',
      category: 'qr_code',
      options: [
        { id: 'A', text: 'क्यूआर कोड स्कैन करके तुरंत अपना गुप्त यूपीआई पिन दर्ज कर दें।' },
        { id: 'B', text: 'साफ मना करें। पैसे प्राप्त करने के लिए कभी भी क्यूआर कोड स्कैन या पिन डालने की जरूरत नहीं होती।' },
        { id: 'C', text: 'अपने परिवार के किसी सदस्य के फोन से वह कोड स्कैन करें।' }
      ],
      correct_option_id: 'B',
      explanation_correct: 'उत्तम समझ! याद रखें: पैसे लेने (Receive) के लिए केवल अपना मोबाइल नंबर देना होता है, कभी भी क्यूआर कोड स्कैन या पिन नहीं डाला जाता।',
      explanation_wrong: 'खतरा! जब भी आप क्यूआर कोड स्कैन करके पिन डालते हैं, तो आपके खाते में पैसे आते नहीं बल्कि कट जाते हैं।',
      red_flags: [
        'पैसे भेजने के बदले क्यूआर कोड स्कैन करने को कहना',
        'पैसे प्राप्त करने के लिए पिन डालने की मांग करना'
      ]
    },
    {
      scenario_id: 'scam_pm_subsidy',
      title: 'सरकारी सब्सिडी का फर्जी मैसेज व ₹500 फीस',
      description: 'संदेश आता है: "बधाई हो! सरकारी योजना के तहत आपको ₹50,000 की सब्सिडी मंजूर हुई है। तुरंत नीचे दिए अनजान लिंक पर क्लिक करें और ₹500 रजिस्ट्रेशन शुल्क जमा करें।"',
      category: 'fake_subsidy',
      options: [
        { id: 'A', text: '₹50,000 पाने के लिए तुरंत लिंक पर क्लिक करके ₹500 जमा कर दें।' },
        { id: 'B', text: 'मैसेज को सभी दोस्तों को फॉरवर्ड कर दें।' },
        { id: 'C', text: 'संदेश को फर्जी समझकर डिलीट करें और अपनी ग्राम पंचायत या सरकारी कार्यालय से सही जानकारी लें।' }
      ],
      correct_option_id: 'C',
      explanation_correct: 'सटीक निर्णय! सरकारी योजनाओं की सब्सिडी के लिए कभी भी व्हाट्सएप लिंक पर पैसे नहीं मांगे जाते। हमेशा पंचायत से पुष्टि करें।',
      explanation_wrong: 'धोखा! यह ठगों का एक आम जाल है। ₹50,000 के लालच में आपकी गाढ़ी कमाई के ₹500 चले जाएंगे।',
      red_flags: [
        'मुफ्त सरकारी पैसे का दावा',
        'सब्सिडी पाने के लिए पहले फीस या रजिस्ट्रेशन चार्ज मांगना'
      ]
    }
  ],
  te: [
    {
      scenario_id: 'scam_bank_otp',
      title: 'బ్యాంక్ అధికారి అని చెప్పి ఫోన్ - "మీ ఏటీఎం బ్లాక్ అయింది"',
      description: 'ఒక వ్యక్తి మీకు ఫోన్ చేసి: "నమస్తే, నేను మీ బ్యాంక్ ప్రధాన కార్యాలయం నుండి మాట్లాడుతున్నాను. మీ ఖాతా మరియు ఏటీఎం బ్లాక్ కానుంది. వెంటనే దాన్ని రద్దు చేయడానికి మీ ఫోన్‌కు వచ్చిన 6 అంకెల ఓటీపీ చెప్పండి" అని అడుగుతాడు.',
      category: 'phone_call',
      options: [
        { id: 'A', text: 'కంగారుపడి ఫోన్‌కు వచ్చిన ఓటీపీ వెంటనే చెప్పడం.' },
        { id: 'B', text: 'బ్యాంక్ ఎప్పుడూ ఓటీపీ అడగదు అని చెప్పి ఫోన్ కట్ చేసి, సమీపంలోని బ్యాంక్ బ్రాంచ్‌కు వెళ్లడం.' },
        { id: 'C', text: 'ఓటీపీతో పాటు మీ ఏటీఎం పిన్ కూడా చెప్పడం.' }
      ],
      correct_option_id: 'B',
      explanation_correct: 'చాలా మంచి నిర్ణయం! బ్యాంకులు లేదా ప్రభుత్వ అధికారులు ఎప్పుడూ ఫోన్ చేసి ఓటీపీ లేదా పిన్ నంబర్ అడగరని గుర్తుంచుకోండి.',
      explanation_wrong: 'ప్రమాదం! ఓటీపీ లేదా పిన్ చెబితే మీ ఖాతాలోని డబ్బంతా మోసగాళ్ల చేతుల్లోకి వెళ్ళిపోతుంది.',
      red_flags: [
        'ఖాతా మూసివేస్తామని భయపెట్టడం',
        'ఫోన్‌లో ఓటీపీ లేదా పిన్ అడగడం'
      ]
    },
    {
      scenario_id: 'scam_qr_receive',
      title: 'డబ్బులు రావడానికి క్యూఆర్ కోడ్ స్కాన్ చేయండి',
      description: 'వ్యాపారం లేదా పని డబ్బులు పంపే నెపంతో ఒక వ్యక్తి మీకు క్యూఆర్ కోడ్ పంపి: "దీన్ని స్కాన్ చేసి మీ యూపీఐ పిన్ కొట్టండి, వెంటనే మీ ఖాతాలో ₹2,000 పడతాయి" అని అంటాడు.',
      category: 'qr_code',
      options: [
        { id: 'A', text: 'క్యూఆర్ కోడ్ స్కాన్ చేసి యూపీఐ పిన్ నమోదు చేయడం.' },
        { id: 'B', text: 'ఖచ్చితంగా నిరాకరించడం! డబ్బులు తీసుకోవడానికి పిన్ కొట్టాల్సిన అవసరం ఉండదు.' },
        { id: 'C', text: 'వేరేవారి ఫోన్ నుండి స్కాన్ చేయడం.' }
      ],
      correct_option_id: 'B',
      explanation_correct: 'అద్భుతమైన నిర్ణయం! గుర్తుంచుకోండి: డబ్బులు తీసుకోవడానికి మన మొబైల్ నంబర్ ఇస్తే చాలు, ఎప్పుడూ పిన్ కొట్టకూడదు.',
      explanation_wrong: 'హెచ్చరిక! క్యూఆర్ కోడ్ స్కాన్ చేసి పిన్ కొడితే మీ ఖాతా నుండి డబ్బులు కట్ అయిపోతాయి.',
      red_flags: [
        'డబ్బులు పంపడానికి క్యూఆర్ కోడ్ స్కాన్ చేయమనడం',
        'డబ్బులు తీసుకోవడానికి పిన్ అడగడం'
      ]
    }
  ],
  en: [
    {
      scenario_id: 'scam_bank_otp',
      title: 'Fake Bank Caller: "Your ATM Card is Blocked"',
      description: 'A caller claiming to be a bank officer says: "Your bank card is about to be blocked today. To prevent this, share the 6-digit OTP code just sent to your mobile phone right now."',
      category: 'phone_call',
      options: [
        { id: 'A', text: 'Panic and share the 6-digit OTP immediately.' },
        { id: 'B', text: 'Refuse firmly. Banks never ask for OTPs over phone calls. Hang up and visit your local branch.' },
        { id: 'C', text: 'Share your 4-digit secret ATM PIN along with the OTP.' }
      ],
      correct_option_id: 'B',
      explanation_correct: 'Safe and smart decision! Genuine banks, post offices, and police officials NEVER ask for passwords, PINs, or OTPs over the phone.',
      explanation_wrong: 'Danger! Sharing your OTP or PIN allows cybercriminals to instantly withdraw all the money from your account.',
      red_flags: [
        'Creating artificial panic and urgency',
        'Demanding an OTP or secret PIN over a voice call',
        'Refusing to let you verify with your branch'
      ]
    },
    {
      scenario_id: 'scam_qr_receive',
      title: 'QR Code "Payment Received" Scam',
      description: 'A customer claiming to send payment for your goods sends a QR code over WhatsApp saying: "Scan this code and enter your UPI PIN to receive ₹2,000 directly into your bank account."',
      category: 'qr_code',
      options: [
        { id: 'A', text: 'Scan the QR code and enter your secret UPI PIN.' },
        { id: 'B', text: 'Refuse firmly. You NEVER need to enter a PIN or scan a code to receive money.' },
        { id: 'C', text: 'Ask a family member to scan the QR code instead.' }
      ],
      correct_option_id: 'B',
      explanation_correct: 'Excellent awareness! Entering a UPI PIN always deducts money from your account. Receiving payments never requires a PIN.',
      explanation_wrong: 'Warning! Scanning a QR code and entering your PIN deducts ₹2,000 from YOUR account and sends it to the scammer.',
      red_flags: [
        'Asking you to scan a code to receive money',
        'Demanding your secret UPI PIN to credit your bank balance'
      ]
    },
    {
      scenario_id: 'scam_pm_subsidy',
      title: 'Fake Government Subsidy & ₹500 Registration Fee',
      description: 'A message claims: "Congratulations! A ₹50,000 grant has been approved for you under the Small Enterprise Scheme. Click this link and pay ₹500 registration fee to claim."',
      category: 'fake_subsidy',
      options: [
        { id: 'A', text: 'Click the link and pay ₹500 to receive ₹50,000.' },
        { id: 'B', text: 'Forward the message to friends and relatives.' },
        { id: 'C', text: 'Recognize it as fraud, delete the message, and verify only through official government offices.' }
      ],
      correct_option_id: 'C',
      explanation_correct: 'Spot on! Genuine government schemes never charge fees through random web links sent on messaging apps.',
      explanation_wrong: 'Trap! You will lose your ₹500 and suspicious links can compromise your phone security.',
      red_flags: [
        'Unsolicited promises of free grant money',
        'Demanding advance processing fees to release funds'
      ]
    }
  ]
};

export function ScamEducationLab() {
  const { t, currentLanguage } = useLanguage();
  const [scenarios, setScenarios] = useState(FALLBACK_SCENARIOS[currentLanguage] || FALLBACK_SCENARIOS.en);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [shieldXP, setShieldXP] = useState(120);

  const loadScenarios = async () => {
    const localList = FALLBACK_SCENARIOS[currentLanguage] || FALLBACK_SCENARIOS.en;
    setScenarios(localList);
    setEvaluation(null);
    setSelectedOption('');

    try {
      const data = await api.getScamScenarios(currentLanguage);
      if (Array.isArray(data) && data.length > 0) {
        setScenarios(data);
      }
      const userStats = await api.getScamStats();
      if (userStats && typeof userStats.scam_shield_points === 'number') {
        setShieldXP(userStats.scam_shield_points);
      }
    } catch (e) {
      console.warn('Scam API fallback active:', e.message);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, [currentLanguage]);

  const current = scenarios[activeIdx] || (FALLBACK_SCENARIOS[currentLanguage] || FALLBACK_SCENARIOS.en)[0];

  const handleSubmit = async () => {
    if (!selectedOption || submitting) return;
    setSubmitting(true);

    try {
      const res = await api.evaluateScam(current.scenario_id, selectedOption, currentLanguage);
      setEvaluation(res);
      if (res.is_correct) {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        setShieldXP((prev) => prev + (res.points_earned || 25));
      }
    } catch (e) {
      const isCorrect = selectedOption === current.correct_option_id;
      const fallbackEval = {
        is_correct: isCorrect,
        points_earned: isCorrect ? 25 : 0,
        why_explanation: isCorrect ? current.explanation_correct : current.explanation_wrong,
        red_flags: current.red_flags || []
      };
      setEvaluation(fallbackEval);
      if (isCorrect) {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        setShieldXP((prev) => prev + 25);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setEvaluation(null);
    setSelectedOption('');
    setActiveIdx((prev) => (prev + 1) % scenarios.length);
  };

  const speakScenario = () => {
    if (!current) return;
    speechService.speak(`${current.title}. ${current.description}`, currentLanguage);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      {/* Clean Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3E7E4]">
        <div>
          <h1 className="text-xl font-bold text-[#263238]">
            {t('scam.title')}
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {t('scam.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F7F8F5] border border-[#E3E7E4] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#176B5B]">
          <Award className="w-4 h-4" />
          <span>{shieldXP} {t('games.xp')}</span>
        </div>
      </div>

      {/* Emergency Helpline Banner (Calm, subtle warning, not bright red) */}
      <div className="bg-[#FCFAF2] border border-[#ECE6D5] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-[#263238]">
          <PhoneForwarded className="w-4 h-4 text-[#D4B04C] shrink-0" />
          <span className="font-medium">{t('scam.emergency_helpline')}</span>
        </div>

        <a
          href="tel:1930"
          className="px-3 py-1.5 rounded-lg bg-[#176B5B] hover:bg-[#125447] text-white font-semibold text-xs transition"
        >
          {t('scam.call_1930')}
        </a>
      </div>

      {/* Interactive Scenario Card */}
      <Card className="space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-[#E3E7E4]">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wide">
            {t('scam.scenario')} {activeIdx + 1} / {scenarios.length}
          </span>
          <button
            onClick={speakScenario}
            title={t('dashboard.read_aloud')}
            className="text-xs font-semibold text-[#176B5B] hover:underline flex items-center gap-1"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{t('dashboard.read_aloud')}</span>
          </button>
        </div>

        {/* Story */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#263238]">
            {current.title}
          </h2>
          <p className="text-sm text-[#263238] bg-[#F7F8F5] border border-[#E3E7E4] p-4 rounded-xl leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Decision Question */}
        <div className="space-y-2.5 pt-1">
          <h3 className="text-xs font-semibold text-[#667085] uppercase tracking-wide">
            {t('scam.question')}
          </h3>

          <div className="space-y-2">
            {(current.options || []).map((opt) => {
              const isSelected = selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => !evaluation && setSelectedOption(opt.id)}
                  disabled={!!evaluation}
                  className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm font-medium border transition flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#DDEDE7] border-[#B8D8CE] text-[#176B5B]'
                      : 'bg-white border-[#E3E7E4] text-[#263238] hover:bg-[#F7F8F5]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isSelected ? 'bg-[#176B5B] text-white' : 'bg-[#EFEFEA] text-[#667085]'
                  }`}>
                    {opt.id}
                  </span>
                  <span className="flex-1 leading-normal">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        {!evaluation && (
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!selectedOption || submitting}
            className="w-full"
          >
            {submitting ? t('common.loading') : t('scam.submit')}
          </Button>
        )}

        {/* Verdict Feedback */}
        {evaluation && (
          <div className={`p-4 rounded-xl border space-y-3 ${
            evaluation.is_correct
              ? 'bg-[#F0F6F4] border-[#D3E5DE] text-[#263238]'
              : 'bg-[#FEF2F2] border-[#FEE2E2] text-[#263238]'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {evaluation.is_correct ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#176B5B]" />
                  <span className="text-[#176B5B]">{t('scam.safe_verdict')}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-[#C54B4B]" />
                  <span className="text-[#C54B4B]">{t('scam.danger_verdict')}</span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#263238] leading-relaxed">
              {evaluation.why_explanation}
            </p>

            {evaluation.red_flags && evaluation.red_flags.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-black/5">
                <div className="text-xs font-semibold text-[#667085]">
                  {t('scam.red_flags')}:
                </div>
                <ul className="space-y-0.5 text-xs text-[#263238]">
                  {evaluation.red_flags.map((flag, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-1.5">
                      <span className="text-[#C54B4B] font-bold">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="w-full"
              >
                {t('scam.next_scenario')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
