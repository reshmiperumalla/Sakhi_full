from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.dependencies import get_db, get_current_user
from app.schemas.budget_schemas import BudgetResponse, AdaptiveBudgetRequest
from app.services.budget_service import BudgetService
from app.services.calculation_service import FinancialCalculationService

router = APIRouter(prefix="/budget", tags=["Smart Budget Planner"])


@router.get("/current", response_model=BudgetResponse)
async def get_current_budget(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = current_user.get("profile", {})
    now = datetime.utcnow()
    month_year = now.strftime("%Y-%m")

    # Check if budget already exists for this month
    existing = await db.budgets.find_one({"user_id": user_id, "month_year": month_year})
    if existing:
        return BudgetResponse(
            id=str(existing["_id"]),
            user_id=user_id,
            month_year=existing["month_year"],
            total_income_expected=existing["total_income_expected"],
            total_expenses_budgeted=existing["total_expenses_budgeted"],
            safe_spending_limit=existing["safe_spending_limit"],
            lean_month_buffer_allocation=existing["lean_month_buffer_allocation"],
            savings_goal_allocation=existing["savings_goal_allocation"],
            category_allocations=existing["category_allocations"],
            spending_tips=existing.get("spending_tips", []),
            is_lean_month=existing.get("is_lean_month", False),
            created_at=existing.get("created_at", now)
        )

    # Auto-generate dynamic adaptive budget using real data
    summary = await FinancialCalculationService.get_financial_summary(db, user_id)
    baseline_inflow = summary["typical_income"] if summary["typical_income"] > 0 else 15000.0
    if summary["month_income"] > 0:
        baseline_inflow = summary["month_income"]

    current_month_name = now.strftime("%B")
    lean_months = profile.get("lean_months", ["May", "June", "November"])
    is_lean = (current_month_name in lean_months)

    generated = BudgetService.generate_adaptive_budget(
        user_id=user_id,
        current_inflow=baseline_inflow,
        safe_baseline=baseline_inflow * 0.8,
        historical_expenses=[],
        profile=profile,
        is_lean_month=is_lean,
        language=profile.get("preferred_language", "en")
    )

    # Save to db
    doc = generated.model_dump(exclude={"id"})
    res = await db.budgets.insert_one(doc)
    generated.id = str(res.inserted_id)

    return generated


@router.post("/generate", response_model=BudgetResponse)
async def generate_custom_budget(
    req: AdaptiveBudgetRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = current_user.get("profile", {})
    now = datetime.utcnow()

    month_name = req.month_name or now.strftime("%B")
    lean_months = profile.get("lean_months", ["May", "June", "November"])
    is_lean = req.is_lean_month if req.is_lean_month is not None else (month_name in lean_months)

    if req.monthly_inflow is not None and req.monthly_inflow > 0:
        inflow = req.monthly_inflow
    else:
        summary = await FinancialCalculationService.get_financial_summary(db, user_id)
        inflow = summary["typical_income"] if summary["typical_income"] > 0 else 15000.0
        if summary["month_income"] > 0:
            inflow = summary["month_income"]

    generated = BudgetService.generate_adaptive_budget(
        user_id=user_id,
        current_inflow=inflow,
        safe_baseline=inflow * 0.8,
        historical_expenses=[],
        profile=profile,
        is_lean_month=is_lean,
        language=profile.get("preferred_language", "en")
    )

    # Upsert into database
    doc = generated.model_dump(exclude={"id"})
    await db.budgets.update_one(
        {"user_id": user_id, "month_year": generated.month_year},
        {"$set": doc},
        upsert=True
    )

    return generated
