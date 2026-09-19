from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    income_change_percentage: Optional[float] = Field(0.0, description="Percentage change in monthly income e.g. -25.0 for drop")
    expense_change_amount: Optional[float] = Field(0.0, description="Fixed change in monthly expenses e.g. 2000.0")
    new_monthly_loan_emi: Optional[float] = Field(0.0, description="New EMI amount e.g. 1500.0")
    hypothetical_lean_months: Optional[int] = Field(1, ge=1, le=12)
    language: Optional[str] = "en"


class SimulationMetric(BaseModel):
    monthly_income: float
    monthly_expenses: float
    net_remaining: float
    runway_months: float
    savings_capacity: float


class SimulationResult(BaseModel):
    baseline: SimulationMetric
    simulated: SimulationMetric
    net_difference: float
    runway_difference_months: float
    risk_level: str  # "SAFE", "MODERATE_CAUTION", "HIGH_RISK"
    explanation: str
    actionable_recommendations: List[str]
