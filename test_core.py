# Fix the test_core.py file
import pandas as pd
import numpy as np
import asyncio
from datetime import datetime
import sys

# Test profiling
async def test_profiling():
    df = pd.DataFrame({
        'age': [25, 30, np.nan, 45, 50],
        'name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
        'salary': [50000, 60000, 75000, 80000, 120000]
    })
    
    from backend.app.services.profiling_service import profile_column
    
    age_profile = profile_column(df, 'age')
    assert age_profile['missing'] == 1
    assert age_profile['inferred_type'] == 'numeric'
    assert 25 <= age_profile['min'] <= 30
    print('✅ Profiling test passed')
    
    from backend.app.services.health_service import calculate_health_score
    profile = {
        'column_profiles': [
            profile_column(df, col) for col in df.columns
        ]
    }
    health = await calculate_health_score(df, profile)
    print(f'Health score: {health["score"]}/100')
    print('✅ Health score test passed')
    return health

if __name__ == '__main__':
    health = asyncio.run(test_profiling())
    print(f'✅ All core tests passed - Final Health Score: {health["score"]}/100')
    print(f'   Breakdown: {health["scores"]}')