from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from dotenv import load_dotenv

from app.utils.warnings_config import suppress_warnings

suppress_warnings()
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.utils.database import connect_db, close_db

    await connect_db()

    os.makedirs("uploads", exist_ok=True)
    os.makedirs("reports", exist_ok=True)

    yield

    await close_db()


app = FastAPI(
    title="DataDoctor AI",
    description="AI-powered data quality, cleaning, profiling, and business-insight platform",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://datadoctor-ai.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.api import (
    auth,
    datasets,
    analysis,
    cleaning,
    chat,
    reports
)

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Auth"]
)

app.include_router(
    datasets.router,
    prefix="/api/datasets",
    tags=["Datasets"]
)

app.include_router(
    analysis.router,
    prefix="/api/datasets",
    tags=["Analysis"]
)

app.include_router(
    cleaning.router,
    prefix="/api/datasets",
    tags=["Cleaning"]
)

app.include_router(
    chat.router,
    prefix="/api/datasets",
    tags=["Chat"]
)

app.include_router(
    reports.router,
    prefix="/api/datasets",
    tags=["Reports"]
)


@app.get("/")
async def root():
    return {
        "message": "DataDoctor AI API",
        "version": "1.0.0"
    }