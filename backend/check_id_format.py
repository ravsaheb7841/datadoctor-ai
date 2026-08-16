import asyncio
import sys
sys.path.insert(0, '.')

async def check_format():
    from app.utils.database import connect_db, get_db, close_db
    from app.services.profiling_service import profile_dataset
    from app.services.quality_service import detect_quality_issues
    import pandas as pd
    import numpy as np
    from bson import ObjectId
    
    await connect_db()
    db = await get_db()
    
    # Create a simple test dataframe
    df = pd.DataFrame({
        'id': [1, 2, 3, 1],  # Duplicate
        'age': [25, -5, 35, 150],  # Invalid
        'name': ['A', None, 'C', 'A'],  # Missing + duplicate
        'city': ['Mumbai', 'mumbai', 'MUMBAI', 'Mumbai ']  # Inconsistent
    })
    
    # Test with a string ID
    test_id = 'test_12345'
    print(f'Testing with string ID: {test_id}')
    
    profile = await profile_dataset(df, test_id)
    print(f'Profile dataset_id: {profile["dataset_id"]}')
    print(f'Profile dataset_id type: {type(profile["dataset_id"])}')
    
    issues = await detect_quality_issues(df, profile)
    print(f'Detected {len(issues)} issues')
    
    if issues:
        print(f'First issue dataset_id: {issues[0].get("dataset_id", "NO dataset_id FIELD")}')
        print(f'First issue keys: {list(issues[0].keys())}')
    
    # Now check what happens when we insert
    print(f'\n--- Testing MongoDB Insert ---')
    test_doc = {
        'dataset_id': test_id,
        'type': 'test',
        'severity': 'high',
        'issue': 'Test issue'
    }
    
    result = await db.data_quality_issues.insert_one(test_doc)
    print(f'Inserted with ID: {result.inserted_id}')
    
    # Query it back
    found = await db.data_quality_issues.find_one({'dataset_id': test_id})
    print(f'Found: {found}')
    
    # Clean up
    await db.data_quality_issues.delete_many({'dataset_id': test_id})
    
    await close_db()

if __name__ == '__main__':
    asyncio.run(check_format())