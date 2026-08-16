import asyncio
import sys
import os
from datetime import datetime

sys.path.insert(0, '.')

async def reanalyze_all_datasets():
    from app.utils.database import connect_db, get_db, close_db
    from app.services.profiling_service import profile_dataset
    from app.services.health_service import calculate_health_score
    from app.services.quality_service import detect_quality_issues
    from app.services.dataset_service import convert_numpy_types
    from bson import ObjectId
    import pandas as pd
    
    print('Connecting to database...')
    await connect_db()
    db = await get_db()
    
    datasets = await db.datasets.find({}).to_list(None)
    print(f'Found {len(datasets)} datasets to re-analyze')
    
    for dataset in datasets:
        dataset_id = str(dataset['_id'])
        filename = dataset.get('filename', 'unknown')
        print(f'\nProcessing: {filename} ({dataset_id})')
        
        # Load dataset
        file_path = f'uploads/{dataset_id}.pkl'
        if not os.path.exists(file_path):
            print(f'  X File not found: {file_path}')
            continue
        
        try:
            df = pd.read_pickle(file_path)
            print(f'  Loaded dataset: {len(df)} rows, {len(df.columns)} columns')
            
            # Re-profile
            print('  Profiling dataset...')
            profile = await profile_dataset(df, dataset_id)
            profile = convert_numpy_types(profile)
            await db.dataset_profiles.replace_one(
                {'dataset_id': dataset_id},
                profile,
                upsert=True
            )
            print(f'  Profile updated: {len(profile["column_profiles"])} columns')
            
            # Re-calculate health
            print('  Calculating health score...')
            health = await calculate_health_score(df, profile)
            health = convert_numpy_types(health)
            print(f'  Health score: {health["score"]}/100')
            
            # Re-detect issues
            print('  Detecting issues...')
            issues = await detect_quality_issues(df, profile)
            issues = convert_numpy_types(issues)
            print(f'  Detected {len(issues)} issues')
            
            # Clear old issues
            delete_result = await db.data_quality_issues.delete_many({'dataset_id': dataset_id})
            print(f'  Cleared {delete_result.deleted_count} old issues')
            
            # Insert new issues
            if issues:
                insert_result = await db.data_quality_issues.insert_many(issues)
                print(f'  Inserted {len(insert_result.inserted_ids)} new issues')
            
            # Update dataset
            update_result = await db.datasets.update_one(
                {'_id': ObjectId(dataset_id)},
                {
                    '$set': {
                        'health_score': int(health['score']),
                        'health_details': health,
                        'issue_count': len(issues),
                        'status': 'completed',
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            print(f'  Dataset updated: {update_result.modified_count} modifications')
            
            print(f'  SUCCESS: Health={health["score"]}, Issues={len(issues)}')
            
        except Exception as e:
            print(f'  ERROR: {str(e)}')
            import traceback
            traceback.print_exc()
    
    await close_db()
    print('\n=== Re-analysis complete ===')

if __name__ == '__main__':
    asyncio.run(reanalyze_all_datasets())