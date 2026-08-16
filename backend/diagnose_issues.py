import asyncio
import sys
import os
sys.path.insert(0, '.')

async def diagnose():
    from app.utils.database import connect_db, get_db, close_db
    from app.services.profiling_service import profile_dataset
    from app.services.quality_service import detect_quality_issues
    import pandas as pd
    import numpy as np
    
    await connect_db()
    db = await get_db()
    
    # Get the latest dataset
    dataset = await db.datasets.find_one(sort=[('created_at', -1)])
    if not dataset:
        print("No datasets found")
        return
    
    dataset_id = str(dataset['_id'])
    filename = dataset.get('filename', 'unknown')
    print(f'Dataset: {filename} ({dataset_id})')
    print(f'Rows: {dataset.get("rows")}, Columns: {dataset.get("columns")}')
    print(f'Health score: {dataset.get("health_score")}')
    
    # Load the actual data
    file_path = f'uploads/{dataset_id}.pkl'
    if not os.path.exists(file_path):
        print(f'File not found: {file_path}')
        return
    
    df = pd.read_pickle(file_path)
    print(f'\nActual data shape: {df.shape}')
    print(f'\nColumn dtypes:')
    for col in df.columns:
        print(f'  {col}: {df[col].dtype}')
    
    print(f'\nMissing values:')
    missing = df.isnull().sum()
    for col in df.columns:
        if missing[col] > 0:
            print(f'  {col}: {missing[col]} missing')
    
    print(f'\nDuplicate rows: {df.duplicated().sum()}')
    
    # Check for duplicates in ID-like columns
    for col in df.columns:
        if 'id' in col.lower():
            dup_count = df[col].duplicated().sum()
            if dup_count > 0:
                print(f'  Duplicate IDs in {col}: {dup_count}')
    
    # Profile the dataset
    print(f'\n--- Profiling ---')
    profile = await profile_dataset(df, dataset_id)
    
    print(f'\nColumn profiles:')
    for cp in profile['column_profiles']:
        print(f'  {cp["column_name"]}: type={cp["inferred_type"]}, missing={cp["missing"]}, unique={cp["unique"]}')
    
    # Detect issues
    print(f'\n--- Detecting Issues ---')
    issues = await detect_quality_issues(df, profile)
    print(f'Total issues detected: {len(issues)}')
    
    for i, issue in enumerate(issues, 1):
        print(f'  {i}. [{issue["severity"]}] {issue["type"]}: {issue["issue"]}')
    
    await close_db()

if __name__ == '__main__':
    asyncio.run(diagnose())