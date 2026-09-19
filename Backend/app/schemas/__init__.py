from app.schemas.auth_schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from app.schemas.profile_schemas import PersonalFinancialProfile, ProfileUpdateRequest, ProfileResponse
from app.schemas.transaction_schemas import (
    TransactionCreate, TransactionResponse, NaturalParseRequest, ParsedItem, NaturalParseResponse
)
from app.schemas.budget_schemas import BudgetCategoryAllocation, AdaptiveBudgetRequest, BudgetResponse
from app.schemas.goal_schemas import GoalCreate, GoalUpdate, GoalResponse, GoalSimulateRequest, GoalSimulateResponse
from app.schemas.assistant_schemas import ChatMessageRequest, ChatMessageResponse
from app.schemas.scam_schemas import ScamScenarioResponse, ScamSubmissionRequest, ScamEvaluationResponse
from app.schemas.game_schemas import GameActivityResponse, GameAnswerRequest, GameResultResponse, UserGameStatsResponse
from app.schemas.simulator_schemas import SimulationRequest, SimulationResult, SimulationMetric
from app.schemas.sync_schemas import OfflineSyncPayload, OfflineSyncResponse, BootstrapOfflineDataResponse
