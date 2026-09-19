from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.dependencies import get_db, get_current_user
from app.services.calculation_service import FinancialCalculationService

router = APIRouter(prefix="/dashboard", tags=["Simple Financial Dashboard"])


@router.get("/summary")
async def get_dashboard_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = current_user.get("profile", {})
    lang = profile.get("preferred_language", "en")

    # Use single source of truth calculation service
    summary = await FinancialCalculationService.get_financial_summary(db, user_id)

    total_income = summary["total_income"]
    total_expenses = summary["total_expenses"]
    available_balance = summary["available_balance"]
    spending_by_category = summary["spending_by_category"]
    top_expense = summary["top_expense"]
    goal_data = summary["savings_goal"]
    typical_income = summary["typical_income"]

    # Friendly localized Tips
    if lang == "te":
        header_title = "నా డబ్బు (MY MONEY)"
        tip = "గమనిక: ఈ నెల మీ ఖర్చులను గమనించండి. అత్యవసర నిధిని జాగ్రత్తగా ఉంచుకోండి."
        income_label = "వచ్చిన డబ్బు (Income)"
        expense_label = "అయిన ఖర్చులు (Expenses)"
        available_label = "చేతిలో ఉన్నవి (Available)"
        top_expense_label = "ఎక్కువైన ఖర్చు (Top Expense)"
    elif lang == "hi":
        header_title = "मेरे पैसे (MY MONEY)"
        tip = "सलाह: इस महीने अपनी बचत का ध्यान रखें और जरूरी खर्चों को प्राथमिकता दें।"
        income_label = "कुल कमाई (Income)"
        expense_label = "कुल खर्च (Expenses)"
        available_label = "बची हुई राशि (Available)"
        top_expense_label = "सबसे बड़ा खर्च (Top Expense)"
    else:
        header_title = "MY MONEY"
        tip = "💡 Tip: Keep a buffer aside in your reserve before planning discretionary purchases."
        income_label = "Income"
        expense_label = "Expenses"
        available_label = "Available"
        top_expense_label = "Top Expense"

    return {
        "header_title": header_title,
        "language": lang,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_balance": available_balance,
        "typical_income": typical_income,
        "spending_by_category": spending_by_category,
        "metrics": {
            "income": {"label": income_label, "amount": total_income},
            "expenses": {"label": expense_label, "amount": total_expenses},
            "available": {"label": available_label, "amount": available_balance}
        },
        "top_expense": {
            "label": top_expense_label,
            "category": top_expense["category"],
            "icon": top_expense["icon"],
            "amount": top_expense["amount"]
        },
        "savings_goal": goal_data,
        "actionable_tip": tip,
        "financial_literacy_level": profile.get("financial_literacy_level", "beginner")
    }
