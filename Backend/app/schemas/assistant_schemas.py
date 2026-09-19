from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    language: Optional[str] = Field(None, description="Preferred response language ('en', 'hi', 'te')")
    include_voice_text: bool = Field(False, description="Whether to include simplified phonetic text for TTS")
    conversation_history: Optional[List[Dict[str, str]]] = Field(
        default_factory=list,
        description="Previous message objects [{'role': 'user'|'assistant', 'content': '...'}]"
    )
    confirmed_action: Optional[Dict[str, Any]] = None  # e.g., {"type": "UPDATE_PROFILE_INCOME", "amount": 20000}


class ChatMessageResponse(BaseModel):
    response: str
    language: str
    detected_intent: str
    suggestions: List[str]
    context_used: Dict[str, Any]
    phonetic_text_for_tts: Optional[str] = None
    action_performed: Optional[Dict[str, Any]] = None
    pending_action: Optional[Dict[str, Any]] = None
    financial_summary: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
