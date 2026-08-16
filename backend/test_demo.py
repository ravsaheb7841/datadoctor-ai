import asyncio
import sys
sys.path.insert(0, '.')

async def test_demo():
    from app.services.dataset_service import create_demo_dataset
    from app.utils.database import connect_db, get_db, close_db
    from app.services.profiling_service import profile_dataset
    from app.services.quality_service import detect_quality_issues
    import pandas as pd
    import os
    
    await connect_db()
    db = await get_db()
    
    # Delete old demo datasets
    await db.datasets.delete_many({'is_demo': True})
    
    # Create new demo dataset
    print('Creating demo dataset...')
    result = await create_demo_dataset(db, 'test_user')
    dataset_id = result['_id']
    print(f'Demo dataset created: {dataset_id}')
    print(f'Issue count: {result["issue_count"]}')
    print(f'Health score: {result["health_score"]}')
    
    # Verify issues are in database
    issues = await db.data_quality_issues.find({'dataset_id': dataset_id}).to_list(None)
    print(f'\nIssues in database: {len(issues)}')
    
    for issue in issues[:5]:
        print(f'  [{issue["severity"]}] {issue["type"]}: {issue["issue"]}')
    
    await close_db()

if __name__ == '__main__':
    asyncio.run(test_demo())