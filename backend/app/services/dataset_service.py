import pandas as pd
import numpy as np
from datetime import datetime
import os
import json
from bson import ObjectId
from app.services.profiling_service import profile_dataset
from app.services.health_service import calculate_health_score
from app.services.quality_service import detect_quality_issues

def convert_numpy_types(obj):
    """Recursively convert numpy types to Python native types for MongoDB"""
    if obj is None:
        return None
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        return str(obj)
    elif isinstance(obj, pd.Timedelta):
        return str(obj)
    else:
        try:
            if pd.isna(obj):
                return None
        except:
            pass
        return obj

async def process_uploaded_dataset(db, dataset_id, file_path, filename, user_id):
    """Process uploaded dataset and run initial analysis"""
    
    # Read the file
    file_ext = os.path.splitext(filename)[1].lower()
    try:
        if file_ext == '.csv':
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
    except Exception as e:
        raise Exception(f"Failed to read file: {str(e)}")
    
    if df.empty:
        raise Exception("Dataset is empty")
    
    # Store dataset metadata
    dataset_doc = {
        "_id": ObjectId(dataset_id),
        "user_id": user_id,
        "filename": filename,
        "original_filename": filename,
        "file_size": int(os.path.getsize(file_path)),
        "file_type": file_ext[1:].upper(),
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": df.columns.tolist(),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "data_preview": convert_numpy_types(df.head(100).to_dict('records')),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "status": "processing",
        "health_score": None,
        "version": 1
    }
    
    await db.datasets.insert_one(dataset_doc)
    
    # Save full dataset for processing
    df.to_pickle(f"uploads/{dataset_id}.pkl")
    
    # Run profiling - pass dataset_id as string
    profile = await profile_dataset(df, dataset_id)
    profile = convert_numpy_types(profile)
    await db.dataset_profiles.insert_one(profile)
    
    # Calculate health score
    health = await calculate_health_score(df, profile)
    health = convert_numpy_types(health)
    
    # Detect quality issues - ensure dataset_id is set correctly
    issues = await detect_quality_issues(df, profile)
    issues = convert_numpy_types(issues)
    
    # Add dataset_id to each issue
    for issue in issues:
        issue['dataset_id'] = dataset_id
    
    if issues:
        await db.data_quality_issues.insert_many(issues)
    
    # Update dataset with results
    await db.datasets.update_one(
        {"_id": ObjectId(dataset_id)},
        {
            "$set": {
                "status": "completed",
                "health_score": int(health["score"]),
                "health_details": health,
                "issue_count": len(issues),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    dataset_doc["_id"] = dataset_id
    dataset_doc["health_score"] = int(health["score"])
    dataset_doc["health_details"] = health
    dataset_doc["issue_count"] = len(issues)
    dataset_doc["status"] = "completed"
    
    return dataset_doc

async def create_demo_dataset(db, user_id):
    """Create a built-in demo dataset with realistic issues"""
    
    np.random.seed(42)
    n_rows = 1000
    
    # Create data with proper types
    data = {
        'customer_id': list(range(1, 1001)),
        'customer_name': [f'Customer {i}' for i in range(1, 1001)],
        'age': np.random.randint(18, 90, n_rows).astype(float),
        'email': [f'customer{i}@email.com' for i in range(1, 1001)],
        'city': np.random.choice(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 
                                  'mumbai', 'MUMBAI', 'Delhi ', 'BANGALORE', None], n_rows),
        'purchase_amount': np.random.normal(5000, 2000, n_rows).astype(float),
        'purchase_date': pd.date_range('2023-01-01', periods=n_rows, freq='D').strftime('%Y-%m-%d').tolist(),
        'category': np.random.choice(['Electronics', 'Clothing', 'Food', 'Books', 'Sports', None], n_rows),
        'quantity': np.random.randint(1, 50, n_rows).astype(float),
        'rating': np.random.choice([1.0, 2.0, 3.0, 4.0, 5.0, np.nan, 0.0, 6.0], n_rows),
        'discount': np.random.uniform(0, 50, n_rows).astype(float),
        'status': np.random.choice(['completed', 'pending', 'cancelled', 'Completed', 'PENDING'], n_rows)
    }
    
    df = pd.DataFrame(data)
    
    # Add deliberate issues
    # Missing values
    df.loc[50:60, 'age'] = np.nan
    df.loc[100:105, 'purchase_amount'] = np.nan
    df.loc[200:210, 'email'] = None
    
    # Duplicates
    duplicate_rows = df.iloc[10:15].copy()
    df = pd.concat([df, duplicate_rows], ignore_index=True)
    df.loc[500:501, 'customer_id'] = 100  # Duplicate ID
    
    # Invalid values
    df.loc[300, 'age'] = -5.0
    df.loc[301, 'age'] = 150.0
    df.loc[400, 'quantity'] = -10.0
    df.loc[401, 'rating'] = 10.0
    df.loc[402, 'discount'] = 150.0
    
    # Inconsistent categories
    df.loc[700:705, 'city'] = 'MUMBAI'
    df.loc[706:710, 'city'] = 'mumbai'
    df.loc[711:715, 'city'] = 'Mumbai '
    
    # Convert purchase_amount to object dtype before setting 'N/A'
    df['purchase_amount'] = df['purchase_amount'].astype(object)
    df.loc[600, 'purchase_amount'] = 'N/A'
    
    # Convert back to numeric (N/A becomes NaN)
    df['purchase_amount'] = pd.to_numeric(df['purchase_amount'], errors='coerce')
    df.loc[800, 'purchase_amount'] = 50000.0
    df.loc[801, 'purchase_amount'] = -1000.0
    
    # Near-constant column
    df['constant_near'] = 'A'
    df.loc[0:5, 'constant_near'] = 'B'
    
    dataset_id = str(ObjectId())
    
    dataset_doc = {
        "_id": ObjectId(dataset_id),
        "user_id": user_id,
        "filename": "demo_sales_dataset.csv",
        "original_filename": "demo_sales_dataset.csv",
        "file_size": 0,
        "file_type": "CSV",
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": df.columns.tolist(),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "data_preview": convert_numpy_types(df.head(100).to_dict('records')),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "status": "processing",
        "health_score": None,
        "is_demo": True,
        "version": 1
    }
    
    await db.datasets.insert_one(dataset_doc)
    
    # Save dataset
    df.to_pickle(f"uploads/{dataset_id}.pkl")
    
    # Run profiling - pass dataset_id as string
    profile = await profile_dataset(df, dataset_id)
    profile = convert_numpy_types(profile)
    await db.dataset_profiles.insert_one(profile)
    
    # Calculate health score
    health = await calculate_health_score(df, profile)
    health = convert_numpy_types(health)
    
    # Detect quality issues
    issues = await detect_quality_issues(df, profile)
    issues = convert_numpy_types(issues)
    
    # CRITICAL FIX: Add dataset_id to each issue explicitly
    for issue in issues:
        issue['dataset_id'] = dataset_id
    
    if issues:
        # Insert issues one by one to verify
        for i, issue in enumerate(issues):
            try:
                result = await db.data_quality_issues.insert_one(issue)
                print(f'  Inserted issue {i+1}/{len(issues)}: {result.inserted_id}')
            except Exception as e:
                print(f'  Failed to insert issue {i+1}: {e}')
    
    # Update dataset
    await db.datasets.update_one(
        {"_id": ObjectId(dataset_id)},
        {
            "$set": {
                "status": "completed",
                "health_score": int(health["score"]),
                "health_details": health,
                "issue_count": len(issues),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    dataset_doc["health_score"] = int(health["score"])
    dataset_doc["health_details"] = health
    dataset_doc["issue_count"] = len(issues)
    dataset_doc["status"] = "completed"
    dataset_doc["_id"] = dataset_id
    
    return dataset_doc

async def get_dataset_info(db, dataset_id, user_id):
    """Get dataset information"""
    dataset = await db.datasets.find_one({
        "_id": ObjectId(dataset_id),
        "user_id": user_id
    })
    if dataset:
        dataset["_id"] = str(dataset["_id"])
        if "created_at" in dataset and dataset["created_at"]:
            dataset["created_at"] = dataset["created_at"].isoformat()
        if "updated_at" in dataset and dataset["updated_at"]:
            dataset["updated_at"] = dataset["updated_at"].isoformat()
    return dataset