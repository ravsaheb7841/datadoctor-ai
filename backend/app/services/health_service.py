import pandas as pd
import numpy as np

def safe_int(value):
    """Convert numpy int to Python int"""
    if isinstance(value, (np.integer,)):
        return int(value)
    return value

async def calculate_health_score(df, profile):
    """Calculate data health score (0-100)"""
    
    scores = {}
    details = {}
    
    # 1. Completeness Score (30 points)
    completeness = calculate_completeness(df, profile)
    scores["completeness"] = int(completeness)
    details["completeness"] = {
        "score": int(completeness),
        "max_score": 30,
        "details": f"{int(completeness)}/30 - Based on missing value percentage"
    }
    
    # 2. Validity Score (20 points)
    validity = calculate_validity(df, profile)
    scores["validity"] = int(validity)
    details["validity"] = {
        "score": int(validity),
        "max_score": 20,
        "details": f"{int(validity)}/20 - Based on data type and value validity"
    }
    
    # 3. Consistency Score (20 points)
    consistency = calculate_consistency(df, profile)
    scores["consistency"] = int(consistency)
    details["consistency"] = {
        "score": int(consistency),
        "max_score": 20,
        "details": f"{int(consistency)}/20 - Based on category and format consistency"
    }
    
    # 4. Uniqueness Score (15 points)
    uniqueness = calculate_uniqueness(df, profile)
    scores["uniqueness"] = int(uniqueness)
    details["uniqueness"] = {
        "score": int(uniqueness),
        "max_score": 15,
        "details": f"{int(uniqueness)}/15 - Based on duplicate rows and IDs"
    }
    
    # 5. Integrity Score (15 points)
    integrity = calculate_integrity(df, profile)
    scores["integrity"] = int(integrity)
    details["integrity"] = {
        "score": int(integrity),
        "max_score": 15,
        "details": f"{int(integrity)}/15 - Based on relationships and constraints"
    }
    
    total_score = int(round(sum(scores.values())))
    
    # Generate strengths and warnings
    strengths = []
    warnings = []
    
    if completeness >= 27:
        strengths.append("Excellent data completeness with minimal missing values")
    elif completeness < 15:
        warnings.append("High percentage of missing values detected")
    
    if validity >= 18:
        strengths.append("Strong data type consistency and valid values")
    elif validity < 10:
        warnings.append("Multiple data type and validity issues detected")
    
    if consistency >= 18:
        strengths.append("High category and format consistency")
    elif consistency < 10:
        warnings.append("Significant category inconsistencies found")
    
    if uniqueness >= 13:
        strengths.append("Good data uniqueness with few duplicates")
    elif uniqueness < 8:
        warnings.append("High duplicate rate detected")
    
    if integrity >= 13:
        strengths.append("Data integrity constraints are well-maintained")
    elif integrity < 8:
        warnings.append("Data integrity issues found")
    
    return {
        "score": total_score,
        "scores": scores,
        "details": details,
        "strengths": strengths,
        "warnings": warnings,
        "interpretation": interpret_score(total_score)
    }

def calculate_completeness(df, profile):
    """Calculate completeness score (30 points)"""
    total_cells = len(df) * len(df.columns)
    missing_cells = int(df.isnull().sum().sum())
    missing_pct = missing_cells / total_cells if total_cells > 0 else 0
    
    if missing_pct == 0:
        return 30
    elif missing_pct < 0.01:
        return 28
    elif missing_pct < 0.05:
        return 25
    elif missing_pct < 0.10:
        return 20
    elif missing_pct < 0.20:
        return 15
    elif missing_pct < 0.30:
        return 10
    elif missing_pct < 0.50:
        return 5
    else:
        return 0

def calculate_validity(df, profile):
    """Calculate validity score (20 points)"""
    score = 20
    issues = 0
    
    for col_profile in profile["column_profiles"]:
        col = col_profile["column_name"]
        
        # Check for numeric values stored as strings
        if col_profile["inferred_type"] == "numeric" and col_profile["dtype"] == "object":
            issues += 2
        
        # Check for invalid values in numeric columns
        if col_profile["inferred_type"] == "numeric" and col_profile.get("outlier_percentage", 0) > 20:
            issues += 1
        
        # Check for impossible values
        if col_profile["column_name"].lower() in ["age"]:
            min_val = col_profile.get("min", 0)
            max_val = col_profile.get("max", 0)
            if min_val is not None and min_val < 0:
                issues += 1
            if max_val is not None and max_val > 120:
                issues += 1
    
    score -= issues * 2
    return max(0, min(20, score))

def calculate_consistency(df, profile):
    """Calculate consistency score (20 points)"""
    score = 20
    issues = 0
    
    for col_profile in profile["column_profiles"]:
        if col_profile["inferred_type"] == "categorical":
            # Check for case inconsistencies
            series = df[col_profile["column_name"]].dropna().astype(str)
            if series.str.islower().any() and series.str.isupper().any():
                issues += 1
            
            # Check for whitespace inconsistencies
            if series.str.startswith(' ').any() or series.str.endswith(' ').any():
                issues += 1
    
    score -= issues * 2
    return max(0, min(20, score))

def calculate_uniqueness(df, profile):
    """Calculate uniqueness score (15 points)"""
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = duplicate_rows / len(df) if len(df) > 0 else 0
    
    if duplicate_pct == 0:
        return 15
    elif duplicate_pct < 0.01:
        return 13
    elif duplicate_pct < 0.05:
        return 10
    elif duplicate_pct < 0.10:
        return 7
    elif duplicate_pct < 0.20:
        return 4
    else:
        return 1

def calculate_integrity(df, profile):
    """Calculate integrity score (15 points)"""
    score = 15
    issues = 0
    
    # Check for negative values where they shouldn't be
    for col_profile in profile["column_profiles"]:
        if col_profile["inferred_type"] == "numeric":
            col_name = col_profile["column_name"].lower()
            if any(term in col_name for term in ["age", "quantity", "amount", "price", "count"]):
                min_val = col_profile.get("min", 0)
                if min_val is not None and min_val < 0:
                    issues += 2
    
    # Check for constant columns
    constant_cols = sum(1 for cp in profile["column_profiles"] if cp.get("is_constant"))
    if constant_cols > 0:
        issues += constant_cols
    
    score -= issues * 2
    return max(0, min(15, score))

def interpret_score(score):
    """Provide interpretation of health score"""
    if score >= 90:
        return "Excellent - Your data is in great shape!"
    elif score >= 75:
        return "Good - Minor issues detected that can be easily fixed"
    elif score >= 60:
        return "Fair - Several quality issues need attention"
    elif score >= 40:
        return "Poor - Significant data quality problems detected"
    else:
        return "Critical - Data requires major cleaning and validation"