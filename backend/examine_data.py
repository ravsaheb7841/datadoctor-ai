import asyncio
import sys
import os
sys.path.insert(0, '.')

async def examine():
    from app.utils.database import connect_db, get_db, close_db
    import pandas as pd
    
    await connect_db()
    db = await get_db()
    
    dataset = await db.datasets.find_one(sort=[('created_at', -1)])
    if dataset:
        dataset_id = str(dataset['_id'])
        filename = dataset.get('filename', 'unknown')
        
        print(f'Dataset: {filename}')
        print(f'Dataset ID: {dataset_id}')
        
        file_path = f'uploads/{dataset_id}.pkl'
        if os.path.exists(file_path):
            df = pd.read_pickle(file_path)
            
            print(f'\nShape: {df.shape}')
            print(f'\nFirst 10 rows:')
            print(df.head(10).to_string())
            
            print(f'\nData Info:')
            print(df.info())
            
            print(f'\nDescribe (numeric):')
            print(df.describe())
            
            print(f'\nDescribe (object):')
            print(df.describe(include=['object']))
            
            # Check for common issues manually
            print(f'\n--- Manual Issue Check ---')
            
            # Missing values
            missing = df.isnull().sum()
            print(f'Missing values: {missing[missing > 0].to_dict() if (missing > 0).any() else "None"}')
            
            # Duplicates
            print(f'Duplicate rows: {df.duplicated().sum()}')
            
            # Check each column for issues
            for col in df.columns:
                print(f'\nColumn: {col} (dtype: {df[col].dtype})')
                
                if df[col].dtype in ['int64', 'float64']:
                    # Numeric column
                    print(f'  Min: {df[col].min()}, Max: {df[col].max()}')
                    print(f'  Negative values: {(df[col] < 0).sum()}')
                    print(f'  Zero values: {(df[col] == 0).sum()}')
                else:
                    # Object column
                    unique_vals = df[col].dropna().unique()
                    print(f'  Unique values: {len(unique_vals)}')
                    if len(unique_vals) < 20:
                        print(f'  Values: {unique_vals[:10]}')
    
    await close_db()

if __name__ == '__main__':
    asyncio.run(examine())