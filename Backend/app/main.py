import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    logger.info("Initializing Financial Empowerment Platform Backend...")
    await connect_to_mongo()
    yield
    # Shutdown: Close MongoDB connection
    logger.info("Shutting down Financial Empowerment Platform Backend...")
    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Financial Empowerment Platform Backend supporting Irregular Incomes, Multilingual Voice/Text, Interactive Scam Education, Gamified Learning, and Offline Sync.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main API router
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "status": "online",
        "application": settings.APP_NAME,
        "version": "1.0.0",
        "docs_url": "/docs",
        "languages_supported": ["English (en)", "Hindi (hi)", "Telugu (te)"],
        "core_features": [
            "AI Personalized Financial Assistant (Ollama/Gemini)",
            "AI Natural Language Transaction Parsing (AI understands, logic calculates)",
            "Irregular Income & Volatility Engine",
            "Smart Adaptive Budget Planner",
            "Goal Planner & Savings Simulator",
            "Interactive Realistic Scam Scenarios",
            "Gamified Financial Challenges",
            "Simple Low-Literacy Dashboard",
            "Offline-Ready IndexedDB Batch Sync",
            "What-If Financial Stress Simulator"
        ]
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "ollama_configured_model": settings.OLLAMA_MODEL,
        "database": settings.DATABASE_NAME
    }
