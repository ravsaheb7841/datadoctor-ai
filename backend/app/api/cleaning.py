from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.auth.utils import get_current_user
from app.utils.database import get_db
from app.services.cleaning_service import apply_cleaning_operation, undo_last_operation, get_cleaning_log
from bson import ObjectId

router = APIRouter()

class CleaningOperation(BaseModel):
    type: str
    column: str = None
    method: str = None
    target_type: str = None
    value: str = None
    keep: str = "first"

@router.post("/{dataset_id}/clean")
async def clean_dataset(
    dataset_id: str,
    operation: CleaningOperation,
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()
    
    # Verify ownership
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        result = await apply_cleaning_operation(dataset_id, operation.dict(), db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cleaning operation failed: {str(e)}"
        )

@router.post("/{dataset_id}/undo")
async def undo_cleaning(dataset_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_db()
    
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    result = await undo_last_operation(dataset_id, db)
    return result

@router.get("/{dataset_id}/cleaning-log")
async def get_cleaning_history(dataset_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_db()
    
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    operations = await get_cleaning_log(dataset_id, db)
    return {"operations": operations}