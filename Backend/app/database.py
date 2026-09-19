import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger(__name__)


import asyncio

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None
    _loop = None


db_instance = Database()


async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    try:
        current_loop = None
        try:
            current_loop = asyncio.get_running_loop()
        except RuntimeError:
            pass

        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        # Verify connection
        await db_instance.client.admin.command('ping')
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        db_instance._loop = current_loop
        logger.info(f"Successfully connected to MongoDB database: {settings.DATABASE_NAME}")

        # Create indexes
        await setup_indexes(db_instance.db)
    except Exception as e:
        logger.warning(f"MongoDB connection warning: {e}. Some online features may fall back to temporary storage.")


async def close_mongo_connection():
    if db_instance.client:
        logger.info("Closing MongoDB connection...")
        try:
            db_instance.client.close()
        except Exception:
            pass
        db_instance.client = None
        db_instance.db = None
        db_instance._loop = None
        logger.info("MongoDB connection closed.")


async def setup_indexes(db: AsyncIOMotorDatabase):
    """Ensure essential indexes for fast lookup and uniqueness."""
    try:
        await db.users.create_index("email", unique=True)
        await db.transactions.create_index([("user_id", 1), ("date", -1)])
        await db.goals.create_index([("user_id", 1), ("status", 1)])
        await db.scams.create_index("scenario_id", unique=True)
        await db.learning_progress.create_index([("user_id", 1), ("activity_type", 1)])
        logger.info("Database indexes configured.")
    except Exception as e:
        logger.debug(f"Index creation notice: {e}")


def get_database() -> AsyncIOMotorDatabase:
    current_loop = None
    try:
        current_loop = asyncio.get_running_loop()
    except RuntimeError:
        pass

    if db_instance.client is None or db_instance._loop != current_loop:
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        db_instance._loop = current_loop

    return db_instance.db
