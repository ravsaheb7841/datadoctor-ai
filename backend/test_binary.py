import pandas as pd
import sys

sys.path.insert(0, '.')

from app.services.column_type_service import column_type_service

df = pd.DataFrame({
    'is_fraud': [0, 1, 0, 0, 1, 0, 1, 0, 1, 0],
    'has_discount': [1, 1, 0, 1, 0, 0, 1, 0, 0, 1],
    'flag_active': [0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
    'amount': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    'age': [25, 30, 35, 40, 45, 50, 55, 60, 65, 70]
})

print("Binary Column Detection Test:")
print("=" * 60)

for col in df.columns:
    info = column_type_service.get_column_type_info(df, col)

    print(f"\nColumn: {col}")
    print(f"  Semantic type: {info['semantic_type']}")
    print(f"  Allowed methods: {info['suggested_methods']}")
    print(f"  Unique values: {info['unique_count']}")

print("\n" + "=" * 60)
print("Test completed")
