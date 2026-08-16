import asyncio
import sys
sys.path.insert(0, '.')

async def test_synthetic():
    from app.services.profiling_service import profile_dataset
    from app.services.quality_service import detect_quality_issues
    import pandas as pd
    import numpy as np
    
    # Create synthetic data with many issues
    np.random.seed(42)
    n = 100
    
    data = {
        'customer_id': list(range(1, n+1)),
        'age': np.random.randint(18, 90, n).astype(float),
        'email': [f'customer{i}@email.com' for i in range(1, n+1)],
        'city': np.random.choice(['Mumbai', 'Delhi', 'Bangalore', 'mumbai', 'MUMBAI', 'Delhi ', None], n),
        'purchase_amount': np.random.normal(5000, 2000, n),
        'quantity': np.random.randint(1, 50, n).astype(float),
        'rating': np.random.choice([1, 2, 3, 4, 5, None, 0, 6], n),
        'discount': np.random.uniform(0, 50, n)
    }
    
    df = pd.DataFrame(data)
    
    # Add deliberate issues
    df.loc[10:15, 'age'] = np.nan  # Missing
    df.loc[20:25, 'purchase_amount'] = np.nan  # Missing
    df.loc[30, 'age'] = -5  # Invalid age
    df.loc[31, 'age'] = 150  # Invalid age
    df.loc[40, 'quantity'] = -10  # Negative quantity
    df.loc[41, 'rating'] = 10  # Invalid rating
    df.loc[42, 'discount'] = 150  # Invalid percentage
    df.loc[50:55, 'city'] = 'MUMBAI'  # Inconsistent
    df.loc[56:60, 'city'] = 'mumbai'  # Inconsistent
    df.loc[61:65, 'city'] = 'Mumbai '  # Inconsistent
    
    # Add duplicates
    duplicate_rows = df.iloc[5:8].copy()
    df = pd.concat([df, duplicate_rows], ignore_index=True)
    df.loc[70, 'customer_id'] = 1  # Duplicate ID
    
    # Add outliers
    df.loc[80, 'purchase_amount'] = 50000
    df.loc[81, 'purchase_amount'] = -1000
    
    # Add near-constant column
    df['constant_near'] = 'A'
    df.loc[0:2, 'constant_near'] = 'B'
    
    print(f'Synthetic dataset: {len(df)} rows, {len(df.columns)} columns')
    
    # Profile
    profile = await profile_dataset(df, 'test_synthetic')
    print(f'\nColumn profiles:')
    for cp in profile['column_profiles']:
        print(f'  {cp["column_name"]}: type={cp["inferred_type"]}, missing={cp["missing"]}, outliers={cp.get("outlier_count", 0)}')
    
    # Detect issues
    issues = await detect_quality_issues(df, profile)
    print(f'\nDetected {len(issues)} issues:')
    for i, issue in enumerate(issues, 1):
        print(f'  {i}. [{issue["severity"]}] {issue["type"]}: {issue["issue"]}')
    
    return issues

if __name__ == '__main__':
    issues = asyncio.run(test_synthetic())
    print(f'\n=== Synthetic test: {len(issues)} issues detected ===')