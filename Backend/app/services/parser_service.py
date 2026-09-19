import re
import json
import logging
from typing import List, Dict, Any, Tuple
import httpx
from app.config import settings
from app.schemas.transaction_schemas import ParsedItem, NaturalParseResponse

logger = logging.getLogger(__name__)


class NaturalLanguageParserService:
    """
    Implements: "AI understands and explains; application logic calculates."
    Extracts structured income/expense line items from natural human speech/text,
    passes numbers to deterministic application logic for calculations, and crafts
    a clean, encouraging explanation in the user's language.
    """

    CATEGORIES_MAP = {
        # Income categories
        "farming": ["farming", "crop", "harvest", "khet", "kheti", "vyavasayam", "krishi", "cotton", "paddy", "wheat", "खेती", "फसल", "వ్యవసాయం", "పంట"],
        "tailoring": ["tailoring", "stitching", "sewing", "darzi", "kuttadam", "दर्जी", "सिलाई", "కుట్టు"],
        "salary": ["salary", "wage", "wages", "tankhwah", "jeetham", "kooli", "daily wage", "वेतन", "तनख्वाह", "मजदूरी", "జీతం", "కూలీ"],
        "small_business": ["business", "shop", "dukan", "store", "vyaparam", "sales", "दुकान", "व्यापार", "షాపు", "వ్యాపారం"],
        "livestock": ["dairy", "milk", "cow", "goat", "cattle", "pasuvulu", "doodh", "दूध", "मवेशी", "పాడి", "ఆవులు"],
        "crafts": ["pottery", "weaving", "handicraft", "carpentry", "हस्तशिल्प"],

        # Expense categories
        "household": ["household", "home", "ration", "kirana", "groceries", "ghar", "inti kharchu", "राशन", "किराना", "घर", "ఇంటి"],
        "food": ["food", "vegetables", "sabzi", "khana", "bhojanam", "tiffin", "सब्जी", "खाना", "భోజనం"],
        "education": ["education", "school", "college", "fees", "books", "padhai", "chaduvu", "स्कूल", "पढ़ाई", "ఫీజు", "చదువు"],
        "healthcare": ["health", "hospital", "medicine", "doctor", "illness", "dawa", "vaidyam", "mandulu", "दवा", "दवाई", "अस्पताल", "వైద్యం", "మందులు"],
        "transport": ["transport", "petrol", "diesel", "bus", "auto", "travel", "prayana", "पेट्रोल", "డీజిల్", "ప్రయాణం"],
        "agriculture": ["seeds", "fertilizer", "pesticide", "diesel pump", "tractor", "beej", "khad", "eruvulu", "खाद", "बीज", "ఎరువులు", "విత్తనాలు"],
        "debt_repayment": ["loan", "emi", "interest", "karz", "vaddi", "kisti", "appu", "कर्ज", "ब्याज", "కిస్తీ", "అప్పు", "వడ్డీ"]
    }

    @classmethod
    async def parse_text(cls, text: str, preferred_language: str = "en") -> NaturalParseResponse:
        detected_lang = cls._detect_language(text, preferred_language)

        # 1. Try AI-powered extraction via Ollama or Gemini if reachable
        extracted_items = await cls._extract_with_llm(text, detected_lang)

        # 2. If LLM returned empty or failed, use robust heuristic parser
        if not extracted_items:
            extracted_items = cls._heuristic_extract(text)

        # 3. Application logic strictly calculates financial numbers
        total_income = sum(item.amount for item in extracted_items if item.type == "income")
        total_expenses = sum(item.amount for item in extracted_items if item.type == "expense")
        net_remaining = total_income - total_expenses

        # 4. Generate user-friendly explanation based on language
        explanation = cls._generate_explanation(
            total_income=total_income,
            total_expenses=total_expenses,
            net_remaining=net_remaining,
            extracted_items=extracted_items,
            language=detected_lang
        )

        return NaturalParseResponse(
            raw_input=text,
            detected_language=detected_lang,
            extracted_items=extracted_items,
            total_income=round(total_income, 2),
            total_expenses=round(total_expenses, 2),
            net_remaining=round(net_remaining, 2),
            human_explanation=explanation
        )

    @classmethod
    def _detect_language(cls, text: str, preferred: str = "en") -> str:
        if any('\u0c00' <= char <= '\u0c7f' for char in text):
            return "te"  # Telugu script
        if any('\u0900' <= char <= '\u097f' for char in text):
            return "hi"  # Devanagari Hindi
        return preferred or "en"

    @classmethod
    async def _extract_with_llm(cls, text: str, language: str) -> List[ParsedItem]:
        prompt = f"""You are a financial entity extraction engine. Extract all income and expense items from the text below.
Return ONLY valid JSON matching this exact structure, with no commentary:
{{
  "items": [
    {{
      "type": "income" or "expense",
      "amount": numeric amount (e.g. 12000),
      "category": "farming"|"tailoring"|"salary"|"small_business"|"household"|"food"|"education"|"healthcare"|"transport"|"agriculture"|"other",
      "source_or_item": "short description e.g. Farming, Tailoring, Household things",
      "is_irregular": true
    }}
  ]
}}

Text to parse: "{text}"
"""
        # Try Ollama
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "format": "json",
                        "stream": False,
                        "options": {"temperature": 0.1}
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    raw_content = data.get("response", "").strip()
                    # Clean <think> tags if present
                    if "<think>" in raw_content and "</think>" in raw_content:
                        raw_content = raw_content.split("</think>")[-1].strip()
                    parsed_json = json.loads(raw_content)
                    raw_items = parsed_json.get("items", [])
                    result = []
                    for it in raw_items:
                        amt = float(it.get("amount", 0))
                        if amt > 0:
                            result.append(ParsedItem(
                                type=it.get("type", "expense"),
                                amount=amt,
                                category=it.get("category", "other"),
                                source_or_item=it.get("source_or_item", "Expense"),
                                is_irregular=it.get("is_irregular", True)
                            ))
                    if result:
                        return result
        except Exception as e:
            logger.debug(f"LLM extraction bypass: {e}")

        return []

    @classmethod
    def _heuristic_extract(cls, text: str) -> List[ParsedItem]:
        """
        Regex + keyword extractor that extracts numbers and maps them
        to income/expense categories even when completely offline.
        """
        items: List[ParsedItem] = []

        # 1. Normalize commas between digits: e.g. "12,000" -> "12000"
        normalized_text = re.sub(r'(?<=\d),(?=\d)', '', text)
        lower = normalized_text.lower()

        # 2. Split sentences/clauses safely
        delimiters = r'[,;।|\n]|\band\b|\bbut\b|\baur\b|\bpar\b|\bkani\b|\bkaani\b|\bమరియు\b|\bకానీ\b|\bऔर\b|\bलेकिन\b|\bतथा\b'
        clauses = re.split(delimiters, lower)

        income_indicators = [
            "got", "earned", "income", "received", "came", "aaye", "aaya",
            "sampadana", "vachindi", "labham", "mila", "kamai", "harvest",
            "मिला", "कमाई", "आया", "आई", "मिली", "खेती", "फसल",
            "వచ్చింది", "ఆదాయం", "సంపాదన", "లభించింది", "పంట"
        ]
        expense_indicators = [
            "spent", "paid", "expense", "expenses", "kharch", "kharcha",
            "ichanu", "poyindi", "household", "bought", "fees", "dawa",
            "ration", "kirana", "खर्च", "खर्चा", "दवा", "राशन", "किराना",
            "अस्पताल", "ఖర్చు", "మందులు", "ఇంటి", "చెల్లించాను", "కొన్నాను", "అయింది"
        ]

        for clause in clauses:
            clause = clause.strip()
            if not clause:
                continue

            # Match all currency numbers
            pattern = r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)(?:\s*(k|thousand|hazar|vela|లక్ష|लाख|lakh))?'
            matches = list(re.finditer(pattern, clause, flags=re.IGNORECASE))

            for m in matches:
                num_str = m.group(1)
                if not num_str:
                    continue
                try:
                    amt = float(num_str)
                except ValueError:
                    continue

                if amt <= 0:
                    continue

                multiplier = m.group(2)
                if multiplier:
                    mult_lower = multiplier.lower()
                    if mult_lower in ["k", "thousand", "hazar", "vela"]:
                        amt *= 1000
                    elif mult_lower in ["lakh", "laakh", "लाख", "లక్ష"]:
                        amt *= 100000

                # Determine whether income or expense
                is_income = any(w in clause for w in income_indicators)
                is_expense = any(w in clause for w in expense_indicators)

                # Identify category
                matched_category = "other"
                matched_label = "Transaction"

                for cat, keywords in cls.CATEGORIES_MAP.items():
                    if any(k in clause for k in keywords):
                        matched_category = cat
                        matched_label = cat.replace("_", " ").title()
                        if cat in ["farming", "tailoring", "salary", "small_business", "livestock", "crafts"]:
                            is_income = True
                        elif cat in ["household", "food", "education", "healthcare", "transport", "agriculture", "debt_repayment"]:
                            is_expense = True
                        break

                tx_type = "expense"
                if is_income and not is_expense:
                    tx_type = "income"
                elif is_income and is_expense:
                    # When both appear, check which keyword appeared closer to the number or specific verbs
                    if any(w in clause for w in ["got", "earned", "received", "mila", "मिला", "వచ్చింది"]):
                        tx_type = "income"
                    else:
                        tx_type = "expense"

                items.append(ParsedItem(
                    type=tx_type,
                    amount=round(amt, 2),
                    category=matched_category,
                    source_or_item=matched_label,
                    is_irregular=True
                ))

        return items

    @classmethod
    def _generate_explanation(
        cls,
        total_income: float,
        total_expenses: float,
        net_remaining: float,
        extracted_items: List[ParsedItem],
        language: str
    ) -> str:
        inc_count = sum(1 for i in extracted_items if i.type == "income")
        exp_count = sum(1 for i in extracted_items if i.type == "expense")

        if language == "te":
            lines = [
                f"నేను మీ వివరాలను అర్థం చేసుకుని లెక్కించాను:",
                f"• మొత్తం వచ్చిన ఆదాయం: ₹{int(total_income):,} ({inc_count} వనరులు)",
                f"• మొత్తం అయిన ఖర్చులు: ₹{int(total_expenses):,} ({exp_count} ఖర్చులు)",
                f"• ప్రస్తుతానికి మిగిలిన డబ్బు: ₹{int(net_remaining):,}"
            ]
            if net_remaining > 0:
                lines.append(f"మంచిది! మిగిలిన ₹{int(net_remaining):,} లో కొంత భాగాన్ని భవిష్యత్ అవసరాల కోసం దాచుకోవచ్చు.")
            else:
                lines.append("గమనిక: ఖర్చులు ఆదాయాన్ని మించాయి. తదుపరి నెలల్లో అనవసర ఖర్చులను తగ్గించడం మంచిది.")
            return "\n".join(lines)

        if language == "hi":
            lines = [
                f"मैंने आपकी आय और खर्च को समझकर हिसाब लगा लिया है:",
                f"• कुल आय: ₹{int(total_income):,} ({inc_count} स्रोत)",
                f"• कुल खर्च: ₹{int(total_expenses):,} ({exp_count} मदें)",
                f"• आपके पास बचा: ₹{int(net_remaining):,}"
            ]
            if net_remaining > 0:
                lines.append(f"बहुत बढ़िया! बचे हुए ₹{int(net_remaining):,} में से कुछ हिस्सा आपातकालीन गुल्लक में जमा करें।")
            else:
                lines.append("ध्यान दें: आपके खर्चे आमदनी से अधिक हो गए हैं। गैर-जरूरी खर्चों पर नियंत्रण रखें।")
            return "\n".join(lines)

        # English
        lines = [
            f"Here is what I understood and calculated from your update:",
            f"• Total Income: ₹{int(total_income):,} (from {inc_count} source{'s' if inc_count != 1 else ''})",
            f"• Total Expenses: ₹{int(total_expenses):,} ({exp_count} item{'s' if exp_count != 1 else ''})",
            f"• Net Remaining: ₹{int(net_remaining):,}"
        ]
        if net_remaining > 0:
            lines.append(f"Good job! Keeping a portion of the ₹{int(net_remaining):,} buffer aside will safeguard you during lean months.")
        else:
            lines.append("Alert: Expenses exceeded your earnings for this period. Prioritize core essentials until the next income inflow.")
        return "\n".join(lines)
