from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class ScamOption(BaseModel):
    id: str  # "A", "B", "C"
    text: str


class ScamScenarioResponse(BaseModel):
    id: str
    scenario_id: str
    category: str  # "otp_scam", "fake_call", "qr_scam", "government_scheme", "loan_app", "job_scam"
    title: str
    description: str
    options: List[ScamOption]
    language: str  # "en", "hi", "te"
    difficulty: str  # "easy", "medium", "advanced"


class ScamSubmissionRequest(BaseModel):
    scenario_id: str
    selected_option_id: str
    language: Optional[str] = "en"


class ScamEvaluationResponse(BaseModel):
    scenario_id: str
    selected_option_id: str
    is_correct: bool
    verdict: str  # "SAFE", "DANGEROUS", "RISKY"
    why_explanation: str
    red_flags: List[str]
    safe_action_steps: List[str]
    points_earned: int
    badge_unlocked: Optional[str] = None
