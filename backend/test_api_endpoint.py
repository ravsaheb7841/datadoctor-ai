import asyncio
import sys
sys.path.insert(0, '.')

async def test_api():
    from app.utils.database import connect_db, get_db, close_db
    from app.api.analysis import get_dataset_issues
    from bson import ObjectId
    
    await connect_db()
    db = await get_db()
    
    # Get the demo dataset
    dataset = await db.datasets.find_one({'is_demo': True}, sort=[('created_at', -1)])
    if dataset:
        dataset_id = str(dataset['_id'])
        print(f'Testing issues endpoint for dataset: {dataset_id}')
        
        # Simulate what the API does
        issues = await db.data_quality_issues.find({'dataset_id': dataset_id}).to_list(None)
        print(f'Issues found: {len(issues)}')
        
        for issue in issues:
            if '_id' in issue:
                issue['_id'] = str(issue['_id'])
        
        result = {'issues': issues, 'total': len(issues)}
        print(f'API response would have {len(result["issues"])} issues')
        print(f'First issue: {result["issues"][0] if result["issues"] else "None"}')
    
    await close_db()

if __name__ == '__main__':
    asyncio.run(test_api())