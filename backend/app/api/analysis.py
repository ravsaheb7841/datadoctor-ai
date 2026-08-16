from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.auth.utils import get_current_user
from app.utils.database import get_db

from app.services.eda_service import generate_eda
from app.services.ai_service import generate_diagnosis, generate_insights
from app.services.suggestion_service import get_dataset_suggestions
from app.services.column_type_service import column_type_service


router = APIRouter()


# ============================================================
# DATASET PROFILE
# ============================================================

@router.get("/{dataset_id}/profile")
async def get_dataset_profile(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()

    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    profile = await db.dataset_profiles.find_one({
        "dataset_id": dataset_id
    })

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    if "_id" in profile:
        profile["_id"] = str(profile["_id"])

    if "created_at" in profile and profile["created_at"]:
        profile["created_at"] = profile["created_at"].isoformat()

    return profile


# ============================================================
# DATASET HEALTH
# ============================================================

@router.get("/{dataset_id}/health")
async def get_dataset_health(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()

    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    return dataset.get("health_details", {})


# ============================================================
# DATASET ISSUES
# ============================================================

@router.get("/{dataset_id}/issues")
async def get_dataset_issues(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()

    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    issues = await db.data_quality_issues.find({
        "dataset_id": dataset_id
    }).to_list(None)

    for issue in issues:

        if "_id" in issue:
            issue["_id"] = str(issue["_id"])

        if "created_at" in issue and issue["created_at"]:
            issue["created_at"] = issue["created_at"].isoformat()

    return {
        "issues": issues,
        "total": len(issues)
    }


# ============================================================
# COLUMN TYPES
# ============================================================

@router.get("/{dataset_id}/column-types")
async def get_column_types(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()

    # Verify dataset belongs to current user
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    try:
        import os
        import pandas as pd

        file_path = f"uploads/{dataset_id}.pkl"

        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404,
                detail="Dataset file not found"
            )

        df = pd.read_pickle(file_path)

        # Detect semantic types for all columns
        column_types = column_type_service.get_all_column_types(df)

        return {
            "columns": column_types
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to detect column types: {str(e)}"
        )


# ============================================================
# CLEANING SUGGESTIONS
# ============================================================

@router.get("/{dataset_id}/suggestions")
async def get_cleaning_suggestions(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()

    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    try:
        suggestions = await get_dataset_suggestions(
            dataset_id,
            db
        )

        return suggestions

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get suggestions: {str(e)}"
        )


# ============================================================
# AI DIAGNOSIS
# ============================================================

@router.post("/{dataset_id}/diagnose")
async def diagnose_dataset(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()

    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    profile = await db.dataset_profiles.find_one({
        "dataset_id": dataset_id
    })

    issues = await db.data_quality_issues.find({
        "dataset_id": dataset_id
    }).to_list(None)

    diagnosis = await generate_diagnosis(
        dataset,
        profile,
        issues
    )

    from datetime import datetime

    await db.ai_insights.update_one(
        {
            "dataset_id": dataset_id,
            "type": "diagnosis"
        },
        {
            "$set": {
                "content": diagnosis,
                "created_at": datetime.utcnow()
            }
        },
        upsert=True
    )

    return diagnosis


# ============================================================
# EXPLORATORY DATA ANALYSIS
# ============================================================

@router.get("/{dataset_id}/eda")
async def get_dataset_eda(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()

    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    try:
        # Always generate EDA using the current dataset
        # and current semantic-type logic.
        eda = await generate_eda(
            dataset_id,
            db
        )

        return eda

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate EDA: {str(e)}"
        )


# ============================================================
# AI INSIGHTS
# ============================================================

@router.get("/{dataset_id}/insights")
async def get_dataset_insights(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()

    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    insights = await generate_insights(
        dataset_id,
        db
    )

    return insights