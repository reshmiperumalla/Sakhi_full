from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.datetime_utils import utc_now

from app.core.dependencies import get_db, get_current_user
from app.schemas.sync_schemas import (
    OfflineSyncPayload, OfflineSyncResponse, BootstrapOfflineDataResponse
)
from app.models.transaction import TransactionModel
from app.models.learning import UserActivityProgressModel
from app.models.scam import UserScamAttemptModel
from app.services.scam_service import ScamService
from app.services.game_service import GameService

router = APIRouter(prefix="/sync", tags=["Offline / Low-Connectivity Sync"])


@router.post("", response_model=OfflineSyncResponse)
async def sync_offline_data(
    payload: OfflineSyncPayload,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Accepts batch changes recorded locally in IndexedDB while device was offline.
    Uses client_id for idempotency so duplicate submissions are cleanly ignored.
    """
    user_id = current_user["id"]
    synced_tx_count = 0
    synced_activities_count = 0

    # 1. Sync offline transactions
    for tx in payload.transactions:
        # Check if already synced via client_id
        if tx.client_id:
            existing = await db.transactions.find_one({"user_id": user_id, "client_id": tx.client_id})
            if existing:
                continue

        doc = TransactionModel(
            user_id=user_id,
            type=tx.type,
            amount=tx.amount,
            category=tx.category,
            source_or_item=tx.source_or_item or tx.category.title(),
            date=tx.date or utc_now(),
            is_irregular=tx.is_irregular,
            is_seasonal=tx.is_seasonal,
            notes=tx.notes,
            client_id=tx.client_id,
            created_at=utc_now()
        ).model_dump(exclude={"id"})

        await db.transactions.insert_one(doc)
        synced_tx_count += 1

    # 2. Sync offline game results
    for gr in payload.game_results:
        act_id = gr.get("activity_id")
        if not act_id:
            continue
        eval_res = GameService.evaluate_game_choice(
            activity_id=act_id,
            user_choices=gr.get("user_choices"),
            language=current_user.get("preferred_language", "en")
        )
        prog_doc = UserActivityProgressModel(
            user_id=user_id,
            activity_id=act_id,
            activity_type=gr.get("activity_type", "general"),
            score=eval_res.score,
            is_passed=eval_res.is_passed,
            xp_earned=eval_res.xp_earned,
            user_choices=gr.get("user_choices"),
            completed_at=utc_now()
        ).model_dump(exclude={"id"})

        await db.learning_progress.insert_one(prog_doc)
        synced_activities_count += 1

    # 3. Sync offline scam attempts
    for sa in payload.scam_attempts:
        sc_id = sa.get("scenario_id")
        if not sc_id:
            continue
        eval_scam = ScamService.evaluate_scenario_answer(
            scenario_id=sc_id,
            selected_option_id=sa.get("selected_option_id", "A"),
            language=current_user.get("preferred_language", "en")
        )
        scam_attempt = UserScamAttemptModel(
            user_id=user_id,
            scenario_id=sc_id,
            selected_option_id=sa.get("selected_option_id", "A"),
            is_correct=eval_scam.is_correct,
            points_earned=eval_scam.points_earned,
            attempted_at=utc_now()
        ).model_dump(exclude={"id"})
        await db.scam_attempts.insert_one(scam_attempt)
        synced_activities_count += 1

    # Recalculate user updated balance
    incomes = [float(tx.get("amount", 0)) async for tx in db.transactions.find({"user_id": user_id, "type": "income"})]
    expenses = [float(tx.get("amount", 0)) async for tx in db.transactions.find({"user_id": user_id, "type": "expense"})]
    updated_balance = sum(incomes) - sum(expenses)

    return OfflineSyncResponse(
        success=True,
        synced_transactions=synced_tx_count,
        synced_activities=synced_activities_count,
        server_timestamp=utc_now(),
        message=f"Successfully synced {synced_tx_count} offline transactions and {synced_activities_count} activities.",
        updated_balance=round(updated_balance, 2)
    )


@router.get("/bootstrap", response_model=BootstrapOfflineDataResponse)
async def get_bootstrap_offline_cache(
    language: Optional[str] = Query(None, description="'en', 'hi', or 'te'"),
    current_user: dict = Depends(get_current_user)
):
    """
    Downloads educational bundles, scam scenarios, and offline tips
    to allow complete functionality when disconnected.
    """
    lang = language or current_user.get("preferred_language", "en")
    scenarios = ScamService.get_all_scenarios(language=lang)
    activities = GameService.get_all_activities(language=lang)

    offline_tips = [
        {"title": "Rule 1", "content": "Never share your bank OTP or ATM PIN with anyone over the phone."},
        {"title": "Rule 2", "content": "You only enter UPI PIN to send money, never to receive money."},
        {"title": "Rule 3", "content": "Keep a lean-month buffer of 3-4 months of safe expenses before major spending."}
    ]
    if lang == "hi":
        offline_tips = [
            {"title": "नियम 1", "content": "फोन पर किसी को भी अपना बैंक OTP या एटीएम पिन कभी न बताएं।"},
            {"title": "नियम 2", "content": "UPI पिन केवल पैसे भेजने के लिए डाला जाता है, पैसे लेने के लिए नहीं।"},
            {"title": "नियम 3", "content": "मंदी के महीनों के लिए 3-4 महीने के जरूरी खर्च की सुरक्षा गुल्लक बनाएं।"}
        ]
    elif lang == "te":
        offline_tips = [
            {"title": "నియమం 1", "content": "ఫోన్‌లో ఎవరికీ మీ బ్యాంక్ ఓటీపీ లేదా ఏటీఎం పిన్ చెప్పవద్దు."},
            {"title": "నియమం 2", "content": "యూపీఐ పిన్ డబ్బులు పంపడానికి మాత్రమే, డబ్బులు తీసుకోవడానికి కాదు."},
            {"title": "నియమం 3", "content": "తక్కువ ఆదాయ నెలల కోసం 3-4 నెలల ఖర్చులకు సరిపడా అత్యవసర నిధిని ఉంచుకోండి."}
        ]

    return BootstrapOfflineDataResponse(
        language=lang,
        scam_scenarios=scenarios,
        game_activities=activities,
        offline_tips=offline_tips,
        cached_at=utc_now()
    )
