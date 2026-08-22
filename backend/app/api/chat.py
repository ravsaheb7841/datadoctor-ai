# backend/app/api/chat.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.auth.utils import get_current_user
from app.utils.database import get_db
from app.services.ai_service import process_chat_query
from bson import ObjectId

router = APIRouter()

class ChatQuery(BaseModel):
    query: str

@router.post("/{dataset_id}/chat")
async def chat_with_data(
    dataset_id: str,
    chat_query: ChatQuery,
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()
    
    print(f"[CHAT DEBUG] dataset_id: {dataset_id}")
    print(f"[CHAT DEBUG] received question: {chat_query.query}")
    print(f"[CHAT DEBUG] question type: {type(chat_query.query)}")
    
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    print(f"[CHAT DEBUG] dataset: {dataset.get('filename')}")
    
    response = await process_chat_query(dataset_id, chat_query.query, db)
    
    print(f"[CHAT DEBUG] final response answer: {response.get('answer', '')[:200]}")
    return response

@router.get("/{dataset_id}/chat/history")
async def get_chat_history(dataset_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_db()
    
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    history = await db.chat_history.find(
        {"dataset_id": dataset_id}
    ).sort("created_at", -1).limit(50).to_list(None)
    
    for msg in history:
        msg["_id"] = str(msg["_id"])
        msg["created_at"] = msg["created_at"].isoformat() if "created_at" in msg else None
    
    return {"messages": history}