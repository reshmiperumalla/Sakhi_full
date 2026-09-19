from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.core.datetime_utils import utc_now
from app.core.dependencies import get_db, get_current_user
from app.schemas.scam_schemas import (
    ScamScenarioResponse, ScamSubmissionRequest, ScamEvaluationResponse
)
from app.models.scam import UserScamAttemptModel
from app.services.scam_service import ScamService

router = APIRouter(prefix="/scam", tags=["Interactive Scam & Fraud Education ⭐"])


@router.get("/scenarios", response_model=List[ScamScenarioResponse])
async def list_scam_scenarios(
    language: Optional[str] = Query(None, description="'en', 'hi', or 'te'"),
    current_user: dict = Depends(get_current_user)
):
    lang = language or current_user.get("preferred_language", "en")
    return ScamService.get_all_scenarios(language=lang)


@router.get("/scenarios/{scenario_id}", response_model=ScamScenarioResponse)
async def get_scam_scenario(
    scenario_id: str,
    language: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    lang = language or current_user.get("preferred_language", "en")
    scenarios = ScamService.get_all_scenarios(language=lang)
    for s in scenarios:
        if s.scenario_id == scenario_id:
            return s
    raise HTTPException(status_code=404, detail="Scam scenario not found")


@router.post("/evaluate", response_model=ScamEvaluationResponse)
async def evaluate_scam_submission(
    submission: ScamSubmissionRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    lang = submission.language or current_user.get("preferred_language", "en")
    result = ScamService.evaluate_scenario_answer(
        scenario_id=submission.scenario_id,
        selected_option_id=submission.selected_option_id,
        language=lang
    )

    # Record user attempt and update XP/badges
    attempt_doc = UserScamAttemptModel(
        user_id=current_user["id"],
        scenario_id=submission.scenario_id,
        selected_option_id=submission.selected_option_id,
        is_correct=result.is_correct,
        points_earned=result.points_earned,
        attempted_at=utc_now()
    ).model_dump(exclude={"id"})

    await db.scam_attempts.insert_one(attempt_doc)

    if result.points_earned > 0:
        update_query = {
            "$inc": {"total_xp": result.points_earned}
        }
        if result.badge_unlocked:
            update_query["$addToSet"] = {"badges": result.badge_unlocked}

        try:
            uid_filter = {"_id": ObjectId(current_user["id"])}
        except Exception:
            uid_filter = {"_id": current_user["id"]}

        await db.users.update_one(
            uid_filter,
            update_query
        )

    return result


@router.get("/my-stats")
async def get_scam_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    cursor = db.scam_attempts.find({"user_id": user_id})

    total_attempts = 0
    correct_attempts = 0
    total_points = 0
    async for att in cursor:
        total_attempts += 1
        if att.get("is_correct"):
            correct_attempts += 1
        total_points += att.get("points_earned", 0)

    accuracy = round((correct_attempts / total_attempts * 100), 1) if total_attempts > 0 else 0.0

    return {
        "user_id": user_id,
        "total_scenarios_attempted": total_attempts,
        "scams_avoided_correctly": correct_attempts,
        "accuracy_rate_percentage": accuracy,
        "scam_shield_points": total_points,
        "badges": current_user.get("badges", [])
    }
