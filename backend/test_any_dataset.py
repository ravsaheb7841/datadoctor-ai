# Let me create a comprehensive test with different datasets
import pandas as pd
import numpy as np
import sys
sys.path.insert(0, '.')

from app.services.column_type_service import column_type_service

def test_dataset_1():
    """Sales dataset with different column names"""
    df = pd.DataFrame({
        'sale_id': [1, 2, 3, 4, 5],
        'sale_date': ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
        'cust_id': [101, 102, 103, 104, 105],
        'prod_code': ['P1', 'P2', 'P3', 'P4', 'P5'],
        'qty': [10, 20, 30, 40, 50],
        'unit_cost': [100.5, 200.5, 300.5, 400.5, 500.5],
        'sale_status': ['Completed', 'Pending', 'Completed', 'Cancelled', 'Completed'],
        'pay_mode': ['Card', 'UPI', 'Cash', 'Card', 'UPI']
    })
    
    print("=" * 60)
    print("Dataset 1: Sales data with different names")
    print("=" * 60)
    for col in df.columns:
        info = column_type_service.get_column_type_info(df, col)
        print(f"  {col}: {info['semantic_type']}")

def test_dataset_2():
    """Healthcare dataset"""
    df = pd.DataFrame({
        'patient_no': [1, 2, 3, 4, 5],
        'patient_name': ['John', 'Jane', 'Bob', 'Alice', 'Charlie'],
        'age': [25, 30, 35, 40, 45],
        'blood_group': ['A+', 'B+', 'O+', 'AB+', 'A-'],
        'admission_date': ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
        'diagnosis': ['Flu', 'Cold', 'Fever', 'Cough', 'Headache'],
        'bill_amount': [1000, 2000, 3000, 4000, 5000],
        'is_insured': [True, False, True, True, False]
    })
    
    print("\n" + "=" * 60)
    print("Dataset 2: Healthcare data")
    print("=" * 60)
    for col in df.columns:
        info = column_type_service.get_column_type_info(df, col)
        print(f"  {col}: {info['semantic_type']}")

def test_dataset_3():
    """E-commerce dataset"""
    df = pd.DataFrame({
        'order_number': [1001, 1002, 1003, 1004, 1005],
        'customer_email': ['a@x.com', 'b@y.com', 'c@z.com', 'd@w.com', 'e@v.com'],
        'product_sku': ['SKU-1', 'SKU-2', 'SKU-3', 'SKU-4', 'SKU-5'],
        'quantity_ordered': [1, 2, 3, 4, 5],
        'price_per_unit': [99.99, 199.99, 299.99, 399.99, 499.99],
        'shipping_city': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
        'order_status': ['Shipped', 'Delivered', 'Processing', 'Shipped', 'Delivered'],
        'payment_method': ['UPI', 'Card', 'COD', 'UPI', 'Card'],
        'delivery_date': ['2024-01-05', '2024-01-06', '2024-01-07', '2024-01-08', '2024-01-09']
    })
    
    print("\n" + "=" * 60)
    print("Dataset 3: E-commerce data")
    print("=" * 60)
    for col in df.columns:
        info = column_type_service.get_column_type_info(df, col)
        print(f"  {col}: {info['semantic_type']}")

def test_dataset_4():
    """Education dataset"""
    df = pd.DataFrame({
        'student_roll': [1, 2, 3, 4, 5],
        'student_name': ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram'],
        'subject': ['Math', 'Science', 'English', 'History', 'Geography'],
        'marks_obtained': [85, 92, 78, 88, 95],
        'total_marks': [100, 100, 100, 100, 100],
        'grade': ['A', 'A+', 'B', 'A', 'A+'],
        'exam_date': ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05'],
        'is_passed': [True, True, True, True, True]
    })
    
    print("\n" + "=" * 60)
    print("Dataset 4: Education data")
    print("=" * 60)
    for col in df.columns:
        info = column_type_service.get_column_type_info(df, col)
        print(f"  {col}: {info['semantic_type']}")

if __name__ == '__main__':
    test_dataset_1()
    test_dataset_2()
    test_dataset_3()
    test_dataset_4()
    print("\n✅ All dataset types tested successfully")