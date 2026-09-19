from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class GameActivityModel(BaseModel):
    id: Optional[str] = None
    activity_id: str
    activity_type: str  # "budget_challenge", "scam_detective", "savings_challenge", "smart_spending"
    title: Dict[str, str]
    scenario_prompt: Dict[str, str]
    starting_balance: Optional[float] = None
    options_or_items: Dict[str, List[Dict[str, Any]]]
    correct_criteria: Dict[str, Any]
    educational_goal: Dict[str, str]
    why_explanation: Dict[str, str]
    key_takeaway: Dict[str, str]
    max_score: int = 100
    xp_reward: int = 50
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserActivityProgressModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    activity_id: str
    activity_type: str
    score: int
    is_passed: bool
    xp_earned: int
    user_choices: Any
    completed_at: datetime = Field(default_factory=datetime.utcnow)
