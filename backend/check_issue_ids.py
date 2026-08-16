import asyncio
import sys
sys.path.insert(0, '.')

async def check_ids():
    from app.utils.database import connect_db, get_db, close_db
    from bson import ObjectId
    
    await connect_db()
    db = await get_db()
    
    # Get the demo dataset
    dataset = await db.datasets.find_one({'is_demo': True}, sort=[('created_at', -1)])
    if dataset:
        dataset_id = str(dataset['_id'])
        print(f'Dataset ID: {dataset_id}')
        print(f'Dataset issue_count: {dataset.get("issue_count")}')
        
        # Check issues with exact dataset_id
        issues = await db.data_quality_issues.find({'dataset_id': dataset_id}).to_list(None)
        print(f'Issues with exact ID ({dataset_id}): {len(issues)}')
        
        # Check all issues regardless of dataset_id
        all_issues = await db.data_quality_issues.find({}).to_list(None)
        print(f'Total issues in collection: {len(all_issues)}')
        
        if all_issues:
            print(f'\nFirst few issues and their dataset_ids:')
            for issue in all_issues[:5]:
                print(f'  dataset_id in issue: {issue.get("dataset_id")}')
                print(f'  type: {issue.get("type")}')
                print(f'  severity: {issue.get("severity")}')
                print()
            
            # Get unique dataset_ids
            unique_ids = set(str(issue.get('dataset_id')) for issue in all_issues)
            print(f'Unique dataset_ids in issues: {unique_ids}')
    
    await close_db()

if __name__ == '__main__':
    asyncio.run(check_ids())