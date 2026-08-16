import pandas as pd
import numpy as np
import os
import json
import httpx
import re
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
HF_API_KEY = os.getenv("HF_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def analyze_column_and_suggest(df, column_name):
    """Analyze column and suggest best cleaning operation (rule-based)"""
    
    col_data = df[column_name]
    col_lower = column_name.lower().strip()
    suggestions = []
    
    missing_count = int(col_data.isnull().sum())
    missing_pct = (missing_count / len(df)) * 100 if len(df) > 0 else 0
    unique_count = int(col_data.nunique())
    dtype = str(col_data.dtype)
    
    # Pattern detection
    is_id = any(pattern in col_lower for pattern in [
        'id', 'uuid', 'guid', 'key', 'code', 'number', 'no',
        'customer', 'cust', 'order', 'product', 'prod', 'user',
        'account', 'employee', 'emp', 'student', 'roll', 'serial',
        'sku', 'barcode', 'phone', 'mobile', 'aadhar', 'pan',
        'passport', 'license', 'registration', 'reg', 'policy',
        'claim', 'ticket', 'booking', 'reservation', 'invoice',
        'reference', 'ref', 'transaction'
    ])
    
    is_date = any(pattern in col_lower for pattern in [
        'date', 'time', 'datetime', 'timestamp', 'created', 'updated',
        'dob', 'birth', 'joined', 'expiry', 'valid', 'month', 'year',
        'day', 'period', 'week', 'quarter'
    ])
    
    is_categorical = any(pattern in col_lower for pattern in [
        'status', 'type', 'category', 'cat', 'group', 'class', 'level',
        'grade', 'gender', 'sex', 'method', 'mode', 'payment', 'pay',
        'currency', 'country', 'state', 'city', 'region', 'zone',
        'district', 'department', 'dept', 'designation', 'role',
        'title', 'position', 'segment', 'tier', 'plan', 'package',
        'channel', 'source', 'brand', 'color', 'size', 'style',
        'model', 'version', 'variant', 'flavor'
    ])
    
    if missing_count > 0:
        if is_id:
            suggestions.append({
                "operation": "fill_missing",
                "method": "forward_fill",
                "reason": f"'{column_name}' is ID column with {missing_count} missing values. Forward fill keeps IDs sequential.",
                "priority": "high"
            })
        elif is_date:
            suggestions.append({
                "operation": "fill_missing",
                "method": "forward_fill",
                "reason": f"'{column_name}' is date column with {missing_count} missing values. Forward fill maintains chronological order.",
                "priority": "high"
            })
        elif is_categorical:
            mode_val = col_data.mode()
            mode_str = str(mode_val[0]) if len(mode_val) > 0 else "Unknown"
            suggestions.append({
                "operation": "fill_missing",
                "method": "mode",
                "reason": f"'{column_name}' has {missing_count} missing values. Fill with mode value '{mode_str}'.",
                "priority": "high"
            })
        else:
            suggestions.append({
                "operation": "fill_missing",
                "method": "mean",
                "reason": f"'{column_name}' has {missing_count} missing values ({missing_pct:.1f}%). Mean imputation works well.",
                "priority": "medium"
            })
    
    if is_id and unique_count < len(col_data.dropna()):
        dup_count = len(col_data.dropna()) - unique_count
        suggestions.append({
            "operation": "remove_duplicates",
            "method": None,
            "reason": f"'{column_name}' has {dup_count} duplicate values. Remove duplicates to ensure uniqueness.",
            "priority": "critical" if dup_count > 5 else "high"
        })
    
    if is_categorical and col_data.dtype == 'object':
        non_null = col_data.dropna().astype(str)
        unique_original = set(non_null)
        unique_normalized = set(non_null.str.lower().str.strip())
        if len(unique_original) > len(unique_normalized):
            suggestions.append({
                "operation": "normalize_categories",
                "method": None,
                "reason": f"'{column_name}' has inconsistent values (case/whitespace). Normalize for consistency.",
                "priority": "medium"
            })
    
    return suggestions

def parse_ai_response_to_structured(ai_text, df):
    """Parse AI text response into structured column suggestions"""
    
    column_suggestions = []
    
    for col in df.columns:
        col_lower = col.lower()
        col_suggestions = []
        
        # Check if AI mentions this column
        if col_lower in ai_text.lower() or col in ai_text:
            # Check for missing values mention
            if 'missing' in ai_text.lower() or 'null' in ai_text.lower():
                if col_lower in ai_text.lower():
                    # Determine best method based on column type
                    method = 'forward_fill'
                    if any(pattern in col_lower for pattern in ['status', 'type', 'category', 'method', 'payment']):
                        method = 'mode'
                    elif any(pattern in col_lower for pattern in ['price', 'amount', 'quantity', 'salary']):
                        method = 'mean'
                    
                    col_suggestions.append({
                        "operation": "fill_missing",
                        "method": method,
                        "reason": f"AI suggests filling missing values in '{col}' using {method.replace('_', ' ')}.",
                        "priority": "high"
                    })
            
            # Check for duplicate mention
            if 'duplicate' in ai_text.lower():
                if col_lower in ai_text.lower():
                    col_suggestions.append({
                        "operation": "remove_duplicates",
                        "method": None,
                        "reason": f"AI suggests removing duplicates in '{col}'.",
                        "priority": "high"
                    })
            
            # Check for normalization mention
            if 'normaliz' in ai_text.lower():
                if col_lower in ai_text.lower():
                    col_suggestions.append({
                        "operation": "normalize_categories",
                        "method": None,
                        "reason": f"AI suggests normalizing '{col}' values.",
                        "priority": "medium"
                    })
        
        # If no AI suggestions, use rule-based
        if not col_suggestions:
            col_suggestions = analyze_column_and_suggest(df, col)
        
        if col_suggestions:
            column_suggestions.append({
                "column": col,
                "suggestions": col_suggestions
            })
    
    return column_suggestions

async def get_ai_suggestions(df, issues):
    """Get AI suggestions using free APIs or rule-based"""
    
    # Prepare context
    sample_data = df.head(20).to_dict('records')
    column_info = []
    
    for col in df.columns:
        col_info = {
            "name": col,
            "dtype": str(df[col].dtype),
            "missing": int(df[col].isnull().sum()),
            "unique": int(df[col].nunique()),
            "sample_values": df[col].dropna().head(5).tolist()
        }
        column_info.append(col_info)
    
    # Try Groq first
    if GROQ_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a data cleaning expert. Analyze columns and suggest specific cleaning operations."
                            },
                            {
                                "role": "user",
                                "content": f"Suggest cleaning operations for:\n{json.dumps(column_info, default=str)[:2000]}"
                            }
                        ],
                        "temperature": 0.3,
                        "max_tokens": 500
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    ai_text = data["choices"][0]["message"]["content"]
                    
                    # Parse AI response into structured format
                    column_suggestions = parse_ai_response_to_structured(ai_text, df)
                    
                    return {
                        "source": "ai",
                        "model": "groq-llama-3.3-70b",
                        "suggestions": ai_text,
                        "column_suggestions": column_suggestions
                    }
        except Exception as e:
            print(f"Groq failed: {e}")
    
    # Rule-based fallback
    column_suggestions = []
    for col in df.columns:
        suggestions = analyze_column_and_suggest(df, col)
        if suggestions:
            column_suggestions.append({
                "column": col,
                "suggestions": suggestions
            })
    
    return {
        "source": "rule-based",
        "suggestions": "Smart recommendations based on column name and data analysis:",
        "column_suggestions": column_suggestions
    }

async def get_dataset_suggestions(dataset_id, db):
    """Get cleaning suggestions for dataset"""
    
    file_path = f"uploads/{dataset_id}.pkl"
    if not os.path.exists(file_path):
        raise Exception("Dataset file not found")
    
    df = pd.read_pickle(file_path)
    issues = await db.data_quality_issues.find({"dataset_id": dataset_id}).to_list(None)
    
    suggestions = await get_ai_suggestions(df, issues)
    return suggestions