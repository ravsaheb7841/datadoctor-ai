import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional

class ColumnTypeService:
    """Centralized semantic column type detection service"""
    
    ALLOWED_METHODS = {
        "numeric": ["mean", "median", "mode", "custom", "drop_rows", "forward_fill", "backward_fill"],
        "categorical": ["mode", "custom", "drop_rows", "forward_fill", "backward_fill"],
        "text": ["custom", "drop_rows", "forward_fill", "backward_fill"],
        "datetime": ["custom", "drop_rows", "forward_fill", "backward_fill"],
        "identifier": ["custom", "drop_rows", "forward_fill", "backward_fill"],
        "boolean": ["mode", "custom", "drop_rows", "forward_fill", "backward_fill"],
        "ordinal": ["median", "mode", "custom", "drop_rows", "forward_fill", "backward_fill"],
        "binary": ["mode", "custom", "drop_rows", "forward_fill", "backward_fill"],
    }
    
    TYPE_LABELS = {
        "numeric": "Numeric",
        "categorical": "Categorical",
        "text": "Text",
        "datetime": "Datetime",
        "identifier": "Identifier",
        "boolean": "Boolean",
        "ordinal": "Ordinal",
        "binary": "Binary",
    }
    
    # Existing patterns remain same...
    STRONG_ID_PATTERNS = [
        'id', 'uuid', 'guid', 'customer_id', 'cust_id', 'user_id', 
        'order_id', 'product_id', 'prod_id', 'employee_id', 'emp_id',
        'student_id', 'transaction_id', 'invoice_id', 'reference_id',
        'ref_id', 'account_id', 'member_id', 'phone', 'mobile',
        'pincode', 'pin_code', 'postal_code', 'zip_code', 'zipcode',
        'aadhar', 'aadhaar', 'pan_number', 'pan_no', 'passport',
        'license', 'licence', 'sku', 'barcode', 'serial_number',
        'serial_no', 'registration_no', 'reg_no', 'policy_no',
        'policy_number', 'claim_no', 'claim_number', 'ticket_no',
        'ticket_number', 'booking_id', 'reservation_id', 'ssn',
        'tax_id', 'vat_no', 'gst_no', 'enrollment_no', 'enrollment_id',
        'patient_no', 'patient_id', 'patient_number', 'order_number',
        'order_no', 'student_roll', 'roll_no', 'roll_number',
        'employee_no', 'employee_number', 'staff_id', 'staff_no',
        'member_no', 'member_number', 'account_no', 'account_number',
        'invoice_no', 'invoice_number', 'receipt_no', 'receipt_number',
        'bill_no', 'bill_number', 'quotation_no', 'quote_no',
        'contract_no', 'contract_number', 'agreement_no', 'agreement_id'
    ]
    
    ID_SUFFIXES = ['_id', '_no', '_num', '_number', '_code', '_key']
    ID_PREFIXES = ['id_', 'no_', 'num_', 'number_', 'code_', 'key_']
    
    NUMERIC_PATTERNS = [
        'age', 'salary', 'price', 'amount', 'quantity', 'qty',
        'revenue', 'profit', 'loss', 'income', 'expense', 'cost',
        'weight', 'height', 'length', 'width', 'depth', 'volume',
        'area', 'distance', 'duration', 'count', 'total', 'sum',
        'avg', 'average', 'balance', 'fee', 'tax', 'discount',
        'rate', 'percentage', 'percent', 'pct', 'score', 'points',
        'unit', 'units', 'stock', 'inventory', 'capacity', 'temperature',
        'speed', 'velocity', 'acceleration', 'force', 'pressure',
        'energy', 'power', 'voltage', 'current', 'resistance',
        'frequency', 'bandwidth', 'latency', 'response_time',
        'marks', 'obtained', 'bill', 'amount_paid', 'amount_due',
        'price_per_unit', 'quantity_ordered', 'marks_obtained', 'total_marks'
    ]
    
    CATEGORICAL_PATTERNS = [
        'status', 'type', 'category', 'cat_', 'group', 'class',
        'level', 'gender', 'sex', 'method', 'mode', 'payment',
        'pay_type', 'pay_mode', 'currency', 'country', 'state',
        'city', 'region', 'zone', 'district', 'department', 'dept',
        'designation', 'role', 'title', 'position', 'segment',
        'tier', 'plan', 'package', 'subscription', 'channel',
        'source', 'medium', 'campaign', 'brand', 'color', 'colour',
        'size', 'style', 'model', 'version', 'variant', 'flavor',
        'flavour', 'marital_status', 'education', 'occupation',
        'industry', 'sector', 'location', 'area', 'province',
        'grade', 'blood_group', 'blood_type', 'diagnosis', 'subject',
        'course', 'branch', 'semester', 'year', 'section', 'division',
        'shift', 'batch', 'stream', 'specialization', 'qualification',
        'experience_level', 'skill_level', 'language', 'religion',
        'caste', 'nationality', 'ethnicity', 'race'
    ]
    
    TEXT_PATTERNS = [
        'comment', 'description', 'review', 'feedback', 'address',
        'notes', 'note', 'message', 'remark', 'remarks', 'summary',
        'details', 'text', 'content', 'body', 'full_name', 'name',
        'email', 'website', 'url', 'link', 'reason', 'explanation',
        'opinion', 'suggestion', 'recommendation'
    ]
    
    # Binary column patterns
    BINARY_PATTERNS = [
        'is_', 'has_', 'flag', 'binary', 'indicator', 'dummy',
        'yes_no', 'true_false', 'enabled', 'disabled', 'active',
        'inactive', 'passed', 'failed', 'present', 'absent',
        'approved', 'rejected', 'accepted', 'declined', 'success',
        'failure', 'win', 'loss', 'churn', 'converted', 'clicked',
        'purchased', 'subscribed', 'opted_in', 'opted_out'
    ]
    
    @staticmethod
    def detect_semantic_type(df: pd.DataFrame, column: str) -> str:
        """Detect semantic type using multiple signals"""
        
        series = df[column]
        dtype = str(series.dtype)
        col_lower = column.lower().strip()
        
        non_null = series.dropna()
        total = len(series)
        non_null_count = len(non_null)
        unique_count = series.nunique()
        unique_ratio = unique_count / non_null_count if non_null_count > 0 else 0
        
        # 1. Identifier detection
        if ColumnTypeService._is_identifier_column(column, dtype, unique_ratio, unique_count, non_null_count):
            return "identifier"
        
        # 2. Datetime detection
        if ColumnTypeService._is_datetime_column(column, dtype, series):
            return "datetime"
        
        # 3. Binary detection (NEW - before boolean)
        if ColumnTypeService._is_binary_column(column, dtype, series, unique_count):
            return "binary"
        
        # 4. Boolean detection
        if ColumnTypeService._is_boolean_column(column, dtype, series):
            return "boolean"
        
        # 5. Ordinal detection
        if ColumnTypeService._is_ordinal_column(column, dtype, unique_count, non_null_count):
            return "ordinal"
        
        # 6. Numeric detection
        if ColumnTypeService._is_numeric_column_by_name(col_lower):
            if dtype in ['int64', 'float64', 'int32', 'float32', 'int16', 'float16']:
                return "numeric"
        
        # 7. Text detection
        if ColumnTypeService._is_text_column(column, dtype, non_null):
            return "text"
        
        # 8. Categorical detection
        if ColumnTypeService._is_categorical_column(column, dtype, unique_ratio, unique_count, non_null_count):
            return "categorical"
        
        # 9. Numeric dtype fallback
        if dtype in ['int64', 'float64', 'int32', 'float32', 'int16', 'float16']:
            # Check if it's actually binary (0/1 values)
            if unique_count <= 2:
                unique_vals = set(non_null.unique())
                if unique_vals.issubset({0, 1, 0.0, 1.0}):
                    return "binary"
            return "numeric"
        
        # Default
        return "categorical"
    
    @staticmethod
    def _is_binary_column(column: str, dtype: str, series: pd.Series, unique_count: int) -> bool:
        """Detect binary columns (0/1 values)"""
        col_lower = column.lower().strip()
        
        # Check column name patterns
        for pattern in ColumnTypeService.BINARY_PATTERNS:
            if col_lower.startswith(pattern) or pattern in col_lower:
                return True
        
        # Check if values are only 0 and 1
        non_null = series.dropna()
        if len(non_null) > 0 and unique_count <= 2:
            unique_vals = set(non_null.unique())
            if unique_vals.issubset({0, 1, 0.0, 1.0}):
                return True
        
        return False
    
    @staticmethod
    def _is_identifier_column(column: str, dtype: str, unique_ratio: float, unique_count: int, non_null_count: int) -> bool:
        """Detect identifier columns"""
        col_lower = column.lower().strip()
        
        for pattern in ColumnTypeService.STRONG_ID_PATTERNS:
            if pattern in col_lower:
                return True
        
        for suffix in ColumnTypeService.ID_SUFFIXES:
            if col_lower.endswith(suffix):
                if not any(num_pattern in col_lower for num_pattern in ['total', 'average', 'avg', 'sum', 'count']):
                    return True
        
        for prefix in ColumnTypeService.ID_PREFIXES:
            if col_lower.startswith(prefix):
                return True
        
        if dtype in ['int64', 'float64'] and unique_ratio > 0.95 and non_null_count > 20:
            if not any(num_pattern in col_lower for num_pattern in ColumnTypeService.NUMERIC_PATTERNS):
                return True
        
        return False
    
    @staticmethod
    def _is_numeric_column_by_name(col_lower: str) -> bool:
        """Check if column name suggests numeric values"""
        for pattern in ColumnTypeService.NUMERIC_PATTERNS:
            if pattern in col_lower:
                return True
        return False
    
    @staticmethod
    def _is_datetime_column(column: str, dtype: str, series: pd.Series) -> bool:
        """Detect datetime columns"""
        col_lower = column.lower().strip()
        
        if 'datetime' in dtype:
            return True
        
        date_patterns = [
            'date', 'time', 'datetime', 'timestamp', 'created', 'updated',
            'deleted', 'dob', 'birth', 'joined', 'expiry', 'valid_from',
            'valid_to', 'start_date', 'end_date', 'due_date', 'order_date',
            'shipping_date', 'delivery_date', 'payment_date', 'invoice_date',
            'admission_date', 'discharge_date', 'exam_date', 'enrollment_date'
        ]
        
        for pattern in date_patterns:
            if pattern in col_lower:
                return True
        
        if dtype == 'object':
            try:
                non_null = series.dropna()
                if len(non_null) > 0:
                    converted = pd.to_datetime(non_null, errors='coerce', format='mixed')
                    if converted.notna().sum() > len(non_null) * 0.8:
                        return True
            except:
                pass
        
        return False
    
    @staticmethod
    def _is_boolean_column(column: str, dtype: str, series: pd.Series) -> bool:
        """Detect boolean columns"""
        col_lower = column.lower().strip()
        
        if 'bool' in dtype:
            return True
        
        bool_patterns = ['is_', 'has_', 'flag', 'active', 'enabled', 'disabled', 'verified', 'valid', 'passed', 'failed']
        for pattern in bool_patterns:
            if col_lower.startswith(pattern) or col_lower == pattern:
                return True
        
        non_null = series.dropna()
        if len(non_null) > 0:
            unique_vals = set(non_null.astype(str).str.lower().unique())
            bool_sets = [
                {'true', 'false'}, {'yes', 'no'}, {'y', 'n'},
                {'active', 'inactive'}, {'enabled', 'disabled'},
                {'passed', 'failed'}, {'present', 'absent'}
            ]
            for bool_set in bool_sets:
                if unique_vals.issubset(bool_set) and len(unique_vals) <= 2:
                    return True
        
        return False
    
    @staticmethod
    def _is_ordinal_column(column: str, dtype: str, unique_count: int, non_null_count: int) -> bool:
        """Detect ordinal columns"""
        col_lower = column.lower().strip()
        
        ordinal_patterns = [
            'rating', 'rank', 'grade', 'level', 'satisfaction',
            'priority', 'severity', 'importance'
        ]
        
        for pattern in ordinal_patterns:
            if pattern in col_lower:
                if unique_count <= 10 and non_null_count > 0:
                    return True
        
        return False
    
    @staticmethod
    def _is_text_column(column: str, dtype: str, non_null: pd.Series) -> bool:
        """Detect free-text columns"""
        col_lower = column.lower().strip()
        
        for pattern in ColumnTypeService.TEXT_PATTERNS:
            if pattern in col_lower:
                return True
        
        if dtype == 'object' and len(non_null) > 0:
            avg_length = non_null.astype(str).str.len().mean()
            if avg_length > 30:
                return True
        
        return False
    
    @staticmethod
    def _is_categorical_column(column: str, dtype: str, unique_ratio: float, unique_count: int, non_null_count: int) -> bool:
        """Detect categorical columns"""
        col_lower = column.lower().strip()
        
        for pattern in ColumnTypeService.CATEGORICAL_PATTERNS:
            if pattern in col_lower:
                return True
        
        if dtype == 'object' and unique_ratio < 0.5 and non_null_count > 0 and unique_count <= 50:
            return True
        
        if dtype in ['int64', 'float64'] and unique_count <= 20 and non_null_count > 10:
            if unique_ratio < 0.3:
                return True
        
        return False
    
    @staticmethod
    def get_allowed_methods(semantic_type: str) -> List[str]:
        """Get allowed cleaning methods for a semantic type"""
        return ColumnTypeService.ALLOWED_METHODS.get(semantic_type, ["custom", "drop_rows"])
    
    @staticmethod
    def validate_method(semantic_type: str, method: str) -> bool:
        """Validate if a cleaning method is allowed for a semantic type"""
        allowed = ColumnTypeService.get_allowed_methods(semantic_type)
        return method in allowed
    
    @staticmethod
    def get_column_type_info(df: pd.DataFrame, column: str) -> Dict[str, Any]:
        """Get complete type information for a column"""
        series = df[column]
        semantic_type = ColumnTypeService.detect_semantic_type(df, column)
        
        return {
            "column": column,
            "dtype": str(series.dtype),
            "semantic_type": semantic_type,
            "semantic_type_label": ColumnTypeService.TYPE_LABELS.get(semantic_type, semantic_type),
            "suggested_methods": ColumnTypeService.get_allowed_methods(semantic_type),
            "missing_count": int(series.isnull().sum()),
            "unique_count": int(series.nunique()),
            "total_count": int(len(series)),
        }
    
    @staticmethod
    def get_all_column_types(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get type info for all columns"""
        return [ColumnTypeService.get_column_type_info(df, col) for col in df.columns]


column_type_service = ColumnTypeService()