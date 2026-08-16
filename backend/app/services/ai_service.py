# backend/app/services/ai_service.py
import os
import json
import httpx
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

async def generate_diagnosis(dataset, profile, issues):
    """Generate AI diagnosis using DeepSeek or fallback to rule-based"""
    
    # Prepare context for AI
    context = {
        "dataset_name": dataset.get("filename", "Unknown"),
        "rows": dataset.get("rows", 0),
        "columns": dataset.get("columns", 0),
        "health_score": dataset.get("health_score", 0),
        "issue_count": len(issues),
        "issues_summary": [
            {
                "type": i.get("type"),
                "severity": i.get("severity"),
                "column": i.get("column"),
                "description": i.get("issue"),
                "affected_rows": i.get("affected_rows"),
                "percentage": i.get("percentage_affected")
            }
            for i in issues[:10]  # Limit context
        ]
    }
    
    # Try AI diagnosis
    if DEEPSEEK_API_KEY and DEEPSEEK_API_KEY != "your-deepseek-api-key-here":
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    DEEPSEEK_API_URL,
                    headers={
                        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a data quality expert. Analyze the dataset statistics and provide a professional diagnosis. Only reference actual numbers from the provided context. Do not fabricate data."
                            },
                            {
                                "role": "user",
                                "content": f"Please diagnose this dataset based on the following metrics:\n\n{json.dumps(context, indent=2)}"
                            }
                        ],
                        "temperature": 0.3,
                        "max_tokens": 500
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    diagnosis = data["choices"][0]["message"]["content"]
                    return {
                        "diagnosis": diagnosis,
                        "source": "ai",
                        "model": "deepseek-chat"
                    }
        except Exception as e:
            print(f"AI diagnosis failed: {e}")
    
    # Fallback to rule-based diagnosis
    return generate_rule_based_diagnosis(context)

def generate_rule_based_diagnosis(context):
    """Generate rule-based diagnosis when AI is unavailable"""
    
    score = context["health_score"]
    issues = context["issues_summary"]
    
    diagnosis_parts = []
    
    if score >= 80:
        diagnosis_parts.append(f"Your dataset '{context['dataset_name']}' is generally healthy with a health score of {score}/100.")
    elif score >= 60:
        diagnosis_parts.append(f"Your dataset '{context['dataset_name']}' has moderate quality issues with a health score of {score}/100.")
    else:
        diagnosis_parts.append(f"Your dataset '{context['dataset_name']}' has significant quality problems with a health score of {score}/100.")
    
    diagnosis_parts.append(f"It contains {context['rows']} rows and {context['columns']} columns.")
    diagnosis_parts.append(f"We detected {context['issue_count']} data quality issues that need attention.")
    
    # Group issues by severity
    critical_issues = [i for i in issues if i["severity"] == "critical"]
    high_issues = [i for i in issues if i["severity"] == "high"]
    
    if critical_issues:
        diagnosis_parts.append(f"\n\nCritical Issues ({len(critical_issues)}):")
        for issue in critical_issues[:3]:
            diagnosis_parts.append(f"- {issue['description']} affecting {issue['affected_rows']} rows ({issue['percentage']}%)")
    
    if high_issues:
        diagnosis_parts.append(f"\nHigh Priority Issues ({len(high_issues)}):")
        for issue in high_issues[:3]:
            diagnosis_parts.append(f"- {issue['description']}")
    
    # Recommendations
    diagnosis_parts.append("\n\nRecommendations:")
    if any(i["type"] == "duplicate_ids" for i in critical_issues):
        diagnosis_parts.append("- Resolve duplicate ID issues immediately as they affect data integrity")
    if any(i["type"] == "missing_values" for i in issues):
        diagnosis_parts.append("- Address missing values using appropriate imputation strategies")
    if any(i["type"] == "type_mismatch" for i in issues):
        diagnosis_parts.append("- Convert columns to their proper data types for accurate analysis")
    if any(i["type"] == "outliers" for i in issues):
        diagnosis_parts.append("- Investigate outliers to determine if they represent errors or valid extreme values")
    
    return {
        "diagnosis": "\n".join(diagnosis_parts),
        "source": "rule-based",
        "model": None
    }

async def generate_insights(dataset_id, db):
    """Generate AI business insights"""
    
    # Get dataset info
    dataset = await db.datasets.find_one({"_id": __import__('bson').ObjectId(dataset_id)})
    eda = await db.analysis_results.find_one({"dataset_id": dataset_id, "type": "eda"})
    
    insights = {
        "dataset_id": dataset_id,
        "created_at": datetime.utcnow(),
        "key_findings": [],
        "trends": [],
        "anomalies": [],
        "relationships": [],
        "business_impact": [],
        "recommendations": []
    }
    
    # Extract key findings from EDA
    if eda:
        # Numerical insights
        for num in eda.get("numerical_analysis", [])[:5]:
            insights["key_findings"].append({
                "column": num["column"],
                "finding": f"Average {num['column']} is {num['stats']['mean']:.2f} with range {num['stats']['min']:.2f} to {num['stats']['max']:.2f}",
                "importance": "high"
            })
        
        # Correlation insights
        for corr in eda.get("correlation_analysis", {}).get("strong_correlations", [])[:5]:
            direction = "positive" if corr["correlation"] > 0 else "negative"
            strength = "strong" if abs(corr["correlation"]) > 0.7 else "moderate"
            insights["relationships"].append({
                "finding": f"{strength.capitalize()} {direction} correlation between {corr['col1']} and {corr['col2']}",
                "correlation": corr["correlation"],
                "importance": "high" if abs(corr["correlation"]) > 0.7 else "medium"
            })
    
    # Try AI insights
    if DEEPSEEK_API_KEY and DEEPSEEK_API_KEY != "your-deepseek-api-key-here":
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    DEEPSEEK_API_URL,
                    headers={
                        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a business intelligence analyst. Generate actionable business insights based on the provided data statistics. Only use actual numbers provided."
                            },
                            {
                                "role": "user",
                                "content": f"Generate business insights based on this data:\n\nDataset: {dataset.get('filename')}\nRows: {dataset.get('rows')}\nKey stats: {json.dumps(eda, default=str)[:1000]}"
                            }
                        ],
                        "temperature": 0.5,
                        "max_tokens": 800
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    insights["ai_insights"] = data["choices"][0]["message"]["content"]
                    insights["source"] = "ai"
        except:
            pass
    
    # Store insights
    await db.ai_insights.update_one(
        {"dataset_id": dataset_id, "type": "insights"},
        {"$set": insights},
        upsert=True
    )
    
    return insights

async def process_chat_query(dataset_id, query, db):
    """Process natural language query about dataset"""
    
    # Load dataset
    import pandas as pd
    import os
    
    file_path = f"uploads/{dataset_id}.pkl"
    if not os.path.exists(file_path):
        return {"error": "Dataset file not found"}
    
    df = pd.read_pickle(file_path)
    
    response = {
        "query": query,
        "answer": "",
        "data": None,
        "chart_data": None
    }
    
    query_lower = query.lower()
    
    # Handle different query types
    if "missing" in query_lower:
        missing = df.isnull().sum()
        missing = missing[missing > 0]
        if len(missing) > 0:
            response["answer"] = f"There are missing values in {len(missing)} columns."
            response["data"] = missing.to_dict()
        else:
            response["answer"] = "No missing values found in the dataset."
    
    elif "duplicate" in query_lower:
        dup_count = df.duplicated().sum()
        response["answer"] = f"Found {dup_count} duplicate rows in the dataset."
        response["data"] = {"duplicate_rows": int(dup_count)}
    
    elif "highest" in query_lower or "top" in query_lower or "maximum" in query_lower:
        # Find numeric columns
        numeric_cols = df.select_dtypes(include=['number']).columns
        for col in numeric_cols:
            if col.lower() in query_lower:
                top_idx = df[col].nlargest(10).index
                top_data = df.loc[top_idx][[col] + [c for c in df.columns if c != col][:3]]
                response["answer"] = f"Top 10 values for {col}:"
                response["data"] = top_data.to_dict('records')
                break
    
    elif "average" in query_lower or "mean" in query_lower:
        numeric_cols = df.select_dtypes(include=['number']).columns
        for col in numeric_cols:
            if col.lower() in query_lower:
                avg = df[col].mean()
                response["answer"] = f"The average {col} is {avg:.2f}"
                response["data"] = {"column": col, "average": float(avg)}
                break
    
    elif "month" in query_lower and "highest" in query_lower:
        # Try to find datetime column
        for col in df.columns:
            try:
                dates = pd.to_datetime(df[col], errors='coerce')
                if dates.notna().sum() > len(df) * 0.8:
                    df['month'] = dates.dt.month
                    monthly = df.groupby('month').size()
                    max_month = monthly.idxmax()
                    response["answer"] = f"Month {max_month} has the highest number of records ({monthly[max_month]} records)"
                    response["chart_data"] = {
                        "type": "bar",
                        "labels": monthly.index.tolist(),
                        "values": monthly.values.tolist()
                    }
                    break
            except:
                pass
    
    elif "count" in query_lower or "how many" in query_lower:
        response["answer"] = f"The dataset contains {len(df)} rows and {len(df.columns)} columns."
        response["data"] = {"rows": len(df), "columns": len(df.columns)}
    
    else:
        # General statistics
        response["answer"] = f"The dataset has {len(df)} rows and {len(df.columns)} columns. "
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
            response["answer"] += f"Numeric columns include: {', '.join(numeric_cols[:5])}. "
        cat_cols = df.select_dtypes(include=['object']).columns
        if len(cat_cols) > 0:
            response["answer"] += f"Categorical columns include: {', '.join(cat_cols[:5])}."
        response["data"] = {
            "rows": len(df),
            "columns": len(df.columns),
            "numeric_columns": list(numeric_cols)[:10],
            "categorical_columns": list(cat_cols)[:10]
        }
    
    # Store chat history
    await db.chat_history.insert_one({
        "dataset_id": dataset_id,
        "user_query": query,
        "response": response,
        "created_at": datetime.utcnow()
    })
    
    return response