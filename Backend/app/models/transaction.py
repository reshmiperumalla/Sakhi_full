from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TransactionModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str  # "income" or "expense"
    amount: float
    category: str
    source_or_item: Optional[str] = None
    date: datetime = Field(default_factory=datetime.utcnow)
    is_irregular: bool = True
    is_seasonal: bool = False
    notes: Optional[str] = None
    client_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
