import asyncio
import sys
sys.path.insert(0, '.')

async def verify():
    from app.utils.database import connect_db, get_db, close_db
    
    await connect_db()
    db = await get_db()
    
    datasets = await db.datasets.find({}).to_list(None)
    print(f'Total datasets: {len(datasets)}')
    
    for dataset in datasets:
        dataset_id = str(dataset['_id'])
        filename = dataset.get('filename', 'unknown')
        issue_count = dataset.get('issue_count', 0)
        
        issues = await db.data_quality_issues.find({'dataset_id': dataset_id}).to_list(None)
        
        print(f'\nDataset: {filename}')
        print(f'  Dataset ID: {dataset_id}')
        print(f'  Issue count (in dataset doc): {issue_count}')
        print(f'  Issues in collection: {len(issues)}')
        print(f'  Match: {"YES" if issue_count == len(issues) else "NO"}')
        
        if issues:
            print(f'  Issue types: {set(i.get("type", "unknown") for i in issues)}')
    
    await close_db()

if __name__ == '__main__':
    asyncio.run(verify())