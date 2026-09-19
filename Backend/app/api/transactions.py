from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.dependencies import get_db, get_current_user
from app.schemas.transaction_schemas import (
    TransactionCreate, TransactionUpdate, TransactionResponse, NaturalParseRequest, NaturalParseResponse
)
from app.models.transaction import TransactionModel
from app.services.parser_service import NaturalLanguageParserService

router = APIRouter(prefix="/transactions", tags=["Income & Expense Manager"])


@router.get("", response_model=List[TransactionResponse])
async def list_transactions(
    type: Optional[str] = Query(None, description="'income' or 'expense'"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    query = {"user_id": current_user["id"]}
    if type:
        query["type"] = type

    cursor = db.transactions.find(query).sort("date", -1).skip(skip).limit(limit)
    transactions = []
    async for doc in cursor:
        transactions.append(
            TransactionResponse(
                id=str(doc["_id"]),
                user_id=doc["user_id"],
                type=doc["type"],
                amount=doc["amount"],
                category=doc["category"],
                source_or_item=doc.get("source_or_item"),
                date=doc.get("date", datetime.utcnow()),
                is_irregular=doc.get("is_irregular", True),
                is_seasonal=doc.get("is_seasonal", False),
                notes=doc.get("notes"),
                client_id=doc.get("client_id"),
                created_at=doc.get("created_at", datetime.utcnow())
            )
        )
    return transactions


@router.post("", response_model=TransactionResponse)
async def create_transaction(
    tx_in: TransactionCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    doc = TransactionModel(
        user_id=current_user["id"],
        type=tx_in.type,
        amount=tx_in.amount,
        category=tx_in.category,
        source_or_item=tx_in.source_or_item or tx_in.category.replace("_", " ").title(),
        date=tx_in.date or datetime.utcnow(),
        is_irregular=tx_in.is_irregular,
        is_seasonal=tx_in.is_seasonal,
        notes=tx_in.notes,
        client_id=tx_in.client_id,
        created_at=datetime.utcnow()
    ).model_dump(exclude={"id"})

    result = await db.transactions.insert_one(doc)

    return TransactionResponse(
        id=str(result.inserted_id),
        user_id=current_user["id"],
        type=doc["type"],
        amount=doc["amount"],
        category=doc["category"],
        source_or_item=doc.get("source_or_item"),
        date=doc["date"],
        is_irregular=doc["is_irregular"],
        is_seasonal=doc["is_seasonal"],
        notes=doc.get("notes"),
        client_id=doc.get("client_id"),
        created_at=doc["created_at"]
    )


@router.delete("/{tx_id}")
async def delete_transaction(
    tx_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        obj_id = ObjectId(tx_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid transaction ID")

    res = await db.transactions.delete_one({"_id": obj_id, "user_id": current_user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"status": "success", "message": "Transaction deleted"}


@router.put("/{tx_id}", response_model=TransactionResponse)
async def update_transaction(
    tx_id: str,
    tx_update: TransactionUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        obj_id = ObjectId(tx_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid transaction ID")

    existing = await db.transactions.find_one({"_id": obj_id, "user_id": current_user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_dict = tx_update.model_dump(exclude_unset=True)
    if update_dict:
        await db.transactions.update_one(
            {"_id": obj_id, "user_id": current_user["id"]},
            {"$set": update_dict}
        )

    updated_doc = await db.transactions.find_one({"_id": obj_id})
    return TransactionResponse(
        id=str(updated_doc["_id"]),
        user_id=updated_doc["user_id"],
        type=updated_doc["type"],
        amount=updated_doc["amount"],
        category=updated_doc["category"],
        source_or_item=updated_doc.get("source_or_item"),
        date=updated_doc.get("date", datetime.utcnow()),
        is_irregular=updated_doc.get("is_irregular", True),
        is_seasonal=updated_doc.get("is_seasonal", False),
        notes=updated_doc.get("notes"),
        client_id=updated_doc.get("client_id"),
        created_at=updated_doc.get("created_at", datetime.utcnow())
    )


@router.post("/parse-natural", response_model=NaturalParseResponse)
async def parse_natural_language_transaction(
    parse_req: NaturalParseRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    AI Understanding & Summarization Layer:
    'AI understands and explains; application logic calculates.'
    Extracts multiple income and expense items from free-form speech or text.
    """
    preferred_lang = parse_req.language or current_user.get("preferred_language", "en")
    parsed_result = await NaturalLanguageParserService.parse_text(
        text=parse_req.text,
        preferred_language=preferred_lang
    )

    saved_list: List[TransactionResponse] = []
    if parse_req.auto_save and parsed_result.extracted_items:
        now = datetime.utcnow()
        for item in parsed_result.extracted_items:
            doc = TransactionModel(
                user_id=current_user["id"],
                type=item.type,
                amount=item.amount,
                category=item.category,
                source_or_item=item.source_or_item,
                date=now,
                is_irregular=item.is_irregular,
                is_seasonal=False,
                notes=f"Extracted from: '{parse_req.text[:50]}...'",
                created_at=now
            ).model_dump(exclude={"id"})
            inserted = await db.transactions.insert_one(doc)
            saved_list.append(
                TransactionResponse(
                    id=str(inserted.inserted_id),
                    user_id=current_user["id"],
                    type=doc["type"],
                    amount=doc["amount"],
                    category=doc["category"],
                    source_or_item=doc["source_or_item"],
                    date=doc["date"],
                    is_irregular=doc["is_irregular"],
                    is_seasonal=doc["is_seasonal"],
                    notes=doc["notes"],
                    created_at=doc["created_at"]
                )
            )
        parsed_result.saved_transactions = saved_list

    return parsed_result
