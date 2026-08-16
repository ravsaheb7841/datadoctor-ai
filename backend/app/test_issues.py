import asyncio
import sys
sys.path.insert(0, '.')

async def test_issues():
    from app.utils.database import connect_db, close_db, get_db
    from bson import ObjectId
    
    await connect_db()
    db = await get_db()
    
    # Get the latest dataset
    dataset = await db.datasets.find_one(sort=[('created_at', -1)])
    if dataset:
        dataset_id = str(dataset['_id'])
        print(f'Dataset: {dataset_id}')
        print(f"Issue count in dataset: {dataset.get('issue_count', 0)}")
        
        # Check issues collection
        issues = await db.data_quality_issues.find({'dataset_id': dataset_id}).to_list(None)
        print(f'Issues in collection: {len(issues)}')
        
        if issues:
            print(f'First issue type: {issues[0].get("type", "unknown")}')
            print(f'First issue severity: {issues[0].get("severity", "unknown")}')
            print(f'First issue description: {issues[0].get("issue", "no description")}')
        else:
            print('No issues found in the data_quality_issues collection!')
            print('This means issues were not saved during dataset processing.')
    
    await close_db()

if __name__ == '__main__':
    asyncio.run(test_issues())