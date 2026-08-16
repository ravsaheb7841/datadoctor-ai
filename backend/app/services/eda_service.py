import pandas as pd
import numpy as np
from datetime import datetime
import os
import warnings
from app.utils.warnings_config import suppress_warnings
from app.services.column_type_service import column_type_service

suppress_warnings()

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
        if isinstance(value, (np.integer,)):
            return int(value)
        elif isinstance(value, (np.floating,)):
            if np.isnan(value) or np.isinf(value):
                return None
            return float(value)
        elif isinstance(value, np.bool_):
            return bool(value)
        elif isinstance(value, (pd.Timestamp,)):
            return str(value)
    except:
        pass
    return value

def convert_numpy_types(obj):
    """Recursively convert numpy types to Python native types"""
    if obj is None:
        return None
    elif isinstance(obj, dict):
        return {str(key): convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        return str(obj)
    else:
        try:
            if pd.isna(obj):
                return None
        except:
            pass
        return obj

async def generate_eda(dataset_id, db):
    """Generate semantic-type-aware EDA for a dataset"""
    
    file_path = f"uploads/{dataset_id}.pkl"
    if not os.path.exists(file_path):
        raise Exception("Dataset file not found")
    
    df = pd.read_pickle(file_path)
    
    # Get semantic types for all columns
    column_types = column_type_service.get_all_column_types(df)
    type_map = {ct["column"]: ct["semantic_type"] for ct in column_types}
    
    # Group columns by semantic type
    numeric_cols = [col for col in df.columns if type_map.get(col) == "numeric"]
    ordinal_cols = [col for col in df.columns if type_map.get(col) == "ordinal"]
    categorical_cols = [col for col in df.columns if type_map.get(col) == "categorical"]
    datetime_cols = [col for col in df.columns if type_map.get(col) == "datetime"]
    identifier_cols = [col for col in df.columns if type_map.get(col) == "identifier"]
    boolean_cols = [col for col in df.columns if type_map.get(col) == "boolean"]
    text_cols = [col for col in df.columns if type_map.get(col) == "text"]
    
    # Build EDA response
    eda = {
        "dataset_id": dataset_id,
        "created_at": datetime.utcnow(),
        "summary": {},
        "numerical_analysis": [],
        "categorical_analysis": [],
        "identifier_summary": [],
        "correlation_analysis": {},
        "outlier_analysis": [],
        "time_analysis": None,
    }
    
    # 1. Dataset Summary
    eda["summary"] = {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "numeric_columns": len(numeric_cols),
        "ordinal_columns": len(ordinal_cols),
        "categorical_columns": len(categorical_cols),
        "datetime_columns": len(datetime_cols),
        "identifier_columns": len(identifier_cols),
        "boolean_columns": len(boolean_cols),
        "text_columns": len(text_cols),
        "missing_values": int(df.isnull().sum().sum()),
        "missing_percentage": round(df.isnull().sum().sum() / (len(df) * len(df.columns)) * 100, 2) if len(df) > 0 else 0,
        "duplicate_rows": int(df.duplicated().sum()),
        "column_types": type_map
    }
    
    # 2. Numerical Analysis (only numeric columns)
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) > 0:
            hist_data = np.histogram(series, bins=20)
            numerical_info = {
                "column": str(col),
                "semantic_type": "numeric",
                "stats": {
                    "mean": safe_convert(series.mean()),
                    "median": safe_convert(series.median()),
                    "std": safe_convert(series.std()) if len(series) > 1 else 0,
                    "min": safe_convert(series.min()),
                    "max": safe_convert(series.max()),
                    "q25": safe_convert(series.quantile(0.25)),
                    "q75": safe_convert(series.quantile(0.75)),
                },
                "histogram": {
                    "bins": [float(x) for x in hist_data[1].tolist()],
                    "counts": [int(x) for x in hist_data[0].tolist()]
                }
            }
            eda["numerical_analysis"].append(numerical_info)
    
    # 3. Ordinal Analysis (limited, no histogram)
    for col in ordinal_cols:
        series = df[col].dropna()
        if len(series) > 0:
            value_counts = series.value_counts().sort_index()
            ordinal_info = {
                "column": str(col),
                "semantic_type": "ordinal",
                "unique_count": int(series.nunique()),
                "value_counts": {str(k): int(v) for k, v in value_counts.items()},
                "min": safe_convert(series.min()),
                "max": safe_convert(series.max()),
            }
            eda["numerical_analysis"].append(ordinal_info)
    
    # 4. Categorical Analysis
    for col in categorical_cols + boolean_cols:
        value_counts = df[col].dropna().value_counts().head(15)
        total_count = len(df[col].dropna())
        categorical_info = {
            "column": str(col),
            "semantic_type": type_map.get(col, "categorical"),
            "unique_count": int(df[col].nunique()),
            "top_categories": {str(k): int(v) for k, v in value_counts.items()},
            "percentages": {str(k): round(v / total_count * 100, 2) for k, v in value_counts.items()} if total_count > 0 else {},
        }
        eda["categorical_analysis"].append(categorical_info)
    
    # 5. Identifier Summary (lightweight, no statistics)
    for col in identifier_cols:
        identifier_info = {
            "column": str(col),
            "semantic_type": "identifier",
            "dtype": str(df[col].dtype),
            "unique_count": int(df[col].nunique()),
            "missing_count": int(df[col].isnull().sum()),
            "total_count": int(len(df[col])),
        }
        eda["identifier_summary"].append(identifier_info)
    
    # 6. Correlation Analysis (only meaningful numeric columns)
    if len(numeric_cols) > 1:
        corr_matrix = df[numeric_cols].corr()
        
        corr_dict = {}
        for i, col1 in enumerate(numeric_cols):
            corr_dict[str(col1)] = {}
            for j, col2 in enumerate(numeric_cols):
                corr_value = corr_matrix.iloc[i, j]
                if pd.isna(corr_value):
                    corr_dict[str(col1)][str(col2)] = None
                else:
                    corr_dict[str(col1)][str(col2)] = float(corr_value)
        
        # Find strong correlations
        correlations = []
        for i in range(len(numeric_cols)):
            for j in range(i+1, len(numeric_cols)):
                corr_value = corr_matrix.iloc[i, j]
                if not pd.isna(corr_value) and abs(corr_value) > 0.3:
                    correlations.append({
                        "col1": str(numeric_cols[i]),
                        "col2": str(numeric_cols[j]),
                        "correlation": float(corr_value),
                        "strength": "strong" if abs(corr_value) > 0.7 else "moderate",
                        "direction": "positive" if corr_value > 0 else "negative"
                    })
        
        eda["correlation_analysis"] = {
            "columns": [str(col) for col in numeric_cols],
            "matrix": corr_dict,
            "strong_correlations": correlations
        }
    
    # 7. Outlier Analysis
    # Only meaningful numeric columns are analyzed.
    # Binary and constant columns are skipped.
    for col in numeric_cols:
        series = df[col].dropna()

        # Skip empty columns and binary columns
        if len(series) == 0 or series.nunique() <= 2:
            continue

        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1

        # Skip constant / zero-IQR columns
        if iqr == 0:
            continue

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        outliers = series[
            (series < lower_bound) |
            (series > upper_bound)
        ]

        if len(outliers) > 0:
            eda["outlier_analysis"].append({
                "column": str(col),
                "outlier_count": int(len(outliers)),
                "outlier_percentage": round(
                    len(outliers) / len(series) * 100,
                    2
                ),
                "lower_bound": safe_convert(lower_bound),
                "upper_bound": safe_convert(upper_bound),
                "q1": safe_convert(q1),
                "q3": safe_convert(q3),
                "iqr": safe_convert(iqr),
            })

    # 8. Time Analysis (only datetime columns)
    if datetime_cols:
        time_col = datetime_cols[0]
        df['_temp_date'] = pd.to_datetime(df[time_col], errors='coerce', format='mixed')
        df['_temp_year'] = df['_temp_date'].dt.year
        df['_temp_month'] = df['_temp_date'].dt.month
        df['_temp_day'] = df['_temp_date'].dt.day
        df['_temp_weekday'] = df['_temp_date'].dt.dayofweek
        
        yearly = df.groupby('_temp_year').size()
        monthly = df.groupby('_temp_month').size()
        daily = df.groupby('_temp_day').size()
        weekday = df.groupby('_temp_weekday').size()
        
        eda["time_analysis"] = {
            "column": str(time_col),
            "min_date": str(df['_temp_date'].min()),
            "max_date": str(df['_temp_date'].max()),
            "date_range_days": int((df['_temp_date'].max() - df['_temp_date'].min()).days) if len(df['_temp_date'].dropna()) > 0 else 0,
            "yearly_distribution": {str(int(k)): int(v) for k, v in yearly.items() if pd.notna(k)},
            "monthly_distribution": {str(int(k)): int(v) for k, v in monthly.items() if pd.notna(k)},
            "daily_distribution": {str(int(k)): int(v) for k, v in daily.items() if pd.notna(k)},
            "weekday_distribution": {str(int(k)): int(v) for k, v in weekday.items() if pd.notna(k)},
        }
        
        # Clean up temp columns
        df.drop(['_temp_date', '_temp_year', '_temp_month', '_temp_day', '_temp_weekday'], axis=1, inplace=True)
    
    # Convert entire EDA to MongoDB-compatible format
    eda = convert_numpy_types(eda)
    eda["type"] = "eda"
    
    # Store EDA in database
    await db.analysis_results.update_one(
        {"dataset_id": dataset_id, "type": "eda"},
        {"$set": eda},
        upsert=True
    )
    
    eda.pop("type", None)
    return eda