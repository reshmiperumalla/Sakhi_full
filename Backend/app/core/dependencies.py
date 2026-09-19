from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.database import get_database
from app.core.security import decode_access_token, hash_password
from app.core.datetime_utils import utc_now

security = HTTPBearer(auto_error=False)


async def get_db() -> AsyncIOMotorDatabase:
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not available."
        )
    return db


async def _provision_session_user(db: AsyncIOMotorDatabase, session_id: str) -> Dict[str, Any]:
    """Auto-provision a warm, welcoming profile for rural women with starter records."""
    user_doc = {
        "session_id": session_id,
        "email": f"{session_id}@saheli.mitra",
        "hashed_password": hash_password("saheli123"),
        "name": "लक्ष्मी देवी (Lakshmi Devi)",
        "phone": "9876543210",
        "preferred_language": "hi",
        "has_profile_completed": True,
        "profile": {
            "preferred_language": "hi",
            "income_pattern": "irregular",
            "income_sources": ["Tailoring & Crafts", "Dairy & Milk", "SHG Group"],
            "primary_expense_categories": ["Household & Groceries", "Children Education", "Healthcare"],
            "financial_literacy_level": "beginner",
            "primary_goal": "Emergency Safety Gullak",
            "dependents_count": 3,
            "monthly_target_savings": 2000.0,
            "lean_months": ["May", "June", "November"],
            "peak_months": ["January", "April", "October"],
            "notes": "Rural homemaker, artisan & SHG member"
        },
        "total_xp": 180,
        "streak_days": 3,
        "badges": ["Gullak Saver", "Scam Shield", "SHG Champion"],
        "created_at": utc_now(),
        "updated_at": utc_now()
    }
    res = await db.users.insert_one(user_doc)
    user_id = str(res.inserted_id)
    user_doc["_id"] = res.inserted_id
    user_doc["id"] = user_id

    # Seed starter transactions for rural woman profile
    starter_txs = [
        {"user_id": user_id, "type": "income", "amount": 6000.0, "category": "farming", "source_or_item": "दूध बिक्री (Dairy Milk Sales)", "date": utc_now(), "is_irregular": True},
        {"user_id": user_id, "type": "income", "amount": 4500.0, "category": "tailoring", "source_or_item": "सिलाई व कशीदाकारी (Tailoring & Crafts)", "date": utc_now(), "is_irregular": True},
        {"user_id": user_id, "type": "income", "amount": 1000.0, "category": "other", "source_or_item": "स्वयं सहायता समूह लाभांश (SHG Dividend)", "date": utc_now(), "is_irregular": True},
        {"user_id": user_id, "type": "expense", "amount": 3500.0, "category": "household", "source_or_item": "महीने का राशन व किराना (Household Groceries)", "date": utc_now(), "is_irregular": False},
        {"user_id": user_id, "type": "expense", "amount": 1500.0, "category": "education", "source_or_item": "बच्चों की स्कूल फीस (School Books & Fee)", "date": utc_now(), "is_irregular": False},
        {"user_id": user_id, "type": "expense", "amount": 1000.0, "category": "healthcare", "source_or_item": "दवा व प्राथमिक उपचार (Medicine & Health)", "date": utc_now(), "is_irregular": True},
    ]
    for tx in starter_txs:
        tx["created_at"] = tx["date"]
        await db.transactions.insert_one(tx)

    # Seed starter goal: Emergency Savings
    await db.goals.insert_one({
        "user_id": user_id,
        "title": "Emergency Savings",
        "target_amount": 15000.0,
        "current_saved": 8000.0,
        "category": "emergency",
        "target_date": None,
        "monthly_planned": 1500.0,
        "status": "in_progress",
        "created_at": utc_now(),
        "updated_at": utc_now()
    })

    return user_doc


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_session_id: Optional[str] = Header(None, alias="X-Session-Id"),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> Dict[str, Any]:
    # 1. Try Bearer JWT if provided
    if credentials:
        token = credentials.credentials
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            user_id = payload.get("sub")
            try:
                user = await db.users.find_one({"_id": ObjectId(user_id)})
            except Exception:
                user = await db.users.find_one({"id": user_id})
            if user:
                user["id"] = str(user["_id"])
                return user

    # 2. Try Session ID from header
    if x_session_id:
        user = await db.users.find_one({"session_id": x_session_id})
        if user:
            user["id"] = str(user["_id"])
            return user
        # Auto-provision a new session user
        user = await _provision_session_user(db, x_session_id)
        return user

    # 3. Fallback to demo user if neither is provided
    demo_user = await db.users.find_one({"email": "demo@mitra.org"})
    if demo_user:
        demo_user["id"] = str(demo_user["_id"])
        return demo_user

    # If demo user also not found, create a generic default session user
    default_user = await _provision_session_user(db, "guest_default_session")
    return default_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_session_id: Optional[str] = Header(None, alias="X-Session-Id"),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> Optional[Dict[str, Any]]:
    try:
        return await get_current_user(credentials, x_session_id, db)
    except Exception:
        return None
