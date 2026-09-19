import datetime
from datetime import timezone
from typing import Optional, Dict, Any
import jwt
import hashlib
import hmac

from app.config import settings

import bcrypt

def hash_password(password: str) -> str:
    """Hash a plain password using direct bcrypt with PBKDF2 fallback."""
    try:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
    except Exception:
        salt = settings.SECRET_KEY[:16].encode("utf-8")
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        return f"pbkdf2_sha256${dk.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the hashed string."""
    try:
        if hashed_password.startswith("pbkdf2_sha256$"):
            salt = settings.SECRET_KEY[:16].encode("utf-8")
            expected_hex = hashed_password.split("$")[1]
            dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
            return hmac.compare_digest(dk.hex(), expected_hex)
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Generate a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(timezone.utc) + datetime.timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
