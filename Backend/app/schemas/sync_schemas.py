from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.transaction_schemas import TransactionCreate, TransactionResponse
from app.schemas.scam_schemas import ScamScenarioResponse
from app.schemas.game_schemas import GameActivityResponse


class OfflineSyncPayload(BaseModel):
    client_timestamp: datetime = Field(default_factory=datetime.utcnow)
    transactions: List[TransactionCreate] = Field(default_factory=list)
    game_results: List[Dict[str, Any]] = Field(default_factory=list)
    scam_attempts: List[Dict[str, Any]] = Field(default_factory=list)


class OfflineSyncResponse(BaseModel):
    success: bool
    synced_transactions: int
    synced_activities: int
    server_timestamp: datetime
    message: str
    updated_balance: float


class BootstrapOfflineDataResponse(BaseModel):
    language: str
    scam_scenarios: List[ScamScenarioResponse]
    game_activities: List[GameActivityResponse]
    offline_tips: List[Dict[str, str]]
    cached_at: datetime
