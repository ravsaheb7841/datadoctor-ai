import pandas as pd
import numpy as np
from datetime import datetime

def safe_int(value):
    """Convert numpy int to Python int"""
    if isinstance(value, (np.integer,)):
        return int(value)
    return value

def safe_float(value):
    """Convert numpy float to Python float"""
    if isinstance(value, (np.floating,)):
        if np.isnan(value) or np.isinf(value):
            return None
        return float(value)
    return value

async def detect_quality_issues(df, profile):
    """Detect all data quality issues"""
    
    issues = []
    
    # 1. Missing values
    issues.extend(detect_missing_values(df, profile))
    
    # 2. Duplicate rows
    issues.extend(detect_duplicates(df))
    
    # 3. Data type problems
    issues.extend(detect_type_problems(df, profile))
    
    # 4. Category inconsistencies
    issues.extend(detect_category_inconsistencies(df, profile))
    
    # 5. Outliers
    issues.extend(detect_outliers(df, profile))
    
    # 6. Invalid values
    issues.extend(detect_invalid_values(df, profile))
    
    # 7. Constant columns
    issues.extend(detect_constant_columns(profile))
    
    # 8. Near-constant columns
    issues.extend(detect_near_constant_columns(profile))
    
    # 9. High cardinality columns
    issues.extend(detect_high_cardinality(df, profile))
    
    return issues

def detect_missing_values(df, profile):
    issues = []
    for col_profile in profile["column_profiles"]:
        if col_profile["missing"] > 0:
            severity = "info"
            pct = col_profile["missing_percentage"]
            if pct > 50:
                severity = "critical"
            elif pct > 30:
                severity = "high"
            elif pct > 10:
                severity = "medium"
            elif pct > 5:
                severity = "low"
            
            issues.append({
                "type": "missing_values",
                "severity": severity,
                "column": str(col_profile["column_name"]),
                "issue": f"Missing values in {col_profile['column_name']}",
                "affected_rows": int(col_profile["missing"]),
                "percentage_affected": float(pct),
                "recommended_action": f"Consider filling missing values with mean/median/mode or dropping rows"
            })
    return issues

def detect_duplicates(df):
    issues = []
    duplicate_count = int(df.duplicated().sum())
    if duplicate_count > 0:
        pct = round(duplicate_count / len(df) * 100, 2)
        severity = "medium"
        if pct > 10:
            severity = "high"
        elif pct > 20:
            severity = "critical"
        
        issues.append({
            "type": "duplicates",
            "severity": severity,
            "column": "all",
            "issue": "Duplicate rows detected",
            "affected_rows": duplicate_count,
            "percentage_affected": float(pct),
            "recommended_action": "Remove duplicate rows"
        })
    
    # Check ID columns for duplicates
    for col in df.columns:
        if 'id' in str(col).lower() and df[col].duplicated().sum() > 0:
            dup_count = int(df[col].duplicated().sum())
            issues.append({
                "type": "duplicate_ids",
                "severity": "critical",
                "column": str(col),
                "issue": f"Duplicate values in ID column: {col}",
                "affected_rows": dup_count,
                "percentage_affected": round(dup_count / len(df) * 100, 2),
                "recommended_action": "Investigate and resolve duplicate IDs"
            })
    
    return issues

def detect_type_problems(df, profile):
    issues = []
    for col_profile in profile["column_profiles"]:
        if col_profile["inferred_type"] == "numeric" and col_profile["dtype"] == "object":
            issues.append({
                "type": "type_mismatch",
                "severity": "high",
                "column": str(col_profile["column_name"]),
                "issue": f"Column '{col_profile['column_name']}' contains numeric values stored as text",
                "affected_rows": int(len(df)),
                "percentage_affected": 100.0,
                "recommended_action": "Convert column to numeric type"
            })
        elif col_profile["inferred_type"] == "datetime" and col_profile["dtype"] == "object":
            issues.append({
                "type": "type_mismatch",
                "severity": "medium",
                "column": str(col_profile["column_name"]),
                "issue": f"Column '{col_profile['column_name']}' contains dates stored as text",
                "affected_rows": int(len(df)),
                "percentage_affected": 100.0,
                "recommended_action": "Convert column to datetime type"
            })
    return issues

def detect_category_inconsistencies(df, profile):
    issues = []
    for col_profile in profile["column_profiles"]:
        if col_profile["inferred_type"] == "categorical":
            series = df[col_profile["column_name"]].dropna().astype(str)
            unique_original = set(series)
            unique_lower = set(series.str.lower().str.strip())
            
            if len(unique_original) > len(unique_lower):
                issues.append({
                    "type": "category_inconsistency",
                    "severity": "medium",
                    "column": str(col_profile["column_name"]),
                    "issue": f"Inconsistent categories in '{col_profile['column_name']}' (case/whitespace differences)",
                    "affected_rows": int(len(unique_original) - len(unique_lower)),
                    "percentage_affected": round((len(unique_original) - len(unique_lower)) / len(unique_original) * 100, 2),
                    "recommended_action": "Normalize categories by trimming whitespace and standardizing case"
                })
                break
    return issues

def detect_outliers(df, profile):
    issues = []
    for col_profile in profile["column_profiles"]:
        if col_profile["inferred_type"] == "numeric" and col_profile.get("outlier_count", 0) > 0:
            pct = col_profile["outlier_percentage"]
            severity = "low"
            if pct > 10:
                severity = "medium"
            elif pct > 20:
                severity = "high"
            
            issues.append({
                "type": "outliers",
                "severity": severity,
                "column": str(col_profile["column_name"]),
                "issue": f"Outliers detected in '{col_profile['column_name']}' using IQR method",
                "affected_rows": int(col_profile["outlier_count"]),
                "percentage_affected": float(pct),
                "recommended_action": "Investigate outliers and consider capping or removing extreme values"
            })
    return issues

def detect_invalid_values(df, profile):
    issues = []
    
    for col_profile in profile["column_profiles"]:
        col_name = str(col_profile["column_name"]).lower()
        
        # Age validation
        if col_name == "age" and col_profile["inferred_type"] == "numeric":
            try:
                numeric_series = pd.to_numeric(df[col_profile["column_name"]], errors='coerce')
                invalid = numeric_series[numeric_series.apply(
                    lambda x: x < 0 or x > 120 if pd.notna(x) else False
                )]
                if len(invalid) > 0:
                    issues.append({
                        "type": "invalid_values",
                        "severity": "high",
                        "column": str(col_profile["column_name"]),
                        "issue": "Invalid age values detected (outside 0-120 range)",
                        "affected_rows": int(len(invalid)),
                        "percentage_affected": round(len(invalid) / len(df) * 100, 2),
                        "recommended_action": "Correct or remove invalid age values"
                    })
            except Exception:
                pass
        
        # Negative quantity/amount validation
        if any(term in col_name for term in ["quantity", "amount", "price"]) and col_profile["inferred_type"] == "numeric":
            try:
                numeric_series = pd.to_numeric(df[col_profile["column_name"]], errors='coerce')
                invalid = numeric_series[numeric_series < 0]
                if len(invalid) > 0:
                    issues.append({
                        "type": "invalid_values",
                        "severity": "high",
                        "column": str(col_profile["column_name"]),
                        "issue": f"Negative values detected in '{col_profile['column_name']}'",
                        "affected_rows": int(len(invalid)),
                        "percentage_affected": round(len(invalid) / len(df) * 100, 2),
                        "recommended_action": "Investigate and correct negative values"
                    })
            except Exception:
                pass
        
        # Rating validation
        if "rating" in col_name and col_profile["inferred_type"] == "numeric":
            try:
                numeric_series = pd.to_numeric(df[col_profile["column_name"]], errors='coerce')
                invalid = numeric_series[(numeric_series < 1) | (numeric_series > 5)]
                if len(invalid) > 0:
                    issues.append({
                        "type": "invalid_values",
                        "severity": "medium",
                        "column": str(col_profile["column_name"]),
                        "issue": "Rating values outside expected range (1-5)",
                        "affected_rows": int(len(invalid)),
                        "percentage_affected": round(len(invalid) / len(df) * 100, 2),
                        "recommended_action": "Correct or remove invalid ratings"
                    })
            except Exception:
                pass
    
    return issues

def detect_constant_columns(profile):
    issues = []
    for col_profile in profile["column_profiles"]:
        if col_profile.get("is_constant"):
            issues.append({
                "type": "constant_column",
                "severity": "medium",
                "column": str(col_profile["column_name"]),
                "issue": f"Column '{col_profile['column_name']}' has only one value",
                "affected_rows": int(col_profile["total"]),
                "percentage_affected": 100.0,
                "recommended_action": "Consider removing this column as it provides no analytical value"
            })
    return issues

def detect_near_constant_columns(profile):
    issues = []
    for col_profile in profile["column_profiles"]:
        if col_profile.get("is_near_constant") and not col_profile.get("is_constant"):
            issues.append({
                "type": "near_constant_column",
                "severity": "low",
                "column": str(col_profile["column_name"]),
                "issue": f"Column '{col_profile['column_name']}' has very low variance",
                "affected_rows": int(col_profile["total"] - col_profile["unique"]),
                "percentage_affected": round((col_profile["total"] - col_profile["unique"]) / col_profile["total"] * 100, 2),
                "recommended_action": "Consider removing this column for most analysis tasks"
            })
    return issues

def detect_high_cardinality(df, profile):
    issues = []
    for col_profile in profile["column_profiles"]:
        if col_profile["inferred_type"] in ["text", "id_like"] and col_profile["unique_percentage"] > 50:
            issues.append({
                "type": "high_cardinality",
                "severity": "info",
                "column": str(col_profile["column_name"]),
                "issue": f"Column '{col_profile['column_name']}' has high cardinality",
                "affected_rows": int(col_profile["total"]),
                "percentage_affected": 100.0,
                "recommended_action": "Consider if this column is useful for analysis or if it should be excluded"
            })
    return issues