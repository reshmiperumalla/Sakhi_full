import json
import logging
import re
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """
    Unified AI orchestration service supporting:
    1. Local Ollama (qwen3:4b) for offline / private inference
    2. Cloud Gemini API / OpenAI API if configured
    3. Intelligent deterministic fallback if LLM is momentarily unreachable
    """

    SYSTEM_PROMPT_TEMPLATE = """You are 'Mitra' (Friend), a compassionate, wise, and simple AI financial guide built specifically for Indian families, farmers, daily-wage workers, micro-business owners, and rural households with IRREGULAR or SEASONAL income.

IMPORTANT PRINCIPLES:
1. Speak in the user's chosen language: {language_name}. Use simple, everyday words.
2. NEVER use complex financial jargon (like 'depreciation', 'portfolio diversification', 'amortization', 'liquidity buffer'). Instead say 'rainy day money', 'safe spending limit', 'keeping money aside for lean months', 'gradual debt clearance'.
3. Always respect that income goes up and down (farming harvest, festival seasons, daily labor). Never lecture or make them feel bad about irregular earnings.
4. Always quote amounts in Indian Rupees (₹).
5. Be concise, direct, and warm.
6. When referencing income, clearly distinguish between their TYPICAL MONTHLY PROFILE INCOME (₹{typical_income}) and their ACTUAL RECORDED CASH TRANSACTIONS THIS MONTH (₹{current_income}).

USER'S FINANCIAL PROFILE:
- Language: {language}
- Income Pattern: {income_pattern}
- Typical Monthly Income: ₹{typical_income}
- Income Sources: {income_sources}
- Main Expenses: {expense_categories}
- Financial Literacy Level: {literacy_level}
- Primary Savings Goal: {primary_goal}
- Dependents: {dependents_count}
- Typical Lean Months (low income): {lean_months}
- Typical Peak Months (high income): {peak_months}

CURRENT RECORDED FINANCIAL STATUS:
- Actual Cash Inflow (This Month): ₹{current_income}
- Actual Cash Outflow (This Month): ₹{current_expenses}
- Real Net Available Balance: ₹{current_balance}
"""

    LANGUAGE_NAMES = {
        "en": "English",
        "hi": "Hindi (हिंदी) - use simple, polite Devanagari Hindi",
        "te": "Telugu (తెలుగు) - use simple, polite Telugu"
    }

    @classmethod
    def get_system_prompt(cls, profile: Dict[str, Any], financial_summary: Dict[str, Any], language: str = "en") -> str:
        lang_code = language or profile.get("preferred_language", "en")
        lang_name = cls.LANGUAGE_NAMES.get(lang_code, "English")

        return cls.SYSTEM_PROMPT_TEMPLATE.format(
            language_name=lang_name,
            language=lang_code,
            income_pattern=profile.get("income_pattern", "irregular"),
            typical_income=financial_summary.get("typical_income", profile.get("typical_income", 15000.0)),
            income_sources=", ".join(profile.get("income_sources", ["farming", "small business"])),
            expense_categories=", ".join(profile.get("primary_expense_categories", ["household", "education"])),
            literacy_level=profile.get("financial_literacy_level", "beginner"),
            primary_goal=profile.get("primary_goal", "emergency savings"),
            dependents_count=profile.get("dependents_count", 2),
            lean_months=", ".join(profile.get("lean_months", ["May", "June"])),
            peak_months=", ".join(profile.get("peak_months", ["October", "January"])),
            current_income=financial_summary.get("income", 0.0),
            current_expenses=financial_summary.get("expenses", 0.0),
            current_balance=financial_summary.get("balance", 0.0)
        )

    @classmethod
    def extract_financial_intent(cls, user_message: str) -> Optional[Dict[str, Any]]:
        """
        Parses user intent for financial mutations and status queries.
        Handles English, Hindi, and Telugu with flexible numeric representations.
        """
        text = user_message.lower().strip()

        # 1. Check for Status Queries (asking about balance or income)
        status_patterns = [
            r"what('s| is) my (balance|income|money|expense|savings)",
            r"how much (money|income|balance|did i spend|do i have)",
            r"check my (balance|income)",
            r"मेरा (बैलेंस|खर्च|आय|कमाई)",
            r"कितना (बैलेंस|पैसा|खर्च|बचा)",
            r"నా (బ్యాలెన్స్|ఆదాయం|ఖర్చు|డబ్బు)",
            r"ఎంత (డబ్బు|బ్యాలెన్స్|మిగిలింది)"
        ]
        if any(re.search(pat, text, re.IGNORECASE) for pat in status_patterns):
            return {"type": "STATUS_QUERY"}

        # 2. Extract Amount
        amount = None
        # Handle k / thousand
        k_match = re.search(r"(?:₹|rs\.?|inr|रु\.?|రూ\.?)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousand|हजार|వేలు)\b", text, re.IGNORECASE)
        if k_match:
            try:
                amount = float(k_match.group(1)) * 1000
            except ValueError:
                pass

        if amount is None:
            # Handle standard numbers with optional commas (e.g. ₹20,000 or 25000)
            num_match = re.search(r"(?:₹|rs\.?|inr|रु\.?|రూ\.?)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:₹|rs\.?|rupees|रुपये|రూపాయలు)?", text, re.IGNORECASE)
            if num_match:
                raw_num = num_match.group(1).replace(",", "")
                try:
                    val = float(raw_num)
                    # Filter out tiny standalone numbers (e.g. "step 1", "2 kids") unless preceded by currency
                    has_curr = bool(re.search(r"[₹]|rs|inr|rupee|रुपये|రూపాయలు", text, re.IGNORECASE))
                    if val >= 50 or has_curr:
                        amount = val
                except ValueError:
                    pass

        if not amount:
            return None

        # 3. Detect Category
        category = "other"
        source_or_item = "Financial Entry"

        cat_keywords = {
            "farming": ["farm", "farming", "crop", "harvest", "cotton", "paddy", "wheat", "कृषि", "खेती", "फसल", "పంట", "వ్యవసాయం"],
            "dairy": ["dairy", "milk", "buffalo", "cow", "दूध", "डेयरी", "பால்", "పాడి", "పాలు"],
            "tailoring": ["tailor", "tailoring", "cloth", "stitch", "sewing", "सिलाई", "कढ़ाई", "कपड़े", "కుట్టు", "బట్టలు"],
            "food": ["groceries", "grocery", "ration", "vegetable", "food", "किराना", "राशन", "सब्जी", "भोजन", "కిరాణా", "ఆహారం"],
            "education": ["school", "fee", "fees", "book", "education", "कॉलेज", "स्कूल", "फीस", "किताब", "ఫీజు", "చదువు"],
            "healthcare": ["medicine", "doctor", "hospital", "health", "medical", "दवा", "डॉक्टर", "इलाज", "వైద్యం", "మందులు"],
            "household": ["household", "rent", "electricity", "cylinder", "gas", "किराया", "बिजली", "गैस", "ఇంటి అద్దె", "కరెంట్ బిల్"]
        }

        for cat, kw_list in cat_keywords.items():
            if any(kw in text for kw in kw_list):
                category = cat
                source_or_item = cat.title()
                break

        # 4. Check for Expense
        expense_keywords = [
            "spent", "spend", "bought", "buy", "purchase", "paid", "expense", "bill", "cost",
            "खर्च", "खरीदा", "दिए", "खर्चा", "భరించాను", "చెల్లించాను", "ఖర్చు"
        ]
        if any(kw in text for kw in expense_keywords):
            return {
                "type": "ADD_EXPENSE_TRANSACTION",
                "amount": amount,
                "category": category if category != "other" else "household",
                "source_or_item": source_or_item if source_or_item != "Financial Entry" else "Daily Expense"
            }

        # 5. Check for Explicit Profile Income
        profile_keywords = [
            "monthly income", "typical income", "earn per month", "monthly salary", "every month",
            "profile income", "set my income", "change my income", "make my income",
            "मासिक आय", "हर महीने", "सामान्य कमाई", "मासिक वेतन", "ప్రతినెలా", "నెలవారీ ఆదాయం", "నెల ఆదాయం"
        ]
        if any(kw in text for kw in profile_keywords):
            return {
                "type": "UPDATE_PROFILE_INCOME",
                "amount": amount
            }

        # 6. Check for Explicit Transaction Income
        tx_income_keywords = [
            "earned", "got", "received", "sold", "today", "yesterday", "credited", "cash in",
            "add income", "record income", "मिले", "कमाई हुई", "बिक्री", "वसूली", "వచ్చాయి", "సంపాదించాను", "అమ్మకం"
        ]
        if any(kw in text for kw in tx_income_keywords):
            return {
                "type": "ADD_INCOME_TRANSACTION",
                "amount": amount,
                "category": category if category != "other" else "farming",
                "source_or_item": source_or_item if source_or_item != "Financial Entry" else "Cash Income"
            }

        # 7. Ambiguous Income (e.g. "My income is 20000", "Income 20000", "मेरी आय 20000 है")
        income_general_keywords = ["income", "earn", "salary", "कमाई", "आय", "आवक", "ఆదాయం"]
        if any(kw in text for kw in income_general_keywords):
            return {
                "type": "AMBIGUOUS_INCOME",
                "amount": amount,
                "category": category,
                "source_or_item": source_or_item
            }

        return None

    @classmethod
    async def generate_response(
        cls,
        user_message: str,
        profile: Dict[str, Any],
        financial_summary: Dict[str, Any],
        language: str = "en",
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        system_prompt = cls.get_system_prompt(profile, financial_summary, language)

        # 1. Try Gemini if API key configured
        if settings.GEMINI_API_KEY:
            try:
                response = await cls._call_gemini(user_message, system_prompt, conversation_history)
                if response:
                    return response
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}. Falling back to Ollama.")

        # 2. Try Local Ollama (qwen3:4b)
        try:
            response = await cls._call_ollama(user_message, system_prompt, conversation_history)
            if response:
                return response
        except Exception as e:
            logger.warning(f"Ollama call failed: {e}. Falling back to rule-based assistant.")

        # 3. Intelligent fallback engine (deterministic & reliable)
        return cls._rule_based_fallback(user_message, profile, financial_summary, language)

    @classmethod
    async def _call_ollama(
        cls,
        user_message: str,
        system_prompt: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Optional[str]:
        url = f"{settings.OLLAMA_BASE_URL}/api/chat"
        messages = [{"role": "system", "content": system_prompt}]

        if conversation_history:
            for item in conversation_history[-6:]:
                messages.append({"role": item.get("role", "user"), "content": item.get("content", "")})

        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.4,
                "num_predict": 400
            }
        }

        async with httpx.AsyncClient(timeout=40.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data.get("message", {}).get("content", "")
                if "<think>" in content and "</think>" in content:
                    content = content.split("</think>")[-1].strip()
                return content
        return None

    @classmethod
    async def _call_gemini(
        cls,
        user_message: str,
        system_prompt: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Optional[str]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        contents = []

        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"Instruction: {system_prompt}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will act as Mitra, following all guidelines."}]})

        if conversation_history:
            for item in conversation_history[-6:]:
                role = "model" if item.get("role") == "assistant" else "user"
                contents.append({"role": role, "parts": [{"text": item.get("content", "")}]})

        contents.append({"role": "user", "parts": [{"text": user_message}]})

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(url, json={"contents": contents})
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
        return None

    @classmethod
    def _rule_based_fallback(
        cls,
        user_message: str,
        profile: Dict[str, Any],
        financial_summary: Dict[str, Any],
        language: str = "en"
    ) -> str:
        msg = user_message.lower()
        income = float(financial_summary.get("income", 0.0))
        expenses = float(financial_summary.get("expenses", 0.0))
        balance = float(financial_summary.get("balance", 0.0))
        typical = float(financial_summary.get("typical_income", profile.get("typical_income", 15000.0)))
        lean_months = ", ".join(profile.get("lean_months", ["May", "June"]))

        # Dynamic proportions calculated strictly by backend arithmetic
        effective_pool = balance if balance > 0 else (income if income > 0 else typical)
        cushion = round(effective_pool * 0.20)
        essentials = round(effective_pool * 0.50)
        goal_alloc = round(effective_pool * 0.15)
        discretionary = round(effective_pool * 0.15)

        # Telugu responses
        if language == "te":
            if any(k in msg for k in ["manage", "left", "save", "బడ్జెట్", "మిగిలింది", "ఎలా", "సహాయం"]):
                return (
                    f"నమస్కారం! మీ వద్ద ప్రస్తుతానికి మిగిలిన డబ్బు ₹{int(balance):,}.\n\n"
                    f"మీకు స్థిరమైన నెలవారీ ఆదాయం ఉండదు కాబట్టి, ఈ పద్ధతిని పాటించండి:\n"
                    f"1. ₹{int(cushion):,} అత్యవసర పొదుపుగా పక్కన పెట్టండి (రాబోయే తక్కువ ఆదాయ నెలల కోసం: {lean_months}).\n"
                    f"2. ₹{int(essentials):,} ఇంటి నిత్యావసరాలు మరియు రేషన్ కోసం ఉపయోగించండి.\n"
                    f"3. ₹{int(goal_alloc):,} మీ ముఖ్యమైన లక్ష్యం కోసం దాచుకోండి.\n\n"
                    f"గుర్తుంచుకోండి: అధిక ఆదాయం వచ్చినప్పుడు ముందుగానే దాచుకుంటే, తక్కువ ఆదాయ నెలల్లో అప్పులు చేయాల్సిన అవసరం రాదు."
                )
            return (
                f"నమస్కారం! నేను మీ ఆర్థిక మిత్రుడిని. మీ ప్రస్తుత నమోదు చేయబడిన ఆదాయం ₹{int(income):,}, "
                f"ఖర్చులు ₹{int(expenses):,}, మిగిలినవి ₹{int(balance):,} (సాధారణ నెలవారీ లక్ష్యం ₹{int(typical):,}).\n"
                f"మీ బడ్జెట్, ఖర్చులను నమోదు చేయడం లేదా పొదుపు ప్రణాళిక గురించి నాకు ఏదైనా అడగవచ్చు."
            )

        # Hindi responses
        if language == "hi":
            if any(k in msg for k in ["manage", "left", "save", "बजट", "बचा", "कैसे", "मदद"]):
                return (
                    f"नमस्ते! आपके पास इस समय ₹{int(balance):,} बचे हैं।\n\n"
                    f"क्योंकि आपकी आमदनी ऊपर-नीचे होती रहती है, इसलिए यह सरल नियम अपनाएं:\n"
                    f"1. ₹{int(cushion):,} मंदी/कम कमाई वाले महीनों ({lean_months}) के लिए सुरक्षा गुल्लक में अलग रखें।\n"
                    f"2. ₹{int(essentials):,} घर के जरूरी राशन और दवाओं के लिए रखें।\n"
                    f"3. ₹{int(goal_alloc):,} अपने बचत लक्ष्य में जमा करें।\n\n"
                    f"कमाई जब अच्छी हो, तब थोड़ा ज्यादा बचाएं ताकि कमजोर महीनों में किसी से कर्ज न लेना पड़े।"
                )
            return (
                f"नमस्ते! मैं आपका वित्तीय मित्र हूं। इस महीने आपकी कुल दर्ज आय ₹{int(income):,}, "
                f"खर्च ₹{int(expenses):,}, और शेष उपलब्ध राशि ₹{int(balance):,} है (सामान्य प्रोफाइल आय ₹{int(typical):,})।\n"
                f"आप मुझसे बजट बनाने, खर्च घटाने या किसी भी धोखाधड़ी/स्कैम के बारे में पूछ सकते हैं।"
            )

        # English responses (Default)
        if any(k in msg for k in ["manage", "left", "budget", "save", "plan"]):
            return (
                f"Hello! Managing your available balance of ₹{int(balance):,} wisely is a great step forward.\n\n"
                f"Since income changes from month to month, here is a safe, simple allocation based on your numbers:\n"
                f"1. **Safety Cushion (₹{int(cushion):,})**: Keep this aside in a safe spot for your lean months ({lean_months}) when work or harvest is slower.\n"
                f"2. **Daily Essentials (₹{int(essentials):,})**: For food, household groceries, and medical emergencies.\n"
                f"3. **Goal Savings (₹{int(goal_alloc):,})**: Towards your primary goal ({profile.get('primary_goal', 'Emergency Reserve')}).\n\n"
                f"Tip: In irregular income situations, the golden rule is: *Protect your lean months during your peak months so you never have to borrow at high interest.*"
            )

        return (
            f"Hello! I am Mitra, your personal financial guide. Currently, your recorded monthly income is ₹{int(income):,}, "
            f"expenses are ₹{int(expenses):,}, leaving ₹{int(balance):,} available (with a typical baseline of ₹{int(typical):,}).\n\n"
            f"You can ask me how to manage your money, check your emergency buffer, plan a savings goal, or record new earnings and expenses."
        )
