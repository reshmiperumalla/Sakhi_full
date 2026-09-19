from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class BudgetCategoryAllocation(BaseModel):
    category: str
    allocated_amount: float
    spent_amount: float = 0.0
    percentage_of_budget: float


class AdaptiveBudgetRequest(BaseModel):
    monthly_inflow: Optional[float] = Field(None, description="Current month inflow if known")
    emergency_buffer_percentage: float = Field(15.0, ge=5.0, le=50.0)
    month_name: Optional[str] = None
    is_lean_month: Optional[bool] = None


class BudgetResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    month_year: str  # E.g. "2026-09"
    total_income_expected: float
    total_expenses_budgeted: float
    safe_spending_limit: float
    lean_month_buffer_allocation: float
    savings_goal_allocation: float
    category_allocations: List[BudgetCategoryAllocation]
    spending_tips: List[str]
    is_lean_month: bool
    created_at: datetime
