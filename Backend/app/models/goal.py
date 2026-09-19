from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class GoalModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    target_amount: float
    current_amount: float = 0.0
    monthly_contribution_planned: float
    category: str = "emergency"
    status: str = "in_progress"  # "in_progress", "achieved", "paused"
    target_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
