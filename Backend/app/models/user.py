from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class UserModel(BaseModel):
    id: Optional[str] = None
    email: str
    hashed_password: str
    name: str
    phone: Optional[str] = None
    preferred_language: str = "en"
    has_profile_completed: bool = False
    profile: Dict[str, Any] = Field(default_factory=lambda: {
        "preferred_language": "en",
        "income_pattern": "irregular",
        "income_sources": ["farming", "small_business"],
        "primary_expense_categories": ["household", "education", "healthcare"],
        "financial_literacy_level": "beginner",
        "primary_goal": "emergency_savings",
        "dependents_count": 2,
        "monthly_target_savings": 2000.0,
        "lean_months": ["May", "June", "November"],
        "peak_months": ["January", "April", "October"],
        "notes": ""
    })
    total_xp: int = 0
    streak_days: int = 1
    last_activity_date: Optional[datetime] = None
    badges: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
