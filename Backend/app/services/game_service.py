from typing import List, Dict, Any, Optional
from app.schemas.game_schemas import GameActivityResponse, GameResultResponse, UserGameStatsResponse


class GameService:
    """
    Implements the 4 core financial learning challenges:
    1. Budget Challenge
    2. Scam Detective
    3. Savings Challenge
    4. Smart Spending
    """

    ACTIVITIES: List[Dict[str, Any]] = [
        # Activity 1: Budget Challenge
        {
            "activity_id": "game_budget_01",
            "activity_type": "budget_challenge",
            "starting_balance": 10000.0,
            "title": {
                "en": "The ₹10,000 Monthly Budget Challenge",
                "hi": "₹10,000 मासिक बजट चुनौती",
                "te": "₹10,000 నెలవారీ బడ్జెట్ ఛాలెంజ్"
            },
            "scenario_prompt": {
                "en": "You have earned ₹10,000 this month. Unexpectedly, a family member has a mild fever (medicines ₹1,500) and an urgent wedding invitation arrives (gift ₹1,000). How will you distribute your ₹10,000 to survive safely without taking debt?",
                "hi": "इस महीने आपको ₹10,000 की कमाई हुई है। अचानक परिवार में किसी को बुखार आया (दवा ₹1,500) और एक जरूरी शादी का न्योता आ गया (तोहफा ₹1,000)। आप बिना कर्ज लिए अपने ₹10,000 का सुरक्षित बंटवारा कैसे करेंगे?",
                "te": "ఈ నెల మీకు ₹10,000 ఆదాయం వచ్చింది. అనుకోకుండా కుటుంబంలో ఒకరికి జ్వరం వచ్చింది (మందులు ₹1,500) మరియు ఒక వివాహ ఆహ్వానం వచ్చింది (బహుమతి ₹1,000). అప్పు తీసుకోకుండా ఈ ₹10,000 ను ఎలా సర్దుబాటు చేస్తారు?"
            },
            "options_or_items": {
                "en": [
                    {"id": "plan_a", "label": "Plan A: Pay essentials (₹5,000), medicines (₹1,500), modest gift (₹500), save buffer (₹3,000)"},
                    {"id": "plan_b", "label": "Plan B: Buy new clothes & large gift (₹4,000), essentials (₹5,000), leave ₹1,000 for emergency"},
                    {"id": "plan_c", "label": "Plan C: Spend everything this month and borrow ₹3,000 next month if money runs short"}
                ],
                "hi": [
                    {"id": "plan_a", "label": "योजना A: जरूरी राशन (₹5,000), दवाइयां (₹1,500), साधारण उपहार (₹500), सुरक्षा बचत (₹3,000)"},
                    {"id": "plan_b", "label": "योजना B: नए कपड़े और बड़ा उपहार (₹4,000), राशन (₹5,000), आपातकाल के लिए केवल ₹1,000"},
                    {"id": "plan_c", "label": "योजना C: पूरे ₹10,000 तुरंत खर्च कर दें और जरूरत पड़ने पर अगले महीने ₹3,000 का कर्ज लें"}
                ],
                "te": [
                    {"id": "plan_a", "label": "ప్లాన్ A: నిత్యావసరాలు (₹5,000), మందులు (₹1,500), చిన్న బహుమతి (₹500), భద్రత పొదుపు (₹3,000)"},
                    {"id": "plan_b", "label": "ప్లాన్ B: కొత్త బట్టలు & పెద్ద గిఫ్ట్ (₹4,000), నిత్యావసరాలు (₹5,000), కేవలం ₹1,000 మిగులు"},
                    {"id": "plan_c", "label": "ప్లాన్ C: మొత్తం ఖర్చు చేసి, అవసరమైతే వచ్చే నెల ₹3,000 అప్పు తీసుకోవడం"}
                ]
            },
            "correct_choice": "plan_a",
            "educational_goal": {
                "en": "Teach prioritizing health essentials and safety buffer over social pressure/luxury.",
                "hi": "दिखावे और कर्ज के बजाय स्वास्थ्य और सुरक्षा बचत को प्राथमिकता देना सिखाना।",
                "te": "అప్పుల ఊబిలో పడకుండా ఆరోగ్యం మరియు భద్రతకు ప్రాధాన్యత ఇవ్వడం నేర్పించడం."
            },
            "why_explanation": {
                "en": "Plan A prioritizes essential medicines and daily food while keeping an essential ₹3,000 buffer for lean months. Modest gifts show care without risking high-interest moneylender debt.",
                "hi": "योजना A बीमारी और राशन को पहली प्राथमिकता देती है और ₹3,000 की सुरक्षा गुल्लक बनाती है। दिखावे से बचकर आप ब्याज वाले कर्ज के जाल से सुरक्षित रहते हैं।",
                "te": "ప్లాన్ A మందులు మరియు నిత్యావసరాలకు పెద్దపీట వేస్తూనే, ₹3,000 అత్యవసర నిధిని కాపాడుతుంది. ఇది అధిక వడ్డీ అప్పుల నుంచి రక్షిస్తుంది."
            },
            "key_takeaway": {
                "en": "Always protect your survival buffer first before discretionary social spending.",
                "hi": "सामाजिक खर्चों से पहले हमेशा अपने परिवार की सुरक्षा और स्वास्थ्य को प्राथमिकता दें।",
                "te": "ఇతరుల మెప్పు కోసం చేసే ఖర్చుల కంటే కుటుంబ ఆరోగ్య భద్రతే ముఖ్యం."
            }
        },
        # Activity 2: Scam Detective
        {
            "activity_id": "game_scam_02",
            "activity_type": "scam_detective",
            "starting_balance": None,
            "title": {
                "en": "Scam Detective: Electricity Disconnection Alert",
                "hi": "स्कैम जासूस: बिजली कटने का फर्जी संदेश",
                "te": "స్కామ్ డిటెక్టివ్: కరెంట్ కట్ అవుతుందనే అలర్ట్"
            },
            "scenario_prompt": {
                "en": "You receive this SMS at 8:30 PM: 'Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM because previous month bill was not updated. Immediately call electricity officer at 9876543210 to prevent blackout.' What should a smart detective do?",
                "hi": "रात 8:30 बजे आपको संदेश मिलता है: 'प्रिय उपभोक्ता, पिछले महीने का बिल जमा न होने के कारण आज रात 9:30 बजे आपकी बिजली काट दी जाएगी। तुरंत 9876543210 पर बिजली अधिकारी को कॉल करें।' एक होशियार जासूस क्या करेगा?",
                "te": "రాత్రి 8:30 కి మీకు ఈ సందేశం వచ్చింది: 'ప్రియమైన వినియోగదారుడా, గత నెల బిల్లు అప్‌డేట్ కానందున ఈ రాత్రి 9:30 గంటలకు మీ విద్యుత్ సరఫరా నిలిపివేయబడుతుంది. వెంటనే 9876543210 నంబర్‌లో విద్యుత్ అధికారిని సంప్రదించండి.' ఒక సమర్థవంతమైన డిటెక్టివ్ ఏం చేస్తాడు?"
            },
            "options_or_items": {
                "en": [
                    {"id": "opt_call", "label": "Call the mobile number in the SMS immediately and download any app they ask for"},
                    {"id": "opt_pay", "label": "Transfer ₹200 to whatever UPI ID they provide on the phone"},
                    {"id": "opt_verify", "label": "Mark as suspicious scam! Government electricity boards never send personal mobile numbers threatening immediate disconnection at night"}
                ],
                "hi": [
                    {"id": "opt_call", "label": "संदेश में दिए मोबाइल नंबर पर तुरंत कॉल करें और उनके कहे अनुसार ऐप डाउनलोड करें"},
                    {"id": "opt_pay", "label": "फोन पर वे जो भी UPI आईडी बताएं, उस पर तुरंत ₹200 भेज दें"},
                    {"id": "opt_verify", "label": "इसे फर्जी स्कैम पहचानें! बिजली बोर्ड कभी भी रात को निजी मोबाइल नंबर से बिजली काटने का ऐसा संदेश नहीं भेजता"}
                ],
                "te": [
                    {"id": "opt_call", "label": "మెసేజ్‌లో ఉన్న నంబర్‌కు కాల్ చేసి వారు చెప్పిన యాప్‌ను డౌన్‌లోడ్ చేసుకోవడం"},
                    {"id": "opt_pay", "label": "వారు ఫోన్‌లో చెప్పిన యూపీఐ ఐడీకి వెంటనే ₹200 పంపడం"},
                    {"id": "opt_verify", "label": "ఇది మోసపూరిత సందేశంగా గుర్తించండి! విద్యుత్ శాఖ అధికారులు రాత్రిపూట వ్యక్తిగత ఫోన్ నంబర్లతో ఇలాంటి బెదిరింపులు పంపరు"}
                ]
            },
            "correct_choice": "opt_verify",
            "educational_goal": {
                "en": "Identify fear tactics used in electricity utility scams.",
                "hi": "बिजली बिल के नाम पर डर फैलाकर की जाने वाली ठगी को पहचानना।",
                "te": "విద్యుత్ బిల్లుల పేరుతో భయపెట్టి చేసే మోసాలను గుర్తించడం."
            },
            "why_explanation": {
                "en": "Scammers send these fake SMS messages at night when electricity offices are closed, creating panic. If you call, they trick you into installing remote access apps (like AnyDesk/TeamViewer) to empty your bank account.",
                "hi": "ठग रात के समय ऐसे संदेश भेजते हैं ताकि आप घबरा जाएं। फोन करने पर वे कोई रिमोट ऐप (जैसे AnyDesk) डाउनलोड करवाकर आपका पूरा बैंक खाता खाली कर देते हैं।",
                "te": "ఆఫీసులు మూసివేసే రాత్రి వేళల్లో భయం కలిగించడానికి మోసగాళ్లు ఇలా చేస్తారు. కాల్ చేస్తే స్క్రీన్ షేరింగ్ యాప్‌లు ఇన్‌స్టాల్ చేయించి బ్యాంక్ ఖాతా ఖాళీ చేస్తారు."
            },
            "key_takeaway": {
                "en": "Never call unknown personal mobile numbers received in panic alerts.",
                "hi": "घबराहट पैदा करने वाले किसी भी संदेश में दिए गए निजी नंबर पर कभी कॉल न करें।",
                "te": "బెదిరింపు సందేశాల్లో వచ్చే అపరిచిత వ్యక్తిగత నంబర్లకు ఎప్పుడూ కాల్ చేయవద్దు."
            }
        },
        # Activity 3: Savings Challenge
        {
            "activity_id": "game_savings_03",
            "activity_type": "savings_challenge",
            "starting_balance": 15000.0,
            "title": {
                "en": "Harvest Season Savings Challenge",
                "hi": "फसल कटाई के मौसम की बचत चुनौती",
                "te": "పంట కోతల సమయం పొదుపు ఛాలెంజ్"
            },
            "scenario_prompt": {
                "en": "This month is your harvest/peak season. You made ₹25,000 (compared to your usual ₹10,000). You have an emergency goal of ₹30,000 (currently ₹10,000 saved). What is the smartest strategy?",
                "hi": "इस महीने फसल बिकी है और आपको ₹25,000 मिले हैं (सामान्य ₹10,000 के मुकाबले)। आपका ₹30,000 का आपातकालीन लक्ष्य है (जिसमें अभी ₹10,000 जमा हैं)। सबसे समझदारी भरी रणनीति क्या होगी?",
                "te": "ఈ నెల పంట అమ్మకం ద్వారా మీకు ₹25,000 వచ్చాయి (సాధారణంగా వచ్చే ₹10,000 కంటే ఎక్కువ). మీ అత్యవసర లక్ష్యం ₹30,000 (ఇప్పటివరకు ₹10,000 దాచారు). తెలివైన నిర్ణయం ఏది?"
            },
            "options_or_items": {
                "en": [
                    {"id": "strat_save", "label": "Live on usual ₹10,000, deposit ₹10,000 directly to Emergency Reserve, keep ₹5,000 for upcoming festival"},
                    {"id": "strat_spend", "label": "Upgrade smartphone and throw a big party with the extra ₹15,000"},
                    {"id": "strat_chit", "label": "Give the entire ₹15,000 to an unregistered local chit-fund offering to double it in 3 months"}
                ],
                "hi": [
                    {"id": "strat_save", "label": "सामान्य ₹10,000 में घर चलाएं, ₹10,000 आपातकालीन गुल्लक में डालें, और ₹5,000 आगामी त्योहार के लिए रखें"},
                    {"id": "strat_spend", "label": "नया स्मार्टफोन खरीदें और बाकी ₹15,000 से बड़ी पार्टी करें"},
                    {"id": "strat_chit", "label": "किसी अनरजिस्टर्ड एजेंट को 3 महीने में पैसे दोगुने करने के लालच में सारे ₹15,000 सौंप दें"}
                ],
                "te": [
                    {"id": "strat_save", "label": "సాధారణ ₹10,000 తో ఇంటి ఖర్చులు చూసుకుని, ₹10,000 అత్యవసర నిధిలో వేసి, ₹5,000 పండుగ కోసం ఉంచడం"},
                    {"id": "strat_spend", "label": "కొత్త స్మార్ట్‌ఫోన్ కొని మిగిలిన ₹15,000 తో విందు చేసుకోవడం"},
                    {"id": "strat_chit", "label": "3 నెలల్లో డబుల్ చేస్తామని చెప్పే రిజిస్టర్ కాని లోకల్ చిట్టీలో మొత్తం ₹15,000 పెట్టడం"}
                ]
            },
            "correct_choice": "strat_save",
            "educational_goal": {
                "en": "Teach disciplined surplus allocation during peak harvest cycles.",
                "hi": "कमाई के अच्छे समय में अतिरिक्त पैसे को सुरक्षित भविष्य के लिए जोड़ना।",
                "te": "ఆదాయం ఎక్కువగా ఉన్నప్పుడు భవిష్యత్తు కోసం ఆదా చేసుకునే క్రమశిక్షణ."
            },
            "why_explanation": {
                "en": "Harvest income only arrives once or twice a year. Depositing ₹10,000 brings your emergency goal to ₹20,000 (66%), shielding you from debt during monsoon and lean sowing seasons.",
                "hi": "फसल की कमाई साल में केवल एक या दो बार ही आती है। ₹10,000 सुरक्षित करने से आपका आपातकालीन फंड ₹20,000 तक पहुंच जाएगा, जो आपको मंदी के दिनों में कर्ज से बचाएगा।",
                "te": "పంట ఆదాయం ఏడాదికి ఒకటి లేదా రెండు సార్లు మాత్రమే వస్తుంది. ₹10,000 పొదుపు చేయడం వల్ల మీ అత్యవసర నిధి ₹20,000 కి చేరుకుంటుంది, ఇది పంట వేసే సమయంలో అప్పుల బాధను నివారిస్తుంది."
            },
            "key_takeaway": {
                "en": "Treat peak surplus as your future security fund, not as permanent daily income.",
                "hi": "अच्छी कमाई को रोज की आमदनी न समझें; इसे भविष्य की ढाल बनाएं।",
                "te": "అదనపు ఆదాయాన్ని శాశ్వత ఆదాయంగా భావించకుండా భవిష్యత్తు రక్షణగా దాచుకోండి."
            }
        },
        # Activity 4: Smart Spending
        {
            "activity_id": "game_spending_04",
            "activity_type": "smart_spending",
            "starting_balance": None,
            "title": {
                "en": "Needs vs Wants: The Smart Spending Test",
                "hi": "जरूरत बनाम चाहत: समझदार खर्च की परीक्षा",
                "te": "అవసరం vs కోరిక: తెలివైన ఖర్చుల పరీక్ష"
            },
            "scenario_prompt": {
                "en": "When money is limited, separating true 'Needs' (essential for survival/work) from 'Wants' (desires that can wait) protects your family from debt. Which of the following is a genuine NEED?",
                "hi": "जब पैसे सीमित हों, तो 'जरूरत' (जीवन और आजीविका के लिए अनिवार्य) और 'चाहत' (जो टाली जा सकती है) में फर्क करना जरूरी है। इनमें से कौन सी एक वास्तविक 'जरूरत' है?",
                "te": "డబ్బు తక్కువగా ఉన్నప్పుడు, 'అవసరాలు' (బ్రతకడానికి/పనికి ముఖ్యమైనవి) మరియు 'కోరికలు' (వాయిదా వేయగలిగినవి) వేరుచేయడం ముఖ్యం. క్రింది వాటిలో నిజమైన అవసరం ఏది?"
            },
            "options_or_items": {
                "en": [
                    {"id": "item_crop_feed", "label": "Cattle fodder & Child's essential school textbooks (Need)"},
                    {"id": "item_gold_scheme", "label": "Branded designer clothes for casual wear (Want)"},
                    {"id": "item_lottery", "label": "Buying ₹500 lottery tickets every week hoping for luck (Want)"}
                ],
                "hi": [
                    {"id": "item_crop_feed", "label": "मवेशियों का चारा और बच्चे की जरूरी स्कूली किताबें (अनिवार्य जरूरत)"},
                    {"id": "item_gold_scheme", "label": "रोजमर्रा के लिए महंगे ब्रांडेड कपड़े (चाहत/दिखावा)"},
                    {"id": "item_lottery", "label": "किस्मत आजमाने के लिए हर हफ्ते ₹500 की लॉटरी खरीदना (चाहत/नुकसान)"}
                ],
                "te": [
                    {"id": "item_crop_feed", "label": "పశువుల మేత & పిల్లల పాఠ్యపుస్తకాలు (నిజమైన అవసరం)"},
                    {"id": "item_gold_scheme", "label": "సాధారణ అవసరాలకు ఖరీదైన బ్రాండెడ్ దుస్తులు (కోరిక)"},
                    {"id": "item_lottery", "label": "అదృష్టం కోసం ప్రతి వారం ₹500 లాటరీ టిక్కెట్లు కొనడం (కోరిక/వృధా)"}
                ]
            },
            "correct_choice": "item_crop_feed",
            "educational_goal": {
                "en": "Distinguish survival/livelihood assets from lifestyle temptations.",
                "hi": "आजीविका से जुड़े जरूरी खर्चों और फिजूलखर्ची में अंतर समझना।",
                "te": "జీవనోపాధికి అవసరమైన వాటికి మరియు తాత్కాలిక కోరికలకు మధ్య తేడా తెలుసుకోవడం."
            },
            "why_explanation": {
                "en": "Cattle fodder protects your dairy income and children's education builds their future. These are genuine Needs. Branded clothes and lottery tickets are Wants that drain cash.",
                "hi": "पशुओं का चारा आपकी दूध की आमदनी को बचाता है और बच्चों की पढ़ाई उनका भविष्य बनाती है। ये अनिवार्य जरूरतें हैं। महंगे कपड़े और लॉटरी सिर्फ धन की बर्बादी हैं।",
                "te": "పశువుల మేత మీ పాడి ఆదాయాన్ని కాపాడుతుంది, పిల్లల చదువు వారి భవిష్యత్తును నిర్మిస్తుంది. ఇవి నిజమైన అవసరాలు. ఖరీదైన దుస్తులు, లాటరీలు డబ్బును వృధా చేస్తాయి."
            },
            "key_takeaway": {
                "en": "Fund livelihood and health first; satisfy luxury desires only with pure surplus.",
                "hi": "पहले रोजी-रोटी और सेहत सुरक्षित करें, शौक केवल अतिरिक्त बचत से पूरे करें।",
                "te": "మొదట జీవనోపాధి మరియు ఆరోగ్యాన్ని కాపాడుకోండి; మిగులు ఉన్నప్పుడే కోరికలు తీర్చుకోండి."
            }
        }
    ]

    @classmethod
    def get_all_activities(cls, language: str = "en") -> List[GameActivityResponse]:
        lang = language if language in ["en", "hi", "te"] else "en"
        results = []
        for act in cls.ACTIVITIES:
            opts = act["options_or_items"].get(lang, act["options_or_items"]["en"])
            results.append(
                GameActivityResponse(
                    activity_id=act["activity_id"],
                    activity_type=act["activity_type"],
                    title=act["title"].get(lang, act["title"]["en"]),
                    scenario_prompt=act["scenario_prompt"].get(lang, act["scenario_prompt"]["en"]),
                    starting_balance=act.get("starting_balance"),
                    options_or_items=opts,
                    educational_goal=act["educational_goal"].get(lang, act["educational_goal"]["en"]),
                    language=lang
                )
            )
        return results

    @classmethod
    def evaluate_game_choice(
        cls,
        activity_id: str,
        user_choices: Any,
        language: str = "en"
    ) -> GameResultResponse:
        lang = language if language in ["en", "hi", "te"] else "en"
        act = next((a for a in cls.ACTIVITIES if a["activity_id"] == activity_id), cls.ACTIVITIES[0])

        # Check correctness
        is_passed = False
        if isinstance(user_choices, str):
            is_passed = (user_choices.strip().lower() == act["correct_choice"].lower())
        elif isinstance(user_choices, dict):
            # If choices passed as dict e.g. {"selected": "plan_a"}
            sel = user_choices.get("selected", "")
            is_passed = (str(sel).strip().lower() == act["correct_choice"].lower())

        score = 100 if is_passed else 30
        xp = 50 if is_passed else 10
        badge = None
        if is_passed:
            badges_map = {
                "budget_challenge": "Budget Guardian",
                "scam_detective": "Scam Detective",
                "savings_challenge": "Prudent Saver",
                "smart_spending": "Smart Spender"
            }
            badge = badges_map.get(act["activity_type"], "Financial Achiever")

        why = act["why_explanation"].get(lang, act["why_explanation"]["en"])
        takeaway = act["key_takeaway"].get(lang, act["key_takeaway"]["en"])

        feedback = "Excellent! You made the financially secure choice." if is_passed else "Good effort, but this choice carries hidden financial risk."
        if lang == "hi":
            feedback = "शानदार! आपने वित्तीय रूप से सबसे सुरक्षित विकल्प चुना।" if is_passed else "अच्छा प्रयास, लेकिन इस विकल्प में आर्थिक जोखिम था।"
        elif lang == "te":
            feedback = "చాలా బాగుంది! మీరు ఆర్థికంగా అత్యంత సురక్షితమైన నిర్ణయం తీసుకున్నారు." if is_passed else "మంచి ప్రయత్నం, కానీ ఈ నిర్ణయంలో దాగి ఉన్న ఆర్థిక ప్రమాదం ఉంది."

        return GameResultResponse(
            activity_id=activity_id,
            score=score,
            max_score=100,
            is_passed=is_passed,
            feedback=feedback,
            why_explanation=why,
            key_takeaway=takeaway,
            xp_earned=xp,
            new_total_xp=xp,
            badge_unlocked=badge
        )
