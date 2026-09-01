import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional

class ColumnTypeService:
    """Centralized semantic column type detection service"""
    
    # Comprehensive operations per semantic type
    ALLOWED_METHODS = {
        "numeric": [
            "mean", "median", "mode", "custom_value", "forward_fill", "backward_fill", "drop_rows",
            "convert_to_numeric", "remove_commas", "remove_currency", "round", "absolute_value",
            "iqr_detect", "zscore_detect", "remove_outliers", "cap_outliers", "replace_median",
            "text_to_numeric", "numeric_to_text", "text_to_date", "int_to_float", "float_to_int",
        ],
        "text": [
            "mode", "custom_value", "forward_fill", "backward_fill", "drop_rows",
            "trim_whitespace", "remove_extra_spaces", "lowercase", "uppercase", "title_case",
            "find_replace", "remove_special_chars",
            "normalize_categories", "replace_category", "merge_categories", "group_rare",
            "text_to_numeric", "numeric_to_text", "text_to_date", "int_to_float", "float_to_int",
        ],
        "categorical": [
            "mode", "custom_value", "forward_fill", "backward_fill", "drop_rows",
            "trim_whitespace", "remove_extra_spaces", "lowercase", "uppercase", "title_case",
            "find_replace", "remove_special_chars",
            "normalize_categories", "replace_category", "merge_categories", "group_rare",
        ],
        "datetime": [
            "mode", "custom_value", "forward_fill", "backward_fill", "drop_rows",
            "convert_to_date", "extract_year", "extract_month", "extract_day",
            "extract_quarter", "extract_weekday",
            "text_to_numeric", "numeric_to_text", "text_to_date", "int_to_float", "float_to_int",
        ],
        "identifier": [
            "mode", "custom_value", "forward_fill", "backward_fill", "drop_rows",
            "trim_whitespace", "remove_extra_spaces", "lowercase", "uppercase", "title_case",
            "find_replace", "remove_special_chars",
            "remove_duplicates_keep_first", "remove_duplicates_keep_last",
        ],
        "boolean": [
            "mode", "custom_value", "forward_fill", "backward_fill", "drop_rows",
            "text_to_numeric", "numeric_to_text", "text_to_date", "int_to_float", "float_to_int",
        ],
        "ordinal": [
            "median", "mode", "custom_value", "forward_fill", "backward_fill", "drop_rows",
            "normalize_categories", "replace_category", "merge_categories", "group_rare",
            "text_to_numeric", "numeric_to_text", "text_to_date", "int_to_float", "float_to_int",
        ],
        "binary": [
            "mode", "custom_value", "forward_fill", "backward_fill", "drop_rows",
            "normalize_categories", "replace_category", "merge_categories", "group_rare",
        ],
    }

    COLUMN_GROUPS = {
        "numeric": ["missing_values", "numeric", "outliers", "data_type"],
        "text": ["missing_values", "text_cleaning", "categorical", "data_type"],
        "categorical": ["missing_values", "text_cleaning", "categorical"],
        "datetime": ["missing_values", "datetime", "data_type"],
        "identifier": ["missing_values", "text_cleaning", "duplicates"],
        "boolean": ["missing_values", "data_type"],
        "ordinal": ["missing_values", "categorical", "data_type"],
        "binary": ["missing_values", "categorical"],
    }

    OPERATION_GROUPS = {
        "missing_values": {
            "label": "Missing Values",
            "methods": ["mean", "median", "mode", "custom_value", "forward_fill", "backward_fill", "drop_rows"],
        },
        "text_cleaning": {
            "label": "Text Cleaning",
            "methods": ["trim_whitespace", "remove_extra_spaces", "lowercase", "uppercase", "title_case", "find_replace", "remove_special_chars"],
        },
        "categorical": {
            "label": "Categorical",
            "methods": ["normalize_categories", "replace_category", "merge_categories", "group_rare"],
        },
        "numeric": {
            "label": "Numeric",
            "methods": ["convert_to_numeric", "remove_commas", "remove_currency", "round", "absolute_value"],
        },
        "outliers": {
            "label": "Outliers",
            "methods": ["iqr_detect", "zscore_detect", "remove_outliers", "cap_outliers", "replace_median"],
        },
        "datetime": {
            "label": "Date & Time",
            "methods": ["convert_to_date", "extract_year", "extract_month", "extract_day", "extract_quarter", "extract_weekday"],
        },
        "duplicates": {
            "label": "Duplicates",
            "methods": ["remove_duplicates_keep_first", "remove_duplicates_keep_last"],
        },
        "data_type": {
            "label": "Data Type",
            "methods": ["text_to_numeric", "numeric_to_text", "text_to_date", "int_to_float", "float_to_int"],
        },
    }

    OPERATION_LABELS = {
        "mean": "Mean", "median": "Median", "mode": "Mode",
        "custom_value": "Custom Value", "forward_fill": "Forward Fill", "backward_fill": "Backward Fill",
        "drop_rows": "Drop Rows",
        "trim_whitespace": "Trim Whitespace", "remove_extra_spaces": "Remove Extra Spaces",
        "lowercase": "lowercase", "uppercase": "UPPERCASE", "title_case": "Title Case",
        "find_replace": "Find & Replace", "remove_special_chars": "Remove Special Characters",
        "normalize_categories": "Normalize Categories", "replace_category": "Replace Category",
        "merge_categories": "Merge Categories", "group_rare": "Group Rare to Other",
        "convert_to_numeric": "Convert to Numeric",
        "remove_commas": "Remove Commas", "remove_currency": "Remove Currency Symbols",
        "round": "Round", "absolute_value": "Absolute Value",
        "iqr_detect": "IQR Detect", "zscore_detect": "Z-Score Detect",
        "remove_outliers": "Remove Outliers", "cap_outliers": "Cap/Winsorize",
        "replace_median": "Replace with Median",
        "convert_to_date": "Convert to Date",
        "extract_year": "Extract Year", "extract_month": "Extract Month", "extract_day": "Extract Day",
        "extract_quarter": "Extract Quarter", "extract_weekday": "Extract Day of Week",
        "remove_duplicates_keep_first": "Keep First", "remove_duplicates_keep_last": "Keep Last",
        "remove_empty_rows": "Remove Empty Rows", "remove_error_rows": "Remove Error Rows",
        "rename_column": "Rename Column", "delete_column": "Delete Column",
        "text_to_numeric": "Text to Numeric", "numeric_to_text": "Numeric to Text",
        "text_to_date": "Text to Date", "int_to_float": "Integer to Float", "float_to_int": "Float to Integer",
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
    def get_operation_label(method: str) -> str:
        """Get human-readable label for operation"""
        return ColumnTypeService.OPERATION_LABELS.get(method, method.replace("_", " ").title())

    @staticmethod
    def get_groups_for_type(semantic_type: str) -> List[str]:
        """Return operation group keys allowed for a semantic type"""
        return ColumnTypeService.COLUMN_GROUPS.get(semantic_type, ["missing_values"])

    @staticmethod
    def get_allowed_methods(semantic_type: str) -> List[str]:
        """Get allowed cleaning methods for a semantic type"""
        return ColumnTypeService.ALLOWED_METHODS.get(semantic_type, ["custom_value", "drop_rows"])
    
    @staticmethod
    def validate_method(semantic_type: str, method: str) -> bool:
        """Validate if a cleaning method is allowed for a semantic type"""
        allowed = ColumnTypeService.get_allowed_methods(semantic_type)
        return method in allowed
    

    @staticmethod
    def _jsonish(value):
        if value is None or (isinstance(value, float) and pd.isna(value)):
            return None
        if isinstance(value, (np.integer,)):
            return int(value)
        if isinstance(value, (np.floating,)):
            return float(value)
        if isinstance(value, (np.bool_, bool)):
            return bool(value)
        return str(value)

    @staticmethod
    def _sample_values(series, n=10, tail=False):
        values = series.dropna()
        values = values.tail(n) if tail else values.head(n)
        out = []
        for v in values.tolist():
            item = ColumnTypeService._jsonish(v)
            if item is not None:
                out.append(item)
        return out

    @staticmethod
    def _has_whitespace(series) -> bool:
        text = series.dropna().astype(str)
        if text.empty:
            return False
        return bool(
            text.str.match(r"^[\s]|[\s]$", na=False).any()
            or text.str.contains(r"\s{2,}", regex=True, na=False).any()
        )

    @staticmethod
    def _has_mixed_case(series) -> bool:
        text = series.dropna().astype(str).str.strip()
        if text.empty:
            return False
        lowered = text.str.lower()
        return int(text.nunique()) > int(lowered.nunique())

    @staticmethod
    def _looks_numeric_text(series) -> bool:
        text = series.dropna().astype(str).str.strip()
        if text.empty:
            return False
        cleaned = text.str.replace(",", "", regex=False)
        cleaned = cleaned.str.replace(r"[$€£₹¥]", "", regex=True)
        converted = pd.to_numeric(cleaned, errors="coerce")
        return float(converted.notna().mean()) >= 0.8

    @staticmethod
    def _looks_currency_or_comma(series) -> bool:
        text = series.dropna().astype(str)
        if text.empty:
            return False
        return bool(text.str.contains(r"[$€£₹¥,]", regex=True, na=False).any())

    @staticmethod
    def build_understanding(column: str, semantic_type: str, dtype: str, unique_count: int) -> str:
        pretty = str(column).replace("_", " ").strip()
        if semantic_type == "identifier":
            entity = pretty
            for token in [" id", " no", " number", " code", " key"]:
                entity = entity.replace(token, "").replace(token.title(), "")
            entity = entity.strip() or pretty
            hint = "numeric" if any(x in dtype for x in ["int", "float"]) else "text"
            return (
                f'Likely a unique identifier for "{entity}". Although the values are {hint}, '
                f"this column should be treated as an identifier rather than a numerical measurement."
            )
        if semantic_type == "numeric":
            return f'Represents "{pretty}" and is a numerical measurement. Values can be aggregated and checked for outliers.'
        if semantic_type == "categorical":
            return f'Represents "{pretty}". This is a categorical column containing repeated category values ({unique_count} unique).'
        if semantic_type == "text":
            return f'Appears to be free text for "{pretty}" (names, comments, or descriptions) rather than a fixed set of categories.'
        if semantic_type == "datetime":
            return f'Represents a date/time field for "{pretty}". Values should be stored in a consistent date format.'
        if semantic_type == "boolean":
            return f'Represents a true/false or yes/no flag for "{pretty}".'
        if semantic_type == "ordinal":
            return f'Represents an ordered rating or level for "{pretty}". Values have a natural rank from low to high.'
        if semantic_type == "binary":
            return f'Represents a binary indicator for "{pretty}" (typically 0/1 or yes/no).'
        return f'Column "{pretty}" appears to be {semantic_type}.'

    @staticmethod
    def detect_column_issues(df: pd.DataFrame, column: str, semantic_type: str) -> list:
        series = df[column]
        non_null = series.dropna()
        total = max(len(series), 1)
        missing = int(series.isnull().sum())
        unique_count = int(series.nunique(dropna=True))
        issues = []

        if missing > 0:
            label = "Missing IDs" if semantic_type == "identifier" else "Missing values"
            issues.append(f"{label} ({missing}, {round(missing / total * 100, 2)}%)")

        dupes = int(series.duplicated().sum())
        if semantic_type == "identifier" and dupes > 0:
            issues.append(f"Duplicate IDs ({dupes})")
        elif semantic_type != "identifier" and series.duplicated(keep=False).sum() > 0 and unique_count == 1:
            issues.append("Constant column")

        if str(series.dtype) == "object" or semantic_type in ("text", "categorical", "identifier"):
            if ColumnTypeService._has_whitespace(series):
                issues.append("Extra whitespace")
            if semantic_type in ("categorical", "text") and ColumnTypeService._has_mixed_case(series):
                issues.append("Inconsistent capitalization")

        if semantic_type == "numeric":
            numeric = pd.to_numeric(non_null, errors="coerce")
            if numeric.notna().any():
                if (numeric < 0).any() and "age" in column.lower():
                    issues.append("Invalid values (negative age)")
                if "age" in column.lower() and (numeric > 120).any():
                    issues.append("Outliers / invalid age values")
                if numeric.nunique() > 4:
                    q1, q3 = numeric.quantile(0.25), numeric.quantile(0.75)
                    iqr = q3 - q1
                    if pd.notna(iqr) and iqr > 0:
                        outlier_count = int(((numeric < q1 - 1.5 * iqr) | (numeric > q3 + 1.5 * iqr)).sum())
                        if outlier_count > 0:
                            issues.append(f"Outliers ({outlier_count})")
            if ColumnTypeService._looks_currency_or_comma(series):
                issues.append("Incorrect numeric formatting")

        if semantic_type == "datetime":
            issues.append("Possible mixed date formats")
            invalid = pd.to_datetime(non_null, errors="coerce")
            bad = int(invalid.isna().sum()) if len(non_null) else 0
            if bad > 0:
                issues.append(f"Invalid dates ({bad})")

        if semantic_type == "categorical" and unique_count > 0:
            freq = non_null.astype(str).value_counts()
            rare = int((freq < max(3, len(non_null) * 0.01)).sum())
            if rare > 0:
                issues.append(f"Rare categories ({rare})")

        if semantic_type == "identifier":
            issues.append("Unexpected formatting")
            if str(series.dtype) == "object":
                issues.append("Extra whitespace if stored as text")

        return issues[:6]

    @staticmethod
    def recommend_operations(df: pd.DataFrame, column: str, semantic_type: str) -> list:
        series = df[column]
        missing = int(series.isnull().sum()) > 0
        is_object = str(series.dtype) == "object"
        ops = []

        def add(*methods):
            for m in methods:
                if m not in ops:
                    ops.append(m)

        if semantic_type == "identifier":
            if int(series.duplicated().sum()) > 0:
                add("remove_duplicates_keep_first", "remove_duplicates_keep_last")
            if is_object:
                if ColumnTypeService._has_whitespace(series):
                    add("trim_whitespace", "remove_extra_spaces")
                add("find_replace")
            if missing:
                add("custom_value", "drop_rows")

        elif semantic_type == "numeric":
            if missing:
                add("mean", "median", "mode", "custom_value", "forward_fill", "backward_fill", "drop_rows")
            if is_object or ColumnTypeService._looks_currency_or_comma(series) or ColumnTypeService._looks_numeric_text(series):
                add("convert_to_numeric", "remove_commas", "remove_currency", "text_to_numeric")
            add("round", "absolute_value")
            numeric = pd.to_numeric(series, errors="coerce")
            if numeric.nunique(dropna=True) > 4:
                add("iqr_detect", "zscore_detect", "remove_outliers", "cap_outliers", "replace_median")

        elif semantic_type == "categorical":
            if missing:
                add("mode", "custom_value", "forward_fill", "backward_fill", "drop_rows")
            if is_object:
                add("trim_whitespace", "remove_extra_spaces")
                if ColumnTypeService._has_mixed_case(series):
                    add("lowercase", "uppercase", "title_case", "normalize_categories")
                else:
                    add("normalize_categories", "title_case")
                add("find_replace", "replace_category", "merge_categories")
            freq = series.dropna().astype(str).value_counts()
            if not freq.empty and int((freq < max(3, len(series) * 0.01)).sum()) > 0:
                add("group_rare")

        elif semantic_type == "text":
            if missing:
                add("custom_value", "forward_fill", "backward_fill", "drop_rows")
            add("trim_whitespace", "remove_extra_spaces", "lowercase", "uppercase", "title_case",
                "find_replace", "remove_special_chars")

        elif semantic_type == "datetime":
            add("convert_to_date", "text_to_date")
            if missing:
                add("forward_fill", "backward_fill", "drop_rows", "custom_value")
            add("extract_year", "extract_month", "extract_day", "extract_quarter", "extract_weekday")

        elif semantic_type == "boolean":
            if missing:
                add("mode", "custom_value", "forward_fill", "backward_fill", "drop_rows")
            add("normalize_categories")

        elif semantic_type == "ordinal":
            if missing:
                add("median", "mode", "custom_value", "forward_fill", "backward_fill", "drop_rows")
            add("replace_category", "merge_categories", "group_rare")

        elif semantic_type == "binary":
            if missing:
                add("mode", "custom_value", "forward_fill", "backward_fill", "drop_rows")
            add("normalize_categories", "replace_category")

        else:
            if missing:
                add("custom_value", "drop_rows")

        allowed = set(ColumnTypeService.get_allowed_methods(semantic_type))
        # Keep dataset-level ops out; only column-relevant allowed methods
        filtered = [m for m in ops if m in allowed or m in {
            "convert_to_numeric", "text_to_numeric", "text_to_date", "iqr_detect", "zscore_detect",
            "merge_categories", "remove_duplicates_keep_first", "remove_duplicates_keep_last",
        }]
        return filtered or ["drop_rows", "custom_value"]

    @staticmethod
    def get_column_type_info(df: pd.DataFrame, column: str) -> Dict[str, Any]:
        """Get complete type information plus semantic cleaning intelligence"""
        series = df[column]
        semantic_type = ColumnTypeService.detect_semantic_type(df, column)
        unique_count = int(series.nunique(dropna=True))
        missing_count = int(series.isnull().sum())
        recommended = ColumnTypeService.recommend_operations(df, column, semantic_type)

        numeric_stats = None
        if semantic_type == "numeric":
            numeric = pd.to_numeric(series, errors="coerce")
            if numeric.notna().any():
                numeric_stats = {
                    "min": ColumnTypeService._jsonish(numeric.min()),
                    "max": ColumnTypeService._jsonish(numeric.max()),
                    "mean": ColumnTypeService._jsonish(round(float(numeric.mean()), 4) if pd.notna(numeric.mean()) else None),
                    "median": ColumnTypeService._jsonish(numeric.median()),
                }

        return {
            "column": column,
            "dtype": str(series.dtype),
            "semantic_type": semantic_type,
            "semantic_type_label": ColumnTypeService.TYPE_LABELS.get(semantic_type, semantic_type),
            "suggested_methods": recommended,
            "recommended_operations": recommended,
            "understanding": ColumnTypeService.build_understanding(
                column, semantic_type, str(series.dtype), unique_count
            ),
            "possible_issues": ColumnTypeService.detect_column_issues(df, column, semantic_type),
            "sample_head": ColumnTypeService._sample_values(series, 10, tail=False),
            "sample_tail": ColumnTypeService._sample_values(series, 5, tail=True),
            "missing_count": missing_count,
            "unique_count": unique_count,
            "duplicate_count": int(series.duplicated().sum()),
            "total_count": int(len(series)),
            "numeric_stats": numeric_stats,
        }

    @staticmethod
    def get_all_column_types(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get type info for all columns"""
        return [ColumnTypeService.get_column_type_info(df, col) for col in df.columns]


column_type_service = ColumnTypeService()