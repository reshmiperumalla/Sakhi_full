from typing import Dict, Any, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.datetime_utils import utc_now
from app.services.goal_service import GoalService


class FinancialCalculationService:
    """
    Central financial calculation engine - Single Source of Truth.
    Rule: AI understands and explains; Backend calculates; React displays.
    """

    CATEGORY_ICON_MAP = {
        "household": "🏠",
        "food": "🍲",
        "education": "📚",
        "healthcare": "🏥",
        "agriculture": "🌾",
        "farming": "🌾",
        "dairy": "🐄",
        "tailoring": "🧵",
        "transport": "🚌",
        "debt_repayment": "💳",
        "salary": "💼",
        "small_business": "🏪",
        "other": "📦"
    }

    @classmethod
    async def get_financial_summary(
        cls,
        db: AsyncIOMotorDatabase,
        user_id: str,
        year: Optional[int] = None,
        month: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Calculates consistent financial metrics for a user.
        Prioritizes the current month; if empty, looks at all-time.
        Guarantees exact arithmetic: balance = income - expenses.
        """
        now = utc_now()
        y = year or now.year
        m = month or now.month

        # Month boundaries
        start_of_month = datetime(y, m, 1)
        if m == 12:
            start_of_next_month = datetime(y + 1, 1, 1)
        else:
            start_of_next_month = datetime(y, m + 1, 1)

        # 1. Fetch current month transactions
        month_incomes = [
            tx async for tx in db.transactions.find({
                "user_id": user_id,
                "type": "income",
                "date": {"$gte": start_of_month, "$lt": start_of_next_month}
            })
        ]
        month_expenses = [
            tx async for tx in db.transactions.find({
                "user_id": user_id,
                "type": "expense",
                "date": {"$gte": start_of_month, "$lt": start_of_next_month}
            })
        ]

        # 2. Fetch all-time transactions
        all_incomes = [
            tx async for tx in db.transactions.find({"user_id": user_id, "type": "income"})
        ]
        all_expenses = [
            tx async for tx in db.transactions.find({"user_id": user_id, "type": "expense"})
        ]

        # Calculate month sums
        m_income = sum(float(tx.get("amount", 0.0)) for tx in month_incomes)
        m_expenses = sum(float(tx.get("amount", 0.0)) for tx in month_expenses)

        # Calculate all-time sums
        all_inc_total = sum(float(tx.get("amount", 0.0)) for tx in all_incomes)
        all_exp_total = sum(float(tx.get("amount", 0.0)) for tx in all_expenses)

        # Determine active period expenses & incomes:
        # If month has activity, use month; otherwise fallback to all-time
        if month_incomes or month_expenses:
            active_income = m_income
            active_expenses = m_expenses
            active_expense_list = month_expenses
        else:
            active_income = all_inc_total
            active_expenses = all_exp_total
            active_expense_list = all_expenses

        active_balance = active_income - active_expenses

        # 3. Calculate spending by category
        spending_by_category: Dict[str, float] = {}
        for tx in active_expense_list:
            cat = str(tx.get("category", "household")).lower().strip()
            amount = float(tx.get("amount", 0.0))
            spending_by_category[cat] = spending_by_category.get(cat, 0.0) + amount

        # Round category totals
        spending_by_category = {k: round(v, 2) for k, v in spending_by_category.items()}

        # 4. Calculate top expense
        if spending_by_category:
            top_cat_key = max(spending_by_category, key=spending_by_category.get)
            top_cat_amount = spending_by_category[top_cat_key]
        else:
            top_cat_key = "household"
            top_cat_amount = 0.0

        top_cat_display = top_cat_key.replace("_", " ").title()
        top_cat_icon = cls.CATEGORY_ICON_MAP.get(top_cat_key, "💰")

        # 5. User Profile (typical income & preferences)
        user_doc = None
        try:
            user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            user_doc = await db.users.find_one({"id": user_id})

        profile = (user_doc.get("profile", {}) if user_doc else {}) or {}
        typical_income = float(profile.get("typical_income", 15000.0))

        # 6. Savings Goal
        primary_goal_doc = await db.goals.find_one({"user_id": user_id, "status": "in_progress"})
        if primary_goal_doc:
            goal_summary = GoalService.calculate_goal_progress(primary_goal_doc)
            goal_data = {
                "title": goal_summary.title,
                "target": goal_summary.target_amount,
                "saved": goal_summary.current_amount,
                "progress_percentage": goal_summary.progress_percentage
            }
        else:
            goal_data = {
                "title": "Emergency Savings",
                "target": 15000.0,
                "saved": 0.0,
                "progress_percentage": 0.0
            }

        return {
            "total_income": round(active_income, 2),
            "total_expenses": round(active_expenses, 2),
            "available_balance": round(active_balance, 2),
            "all_time_income": round(all_inc_total, 2),
            "all_time_expenses": round(all_exp_total, 2),
            "all_time_balance": round(all_inc_total - all_exp_total, 2),
            "month_income": round(m_income, 2),
            "month_expenses": round(m_expenses, 2),
            "month_balance": round(m_income - m_expenses, 2),
            "spending_by_category": spending_by_category,
            "top_expense": {
                "category": top_cat_display,
                "icon": top_cat_icon,
                "amount": round(top_cat_amount, 2)
            },
            "typical_income": typical_income,
            "savings_goal": goal_data,
            "profile": profile
        }
