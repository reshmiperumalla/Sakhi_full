from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    preferred_language: str = "en"  # "en", "hi", "te"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str
    preferred_language: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    preferred_language: str
    has_profile_completed: bool = False
    created_at: datetime
