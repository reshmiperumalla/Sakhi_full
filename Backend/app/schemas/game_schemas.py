from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class GameActivityResponse(BaseModel):
    activity_id: str
    activity_type: str  # "budget_challenge", "scam_detective", "savings_challenge", "smart_spending"
    title: str
    scenario_prompt: str
    starting_balance: Optional[float] = None
    options_or_items: List[Dict[str, Any]]
    educational_goal: str
    language: str


class GameAnswerRequest(BaseModel):
    activity_id: str
    activity_type: str
    user_choices: Any  # Can be selected option, allocated dictionary, or classification list
    language: Optional[str] = "en"


class GameResultResponse(BaseModel):
    activity_id: str
    score: int
    max_score: int
    is_passed: bool
    feedback: str
    why_explanation: str
    key_takeaway: str
    xp_earned: int
    new_total_xp: int
    badge_unlocked: Optional[str] = None


class UserGameStatsResponse(BaseModel):
    user_id: str
    total_xp: int
    level: int
    streak_days: int
    badges: List[str]
    completed_activities_count: int
