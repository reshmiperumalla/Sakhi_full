from typing import List, Dict, Any, Optional
from datetime import datetime
from app.schemas.scam_schemas import ScamScenarioResponse, ScamOption, ScamEvaluationResponse


class ScamService:
    """
    Powers realistic interactive scam scenarios in English, Hindi, and Telugu.
    Evaluates responses, explains psychological traps, highlights red flags,
    and teaches official emergency reporting channels (1930 / cybercrime.gov.in).
    """

    # Rich pre-seeded scenarios available out-of-the-box
    SCENARIOS_DATA: List[Dict[str, Any]] = [
        {
            "scenario_id": "scam_001_bank_otp",
            "category": "otp_scam",
            "difficulty": "easy",
            "points": 50,
            "title": {
                "en": "Urgent Bank Account Blocking Call",
                "hi": "बैंक खाता ब्लॉक होने का फर्जी कॉल",
                "te": "బ్యాంక్ ఖాతా బ్లాక్ అవుతుందనే నకిలీ కాల్"
            },
            "description": {
                "en": "Someone calls claiming to be an officer from your bank: 'Sir/Madam, your ATM card is expiring today and your account will be permanently blocked unless you verify your identity right now. I have sent an OTP to your phone. Tell me the OTP immediately so I can keep your account active!'",
                "hi": "किसी व्यक्ति का फोन आता है जो खुद को आपके बैंक का अधिकारी बताता है: 'सर/मैडम, आपका एटीएम कार्ड आज बंद हो रहा है और खाता तुरंत ब्लॉक हो जाएगा। आपके फोन पर एक ओटीपी (OTP) आया है, जल्दी बताइए ताकि खाता चालू रखा जा सके!'",
                "te": "ఒక వ్యక్తి మీకు ఫోన్ చేసి మీ బ్యాంక్ మేనేజర్‌నని చెబుతాడు: 'సార్/మేడం, మీ ఏటీఎం కార్డు ఈ రోజే గడువు ముగుస్తోంది, వెంటనే కేవైసీ చేయకపోతే ఖాతా రద్దు అవుతుంది. మీ ఫోన్‌కు ఒక ఓటీపీ (OTP) వచ్చింది, ఖాతా యాక్టివ్‌గా ఉండటానికి వెంటనే ఆ ఓటీపీ చెప్పండి!'"
            },
            "options": {
                "en": [
                    {"id": "A", "text": "Quickly tell the OTP so your account and savings are not blocked."},
                    {"id": "B", "text": "Give only the last two digits of the OTP to be safe."},
                    {"id": "C", "text": "Never share the OTP. Disconnect immediately and visit your bank branch."}
                ],
                "hi": [
                    {"id": "A", "text": "तुरंत ओटीपी बता दें ताकि आपका बैंक खाता बंद न हो।"},
                    {"id": "B", "text": "सुरक्षित रहने के लिए केवल आखिरी दो अंक बताएं।"},
                    {"id": "C", "text": "ओटीपी बिल्कुल न बताएं। फोन काटें और सीधे बैंक शाखा जाकर जांचें।"}
                ],
                "te": [
                    {"id": "A", "text": "ఖాతా ఆగిపోకుండా ఉండటానికి వెంటనే ఓటీపీ చెప్పేయండి."},
                    {"id": "B", "text": "రక్షణ కోసం ఓటీపీలోని చివరి రెండు అంకెలు మాత్రమే చెప్పండి."},
                    {"id": "C", "text": "ఎట్టి పరిస్థితుల్లోనూ ఓటీపీ చెప్పకండి. వెంటనే కాల్ కట్ చేసి బ్యాంక్ బ్రాంచ్‌కు వెళ్ళండి."}
                ]
            },
            "correct_option_id": "C",
            "why_explanation": {
                "en": "Banks and genuine officials NEVER ask for your OTP, ATM PIN, or password over the phone. Fraudsters create false urgency ('account will be blocked') to panic you into revealing secrets that authorize theft from your account.",
                "hi": "असली बैंक या कोई भी सरकारी अधिकारी फोन पर कभी भी आपसे OTP, एटीएम पिन या पासवर्ड नहीं मांगते हैं। ठग आपको डराने के लिए 'खाता बंद होने' की झूठी बात कहते हैं ताकि आप घबराकर कोड बता दें।",
                "te": "నిజమైన బ్యాంక్ అధికారులు ఫోన్‌లో ఎప్పుడూ ఓటీపీ (OTP), పిన్ లేదా పాస్‌వర్డ్ అడగరు. మీరు భయపడి రహస్య కోడ్ చెప్పేలా మోసగాళ్లు 'ఖాతా రద్దు' పేరుతో భయాందోళన కలిగిస్తారు."
            },
            "red_flags": {
                "en": [
                    "High urgency and threatening account closure",
                    "Demanding one-time passcode (OTP) received on SMS",
                    "Calling from an unknown mobile number instead of an official toll-free line"
                ],
                "hi": [
                    "खाता तुरंत बंद होने की धमकी और जल्दबाजी मचाना",
                    "एसएमएस (SMS) पर आए गुप्त ओटीपी की मांग करना",
                    "बैंक के आधिकारिक नंबर के बजाय सामान्य मोबाइल नंबर से कॉल आना"
                ],
                "te": [
                    "ఖాతా వెంటనే బ్లాక్ అవుతుందని బెదిరించడం",
                    "మీ మొబైల్‌కు వచ్చిన రహస్య ఓటీపీని చెప్పమని ఒత్తిడి చేయడం",
                    "అధికారిక బ్యాంక్ నంబర్ కాకుండా సాధారణ నంబర్ నుండి కాల్ రావడం"
                ]
            },
            "safe_action_steps": {
                "en": [
                    "Hang up immediately without answering questions.",
                    "If you ever accidentally shared an OTP, call national cybercrime helpline 1930 immediately.",
                    "Check your bank balance via official mobile app or visit the physical branch."
                ],
                "hi": [
                    "तुरंत फोन काट दें और कोई जवाब न दें।",
                    "यदि गलती से कभी ओटीपी साझा हो जाए, तो तुरंत 1930 राष्ट्रीय साइबर हेल्पलाइन पर कॉल करें।",
                    "बैंक के आधिकारिक ऐप या शाखा में जाकर ही पूछताछ करें।"
                ],
                "te": [
                    "వెంటనే కాల్ కట్ చేసి ఎలాంటి సమాచారం ఇవ్వకండి.",
                    "పొరపాటున ఎప్పుడైనా ఓటీపీ చెబితే, వెంటనే 1930 సైబర్ క్రైమ్ హెల్ప్‌లైన్‌కు కాల్ చేయండి.",
                    "మీ బ్యాంక్ అధికారిక శాఖకు వెళ్లి మాత్రమే వివరాలు తెలుసుకోండి."
                ]
            }
        },
        {
            "scenario_id": "scam_002_qr_receive_money",
            "category": "qr_scam",
            "difficulty": "medium",
            "points": 50,
            "title": {
                "en": "Scan QR Code to 'Receive' Money for Crops/Goods",
                "hi": "फसल या सामान के पैसे 'पाने' के लिए QR कोड स्कैन करने का झांसा",
                "te": "సరుకులకు డబ్బులు 'పొందడానికి' క్యూఆర్ (QR) కోడ్ స్కాన్ చేయమనడం"
            },
            "description": {
                "en": "A buyer calls you to buy your vegetables or farm produce. They say: 'I have transferred ₹8,000 to you via PhonePe/GPay. I am sending you a QR code on WhatsApp. Open your UPI app and scan this QR code and enter your UPI PIN to claim the ₹8,000 in your account.'",
                "hi": "एक खरीदार आपकी फसल या सब्जी खरीदने के लिए फोन करता है: 'मैंने फोनपे/गूगलपे से आपको ₹8,000 भेज दिए हैं। मैं व्हाट्सएप पर एक QR कोड भेज रहा हूं। अपना यूपीआई ऐप खोलकर यह कोड स्कैन करें और अपना यूपीआई पिन डालें ताकि पैसे आपके खाते में आ जाएं।'",
                "te": "మీ వ్యవసాయ పంటను కొనడానికి ఒక వ్యక్తి ఫోన్ చేసి: 'నేను మీకు ₹8,000 ఫోన్‌పే/గూగుల్‌పే ద్వారా పంపాను. వాట్సాప్‌లో క్యూఆర్ కోడ్ పంపుతున్నాను. మీ యూపీఐ యాప్‌లో దాన్ని స్కాన్ చేసి, మీ యూపీఐ పిన్ (UPI PIN) నమోదు చేస్తే ఆ ₹8,000 మీ ఖాతాలోకి వస్తాయి' అని చెబుతాడు."
            },
            "options": {
                "en": [
                    {"id": "A", "text": "Scan the QR code and enter your UPI PIN quickly to receive your payment."},
                    {"id": "B", "text": "Ask them to send ₹1 first on the QR code to verify."},
                    {"id": "C", "text": "Refuse and cancel. You NEVER need to scan a QR code or enter a UPI PIN to receive money."}
                ],
                "hi": [
                    {"id": "A", "text": "पैसे पाने के लिए जल्दी से QR कोड स्कैन करके अपना UPI पिन दर्ज करें।"},
                    {"id": "B", "text": "जांचने के लिए पहले ₹1 भेजने को कहें।"},
                    {"id": "C", "text": "साफ मना करें। पैसे प्राप्त करने के लिए कभी भी QR कोड स्कैन करने या PIN डालने की जरूरत नहीं होती।"}
                ],
                "te": [
                    {"id": "A", "text": "డబ్బులు అందుకోవడానికి వెంటనే క్యూఆర్ కోడ్ స్కాన్ చేసి యూపీఐ పిన్ ఎంటర్ చేయండి."},
                    {"id": "B", "text": "పరీక్షించడానికి ముందుగా క్యూఆర్ కోడ్‌పై ₹1 పంపమని అడగండి."},
                    {"id": "C", "text": "తిరస్కరించండి. డబ్బులు అందుకోవడానికి (Receive) ఎప్పుడూ క్యూఆర్ కోడ్ స్కాన్ చేయడం లేదా యూపీఐ పిన్ నమోదు చేయడం అవసరం లేదు."}
                ]
            },
            "correct_option_id": "C",
            "why_explanation": {
                "en": "GOLDEN UPI RULE: You only enter your UPI PIN to SEND money, never to RECEIVE money. Scanning a QR code and entering your PIN deducts money from YOUR account and sends it to the fraudster.",
                "hi": "यूपीआई का सुनहरा नियम: यूपीआई पिन केवल पैसे भेजने (खर्च करने) के लिए डाला जाता है, पैसे प्राप्त करने के लिए कभी नहीं। QR कोड स्कैन करके पिन डालते ही आपके खाते से पैसे कट जाएंगे।",
                "te": "యూపీఐ ముఖ్యమైన సూత్రం: డబ్బులు ఎవరికైనా పంపడానికి మాత్రమే పిన్ (UPI PIN) అవసరం, డబ్బులు మన ఖాతాలోకి రావడానికి ఎప్పుడూ పిన్ అవసరం లేదు. క్యూఆర్ కోడ్ స్కాన్ చేసి పిన్ కొడితే మీ ఖాతాలోని డబ్బే పోతుంది."
            },
            "red_flags": {
                "en": [
                    "Claiming you must enter a UPI PIN to receive money",
                    "Sending QR codes on WhatsApp for incoming payments",
                    "Buyer is overly eager and refuses cash or standard direct account transfer"
                ],
                "hi": [
                    "पैसे प्राप्त करने के लिए UPI पिन डालने को कहना",
                    "व्हाट्सएप पर QR कोड भेजकर भुगतान लेने का दावा करना",
                    "सीधे बैंक खाते में पैसा भेजने से बचना"
                ],
                "te": [
                    "డబ్బులు రావడానికి యూపీఐ పిన్ కొట్టాలని చెప్పడం",
                    "వాట్సాప్‌లో క్యూఆర్ కోడ్ పంపి స్కాన్ చేయమనడం",
                    "నేరుగా బ్యాంకులో వేయడానికి ఇష్టపడకపోవడం"
                ]
            },
            "safe_action_steps": {
                "en": [
                    "Never scan QR codes or type PINs to collect money.",
                    "Ask the buyer to transfer using your registered UPI Mobile number directly.",
                    "Block the fraudulent buyer on WhatsApp immediately."
                ],
                "hi": [
                    "पैसे लेने के लिए कभी भी QR स्कैन न करें और न ही पिन डालें।",
                    "सामने वाले से कहें कि वह केवल आपके मोबाइल नंबर पर सीधे पैसे भेजे।",
                    "ठग के नंबर को तुरंत ब्लॉक करें।"
                ],
                "te": [
                    "డబ్బు తీసుకోవడానికి ఎప్పుడూ క్యూఆర్ స్కాన్ చేయవద్దు, పిన్ కొట్టవద్దు.",
                    "డబ్బులు పంపే వ్యక్తిని నేరుగా మీ మొబైల్ నంబర్‌కు పంపమని చెప్పండి.",
                    "ఆ నంబర్‌ను వెంటనే బ్లాక్ చేయండి."
                ]
            }
        },
        {
            "scenario_id": "scam_003_subsidy_processing_fee",
            "category": "government_scheme",
            "difficulty": "medium",
            "points": 50,
            "title": {
                "en": "Fake PM-Kisan / Government Subsidy SMS",
                "hi": "पीएम-किसान / सरकारी सब्सिडी का फर्जी संदेश",
                "te": "నకిలీ పీఎం కిసాన్ / ప్రభుత్వ సబ్సిడీ సందేశం"
            },
            "description": {
                "en": "You receive an SMS: 'Congratulations! ₹25,000 tractor/crop subsidy has been approved under PM Scheme. To release your fund immediately, click this link and pay a processing fee of ₹499 via UPI within 2 hours.'",
                "hi": "आपको एक SMS मिलता है: 'बधाई हो! सरकारी योजना के तहत आपको ₹25,000 की फसल सब्सिडी मंजूर की गई है। पैसे तुरंत खाते में पाने के लिए नीचे दिए लिंक पर क्लिक करें और 2 घंटे में ₹499 प्रोसेसिंग फीस जमा करें।'",
                "te": "మీకు ఒక మెసేజ్ వస్తుంది: 'అభినందనలు! పీఎం పథకం కింద మీకు ₹25,000 ట్రాక్టర్/రైతు సబ్సిడీ మంజూరైంది. డబ్బులు వెంటనే మీ ఖాతాలో జమ కావడానికి ఈ లింక్ క్లిక్ చేసి 2 గంటల్లోగా ₹499 ప్రాసెసింగ్ ఫీజు చెల్లించండి.'"
            },
            "options": {
                "en": [
                    {"id": "A", "text": "Pay ₹499 right away because ₹25,000 is a huge benefit."},
                    {"id": "B", "text": "Forward the message to your family and friends so they can also get it."},
                    {"id": "C", "text": "Ignore the link. Genuine government subsidies never ask for upfront UPI processing fees on random links."}
                ],
                "hi": [
                    {"id": "A", "text": "तुरंत ₹499 का भुगतान कर दें क्योंकि ₹25,000 बहुत बड़ा लाभ है।"},
                    {"id": "B", "text": "यह संदेश अपने परिवार और मित्रों को भेजें ताकि उन्हें भी लाभ मिले।"},
                    {"id": "C", "text": "लिंक को अनदेखा करें। सरकारी योजनाएं किसी अज्ञात लिंक पर अग्रिम यूपीआई फीस नहीं मांगतीं।"}
                ],
                "te": [
                    {"id": "A", "text": "₹25,000 పెద్ద మొత్తం కాబట్టి వెంటనే ₹499 చెల్లించండి."},
                    {"id": "B", "text": "ఈ మెసేజ్‌ను మీ బంధువులకు, స్నేహితులకు ఫార్వర్డ్ చేయండి."},
                    {"id": "C", "text": "లింక్‌ను నొక్కకండి. నిజమైన ప్రభుత్వ పథకాలు అపరిచిత లింకుల ద్వారా ముందస్తుగా యూపీఐ ఫీజులు అడగవు."}
                ]
            },
            "correct_option_id": "C",
            "why_explanation": {
                "en": "Government subsidies are deposited directly into Aadhaar-linked bank accounts (DBT) without requiring processing fees through unofficial links. Fraudulent links steal your money or install spyware.",
                "hi": "सरकारी सब्सिडी सीधे आपके आधार से जुड़े बैंक खाते (DBT) में आती है। इसके लिए किसी अनधिकृत लिंक पर पहले पैसे नहीं मांगे जाते। यह जालसाजी है।",
                "te": "ప్రభుత్వ సబ్సిడీలు నేరుగా ఆధార్ లింక్ అయిన బ్యాంక్ ఖాతా (DBT) లోనే జమవుతాయి. ఎవరూ ముందుగానే అనధికారిక లింక్ ద్వారా ఫీజులు అడగరు. ఇటువంటి లింకులు మోసపూరితమైనవి."
            },
            "red_flags": {
                "en": [
                    "Asking for upfront money or 'processing fees' to release government funds",
                    "Shortened or unofficial website URLs (e.g. .xyz, .top, bit.ly instead of .gov.in)",
                    "Urgent countdown timer ('within 2 hours')"
                ],
                "hi": [
                    "सरकारी सहायता जारी करने के लिए पहले 'प्रोसेसिंग फीस' मांगना",
                    "फर्जी या छोटे लिंक (.gov.in के बजाय .xyz, bit.ly आदि)",
                    "समय सीमा का दबाव बनाना ('2 घंटे के भीतर')"
                ],
                "te": [
                    "ప్రభుత్వ నిధులు విడుదల చేయడానికి ముందస్తు 'ప్రాసెసింగ్ ఫీజు' అడగడం",
                    "అధికారిక .gov.in సైట్లు కాకుండా అపరిచిత లింకులు ఉండటం",
                    "2 గంటల్లోగా చెల్లించాలని తొందరపెట్టడం"
                ]
            },
            "safe_action_steps": {
                "en": [
                    "Visit your local Gram Panchayat, Agriculture Officer, or official pmkisan.gov.in portal directly.",
                    "Never click unverified links received via SMS or WhatsApp.",
                    "Report scam messages on the Sanchar Saathi portal (Chakshu facility)."
                ],
                "hi": [
                    "अपनी ग्राम पंचायत, कृषि अधिकारी या आधिकारिक सरकारी पोर्टल से सीधे संपर्क करें।",
                    "SMS पर आए किसी भी अनजान लिंक पर क्लिक न करें।",
                    "संचार साथी पोर्टल पर धोखाधड़ी की रिपोर्ट करें।"
                ],
                "te": [
                    "మీ గ్రామ పంచాయతీ, వ్యవసాయ అధికారి లేదా అధికారిక ప్రభుత్వ పోర్టల్‌ను నేరుగా సంప్రదించండి.",
                    "ఎస్ఎంఎస్ లేదా వాట్సాప్‌లో వచ్చే గుర్తుతెలియని లింకులను క్లిక్ చేయవద్దు.",
                    "సంచార్ సాథీ (చక్షు) పోర్టల్‌లో ఫిర్యాదు చేయండి."
                ]
            }
        }
    ]

    @classmethod
    def get_all_scenarios(cls, language: str = "en") -> List[ScamScenarioResponse]:
        lang = language if language in ["en", "hi", "te"] else "en"
        results = []
        for s in cls.SCENARIOS_DATA:
            options_list = [
                ScamOption(id=opt["id"], text=opt["text"])
                for opt in s["options"].get(lang, s["options"]["en"])
            ]
            results.append(
                ScamScenarioResponse(
                    id=s["scenario_id"],
                    scenario_id=s["scenario_id"],
                    category=s["category"],
                    title=s["title"].get(lang, s["title"]["en"]),
                    description=s["description"].get(lang, s["description"]["en"]),
                    options=options_list,
                    language=lang,
                    difficulty=s.get("difficulty", "medium")
                )
            )
        return results

    @classmethod
    def evaluate_scenario_answer(
        cls,
        scenario_id: str,
        selected_option_id: str,
        language: str = "en"
    ) -> ScamEvaluationResponse:
        lang = language if language in ["en", "hi", "te"] else "en"
        scenario = next((s for s in cls.SCENARIOS_DATA if s["scenario_id"] == scenario_id), None)
        if not scenario:
            scenario = cls.SCENARIOS_DATA[0]

        is_correct = (selected_option_id.upper() == scenario["correct_option_id"])
        verdict = "SAFE" if is_correct else "DANGEROUS"
        points = scenario["points"] if is_correct else 0
        badge = "Scam Shield" if is_correct else None

        why = scenario["why_explanation"].get(lang, scenario["why_explanation"]["en"])
        red_flags = scenario["red_flags"].get(lang, scenario["red_flags"]["en"])
        safe_steps = scenario["safe_action_steps"].get(lang, scenario["safe_action_steps"]["en"])

        return ScamEvaluationResponse(
            scenario_id=scenario_id,
            selected_option_id=selected_option_id,
            is_correct=is_correct,
            verdict=verdict,
            why_explanation=why,
            red_flags=red_flags,
            safe_action_steps=safe_steps,
            points_earned=points,
            badge_unlocked=badge
        )
