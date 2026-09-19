import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Server
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True
    APP_NAME: str = "AI-Powered Financial Empowerment Platform"

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "financial_empowerment"

    # JWT Authentication
    SECRET_KEY: str = "financial-empowerment-secure-jwt-secret-key-32-chars-long!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # LLM Integrations
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen3:4b"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"

    # Audio
    WHISPER_MODEL: str = "base"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
