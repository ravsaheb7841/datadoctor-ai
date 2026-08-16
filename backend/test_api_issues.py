import asyncio
import sys
sys.path.insert(0, '.')

async def test_api():
    from app.utils.database import connect_db, get_db, close_db
    from app.services.quality_service import detect_quality_issues
    from app.services.profiling_service import profile_dataset
    import pandas as pd
    import numpy as np
    
    # Create test data with known issues
    data = {
        'customer_id': [1, 2, 3, 4, 5, 1],  # Duplicate ID
        'name': ['Alice', 'Bob', None, 'David', 'Eve', 'Alice'],  # Missing + duplicate
        'age': [25, 30, 35, 40, -5, 150],  # Invalid ages
        'city': ['Mumbai', 'mumbai', 'MUMBAI', 'Delhi', 'Delhi ', 'Mumbai'],  # Inconsistent
        'salary': [50000, 60000, 70000, 80000, 90000, 1000000]  # Outlier
    }
    df = pd.DataFrame(data)
    
    print(f'Test dataframe: {len(df)} rows, {len(df.columns)} columns')
    
    # Profile
    profile = await profile_dataset(df, 'test_dataset')
    print(f'Profile generated: {len(profile["column_profiles"])} columns profiled')
    
    # Detect issues
    issues = await detect_quality_issues(df, profile)
    print(f'\nDetected {len(issues)} issues:')
    for i, issue in enumerate(issues, 1):
        print(f'  {i}. [{issue["severity"]}] {issue["type"]}: {issue["issue"]}')
    
    return issues

if __name__ == '__main__':
    issues = asyncio.run(test_api())
    print(f'\n=== Test complete: {len(issues)} issues detected ===')