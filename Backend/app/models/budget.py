from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class BudgetModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    month_year: str  # e.g. "2026-09"
    total_income_expected: float
    total_expenses_budgeted: float
    safe_spending_limit: float
    lean_month_buffer_allocation: float
    savings_goal_allocation: float
    category_allocations: List[Dict[str, Any]]
    spending_tips: List[str] = Field(default_factory=list)
    is_lean_month: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
