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
    try:
        column_types = column_type_service.get_all_column_types(df)
        type_map = {ct["column"]: ct["semantic_type"] for ct in column_types}
    except Exception as e:
        print(f"Column type detection failed: {e}")
        # Fallback to basic dtype mapping
        type_map = {}
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                type_map[col] = "numeric"
            elif pd.api.types.is_datetime64_any_dtype(df[col]):
                type_map[col] = "datetime"
            else:
                type_map[col] = "categorical"
    
    # Group columns by semantic type
    numeric_cols = [col for col in df.columns if type_map.get(col) == "numeric"]
    ordinal_cols = [col for col in df.columns if type_map.get(col) == "ordinal"]
    categorical_cols = [col for col in df.columns if type_map.get(col) == "categorical"]
    datetime_cols = [col for col in df.columns if type_map.get(col) == "datetime"]
    identifier_cols = [col for col in df.columns if type_map.get(col) == "identifier"]
    boolean_cols = [col for col in df.columns if type_map.get(col) in ["boolean", "binary"]]
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
    total_cells = len(df) * len(df.columns) if len(df) > 0 else 0
    missing_cells = int(df.isnull().sum().sum())
    
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
        "missing_values": missing_cells,
        "missing_percentage": round(missing_cells / total_cells * 100, 2) if total_cells > 0 else 0,
        "duplicate_rows": int(df.duplicated().sum()),
        "column_types": type_map
    }
    
    # 2. Numerical Analysis (only numeric columns)
    for col in numeric_cols:
        try:
            series = pd.to_numeric(df[col], errors='coerce').dropna()
            if len(series) == 0:
                continue
            if series.nunique() <= 1:
                continue  # Skip constant columns
            
            hist_data = np.histogram(series, bins=min(20, series.nunique()))
            
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
                    "skewness": safe_convert(series.skew()) if len(series) > 2 else 0,
                    "kurtosis": safe_convert(series.kurtosis()) if len(series) > 3 else 0,
                },
                "histogram": {
                    "bins": [float(x) for x in hist_data[1].tolist()],
                    "counts": [int(x) for x in hist_data[0].tolist()]
                }
            }
            eda["numerical_analysis"].append(numerical_info)
        except Exception as e:
            print(f"Numerical analysis failed for {col}: {e}")
    
    # 3. Ordinal Analysis (limited, no histogram)
    for col in ordinal_cols:
        try:
            series = pd.to_numeric(df[col], errors='coerce').dropna()
            if len(series) == 0:
                continue
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
        except Exception as e:
            print(f"Ordinal analysis failed for {col}: {e}")
    
    # 4. Categorical Analysis
    for col in categorical_cols + boolean_cols:
        try:
            value_counts = df[col].dropna().value_counts().head(15)
            total_count = len(df[col].dropna())
            if total_count == 0:
                continue
            
            categorical_info = {
                "column": str(col),
                "semantic_type": type_map.get(col, "categorical"),
                "unique_count": int(df[col].nunique()),
                "top_categories": {str(k): int(v) for k, v in value_counts.items()},
                "percentages": {str(k): round(v / total_count * 100, 2) for k, v in value_counts.items()},
            }
            eda["categorical_analysis"].append(categorical_info)
        except Exception as e:
            print(f"Categorical analysis failed for {col}: {e}")
    
    # 5. Identifier Summary (lightweight, no statistics)
    for col in identifier_cols:
        try:
            identifier_info = {
                "column": str(col),
                "semantic_type": "identifier",
                "dtype": str(df[col].dtype),
                "unique_count": int(df[col].nunique()),
                "missing_count": int(df[col].isnull().sum()),
                "total_count": int(len(df[col])),
            }
            eda["identifier_summary"].append(identifier_info)
        except Exception as e:
            print(f"Identifier analysis failed for {col}: {e}")
    
    # 6. Correlation Analysis (only meaningful numeric columns)
    meaningful_numeric = []
    for col in numeric_cols:
        try:
            if df[col].nunique() > 1 and df[col].std() > 0:
                meaningful_numeric.append(col)
        except:
            pass
    
    if len(meaningful_numeric) > 1:
        try:
            corr_matrix = df[meaningful_numeric].corr()
            
            corr_dict = {}
            for i, col1 in enumerate(meaningful_numeric):
                corr_dict[str(col1)] = {}
                for j, col2 in enumerate(meaningful_numeric):
                    corr_value = corr_matrix.iloc[i, j]
                    if pd.isna(corr_value):
                        corr_dict[str(col1)][str(col2)] = None
                    else:
                        corr_dict[str(col1)][str(col2)] = float(corr_value)
            
            # Find strong correlations
            correlations = []
            for i in range(len(meaningful_numeric)):
                for j in range(i+1, len(meaningful_numeric)):
                    corr_value = corr_matrix.iloc[i, j]
                    if not pd.isna(corr_value) and abs(corr_value) > 0.3:
                        correlations.append({
                            "col1": str(meaningful_numeric[i]),
                            "col2": str(meaningful_numeric[j]),
                            "correlation": float(corr_value),
                            "strength": "strong" if abs(corr_value) > 0.7 else "moderate" if abs(corr_value) > 0.5 else "weak",
                            "direction": "positive" if corr_value > 0 else "negative"
                        })
            
            eda["correlation_analysis"] = {
                "columns": [str(col) for col in meaningful_numeric],
                "matrix": corr_dict,
                "strong_correlations": correlations
            }
        except Exception as e:
            print(f"Correlation analysis failed: {e}")
    
    # 7. Outlier Analysis
    for col in meaningful_numeric:
        try:
            series = pd.to_numeric(df[col], errors='coerce').dropna()
            
            if len(series) == 0 or series.nunique() <= 2:
                continue
            
            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)
            iqr = q3 - q1
            
            if iqr == 0:
                continue
            
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            outliers = series[(series < lower_bound) | (series > upper_bound)]
            
            if len(outliers) > 0:
                eda["outlier_analysis"].append({
                    "column": str(col),
                    "outlier_count": int(len(outliers)),
                    "outlier_percentage": round(len(outliers) / len(series) * 100, 2),
                    "lower_bound": safe_convert(lower_bound),
                    "upper_bound": safe_convert(upper_bound),
                    "q1": safe_convert(q1),
                    "q3": safe_convert(q3),
                    "iqr": safe_convert(iqr),
                })
        except Exception as e:
            print(f"Outlier analysis failed for {col}: {e}")
    
    # 8. Time Analysis (only datetime columns)
    if datetime_cols:
        try:
            time_col = datetime_cols[0]
            temp_date = pd.to_datetime(df[time_col], errors='coerce', format='mixed')
            valid_dates = temp_date.dropna()
            
            if len(valid_dates) > 0:
                df['_temp_date'] = temp_date
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
                    "min_date": str(valid_dates.min()),
                    "max_date": str(valid_dates.max()),
                    "date_range_days": int((valid_dates.max() - valid_dates.min()).days),
                    "yearly_distribution": {str(int(k)): int(v) for k, v in yearly.items() if pd.notna(k)},
                    "monthly_distribution": {str(int(k)): int(v) for k, v in monthly.items() if pd.notna(k)},
                    "daily_distribution": {str(int(k)): int(v) for k, v in daily.items() if pd.notna(k)},
                    "weekday_distribution": {str(int(k)): int(v) for k, v in weekday.items() if pd.notna(k)},
                }
                
                # Clean up temp columns
                df.drop(['_temp_date', '_temp_year', '_temp_month', '_temp_day', '_temp_weekday'], axis=1, inplace=True)
        except Exception as e:
            print(f"Time analysis failed: {e}")
    
    # Convert entire EDA to MongoDB-compatible format
    try:
        eda = convert_numpy_types(eda)
    except Exception as e:
        print(f"Conversion failed: {e}")
    
    eda["type"] = "eda"
    
    # Store EDA in database
    try:
        await db.analysis_results.update_one(
            {"dataset_id": dataset_id, "type": "eda"},
            {"$set": eda},
            upsert=True
        )
    except Exception as e:
        print(f"MongoDB storage failed: {e}")
    
    eda.pop("type", None)
    return eda