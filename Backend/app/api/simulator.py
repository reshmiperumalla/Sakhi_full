from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.dependencies import get_db, get_current_user
from app.schemas.simulator_schemas import SimulationRequest, SimulationResult
from app.services.simulator_service import SimulatorService
from app.services.calculation_service import FinancialCalculationService

router = APIRouter(prefix="/simulator", tags=["What-If Financial Simulator ⭐"])


@router.post("/simulate", response_model=SimulationResult)
async def run_what_if_simulation(
    req: SimulationRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = current_user.get("profile", {})
    lang = req.language or profile.get("preferred_language", "en")

    # Fetch real baseline user income, expenses, and savings
    summary = await FinancialCalculationService.get_financial_summary(db, user_id)
    baseline_income = summary["month_income"] if summary["month_income"] > 0 else (summary["total_income"] if summary["total_income"] > 0 else summary["typical_income"])
    baseline_expenses = summary["month_expenses"] if summary["month_expenses"] > 0 else (summary["total_expenses"] if summary["total_expenses"] > 0 else 10000.0)
    saved_fund = float(summary.get("savings_goal", {}).get("saved", 0.0))
    emergency_fund = saved_fund if saved_fund > 0 else max(summary["available_balance"], 5000.0)

    return SimulatorService.simulate_scenario(
        request=req,
        baseline_income=baseline_income,
        baseline_expenses=baseline_expenses,
        emergency_fund_balance=emergency_fund,
        language=lang
    )
