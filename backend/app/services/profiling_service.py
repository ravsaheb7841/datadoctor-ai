import pandas as pd
import numpy as np
from datetime import datetime
import json
import warnings
import sys

# Suppress all pandas warnings globally
warnings.filterwarnings('ignore')
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)
pd.options.mode.chained_assignment = None

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, pd.Timestamp):
            return str(obj)
        if isinstance(obj, np.bool_):
            return bool(obj)
        try:
            if pd.isna(obj):
                return None
        except:
            pass
        return super(NpEncoder, self).default(obj)

def safe_convert(value):
    """Convert numpy types to Python native types"""
    if value is None:
        return None
    try:
        if pd.isna(value):
            return None
    except:
        pass
    
    try:
        if isinstance(value, np.integer):
            return int(value)
        elif isinstance(value, np.floating):
            if np.isnan(value) or np.isinf(value):
                return None
            return float(value)
        elif isinstance(value, np.bool_):
            return bool(value)
        elif isinstance(value, pd.Timestamp):
            return str(value)
        elif isinstance(value, np.ndarray):
            return value.tolist()
    except:
        pass
    
    return value

async def profile_dataset(df, dataset_id):
    """Generate comprehensive dataset profile"""
    
    profile = {
        "dataset_id": dataset_id,
        "created_at": datetime.utcnow(),
        "total_rows": int(len(df)),
        "total_columns": int(len(df.columns)),
        "total_missing": int(df.isnull().sum().sum()),
        "total_duplicates": int(df.duplicated().sum()),
        "memory_usage": int(df.memory_usage(deep=True).sum()),
        "column_profiles": []
    }
    
    for col in df.columns:
        col_profile = profile_column(df, col)
        profile["column_profiles"].append(col_profile)
    
    return profile

def profile_column(df, col_name):
    """Profile a single column"""
    series = df[col_name]
    dtype = str(series.dtype)
    total = len(series)
    
    # Basic stats
    missing = int(series.isnull().sum())
    missing_pct = round(missing / total * 100, 2) if total > 0 else 0
    unique = int(series.nunique())
    unique_pct = round(unique / total * 100, 2) if total > 0 else 0
    
    # Classify column type
    col_type = classify_column_type(series, dtype)
    
    profile = {
        "column_name": str(col_name),
        "dtype": dtype,
        "inferred_type": col_type,
        "total": int(total),
        "missing": missing,
        "missing_percentage": missing_pct,
        "unique": unique,
        "unique_percentage": unique_pct,
        "is_constant": bool(unique <= 1),
        "is_near_constant": bool(unique <= 5 if total > 100 else False)
    }
    
    # Numeric column stats
    if col_type == "numeric":
        numeric_series = pd.to_numeric(series, errors='coerce').dropna()
        if len(numeric_series) > 0:
            profile.update({
                "min": safe_convert(numeric_series.min()),
                "max": safe_convert(numeric_series.max()),
                "mean": safe_convert(numeric_series.mean()),
                "median": safe_convert(numeric_series.median()),
                "std": safe_convert(numeric_series.std()) if len(numeric_series) > 1 else 0,
                "q25": safe_convert(numeric_series.quantile(0.25)),
                "q75": safe_convert(numeric_series.quantile(0.75)),
                "skewness": safe_convert(numeric_series.skew()),
                "kurtosis": safe_convert(numeric_series.kurtosis()),
                "zeros_count": int((numeric_series == 0).sum()),
                "zeros_percentage": round((numeric_series == 0).sum() / len(numeric_series) * 100, 2) if len(numeric_series) > 0 else 0
            })
            
            # Outliers using IQR
            q1 = numeric_series.quantile(0.25)
            q3 = numeric_series.quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            outliers = numeric_series[(numeric_series < lower_bound) | (numeric_series > upper_bound)]
            profile["outlier_count"] = int(len(outliers))
            profile["outlier_percentage"] = round(len(outliers) / len(numeric_series) * 100, 2) if len(numeric_series) > 0 else 0
    
    # Categorical column stats
    elif col_type in ["categorical", "boolean", "text"]:
        value_counts = series.dropna().value_counts()
        top_values = value_counts.head(10).to_dict()
        # Convert keys to strings and values to int for JSON compatibility
        profile["top_values"] = {str(k): int(v) for k, v in top_values.items()}
        profile["value_counts"] = int(len(value_counts))
    
    # Datetime column stats
    elif col_type == "datetime":
        try:
            # Use format='mixed' to handle different date formats without warnings
            date_series = pd.to_datetime(series, errors='coerce', format='mixed')
            date_series = date_series.dropna()
            if len(date_series) > 0:
                profile["min_date"] = str(date_series.min())
                profile["max_date"] = str(date_series.max())
                profile["date_range_days"] = int((date_series.max() - date_series.min()).days)
        except Exception:
            pass
    
    return profile

def classify_column_type(series, dtype):
    """Classify column type"""
    
    # Check datetime
    if 'datetime' in dtype.lower():
        return 'datetime'
    
    # Check boolean
    if 'bool' in dtype.lower():
        return 'boolean'
    
    # Numeric columns
    if np.issubdtype(series.dtype, np.number):
        return 'numeric'
    
    # Object/string columns
    if dtype == 'object':
        # Try to convert to numeric
        non_null = series.dropna()
        
        if len(non_null) > 0:
            # Check if mostly numeric
            numeric_series = pd.to_numeric(series, errors='coerce')
            numeric_ratio = numeric_series.notna().sum() / len(non_null)
            if numeric_ratio > 0.8:
                return 'numeric'
            
            # Check if datetime with format='mixed'
            try:
                date_series = pd.to_datetime(series, errors='coerce', format='mixed')
                date_ratio = date_series.notna().sum() / len(non_null)
                if date_ratio > 0.8:
                    return 'datetime'
            except Exception:
                pass
            
            # Check cardinality for categorical
            unique_count = series.nunique()
            unique_ratio = unique_count / len(non_null)
            if unique_ratio < 0.5 and unique_count < 100:
                return 'categorical'
            elif unique_ratio > 0.9:
                return 'id_like'
            else:
                return 'text'
    
    return 'other'