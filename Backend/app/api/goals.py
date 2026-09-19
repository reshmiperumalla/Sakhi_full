from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.dependencies import get_db, get_current_user
from app.schemas.goal_schemas import (
    GoalCreate, GoalUpdate, GoalResponse, GoalSimulateRequest, GoalSimulateResponse
)
from app.models.goal import GoalModel
from app.services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["Goal Planner & Savings Tracker"])


@router.get("", response_model=List[GoalResponse])
async def list_goals(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    cursor = db.goals.find({"user_id": current_user["id"]}).sort("created_at", -1)
    results = []
    async for doc in cursor:
        results.append(GoalService.calculate_goal_progress(doc))
    return results


@router.post("", response_model=GoalResponse)
async def create_goal(
    goal_in: GoalCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    doc = GoalModel(
        user_id=current_user["id"],
        title=goal_in.title,
        target_amount=goal_in.target_amount,
        current_amount=goal_in.current_amount,
        monthly_contribution_planned=goal_in.monthly_contribution_planned,
        category=goal_in.category,
        target_date=goal_in.target_date,
        notes=goal_in.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    ).model_dump(exclude={"id"})

    res = await db.goals.insert_one(doc)
    doc["_id"] = res.inserted_id

    return GoalService.calculate_goal_progress(doc)


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: str,
    goal_up: GoalUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        obj_id = ObjectId(goal_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid goal ID")

    updates = goal_up.model_dump(exclude_unset=True)
    updates["updated_at"] = datetime.utcnow()

    # If current_amount meets target_amount, auto-mark achieved
    existing = await db.goals.find_one({"_id": obj_id, "user_id": current_user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Goal not found")

    new_current = updates.get("current_amount", existing.get("current_amount", 0.0))
    target = updates.get("target_amount", existing.get("target_amount", 0.0))
    if new_current >= target and target > 0:
        updates["status"] = "achieved"

    await db.goals.update_one(
        {"_id": obj_id, "user_id": current_user["id"]},
        {"$set": updates}
    )

    updated_doc = await db.goals.find_one({"_id": obj_id})
    return GoalService.calculate_goal_progress(updated_doc)


@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        obj_id = ObjectId(goal_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid goal ID")

    res = await db.goals.delete_one({"_id": obj_id, "user_id": current_user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"status": "success", "message": "Goal deleted"}


@router.post("/{goal_id}/simulate", response_model=GoalSimulateResponse)
async def simulate_goal_savings(
    goal_id: str,
    req: GoalSimulateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        obj_id = ObjectId(goal_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid goal ID")

    goal = await db.goals.find_one({"_id": obj_id, "user_id": current_user["id"]})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    profile = current_user.get("profile", {})
    lang = profile.get("preferred_language", "en")

    return GoalService.simulate_contribution_change(
        goal_data=goal,
        new_monthly_savings=req.hypothetical_monthly_savings,
        language=lang
    )
