import pandas as pd
import numpy as np
from datetime import datetime
from bson import ObjectId
from app.services.dataset_service import convert_numpy_types
from app.services.profiling_service import profile_dataset
from app.services.health_service import calculate_health_score
from app.services.column_type_service import column_type_service

async def apply_cleaning_operation(dataset_id, operation, db):
    """Apply a cleaning operation to the dataset with semantic type validation"""
    
    import os
    file_path = f"uploads/{dataset_id}.pkl"
    if not os.path.exists(file_path):
        raise Exception("Dataset file not found")
    
    df = pd.read_pickle(file_path)
    
    before_state = {
        "rows": int(len(df)),
        "missing": int(df.isnull().sum().sum()),
        "duplicates": int(df.duplicated().sum())
    }
    
    op_type = operation.get("type")
    column = operation.get("column")
    method = operation.get("method")
    
    # Validate method against semantic type
    if column and column != "all" and column in df.columns:
        semantic_type = column_type_service.detect_semantic_type(df, column)
        
        if method and not column_type_service.validate_method(semantic_type, method):
            raise Exception(f"Method '{method}' is not supported for {semantic_type} column '{column}'. Allowed methods: {column_type_service.get_allowed_methods(semantic_type)}")
    
    log_entry = {
        "dataset_id": dataset_id,
        "timestamp": datetime.utcnow(),
        "operation": op_type,
        "column": column,
        "method": method,
        "before": before_state,
        "operation_details": operation
    }
    
    try:
        if op_type == "drop_missing":
            subset = [column] if column and column != "all" else None
            df = df.dropna(subset=subset)
        
        elif op_type == "fill_missing":
            if column and column != "all":
                if method == "drop_rows":
                    df = df.dropna(subset=[column])
                elif method == "mean":
                    if df[column].dtype in ['int64', 'float64', 'int32', 'float32']:
                        mean_val = df[column].mean()
                        if pd.notna(mean_val):
                            if df[column].dtype in ['int64', 'int32']:
                                df[column].fillna(int(round(mean_val)), inplace=True)
                            else:
                                df[column].fillna(round(mean_val, 2), inplace=True)
                    else:
                        raise Exception(f"Mean imputation requires numeric column, got {df[column].dtype}")
                
                elif method == "median":
                    if df[column].dtype in ['int64', 'float64', 'int32', 'float32']:
                        median_val = df[column].median()
                        if pd.notna(median_val):
                            if df[column].dtype in ['int64', 'int32']:
                                df[column].fillna(int(median_val), inplace=True)
                            else:
                                df[column].fillna(median_val, inplace=True)
                    else:
                        raise Exception(f"Median imputation requires numeric column, got {df[column].dtype}")
                
                elif method == "mode":
                    mode_val = df[column].mode()
                    if len(mode_val) > 0:
                        df[column].fillna(mode_val[0], inplace=True)
                    else:
                        df[column].fillna("Unknown", inplace=True)
                
                elif method == "forward_fill":
                    df[column] = df[column].fillna(method='ffill')
                    if df[column].isnull().any():
                        df[column] = df[column].fillna(method='bfill')
                
                elif method == "backward_fill":
                    df[column] = df[column].fillna(method='bfill')
                    if df[column].isnull().any():
                        df[column] = df[column].fillna(method='ffill')
                
                elif method == "custom":
                    custom_value = operation.get("value", "")
                    is_numeric = df[column].dtype in ['int64', 'float64', 'int32', 'float32']
                    if is_numeric and custom_value:
                        try:
                            if df[column].dtype in ['int64', 'int32']:
                                custom_value = int(float(custom_value))
                            else:
                                custom_value = float(custom_value)
                        except:
                            pass
                    df[column].fillna(custom_value, inplace=True)
        
        elif op_type == "remove_duplicates":
            keep = operation.get("keep", "first")
            if column and column != "all" and column in df.columns:
                df = df.drop_duplicates(subset=[column], keep=keep)
            else:
                df = df.drop_duplicates(keep=keep)
        
        elif op_type == "convert_type":
            if column:
                target_type = operation.get("target_type", "numeric")
                if target_type == "numeric":
                    df[column] = pd.to_numeric(df[column], errors='coerce')
                elif target_type == "datetime":
                    df[column] = pd.to_datetime(df[column], errors='coerce', format='mixed')
                elif target_type == "categorical":
                    df[column] = df[column].astype(str)
        
        elif op_type == "normalize_categories":
            if column:
                df[column] = df[column].astype(str).str.strip().str.lower()
        
        elif op_type == "cap_outliers":
            if column and df[column].dtype in ['int64', 'float64', 'int32', 'float32']:

                # Binary columns are not suitable for outlier capping
                if df[column].nunique() <= 2:
                    raise Exception(
                        f"Cannot apply outlier capping on binary column "
                        f"'{column}'. This column has only 0/1 values."
                    )

                q1 = df[column].quantile(0.25)
                q3 = df[column].quantile(0.75)
                iqr = q3 - q1

                # Skip constant / zero-IQR columns
                if iqr == 0:
                    raise Exception(
                        f"Cannot apply outlier capping on column "
                        f"'{column}'. IQR is zero."
                    )

                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr

                df[column] = df[column].clip(lower, upper)
        
        elif op_type == "remove_outliers":
            if column and df[column].dtype in ['int64', 'float64', 'int32', 'float32']:

                # Binary columns are not suitable for outlier removal
                if df[column].nunique() <= 2:
                    raise Exception(
                        f"Cannot remove outliers from binary column "
                        f"'{column}'. This column has only 0/1 values."
                    )

                q1 = df[column].quantile(0.25)
                q3 = df[column].quantile(0.75)
                iqr = q3 - q1

                # Skip constant / zero-IQR columns
                if iqr == 0:
                    raise Exception(
                        f"Cannot remove outliers from column "
                        f"'{column}'. IQR is zero."
                    )

                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr

                df = df[
                    (df[column] >= lower) &
                    (df[column] <= upper)
                ]
        
        elif op_type == "drop_column":
            if column and column != "all" and column in df.columns:
                df = df.drop(columns=[column])

        elif op_type == "trim_whitespace":
            if column and column != "all" and column in df.columns:
                df[column] = df[column].astype(str).str.strip()

        elif op_type == "remove_extra_spaces":
            if column and column != "all" and column in df.columns:
                df[column] = df[column].astype(str).str.replace(r"\s+", " ", regex=True).str.strip()

        elif op_type == "lowercase":
            if column and column != "all" and column in df.columns:
                df[column] = df[column].astype(str).str.lower()

        elif op_type == "uppercase":
            if column and column != "all" and column in df.columns:
                df[column] = df[column].astype(str).str.upper()

        elif op_type == "title_case":
            if column and column != "all" and column in df.columns:
                df[column] = df[column].astype(str).str.title()

        elif op_type == "round":
            if column and column != "all" and column in df.columns:
                df[column] = pd.to_numeric(df[column], errors="coerce").round()

        elif op_type == "absolute_value":
            if column and column != "all" and column in df.columns:
                df[column] = pd.to_numeric(df[column], errors="coerce").abs()

        elif op_type == "remove_commas":
            if column and column != "all" and column in df.columns:
                df[column] = df[column].astype(str).str.replace(",", "")

        elif op_type == "remove_currency":
            if column and column != "all" and column in df.columns:
                df[column] = df[column].astype(str).str.replace(r"[$€£₹]", "", regex=True)

        elif op_type == "replace_median":
            if column and column != "all" and column in df.columns:
                median_val = df[column].median()
                df[column] = df[column].fillna(median_val)

        elif op_type == "convert_to_int":
            if column and column != "all" and column in df.columns:
                df[column] = pd.to_numeric(df[column], errors="coerce").astype("Int64")

        elif op_type == "convert_to_float":
            if column and column != "all" and column in df.columns:
                df[column] = pd.to_numeric(df[column], errors="coerce").astype("float64")

        elif op_type == "convert_to_text":
            if column and column != "all" and column in df.columns:
                df[column] = df[column].astype(str)

        elif op_type == "convert_to_date":
            if column and column != "all" and column in df.columns:
                df[column] = pd.to_datetime(df[column], errors="coerce")

        elif op_type == "extract_year":
            if column and column != "all" and column in df.columns:
                df[column + "_year"] = pd.to_datetime(df[column], errors="coerce").dt.year

        elif op_type == "extract_month":
            if column and column != "all" and column in df.columns:
                df[column + "_month"] = pd.to_datetime(df[column], errors="coerce").dt.month

        elif op_type == "extract_day":
            if column and column != "all" and column in df.columns:
                df[column + "_day"] = pd.to_datetime(df[column], errors="coerce").dt.day

        elif op_type == "extract_quarter":
            if column and column != "all" and column in df.columns:
                df[column + "_quarter"] = pd.to_datetime(df[column], errors="coerce").dt.quarter

        elif op_type == "extract_weekday":
            if column and column != "all" and column in df.columns:
                df[column + "_weekday"] = pd.to_datetime(df[column], errors="coerce").dt.dayofweek

        elif op_type == "remove_duplicates_keep_first":
            if column and column != "all" and column in df.columns:
                df = df.drop_duplicates(subset=[column], keep="first")

        elif op_type == "remove_duplicates_keep_last":
            if column and column != "all" and column in df.columns:
                df = df.drop_duplicates(subset=[column], keep="last")

        elif op_type == "replace_category":
            if column and column != "all" and column in df.columns:
                old_val = operation.get("old_value", "")
                new_val = operation.get("new_value", "")
                if old_val:
                    df[column] = df[column].replace(old_val, new_val)

        elif op_type == "group_rare":
            if column and column != "all" and column in df.columns:
                threshold = operation.get("threshold", 5)
                value_counts = df[column].value_counts()
                rare_values = value_counts[value_counts < threshold].index
                df[column] = df[column].apply(lambda x: "Other" if x in rare_values else x)

        elif op_type == "find_replace":
            if column and column != "all" and column in df.columns:
                find_val = operation.get("find", "")
                replace_val = operation.get("replace", "")
                if find_val:
                    df[column] = df[column].astype(str).str.replace(find_val, replace_val, regex=False)

        elif op_type == "remove_special_chars":
            if column and column != "all" and column in df.columns:
                df[column] = df[column].astype(str).str.replace(r"[^a-zA-Z0-9\s]", "", regex=True)
        
        # Calculate after state
        after_state = {
            "rows": int(len(df)),
            "missing": int(df.isnull().sum().sum()),
            "duplicates": int(df.duplicated().sum())
        }
        
        log_entry["after"] = after_state
        log_entry["rows_affected"] = before_state["rows"] - after_state["rows"]
        
        df.to_pickle(file_path)
        
        # MARK CORRESPONDING ISSUES AS RESOLVED
        resolved_filter = {"dataset_id": dataset_id}

        if op_type == "fill_missing" and column and column != "all":
            resolved_filter["column"] = column
            resolved_filter["type"] = "missing_values"

        elif op_type == "remove_duplicates":
            resolved_filter["type"] = {"$in": ["duplicates", "duplicate_ids"]}
            if column and column != "all":
                resolved_filter["column"] = column

        elif op_type == "normalize_categories" and column:
            resolved_filter["column"] = column
            resolved_filter["type"] = "category_inconsistency"

        elif op_type in ["cap_outliers", "remove_outliers"] and column:
            resolved_filter["column"] = column
            resolved_filter["type"] = "outliers"

        elif op_type == "drop_column" and column:
            resolved_filter["column"] = column
            resolved_filter["type"] = {"$in": ["constant_column", "near_constant_column"]}

        elif op_type == "convert_type" and column:
            resolved_filter["column"] = column
            resolved_filter["type"] = "type_mismatch"

        matching_issues = await db.data_quality_issues.find(
            resolved_filter
        ).to_list(None)

        if matching_issues:
            update_result = await db.data_quality_issues.update_many(
                resolved_filter,
                {
                    "$set": {
                        "status": "resolved",
                        "resolved_at": datetime.utcnow()
                    }
                }
            )

            print(
                f"Marked {update_result.modified_count} issues as resolved"
            )


        
        preview_data = convert_numpy_types(df.head(100).to_dict('records'))
        
        await db.datasets.update_one(
            {"_id": ObjectId(dataset_id)},
            {
                "$set": {
                    "rows": int(len(df)),
                    "columns": int(len(df.columns)),
                    "column_names": df.columns.tolist(),
                    "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
                    "data_preview": preview_data,
                    "updated_at": datetime.utcnow()
                },
                "$inc": {"version": 1}
            }
        )
        
        log_entry = convert_numpy_types(log_entry)
        await db.cleaning_operations.insert_one(log_entry)
        
        profile = await profile_dataset(df, dataset_id)
        profile = convert_numpy_types(profile)
        await db.dataset_profiles.replace_one(
            {"dataset_id": dataset_id},
            profile,
            upsert=True
        )
        
        health = await calculate_health_score(df, profile)
        health = convert_numpy_types(health)
        
        await db.datasets.update_one(
            {"_id": ObjectId(dataset_id)},
            {"$set": {
                "health_score": int(health["score"]),
                "health_details": health
            }}
        )
        
        return {
            "success": True,
            "before": before_state,
            "after": after_state,
            "health_score": int(health["score"])
        }
        
    except Exception as e:
        log_entry["error"] = str(e)
        try:
            log_entry = convert_numpy_types(log_entry)
            await db.cleaning_operations.insert_one(log_entry)
        except:
            pass
        raise e

async def undo_last_operation(dataset_id, db):
    """Undo the last cleaning operation"""
    last_op = await db.cleaning_operations.find_one(
        {"dataset_id": dataset_id, "error": {"$exists": False}},
        sort=[("timestamp", -1)]
    )
    if not last_op:
        return {"error": "No operations to undo"}
    return {
        "message": "Undo functionality is limited.",
        "last_operation": last_op.get("operation", "unknown")
    }

async def get_cleaning_log(dataset_id, db):
    """Get cleaning operation log"""
    operations = await db.cleaning_operations.find(
        {"dataset_id": dataset_id}
    ).sort("timestamp", -1).to_list(None)
    
    for op in operations:
        if "_id" in op:
            op["_id"] = str(op["_id"])
        if "timestamp" in op and op["timestamp"]:
            op["timestamp"] = op["timestamp"].isoformat()
    
    return operations