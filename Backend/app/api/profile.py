from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.datetime_utils import utc_now
from app.core.dependencies import get_db, get_current_user
from app.schemas.profile_schemas import PersonalFinancialProfile, ProfileUpdateRequest, ProfileResponse

router = APIRouter(prefix="/profile", tags=["Personal Financial Profile"])


@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    profile_data = current_user.get("profile", {})
    # Fallback to defaults if empty
    profile = PersonalFinancialProfile(**profile_data) if profile_data else PersonalFinancialProfile()

    return ProfileResponse(
        user_id=current_user["id"],
        profile=profile,
        updated_at=str(current_user.get("updated_at", utc_now()))
    )


@router.put("", response_model=ProfileResponse)
async def update_profile(
    update_data: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    existing_profile = current_user.get("profile", {})
    update_dict = update_data.model_dump(exclude_unset=True)

    # Merge updates
    updated_profile = {**existing_profile, **update_dict}
    now = utc_now()

    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {
            "$set": {
                "profile": updated_profile,
                "has_profile_completed": True,
                "preferred_language": updated_profile.get("preferred_language", current_user.get("preferred_language", "en")),
                "updated_at": now
            }
        }
    )

    return ProfileResponse(
        user_id=current_user["id"],
        profile=PersonalFinancialProfile(**updated_profile),
        updated_at=now.isoformat()
    )
