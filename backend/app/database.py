"""Async MongoDB connection using Motor with fast timeout and fallback."""

import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None
_is_available: bool = False


async def connect_db() -> None:
    """Open the MongoDB connection and verify connection with ping."""
    global client, db, _is_available
    try:
        client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=1500,
            connectTimeoutMS=1500,
        )
        # Test connection with a quick ping
        await client.admin.command("ping")
        db = client[settings.db_name]
        _is_available = True
        logger.info("Successfully connected to MongoDB (%s).", settings.db_name)
    except Exception as exc:
        _is_available = False
        db = None
        logger.info("MongoDB unavailable locally (%s). Using fallback CSV and in-memory plan storage.", exc)


async def close_db() -> None:
    """Close the MongoDB connection."""
    global client, db, _is_available
    if client:
        client.close()
    client = None
    db = None
    _is_available = False


def is_db_available() -> bool:
    """Check whether MongoDB is currently reachable."""
    return _is_available and db is not None


def get_db() -> AsyncIOMotorDatabase:
    """Return the database handle if connected, else raises RuntimeError."""
    if not is_db_available():
        raise RuntimeError("MongoDB is not available.")
    return db
