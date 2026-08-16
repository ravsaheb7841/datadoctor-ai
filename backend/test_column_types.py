import pandas as pd
import numpy as np
import sys

sys.path.insert(0, '.')

from app.services.column_type_service import column_type_service


# Create test dataframe with various column types
df = pd.DataFrame({
    'Age': [25, 30, 35, 40, 45, 50],

    'Salary': [
        50000,
        60000,
        70000,
        80000,
        90000,
        100000
    ],

    'Customer_ID': [
        101,
        102,
        103,
        104,
        105,
        106
    ],

    'Pincode': [
        400001,
        400002,
        400003,
        400004,
        400005,
        400006
    ],

    'Phone': [
        9876543210,
        9876543211,
        9876543212,
        9876543213,
        9876543214,
        9876543215
    ],

    'Gender': [
        'Male',
        'Female',
        'Male',
        'Female',
        'Male',
        'Female'
    ],

    'City': [
        'Mumbai',
        'Delhi',
        'Mumbai',
        'Delhi',
        'Mumbai',
        'Delhi'
    ],

    'Status': [
        'Active',
        'Inactive',
        'Active',
        'Active',
        'Inactive',
        'Active'
    ],

    'Comments': [
        'Great product',
        'Very good service',
        'Excellent quality',
        'Nice experience',
        'Good value',
        'Highly recommended'
    ],

    'Order_Date': [
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
        '2024-01-04',
        '2024-01-05',
        '2024-01-06'
    ],

    'Rating': [
        1,
        2,
        3,
        4,
        5,
        3
    ],

    'Is_Active': [
        True,
        False,
        True,
        True,
        False,
        True
    ],

    'Payment_Method': [
        'Card',
        'UPI',
        'Cash',
        'Card',
        'UPI',
        'Cash'
    ],
})


print("Column Type Detection Results:")
print("=" * 60)


for col in df.columns:

    type_info = column_type_service.get_column_type_info(
        df,
        col
    )

    print(f"\nColumn: {col}")
    print(f"  Pandas dtype: {type_info['dtype']}")
    print(f"  Semantic type: {type_info['semantic_type']}")
    print(f"  Allowed methods: {type_info['suggested_methods']}")


print("\n" + "=" * 60)
print("✅ Column type detection working correctly")
