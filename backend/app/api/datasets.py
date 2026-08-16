# backend/app/api/datasets.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import FileResponse
from app.auth.utils import get_current_user
from app.utils.database import get_db
from app.services.dataset_service import process_uploaded_dataset, create_demo_dataset, get_dataset_info
from bson import ObjectId
import os
import aiofiles

router = APIRouter()

ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.xls'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 100MB limit"
        )
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file"
        )
    
    # Save file
    db = await get_db()
    dataset_id = str(ObjectId())
    file_path = f"uploads/{dataset_id}{file_ext}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    try:
        # Process dataset
        result = await process_uploaded_dataset(db, dataset_id, file_path, file.filename, current_user["id"])
        return result
    except Exception as e:
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing dataset: {str(e)}"
        )

@router.post("/demo")
async def load_demo_dataset(current_user: dict = Depends(get_current_user)):
    db = await get_db()
    result = await create_demo_dataset(db, current_user["id"])
    return result

@router.get("")
async def list_datasets(current_user: dict = Depends(get_current_user)):
    db = await get_db()
    datasets = await db.datasets.find(
        {"user_id": current_user["id"]},
        {"data_preview": 0}  # Exclude preview data from list
    ).sort("created_at", -1).to_list(None)
    
    for ds in datasets:
        ds["_id"] = str(ds["_id"])
        ds["created_at"] = ds["created_at"].isoformat() if "created_at" in ds else None
    
    return {"datasets": datasets}

@router.get("/{dataset_id}")
async def get_dataset(dataset_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_db()
    
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })
    
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
    
    dataset["_id"] = str(dataset["_id"])
    dataset["created_at"] = dataset["created_at"].isoformat() if "created_at" in dataset else None
    dataset["updated_at"] = dataset["updated_at"].isoformat() if "updated_at" in dataset else None
    
    return dataset

@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_db()
    
    result = await db.datasets.delete_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
    
    # Clean up related records
    await db.dataset_profiles.delete_many({"dataset_id": dataset_id})
    await db.data_quality_issues.delete_many({"dataset_id": dataset_id})
    await db.cleaning_operations.delete_many({"dataset_id": dataset_id})
    await db.analysis_results.delete_many({"dataset_id": dataset_id})
    await db.ai_insights.delete_many({"dataset_id": dataset_id})
    await db.reports.delete_many({"dataset_id": dataset_id})
    await db.chat_history.delete_many({"dataset_id": dataset_id})
    
    # Remove files
    for ext in ['.csv', '.xlsx', '.xls']:
        file_path = f"uploads/{dataset_id}{ext}"
        if os.path.exists(file_path):
            os.remove(file_path)
    
    return {"message": "Dataset deleted successfully"}