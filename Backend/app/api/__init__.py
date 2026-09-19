from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.transactions import router as transactions_router
from app.api.irregular import router as irregular_router
from app.api.budget import router as budget_router
from app.api.goals import router as goals_router
from app.api.assistant import router as assistant_router
from app.api.voice import router as voice_router
from app.api.scam_education import router as scam_router
from app.api.gamification import router as gamification_router
from app.api.dashboard import router as dashboard_router
from app.api.simulator import router as simulator_router
from app.api.sync import router as sync_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(transactions_router)
api_router.include_router(irregular_router)
api_router.include_router(budget_router)
api_router.include_router(goals_router)
api_router.include_router(assistant_router)
api_router.include_router(voice_router)
api_router.include_router(scam_router)
api_router.include_router(gamification_router)
api_router.include_router(dashboard_router)
api_router.include_router(simulator_router)
api_router.include_router(sync_router)
