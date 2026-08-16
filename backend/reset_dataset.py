import asyncio
import sys
import os
sys.path.insert(0, '.')

async def reset_latest_dataset():
    from app.utils.database import connect_db, get_db, close_db
    from app.services.dataset_service import convert_numpy_types
    from app.services.profiling_service import profile_dataset
    from app.services.health_service import calculate_health_score
    from app.services.quality_service import detect_quality_issues
    from bson import ObjectId
    import pandas as pd
    from datetime import datetime
    
    await connect_db()
    db = await get_db()
    
    # Get all datasets
    datasets = await db.datasets.find({}).sort('created_at', -1).to_list(None)
    
    for dataset in datasets:
        dataset_id = str(dataset['_id'])
        filename = dataset.get('filename', 'unknown')
        
        # Check if this is an uploaded dataset (not demo)
        if not dataset.get('is_demo', False):
            print(f'Resetting dataset: {filename} ({dataset_id})')
            
            # Delete cleaning operations
            await db.cleaning_operations.delete_many({'dataset_id': dataset_id})
            
            # Delete old issues
            await db.data_quality_issues.delete_many({'dataset_id': dataset_id})
            
            # Try to reload original file
            file_ext = os.path.splitext(filename)[1].lower()
            original_path = f'uploads/{dataset_id}{file_ext}'
            
            if os.path.exists(original_path):
                print(f'  Found original file: {original_path}')
                try:
                    if file_ext == '.csv':
                        df = pd.read_csv(original_path)
                    else:
                        df = pd.read_excel(original_path)
                    
                    print(f'  Loaded original data: {len(df)} rows')
                    
                    # Save as pickle
                    df.to_pickle(f'uploads/{dataset_id}.pkl')
                    
                    # Re-profile
                    profile = await profile_dataset(df, dataset_id)
                    profile = convert_numpy_types(profile)
                    await db.dataset_profiles.replace_one(
                        {'dataset_id': dataset_id},
                        profile,
                        upsert=True
                    )
                    
                    # Re-calculate health
                    health = await calculate_health_score(df, profile)
                    health = convert_numpy_types(health)
                    
                    # Re-detect issues
                    issues = await detect_quality_issues(df, profile)
                    issues = convert_numpy_types(issues)
                    for issue in issues:
                        issue['dataset_id'] = dataset_id
                    
                    if issues:
                        await db.data_quality_issues.insert_many(issues)
                    
                    # Update dataset
                    await db.datasets.update_one(
                        {'_id': ObjectId(dataset_id)},
                        {'$set': {
                            'rows': int(len(df)),
                            'columns': int(len(df.columns)),
                            'health_score': int(health['score']),
                            'health_details': health,
                            'issue_count': len(issues),
                            'status': 'completed',
                            'version': 1,
                            'updated_at': datetime.utcnow()
                        }}
                    )
                    
                    print(f'  ✅ Reset complete: Health={health["score"]}, Issues={len(issues)}')
                except Exception as e:
                    print(f'  ❌ Failed to reset: {e}')
            else:
                print(f'  ❌ Original file not found')
    
    await close_db()
    print('\n=== Reset complete ===')

if __name__ == '__main__':
    asyncio.run(reset_latest_dataset())