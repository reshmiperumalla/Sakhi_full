from datetime import datetime
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.datetime_utils import utc_now
from app.core.dependencies import get_db, get_current_user
from app.schemas.assistant_schemas import ChatMessageRequest, ChatMessageResponse
from app.services.ai_service import AIService
from app.services.calculation_service import FinancialCalculationService
from app.models.transaction import TransactionModel

router = APIRouter(prefix="/assistant", tags=["AI Personalized Financial Assistant"])


@router.post("/chat", response_model=ChatMessageResponse)
async def chat_with_assistant(
    chat_req: ChatMessageRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = current_user.get("profile", {})
    target_lang = chat_req.language or profile.get("preferred_language", "en")

    # 1. Fetch single source of truth financial metrics
    summary = await FinancialCalculationService.get_financial_summary(db, user_id)
    fin_summary = {
        "income": summary["total_income"],
        "expenses": summary["total_expenses"],
        "balance": summary["available_balance"],
        "typical_income": summary["typical_income"]
    }

    # 2. Check for explicit confirmed_action from user interaction (e.g. clicking clarification choice)
    if chat_req.confirmed_action:
        act = chat_req.confirmed_action
        act_type = act.get("type")
        amount = float(act.get("amount", 0.0))

        if act_type == "UPDATE_PROFILE_INCOME" and amount > 0:
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"profile.typical_income": amount, "updated_at": utc_now()}}
            )
            # Re-fetch summary
            summary = await FinancialCalculationService.get_financial_summary(db, user_id)

            if target_lang == "te":
                resp_text = (
                    f"సరే! మీ ప్రొఫైల్‌లో సాధారణ నెలవారీ ఆదాయాన్ని ₹{int(amount):,} కి అప్‌డేట్ చేశాను. "
                    f"ఈ నెలకు ప్రస్తుత నమోదు చేయబడిన ఆదాయం ₹{int(summary['total_income']):,}, "
                    f"మిగిలిన బ్యాలెన్స్ ₹{int(summary['available_balance']):,}."
                )
            elif target_lang == "hi":
                resp_text = (
                    f"समझ गया! मैंने आपकी प्रोफाइल में सामान्य मासिक आय ₹{int(amount):,} सेट कर दी है। "
                    f"इस महीने आपकी दर्ज आय ₹{int(summary['total_income']):,} और शेष राशि ₹{int(summary['available_balance']):,} है।"
                )
            else:
                resp_text = (
                    f"Understood! I have updated your typical monthly profile income to ₹{int(amount):,}. "
                    f"Your recorded income for this month is ₹{int(summary['total_income']):,}, "
                    f"and available balance is ₹{int(summary['available_balance']):,}."
                )

            return ChatMessageResponse(
                response=resp_text,
                language=target_lang,
                detected_intent="update_profile_income",
                suggestions=[
                    "What is my safe spending limit?" if target_lang == "en" else "मेरा सुरक्षित खर्च कितना है?",
                    "How to save for lean months?" if target_lang == "en" else "कमजोर महीनों के लिए कैसे बचाएं?"
                ],
                context_used=fin_summary,
                action_performed={"type": "UPDATE_PROFILE_INCOME", "amount": amount},
                financial_summary=summary,
                timestamp=utc_now()
            )

        elif act_type == "ADD_INCOME_TRANSACTION" and amount > 0:
            category = act.get("category", "farming")
            source = act.get("source_or_item", "Income via Mitra")
            now = utc_now()
            doc = TransactionModel(
                user_id=user_id,
                type="income",
                amount=amount,
                category=category,
                source_or_item=source,
                date=now,
                is_irregular=True,
                is_seasonal=False,
                notes="Added via Mitra Assistant",
                created_at=now
            ).model_dump(exclude={"id"})
            await db.transactions.insert_one(doc)

            # Re-fetch summary
            summary = await FinancialCalculationService.get_financial_summary(db, user_id)

            if target_lang == "te":
                resp_text = (
                    f"✅ ₹{int(amount):,} ఆదాయ లావాదేవీని ({source}) విజయవంతంగా నమోదు చేశాను! "
                    f"మీ నూతన మొత్తం ఆదాయం ₹{int(summary['total_income']):,} మరియు చేతిలో ఉన్న బ్యాలెన్స్ ₹{int(summary['available_balance']):,}."
                )
            elif target_lang == "hi":
                resp_text = (
                    f"✅ ₹{int(amount):,} की आय ({source}) सफलतापूर्वक दर्ज कर ली गई है! "
                    f"आपकी नई कुल आय ₹{int(summary['total_income']):,} और उपलब्ध शेष राशि ₹{int(summary['available_balance']):,} है।"
                )
            else:
                resp_text = (
                    f"✅ Successfully recorded ₹{int(amount):,} income ({source})! "
                    f"Your updated total income is ₹{int(summary['total_income']):,} and available balance is ₹{int(summary['available_balance']):,}."
                )

            return ChatMessageResponse(
                response=resp_text,
                language=target_lang,
                detected_intent="add_income_transaction",
                suggestions=[
                    "Check my budget" if target_lang == "en" else "मेरा बजट दिखाएं",
                    "How much should I save?" if target_lang == "en" else "मुझे कितना बचाना चाहिए?"
                ],
                context_used=fin_summary,
                action_performed={"type": "ADD_INCOME_TRANSACTION", "amount": amount},
                financial_summary=summary,
                timestamp=utc_now()
            )

    # 3. Detect intent from message text
    parsed_intent = AIService.extract_financial_intent(chat_req.message)

    if parsed_intent:
        itype = parsed_intent["type"]

        # A. Status Query
        if itype == "STATUS_QUERY":
            inc = summary["total_income"]
            exp = summary["total_expenses"]
            bal = summary["available_balance"]
            typ = summary["typical_income"]

            if target_lang == "te":
                resp_text = (
                    f"నమస్కారం! మీ ప్రస్తుత ఆర్థిక వివరాలు:\n\n"
                    f"• ఈ నెల వచ్చిన ఆదాయం: ₹{int(inc):,}\n"
                    f"• అయిన మొత్తం ఖర్చులు: ₹{int(exp):,}\n"
                    f"• చేతిలో ఉన్న మిగిలిన బ్యాలెన్స్: ₹{int(bal):,}\n"
                    f"• సాధారణ ప్రొఫైల్ నెలవారీ లక్ష్యం: ₹{int(typ):,}"
                )
            elif target_lang == "hi":
                resp_text = (
                    f"नमस्ते! आपकी वर्तमान वित्तीय स्थिति:\n\n"
                    f"• इस महीने की दर्ज कमाई: ₹{int(inc):,}\n"
                    f"• कुल हुए खर्च: ₹{int(exp):,}\n"
                    f"• उपलब्ध शेष राशि (बैलेंस): ₹{int(bal):,}\n"
                    f"• प्रोफाइल में सामान्य मासिक आय: ₹{int(typ):,}"
                )
            else:
                resp_text = (
                    f"Hello! Here is your accurate financial status:\n\n"
                    f"• Recorded Income (This Month): ₹{int(inc):,}\n"
                    f"• Total Expenses: ₹{int(exp):,}\n"
                    f"• Net Available Balance: ₹{int(bal):,}\n"
                    f"• Typical Monthly Profile Baseline: ₹{int(typ):,}"
                )

            return ChatMessageResponse(
                response=resp_text,
                language=target_lang,
                detected_intent="status_query",
                suggestions=[
                    "How to budget this balance?",
                    "Record an expense",
                    "Add new income"
                ],
                context_used=fin_summary,
                financial_summary=summary,
                timestamp=utc_now()
            )

        # B. Direct Profile Update
        elif itype == "UPDATE_PROFILE_INCOME":
            amt = parsed_intent["amount"]
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"profile.typical_income": amt, "updated_at": utc_now()}}
            )
            summary = await FinancialCalculationService.get_financial_summary(db, user_id)

            if target_lang == "te":
                resp_text = (
                    f"✅ మీ ప్రొఫైల్‌లో సాధారణ నెలవారీ ఆదాయాన్ని ₹{int(amt):,} కి అప్‌డేట్ చేశాను. "
                    f"మీ ప్రస్తుత నెల ఆదాయం ₹{int(summary['total_income']):,}, మిగిలిన బ్యాలెన్స్ ₹{int(summary['available_balance']):,}."
                )
            elif target_lang == "hi":
                resp_text = (
                    f"✅ आपकी प्रोफाइल में सामान्य मासिक आय को ₹{int(amt):,} पर अपडेट कर दिया गया है। "
                    f"इस महीने की कुल दर्ज आय ₹{int(summary['total_income']):,} और शेष राशि ₹{int(summary['available_balance']):,} है।"
                )
            else:
                resp_text = (
                    f"✅ Updated your typical monthly profile income to ₹{int(amt):,}. "
                    f"Your recorded income for this month is ₹{int(summary['total_income']):,}, "
                    f"and available balance is ₹{int(summary['available_balance']):,}."
                )

            return ChatMessageResponse(
                response=resp_text,
                language=target_lang,
                detected_intent="update_profile_income",
                suggestions=["View my budget", "What is my daily limit?"],
                context_used=fin_summary,
                action_performed={"type": "UPDATE_PROFILE_INCOME", "amount": amt},
                financial_summary=summary,
                timestamp=utc_now()
            )

        # C. Direct Transaction Income
        elif itype == "ADD_INCOME_TRANSACTION":
            amt = parsed_intent["amount"]
            cat = parsed_intent.get("category", "farming")
            src = parsed_intent.get("source_or_item", "Income via Mitra")
            now = utc_now()
            doc = TransactionModel(
                user_id=user_id,
                type="income",
                amount=amt,
                category=cat,
                source_or_item=src,
                date=now,
                is_irregular=True,
                is_seasonal=False,
                notes="Added via Mitra Assistant",
                created_at=now
            ).model_dump(exclude={"id"})
            await db.transactions.insert_one(doc)
            summary = await FinancialCalculationService.get_financial_summary(db, user_id)

            if target_lang == "te":
                resp_text = (
                    f"✅ ₹{int(amt):,} ఆదాయాన్ని ({src}) విజయవంతంగా నమోదు చేశాను. "
                    f"మీ తాజా మొత్తం ఆదాయం ₹{int(summary['total_income']):,}, చేతిలో ఉన్న బ్యాలెన్స్ ₹{int(summary['available_balance']):,}."
                )
            elif target_lang == "hi":
                resp_text = (
                    f"✅ ₹{int(amt):,} की आय ({src}) को रिकॉर्ड कर लिया गया है। "
                    f"आपकी कुल आय अब ₹{int(summary['total_income']):,} और शेष राशि ₹{int(summary['available_balance']):,} है।"
                )
            else:
                resp_text = (
                    f"✅ Recorded ₹{int(amt):,} income ({src})! "
                    f"Your updated total income is ₹{int(summary['total_income']):,} and balance is ₹{int(summary['available_balance']):,}."
                )

            return ChatMessageResponse(
                response=resp_text,
                language=target_lang,
                detected_intent="add_income_transaction",
                suggestions=["Check my budget", "How much should I save?"],
                context_used=fin_summary,
                action_performed={"type": "ADD_INCOME_TRANSACTION", "amount": amt},
                financial_summary=summary,
                timestamp=utc_now()
            )

        # D. Direct Expense Transaction
        elif itype == "ADD_EXPENSE_TRANSACTION":
            amt = parsed_intent["amount"]
            cat = parsed_intent.get("category", "household")
            src = parsed_intent.get("source_or_item", "Expense via Mitra")
            now = utc_now()
            doc = TransactionModel(
                user_id=user_id,
                type="expense",
                amount=amt,
                category=cat,
                source_or_item=src,
                date=now,
                is_irregular=True,
                is_seasonal=False,
                notes="Added via Mitra Assistant",
                created_at=now
            ).model_dump(exclude={"id"})
            await db.transactions.insert_one(doc)
            summary = await FinancialCalculationService.get_financial_summary(db, user_id)

            if target_lang == "te":
                resp_text = (
                    f"✅ ₹{int(amt):,} ఖర్చును ({src}) నమోదు చేశాను. "
                    f"ఈ నెల మొత్తం ఖర్చులు ₹{int(summary['total_expenses']):,}, మిగిలిన బ్యాలెన్స్ ₹{int(summary['available_balance']):,}."
                )
            elif target_lang == "hi":
                resp_text = (
                    f"✅ ₹{int(amt):,} का खर्च ({src}) दर्ज कर लिया गया है। "
                    f"इस महीने कुल खर्च ₹{int(summary['total_expenses']):,} और शेष राशि ₹{int(summary['available_balance']):,} है।"
                )
            else:
                resp_text = (
                    f"✅ Recorded ₹{int(amt):,} expense ({src})! "
                    f"Total expenses this month: ₹{int(summary['total_expenses']):,}, remaining balance: ₹{int(summary['available_balance']):,}."
                )

            return ChatMessageResponse(
                response=resp_text,
                language=target_lang,
                detected_intent="add_expense_transaction",
                suggestions=["Check my budget", "How much money is left?"],
                context_used=fin_summary,
                action_performed={"type": "ADD_EXPENSE_TRANSACTION", "amount": amt},
                financial_summary=summary,
                timestamp=utc_now()
            )

        # E. Ambiguous Income Statement: Ask clarification!
        elif itype == "AMBIGUOUS_INCOME":
            amt = parsed_intent["amount"]
            cat = parsed_intent.get("category", "farming")
            src = parsed_intent.get("source_or_item", "Income")

            if target_lang == "te":
                resp_text = (
                    f"మీరు ₹{int(amt):,} ఆదాయాన్ని పేర్కొన్నారు. దయచేసి స్పష్టం చేయండి:\n\n"
                    f"• మీరు దీన్ని మీ **సాధారణ నెలవారీ ప్రొఫైల్ ఆదాయంగా** అప్‌డేట్ చేయాలనుకుంటున్నారా?\n"
                    f"• లేక ఈ నెలకు **కొత్త ఆదాయ లావాదేవీగా** నమోదు చేయాలనుకుంటున్నారా?"
                )
                suggestions = [
                    f"నెలవారీ ప్రొఫైల్ ఆదాయం (₹{int(amt):,})",
                    f"ఈ నెల ఆదాయ లావాదేవీ (₹{int(amt):,})"
                ]
            elif target_lang == "hi":
                resp_text = (
                    f"आपने ₹{int(amt):,} की आय का उल्लेख किया है। कृपया स्पष्ट करें:\n\n"
                    f"• क्या आप इसे अपनी प्रोफाइल में **सामान्य मासिक आय** के रूप में सेट करना चाहते हैं?\n"
                    f"• या इस महीने के लिए **नई आय लेनदेन (ट्रांजेक्शन)** के रूप में जोड़ना चाहते हैं?"
                )
                suggestions = [
                    f"मासिक प्रोफाइल आय (₹{int(amt):,})",
                    f"इस महीने की नई कमाई (₹{int(amt):,})"
                ]
            else:
                resp_text = (
                    f"I noticed you mentioned an income of ₹{int(amt):,}. Please clarify your intent:\n\n"
                    f"• Would you like to set your **typical monthly profile income** to ₹{int(amt):,}?\n"
                    f"• Or record a **new income transaction** of ₹{int(amt):,} for this month?"
                )
                suggestions = [
                    f"Set as Monthly Profile Income (₹{int(amt):,})",
                    f"Record as Cash Inflow Transaction (₹{int(amt):,})"
                ]

            return ChatMessageResponse(
                response=resp_text,
                language=target_lang,
                detected_intent="ambiguous_income_clarification",
                suggestions=suggestions,
                context_used=fin_summary,
                pending_action={
                    "amount": amt,
                    "category": cat,
                    "source_or_item": src,
                    "options": [
                        {"type": "UPDATE_PROFILE_INCOME", "label": suggestions[0], "amount": amt},
                        {"type": "ADD_INCOME_TRANSACTION", "label": suggestions[1], "amount": amt, "category": cat, "source_or_item": src}
                    ]
                },
                financial_summary=summary,
                timestamp=utc_now()
            )

    # 4. Check if user answered a pending ambiguity in free text
    # e.g. "Monthly profile" or "profile" or "transaction"
    msg_low = chat_req.message.lower()
    last_msgs = chat_req.conversation_history or []
    is_clarifying = any("please clarify" in m.get("content", "").lower() or "स्पष्ट करें" in m.get("content", "") or "స్పష్టం" in m.get("content", "") for m in last_msgs[-2:])

    if is_clarifying:
        # Check for extracted amount in recent history
        hist_text = " ".join([m.get("content", "") for m in last_msgs[-3:]])
        amt_match = re.search(r"(\d{1,3}(?:,\d{2,3})*|\d+)", hist_text)
        resolved_amt = float(amt_match.group(1).replace(",", "")) if amt_match else 15000.0

        if any(w in msg_low for w in ["profile", "monthly", "मासिक", "प्रोफाइल", "నెలవారీ", "ప్రొఫైల్"]):
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"profile.typical_income": resolved_amt, "updated_at": utc_now()}}
            )
            summary = await FinancialCalculationService.get_financial_summary(db, user_id)
            return ChatMessageResponse(
                response=f"✅ Updated your typical monthly profile income to ₹{int(resolved_amt):,}!",
                language=target_lang,
                detected_intent="update_profile_income",
                suggestions=["View my budget", "What is my balance?"],
                context_used=fin_summary,
                action_performed={"type": "UPDATE_PROFILE_INCOME", "amount": resolved_amt},
                financial_summary=summary,
                timestamp=utc_now()
            )
        elif any(w in msg_low for w in ["transaction", "cash", "inflow", "लेनदेन", "कमाई", "ఈ నెల", "లావాదేవీ"]):
            now = utc_now()
            doc = TransactionModel(
                user_id=user_id,
                type="income",
                amount=resolved_amt,
                category="farming",
                source_or_item="Income via Mitra",
                date=now,
                is_irregular=True,
                is_seasonal=False,
                notes="Added via Mitra clarification",
                created_at=now
            ).model_dump(exclude={"id"})
            await db.transactions.insert_one(doc)
            summary = await FinancialCalculationService.get_financial_summary(db, user_id)
            return ChatMessageResponse(
                response=f"✅ Recorded ₹{int(resolved_amt):,} income transaction for this month!",
                language=target_lang,
                detected_intent="add_income_transaction",
                suggestions=["View my transactions", "Check my budget"],
                context_used=fin_summary,
                action_performed={"type": "ADD_INCOME_TRANSACTION", "amount": resolved_amt},
                financial_summary=summary,
                timestamp=utc_now()
            )

    # 5. General AI conversation with live numbers injected
    ai_response = await AIService.generate_response(
        user_message=chat_req.message,
        profile=profile,
        financial_summary=fin_summary,
        language=target_lang,
        conversation_history=chat_req.conversation_history
    )

    # Contextual follow-up suggestions
    suggestions = []
    if target_lang == "te":
        suggestions = [
            "ఈ నెలకు నేను ఎంత ఖర్చు చేయవచ్చు?",
            "తక్కువ ఆదాయ నెలల కోసం ఎంత దాచుకోవాలి?",
            "ఇది మోసపూరిత సందేశమా కాదా అని ఎలా తెలుసుకోవాలి?"
        ]
    elif target_lang == "hi":
        suggestions = [
            "मैं इस महीने कितना खर्च सुरक्षित रूप से कर सकता हूं?",
            "कम कमाई वाले महीनों के लिए कितनी बचत जरूरी है?",
            "क्या कोई बैंक अधिकारी फोन पर ओटीपी मांग सकता है?"
        ]
    else:
        suggestions = [
            "What is my safe spending limit for this month?",
            "How much should I keep aside for my lean season?",
            "How do I spot a fake government subsidy message?"
        ]

    # Intent tagging
    intent = "general_advice"
    if any(k in msg_low for k in ["manage", "budget", "spend", "left"]):
        intent = "budget_guidance"
    elif any(k in msg_low for k in ["goal", "save", "savings", "target"]):
        intent = "goal_planning"
    elif any(k in msg_low for k in ["scam", "fraud", "otp", "fake", "call"]):
        intent = "scam_safety"

    return ChatMessageResponse(
        response=ai_response,
        language=target_lang,
        detected_intent=intent,
        suggestions=suggestions,
        context_used={
            "income": fin_summary["income"],
            "expenses": fin_summary["expenses"],
            "balance": fin_summary["balance"],
            "typical_income": fin_summary["typical_income"],
            "income_pattern": profile.get("income_pattern", "irregular"),
            "language": target_lang
        },
        financial_summary=summary,
        phonetic_text_for_tts=ai_response[:200] if chat_req.include_voice_text else None,
        timestamp=utc_now()
    )
