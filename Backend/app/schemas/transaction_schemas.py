from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime


class TransactionCreate(BaseModel):
    type: Literal["income", "expense"]
    amount: float = Field(..., gt=0, description="Amount in INR")
    category: str = Field(..., description="E.g. farming, tailoring, salary, food, education, healthcare, household")
    source_or_item: Optional[str] = Field(None, description="Descriptive label e.g., 'Cotton harvest', 'School fees'")
    date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    is_irregular: bool = Field(True, description="Flag for irregular or fluctuating inflow/outflow")
    is_seasonal: bool = Field(False, description="Flag for seasonal income/expense")
    notes: Optional[str] = None
    client_id: Optional[str] = Field(None, description="UUID for offline idempotent synchronization")


class TransactionUpdate(BaseModel):
    type: Optional[Literal["income", "expense"]] = None
    amount: Optional[float] = Field(None, gt=0, description="Amount in INR")
    category: Optional[str] = None
    source_or_item: Optional[str] = None
    date: Optional[datetime] = None
    is_irregular: Optional[bool] = None
    is_seasonal: Optional[bool] = None
    notes: Optional[str] = None


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    type: str
    amount: float
    category: str
    source_or_item: Optional[str] = None
    date: datetime
    is_irregular: bool
    is_seasonal: bool
    notes: Optional[str] = None
    client_id: Optional[str] = None
    created_at: datetime


class NaturalParseRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Natural sentence describing earnings or expenses")
    language: Optional[str] = Field(None, description="Target language ('en', 'hi', 'te') or auto-detected")
    auto_save: bool = Field(False, description="Whether to directly persist the extracted items into DB")


class ParsedItem(BaseModel):
    type: Literal["income", "expense"]
    amount: float
    category: str
    source_or_item: str
    is_irregular: bool = True
    confidence: float = 0.95


class NaturalParseResponse(BaseModel):
    raw_input: str
    detected_language: str
    extracted_items: List[ParsedItem]
    # Mathematical computations calculated by application logic
    total_income: float
    total_expenses: float
    net_remaining: float
    human_explanation: str
    saved_transactions: Optional[List[TransactionResponse]] = None
