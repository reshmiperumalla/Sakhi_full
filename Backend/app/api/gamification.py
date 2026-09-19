from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.datetime_utils import utc_now
from app.core.dependencies import get_db, get_current_user
from app.schemas.game_schemas import (
    GameActivityResponse, GameAnswerRequest, GameResultResponse, UserGameStatsResponse
)
from app.models.learning import UserActivityProgressModel
from app.services.game_service import GameService

router = APIRouter(prefix="/learning", tags=["Gamified Financial Learning"])


@router.get("/activities", response_model=List[GameActivityResponse])
async def list_learning_activities(
    language: Optional[str] = Query(None, description="'en', 'hi', or 'te'"),
    current_user: dict = Depends(get_current_user)
):
    lang = language or current_user.get("preferred_language", "en")
    return GameService.get_all_activities(language=lang)


@router.post("/submit", response_model=GameResultResponse)
async def submit_learning_answer(
    req: GameAnswerRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    lang = req.language or current_user.get("preferred_language", "en")
    eval_result = GameService.evaluate_game_choice(
        activity_id=req.activity_id,
        user_choices=req.user_choices,
        language=lang
    )

    # Record progress
    progress_doc = UserActivityProgressModel(
        user_id=current_user["id"],
        activity_id=req.activity_id,
        activity_type=req.activity_type,
        score=eval_result.score,
        is_passed=eval_result.is_passed,
        xp_earned=eval_result.xp_earned,
        user_choices=req.user_choices,
        completed_at=utc_now()
    ).model_dump(exclude={"id"})

    await db.learning_progress.insert_one(progress_doc)

    # Update user XP & Badges
    new_total_xp = current_user.get("total_xp", 0) + eval_result.xp_earned
    eval_result.new_total_xp = new_total_xp

    update_fields = {"total_xp": new_total_xp}
    try:
        uid_filter = {"_id": ObjectId(current_user["id"])}
    except Exception:
        uid_filter = {"_id": current_user["id"]}

    if eval_result.badge_unlocked:
        await db.users.update_one(
            uid_filter,
            {
                "$set": update_fields,
                "$addToSet": {"badges": eval_result.badge_unlocked}
            }
        )
    else:
        await db.users.update_one(
            uid_filter,
            {"$set": update_fields}
        )

    return eval_result


@router.get("/stats", response_model=UserGameStatsResponse)
async def get_user_learning_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    completed_count = await db.learning_progress.count_documents({"user_id": user_id})

    total_xp = current_user.get("total_xp", 0)
    level = max(1, (total_xp // 100) + 1)

    return UserGameStatsResponse(
        user_id=user_id,
        total_xp=total_xp,
        level=level,
        streak_days=current_user.get("streak_days", 1),
        badges=current_user.get("badges", []),
        completed_activities_count=completed_count
    )
