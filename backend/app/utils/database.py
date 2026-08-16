# backend/app/utils/database.py
import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "datadoctor")

client = None
db = None

async def connect_db():
    global client, db
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
    db = client[MONGO_DB_NAME]
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.datasets.create_index([("user_id", 1), ("created_at", -1)])
    await db.dataset_profiles.create_index("dataset_id", unique=True)
    await db.data_quality_issues.create_index("dataset_id")
    await db.cleaning_operations.create_index("dataset_id")
    await db.analysis_results.create_index("dataset_id")
    await db.ai_insights.create_index("dataset_id")
    await db.reports.create_index("dataset_id")
    await db.chat_history.create_index([("dataset_id", 1), ("created_at", -1)])
    return db

async def close_db():
    global client
    if client:
        client.close()

async def get_db():
    return db