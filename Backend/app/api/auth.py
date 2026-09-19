from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.datetime_utils import utc_now
from app.core.dependencies import get_db, get_current_user
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth_schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.models.user import UserModel

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserRegister, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Check if user already exists
    existing = await db.users.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user_doc = UserModel(
        email=user_in.email.lower(),
        hashed_password=hash_password(user_in.password),
        name=user_in.name,
        phone=user_in.phone,
        preferred_language=user_in.preferred_language,
        created_at=utc_now(),
        updated_at=utc_now()
    ).model_dump(exclude={"id"})

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    access_token = create_access_token(data={"sub": user_id, "email": user_in.email.lower()})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user_id,
        name=user_in.name,
        email=user_in.email.lower(),
        preferred_language=user_in.preferred_language
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = str(user["_id"])
    access_token = create_access_token(data={"sub": user_id, "email": user["email"]})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user_id,
        name=user.get("name", "User"),
        email=user["email"],
        preferred_language=user.get("preferred_language", "en")
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        phone=current_user.get("phone"),
        preferred_language=current_user.get("preferred_language", "en"),
        has_profile_completed=current_user.get("has_profile_completed", False),
        created_at=current_user.get("created_at", utc_now())
    )
