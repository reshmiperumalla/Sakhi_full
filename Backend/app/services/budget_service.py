from typing import List, Dict, Any, Optional
from datetime import datetime
from app.schemas.budget_schemas import BudgetResponse, BudgetCategoryAllocation
from app.services.irregular_income import IrregularIncomeEngine


class BudgetService:
    """
    Creates and dynamically adjusts budgets tailored to irregular income patterns.
    Divides cash into:
    1. Essential Survival (Food, Groceries, Healthcare, Debt EMI): ~50%
    2. Lean-Month Buffer & Emergency Cushion: ~20%
    3. Goals & Future Security: ~15%
    4. Flexible Discretionary: ~15%
    """

    @classmethod
    def generate_adaptive_budget(
        cls,
        user_id: str,
        current_inflow: float,
        safe_baseline: float,
        historical_expenses: List[Dict[str, Any]],
        profile: Dict[str, Any],
        is_lean_month: bool = False,
        language: str = "en"
    ) -> BudgetResponse:
        now = datetime.utcnow()
        month_year = now.strftime("%Y-%m")

        # Inflow to budget against
        effective_income = current_inflow if current_inflow > 0 else safe_baseline
        if effective_income <= 0:
            effective_income = 15000.0  # Reasonable starting default for rural/micro-business benchmark

        # Adjust proportions if lean month vs harvest/peak month
        if is_lean_month:
            essential_pct = 0.70
            buffer_pct = 0.05
            goals_pct = 0.10
            discretionary_pct = 0.15
        else:
            essential_pct = 0.50
            buffer_pct = 0.20
            goals_pct = 0.15
            discretionary_pct = 0.15

        essential_total = effective_income * essential_pct
        buffer_total = effective_income * buffer_pct
        goals_total = effective_income * goals_pct
        discretionary_total = effective_income * discretionary_pct

        # Allocations across practical expense categories
        category_weights = {
            "Household & Food": 0.50,
            "Education": 0.20,
            "Healthcare": 0.15,
            "Transport & Utilities": 0.15
        }

        category_allocations: List[BudgetCategoryAllocation] = []
        for cat_name, weight in category_weights.items():
            cat_amt = round(essential_total * weight, 2)
            category_allocations.append(
                BudgetCategoryAllocation(
                    category=cat_name,
                    allocated_amount=cat_amt,
                    spent_amount=0.0,
                    percentage_of_budget=round(weight * essential_pct * 100, 1)
                )
            )

        # Discretionary/Other
        category_allocations.append(
            BudgetCategoryAllocation(
                category="Discretionary & Flexibility",
                allocated_amount=round(discretionary_total, 2),
                spent_amount=0.0,
                percentage_of_budget=round(discretionary_pct * 100, 1)
            )
        )

        total_budgeted_expenses = essential_total + discretionary_total
        safe_spending_limit = total_budgeted_expenses

        tips = IrregularIncomeEngine.generate_irregular_tips(
            volatility_level="HIGH" if profile.get("income_pattern") == "irregular" else "MODERATE",
            is_lean_month=is_lean_month,
            current_balance=effective_income - total_budgeted_expenses,
            safe_baseline=safe_baseline,
            language=language
        )

        return BudgetResponse(
            user_id=user_id,
            month_year=month_year,
            total_income_expected=round(effective_income, 2),
            total_expenses_budgeted=round(total_budgeted_expenses, 2),
            safe_spending_limit=round(safe_spending_limit, 2),
            lean_month_buffer_allocation=round(buffer_total, 2),
            savings_goal_allocation=round(goals_total, 2),
            category_allocations=category_allocations,
            spending_tips=tips,
            is_lean_month=is_lean_month,
            created_at=now
        )
