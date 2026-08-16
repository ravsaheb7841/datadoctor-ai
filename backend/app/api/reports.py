from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse
from app.auth.utils import get_current_user
from app.utils.database import get_db
from app.services.report_service import generate_report, get_download_path
from bson import ObjectId
import os
import pandas as pd
import io

router = APIRouter()

@router.post("/{dataset_id}/report")
async def create_report(
    dataset_id: str, 
    report_type: str = "before",
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()
    
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        file_path = await generate_report(dataset_id, db, report_type, "pdf")
        return {"file_path": file_path, "report_type": report_type}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.get("/{dataset_id}/report")
async def get_report(
    dataset_id: str, 
    format: str = "pdf",
    report_type: str = "before",
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()
    
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        file_path = await generate_report(dataset_id, db, report_type, format)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Report file not found")
        
        # Get clean filename
        import re
        dataset_name = dataset.get('filename', 'dataset')
        sanitized = re.sub(r'[^a-zA-Z0-9_-]', '_', dataset_name.replace('.csv', '').replace('.xlsx', ''))
        filename = f'datadoctor_{sanitized}_{report_type}_cleaning.pdf'
        
        return FileResponse(
            file_path,
            filename=filename,
            media_type='application/pdf'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.get("/{dataset_id}/download")
async def download_cleaned_dataset(dataset_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_db()
    
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    file_path = f"uploads/{dataset_id}.pkl"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Dataset file not found")
    
    try:
        df = pd.read_pickle(file_path)
        original_filename = dataset.get('filename', 'dataset')
        base_name = os.path.splitext(original_filename)[0]
        
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_content = csv_buffer.getvalue()
        
        return StreamingResponse(
            iter([csv_content]),
            media_type='text/csv',
            headers={'Content-Disposition': f'attachment; filename=cleaned_{base_name}.csv'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download: {str(e)}")

@router.get("/{dataset_id}/download/{format}")
async def download_dataset_in_format(
    dataset_id: str,
    format: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_db()
    
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": current_user["id"]
    })
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    file_path = f"uploads/{dataset_id}.pkl"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Dataset file not found")
    
    try:
        df = pd.read_pickle(file_path)
        original_filename = dataset.get('filename', 'dataset')
        base_name = os.path.splitext(original_filename)[0]
        
        if format == 'csv':
            buffer = io.StringIO()
            df.to_csv(buffer, index=False)
            content = buffer.getvalue()
            media_type = 'text/csv'
            filename = f'cleaned_{base_name}.csv'
        elif format == 'xlsx':
            buffer = io.BytesIO()
            with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Cleaned Data')
            content = buffer.getvalue()
            media_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            filename = f'cleaned_{base_name}.xlsx'
        elif format == 'json':
            content = df.to_json(orient='records', date_format='iso')
            media_type = 'application/json'
            filename = f'cleaned_{base_name}.json'
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
        
        if format == 'xlsx':
            return StreamingResponse(
                io.BytesIO(content),
                media_type=media_type,
                headers={'Content-Disposition': f'attachment; filename={filename}'}
            )
        else:
            return StreamingResponse(
                iter([content]),
                media_type=media_type,
                headers={'Content-Disposition': f'attachment; filename={filename}'}
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download: {str(e)}")

@router.get("/{dataset_id}/cleaning-log")
async def get_cleaning_log(dataset_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_db()
    
    operations = await db.cleaning_operations.find(
        {"dataset_id": dataset_id, "error": {"$exists": False}}
    ).sort("timestamp", -1).to_list(None)
    
    return {"operations": operations, "total": len(operations)}