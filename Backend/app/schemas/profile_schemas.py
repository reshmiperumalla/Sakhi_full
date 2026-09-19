from typing import List, Optional
from pydantic import BaseModel, Field


class PersonalFinancialProfile(BaseModel):
    preferred_language: str = Field("en", description="'en', 'hi', or 'te'")
    income_pattern: str = Field(
        "irregular",
        description="'irregular', 'seasonal', 'daily_wage', 'monthly_salary', or 'mixed'"
    )
    income_sources: List[str] = Field(
        default_factory=lambda: ["farming", "small_business"],
        description="E.g. farming, tailoring, daily labor, salary, livestock, crafts"
    )
    primary_expense_categories: List[str] = Field(
        default_factory=lambda: ["household", "education", "healthcare"],
        description="E.g. food, education, healthcare, transport, household, agriculture"
    )
    financial_literacy_level: str = Field(
        "beginner",
        description="'beginner', 'intermediate', or 'advanced'"
    )
    primary_goal: Optional[str] = Field(
        "emergency_savings",
        description="E.g. emergency_savings, children_education, buy_equipment, loan_freedom"
    )
    dependents_count: int = Field(2, ge=0, le=20)
    monthly_target_savings: Optional[float] = Field(2000.0, ge=0)
    typical_income: Optional[float] = Field(15000.0, ge=0, description="Typical/expected monthly income")
    lean_months: List[str] = Field(
        default_factory=lambda: ["May", "June", "November"],
        description="Months when income is typically lower than average"
    )
    peak_months: List[str] = Field(
        default_factory=lambda: ["January", "April", "October"],
        description="Months when harvest or high business returns occur"
    )
    notes: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    preferred_language: Optional[str] = None
    income_pattern: Optional[str] = None
    income_sources: Optional[List[str]] = None
    primary_expense_categories: Optional[List[str]] = None
    financial_literacy_level: Optional[str] = None
    primary_goal: Optional[str] = None
    dependents_count: Optional[int] = None
    monthly_target_savings: Optional[float] = None
    typical_income: Optional[float] = None
    lean_months: Optional[List[str]] = None
    peak_months: Optional[List[str]] = None
    notes: Optional[str] = None


class ProfileResponse(BaseModel):
    user_id: str
    profile: PersonalFinancialProfile
    updated_at: Optional[str] = None
