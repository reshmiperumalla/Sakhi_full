from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class GoalCreate(BaseModel):
    title: str = Field(..., min_length=2, description="E.g. Children Education, Emergency Fund, Buy Solar Pump")
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(0.0, ge=0)
    monthly_contribution_planned: float = Field(..., gt=0)
    category: str = Field("emergency", description="'emergency', 'education', 'business', 'agriculture', 'medical', 'other'")
    target_date: Optional[datetime] = None
    notes: Optional[str] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    monthly_contribution_planned: Optional[float] = None
    status: Optional[str] = None  # "in_progress", "achieved", "paused"
    notes: Optional[str] = None


class GoalResponse(BaseModel):
    id: str
    user_id: str
    title: str
    target_amount: float
    current_amount: float
    remaining_amount: float
    progress_percentage: float
    monthly_contribution_planned: float
    estimated_months_left: int
    category: str
    status: str
    target_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime


class GoalSimulateRequest(BaseModel):
    goal_id: str
    hypothetical_monthly_savings: float = Field(..., gt=0)


class GoalSimulateResponse(BaseModel):
    goal_id: str
    title: str
    current_months_to_complete: int
    new_months_to_complete: int
    months_saved: int
    explanation: str
