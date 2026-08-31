import pandas as pd
import numpy as np
import re as re_module
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
    """Detect missing values"""
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
                "issue": f"Missing values in '{col_profile['column_name']}'",
                "affected_rows": int(col_profile["missing"]),
                "percentage_affected": float(pct),
                "recommended_action": "Fill missing values with appropriate method (mean, mode, forward fill, etc.)"
            })
    return issues

def detect_duplicates(df):
    """Detect duplicate rows"""
    issues = []
    
    # Exact duplicates
    duplicate_count = int(df.duplicated().sum())
    if duplicate_count > 0:
        pct = round(duplicate_count / len(df) * 100, 2) if len(df) > 0 else 0
        severity = "medium"
        if pct > 20:
            severity = "critical"
        elif pct > 10:
            severity = "high"
        
        issues.append({
            "type": "duplicates",
            "severity": severity,
            "column": "all",
            "issue": f"Duplicate rows detected ({duplicate_count} exact duplicates)",
            "affected_rows": duplicate_count,
            "percentage_affected": float(pct),
            "recommended_action": "Remove duplicate rows"
        })
    
    # Case-insensitive duplicates
    try:
        df_copy = df.copy()
        for col in df_copy.columns:
            if df_copy[col].dtype == 'object':
                df_copy[col] = df_copy[col].astype(str).str.lower().str.strip()
        
        fuzzy_dup_count = int(df_copy.duplicated().sum())
        new_dups = fuzzy_dup_count - duplicate_count
        
        if new_dups > 0:
            pct = round(new_dups / len(df) * 100, 2) if len(df) > 0 else 0
            issues.append({
                "type": "duplicates",
                "severity": "medium",
                "column": "all",
                "issue": f"Near-duplicate rows detected (case/whitespace differences) - {new_dups} rows",
                "affected_rows": new_dups,
                "percentage_affected": float(pct),
                "recommended_action": "Normalize case and whitespace, then remove duplicates"
            })
    except Exception:
        pass
    
    # Duplicate ID check
    for col in df.columns:
        if 'id' in str(col).lower():
            dup_ids = int(df[col].duplicated().sum())
            if dup_ids > 0:
                issues.append({
                    "type": "duplicate_ids",
                    "severity": "critical",
                    "column": str(col),
                    "issue": f"Duplicate values in ID column '{col}'",
                    "affected_rows": dup_ids,
                    "percentage_affected": round(dup_ids / len(df) * 100, 2) if len(df) > 0 else 0,
                    "recommended_action": "Resolve duplicate IDs"
                })
    
    return issues

def detect_type_problems(df, profile):
    """Detect data type mismatches"""
    issues = []
    for col_profile in profile["column_profiles"]:
        if col_profile["inferred_type"] == "numeric" and col_profile["dtype"] == "object":
            issues.append({
                "type": "type_mismatch",
                "severity": "high",
                "column": str(col_profile["column_name"]),
                "issue": f"Column '{col_profile['column_name']}' has numeric values stored as text",
                "affected_rows": int(col_profile["total"]),
                "percentage_affected": 100.0,
                "recommended_action": "Convert column to numeric type"
            })
        
        # Age column with decimals
        col_name = str(col_profile["column_name"]).lower()
        if col_name == 'age':
            if col_profile["inferred_type"] == "numeric":
                try:
                    col = col_profile["column_name"]
                    non_null = df[col].dropna()
                    decimals = non_null[non_null != non_null.round()]
                    if len(decimals) > 0:
                        issues.append({
                            "type": "type_mismatch",
                            "severity": "medium",
                            "column": str(col),
                            "issue": f"Age column has decimal values ({len(decimals)} rows)",
                            "affected_rows": int(len(decimals)),
                            "percentage_affected": round(len(decimals) / len(df) * 100, 2) if len(df) > 0 else 0,
                            "recommended_action": "Round age values to whole numbers"
                        })
                except Exception:
                    pass
    
    return issues

def detect_category_inconsistencies(df, profile):
    """Detect category inconsistencies (case/whitespace)"""
    issues = []
    for col_profile in profile["column_profiles"]:
        if col_profile["inferred_type"] == "categorical" or col_profile["dtype"] == "object":
            col = col_profile["column_name"]
            try:
                series = df[col].dropna().astype(str)
                unique_original = set(series)
                unique_normalized = set(series.str.lower().str.strip())
                
                if len(unique_original) > len(unique_normalized):
                    issues.append({
                        "type": "category_inconsistency",
                        "severity": "medium",
                        "column": str(col),
                        "issue": f"Inconsistent categories in '{col}' (case/whitespace differences)",
                        "affected_rows": int(len(unique_original) - len(unique_normalized)),
                        "percentage_affected": round((len(unique_original) - len(unique_normalized)) / len(unique_original) * 100, 2) if len(unique_original) > 0 else 0,
                        "recommended_action": "Normalize categories (trim whitespace, standardize case)"
                    })
            except Exception:
                pass
    return issues

def detect_outliers(df, profile):
    """Detect outliers using IQR method"""
    issues = []
    for col_profile in profile["column_profiles"]:
        if col_profile["inferred_type"] == "numeric":
            col = col_profile["column_name"]
            try:
                series = pd.to_numeric(df[col], errors='coerce').dropna()
                
                # Skip binary columns
                if series.nunique() <= 2:
                    continue
                
                if len(series) > 0:
                    q1 = series.quantile(0.25)
                    q3 = series.quantile(0.75)
                    iqr = q3 - q1
                    
                    if iqr == 0:
                        continue
                    
                    lower = q1 - 1.5 * iqr
                    upper = q3 + 1.5 * iqr
                    outliers = series[(series < lower) | (series > upper)]
                    
                    if len(outliers) > 0:
                        issues.append({
                            "type": "outliers",
                            "severity": "low",
                            "column": str(col),
                            "issue": f"Outliers detected in '{col}' ({len(outliers)} values outside IQR range)",
                            "affected_rows": int(len(outliers)),
                            "percentage_affected": round(len(outliers) / len(series) * 100, 2),
                            "recommended_action": "Investigate outliers or apply capping"
                        })
            except Exception:
                pass
    return issues

def detect_invalid_values(df, profile):
    """Detect invalid values"""
    issues = []
    
    for col_profile in profile["column_profiles"]:
        col_name = str(col_profile["column_name"]).lower()
        col = col_profile["column_name"]
        
        # Email validation
        if 'email' in col_name or 'mail' in col_name:
            try:
                email_pattern = re_module.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
                non_null = df[col].dropna().astype(str)
                invalid_emails = non_null[~non_null.str.match(email_pattern)]
                
                if len(invalid_emails) > 0:
                    issues.append({
                        "type": "invalid_values",
                        "severity": "high",
                        "column": str(col),
                        "issue": f"Invalid email format in '{col}'",
                        "affected_rows": int(len(invalid_emails)),
                        "percentage_affected": round(len(invalid_emails) / len(df) * 100, 2) if len(df) > 0 else 0,
                        "recommended_action": "Correct invalid email addresses"
                    })
            except Exception:
                pass
        
        # Negative age check
        if col_name == 'age':
            try:
                numeric_series = pd.to_numeric(df[col], errors='coerce')
                invalid = numeric_series[numeric_series < 0]
                if len(invalid) > 0:
                    issues.append({
                        "type": "invalid_values",
                        "severity": "high",
                        "column": str(col),
                        "issue": f"Negative age values in '{col}'",
                        "affected_rows": int(len(invalid)),
                        "percentage_affected": round(len(invalid) / len(df) * 100, 2),
                        "recommended_action": "Correct negative age values"
                    })
            except Exception:
                pass
        
        # Negative quantity/amount check
        if any(term in col_name for term in ['quantity', 'qty', 'amount', 'price', 'sales']):
            try:
                numeric_series = pd.to_numeric(df[col], errors='coerce')
                invalid = numeric_series[numeric_series < 0]
                if len(invalid) > 0:
                    issues.append({
                        "type": "invalid_values",
                        "severity": "high",
                        "column": str(col),
                        "issue": f"Negative values in '{col}'",
                        "affected_rows": int(len(invalid)),
                        "percentage_affected": round(len(invalid) / len(df) * 100, 2),
                        "recommended_action": "Correct negative values"
                    })
            except Exception:
                pass
    
    return issues

def detect_constant_columns(profile):
    """Detect constant columns (only one value)"""
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
                "recommended_action": "Consider removing this column"
            })
    return issues

def detect_near_constant_columns(profile):
    """Detect near-constant columns"""
    issues = []
    for col_profile in profile["column_profiles"]:
        if col_profile.get("is_near_constant") and not col_profile.get("is_constant"):
            issues.append({
                "type": "near_constant_column",
                "severity": "low",
                "column": str(col_profile["column_name"]),
                "issue": f"Column '{col_profile['column_name']}' has very low variance",
                "affected_rows": int(col_profile["total"]),
                "percentage_affected": 100.0,
                "recommended_action": "Consider removing this column"
            })
    return issues

def detect_high_cardinality(df, profile):
    """Detect high cardinality - informational only"""
    from app.services.column_type_service import column_type_service
    
    issues = []
    for col_profile in profile["column_profiles"]:
        col_name = col_profile["column_name"]
        
        try:
            semantic_type = column_type_service.detect_semantic_type(df, col_name)
        except:
            semantic_type = col_profile.get("inferred_type", "other")
        
        # Skip identifier columns
        if semantic_type == "identifier":
            continue
        
        # Only flag text columns with high cardinality
        if semantic_type == "text" and col_profile["unique_percentage"] > 80:
            issues.append({
                "type": "high_cardinality",
                "severity": "info",
                "column": str(col_name),
                "issue": f"Column '{col_name}' has high cardinality ({col_profile['unique_percentage']}% unique)",
                "affected_rows": 0,
                "percentage_affected": 0,
                "recommended_action": "Informational only",
                "is_informational": True
            })
    return issues