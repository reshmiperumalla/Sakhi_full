from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ScamScenarioModel(BaseModel):
    id: Optional[str] = None
    scenario_id: str
    category: str
    title: Dict[str, str]  # {"en": "...", "hi": "...", "te": "..."}
    description: Dict[str, str]  # {"en": "...", "hi": "...", "te": "..."}
    options: Dict[str, List[Dict[str, str]]]  # {"en": [{"id": "A", "text": "..."}], ...}
    correct_option_id: str
    why_explanation: Dict[str, str]  # explanation per language
    red_flags: Dict[str, List[str]]
    safe_action_steps: Dict[str, List[str]]
    difficulty: str = "medium"
    points: int = 50
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserScamAttemptModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    scenario_id: str
    selected_option_id: str
    is_correct: bool
    points_earned: int
    attempted_at: datetime = Field(default_factory=datetime.utcnow)
