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
                        "model": "qwen/qwen3.6-27b",
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
    """Complete AI chat with Gemini and rule-based fallback."""

    import os
    import json
    import httpx
    import pandas as pd
    import numpy as np
    from datetime import datetime
    from bson import ObjectId

    file_path = f"uploads/{dataset_id}.pkl"

    if not os.path.exists(file_path):
        return {
            "query": query,
            "answer": "Dataset file not found.",
            "source": "error",
            "data": None,
            "chart_data": None
        }

    df = pd.read_pickle(file_path)
    query_lower = query.lower().strip()

    print(f"[CHAT DEBUG] Query: {query}")

    numeric_cols = df.select_dtypes(
        include=[np.number]
    ).columns.tolist()

    categorical_cols = df.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    context = {
        "dataset_name": "",
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": [
            str(col) for col in df.columns
        ],
        "numeric_columns": [
            str(col) for col in numeric_cols
        ],
        "categorical_columns": [
            str(col) for col in categorical_cols
        ]
    }

    # Get dataset name
    try:
        dataset_info = await db.datasets.find_one(
            {"_id": ObjectId(dataset_id)}
        )

        if dataset_info:
            context["dataset_name"] = dataset_info.get(
                "filename",
                ""
            )
    except Exception as e:
        print(f"[CHAT DEBUG] Dataset info error: {e}")

    response = {
        "query": query,
        "answer": "",
        "source": "rule-based",
        "data": None,
        "chart_data": None
    }

    async def save_response():
        await db.chat_history.insert_one({
            "dataset_id": dataset_id,
            "user_query": query,
            "response": response,
            "created_at": datetime.utcnow()
        })

        return response

    def find_column():
        for col in df.columns:
            col_name = str(col).lower()

            if col_name in query_lower:
                return col

        return None

    # =========================================================
    # GREETING
    # =========================================================

    if query_lower in [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening"
    ]:
        response["answer"] = (
            f"Hello! Ask me about "
            f"'{context['dataset_name']}'. "
            "I can help with rows, columns, averages, "
            "missing values, duplicates, statistics, "
            "and more."
        )

        return await save_response()

    # =========================================================
    # IDENTITY
    # =========================================================

    if any(word in query_lower for word in [
        "your name",
        "who are you",
        "what are you",
        "about you"
    ]):
        response["answer"] = (
            "I am DataDoctor AI's data analysis assistant. "
            "I analyze your dataset and answer questions "
            "about its data."
        )

        return await save_response()

    # =========================================================
    # THANKS
    # =========================================================

    if any(word in query_lower for word in [
        "thank",
        "thanks",
        "thx"
    ]):
        response["answer"] = (
            "You're welcome! Feel free to ask "
            "more questions about your dataset."
        )

        return await save_response()

    # =========================================================
    # BYE
    # =========================================================

    if any(word in query_lower for word in [
        "bye",
        "goodbye",
        "see you"
    ]):
        response["answer"] = (
            "Goodbye! Come back anytime to analyze your data."
        )

        return await save_response()

    # =========================================================
    # HELP
    # =========================================================

    if query_lower in [
        "help",
        "what can you do",
        "what can i ask"
    ]:
        response["answer"] = (
            "I can answer questions about:\n"
            "- Row and column counts\n"
            "- Average and median\n"
            "- Minimum and maximum\n"
            "- Missing values\n"
            "- Duplicate rows\n"
            "- Unique values\n"
            "- Top values\n"
            "- Column information\n"
            "- Dataset summary"
        )

        return await save_response()

    # =========================================================
    # DATASET NAME
    # =========================================================

    if any(word in query_lower for word in [
        "dataset name",
        "file name",
        "data name"
    ]):
        response["answer"] = (
            f"The dataset is named "
            f"'{context['dataset_name']}'."
        )

        return await save_response()

    # =========================================================
    # ROW COUNT
    # =========================================================

    if any(word in query_lower for word in [
        "how many rows",
        "how many row",
        "number of rows",
        "number of row",
        "total rows",
        "total row",
        "row count"
    ]):
        response["answer"] = (
            f"The dataset contains {len(df)} rows."
        )

        response["data"] = {
            "rows": int(len(df))
        }

        return await save_response()

    # =========================================================
    # COLUMN COUNT
    # =========================================================

    if any(word in query_lower for word in [
        "how many columns",
        "how many column",
        "number of columns",
        "number of column",
        "total columns",
        "total column",
        "column count"
    ]):
        response["answer"] = (
            f"The dataset has {len(df.columns)} columns: "
            f"{', '.join(map(str, df.columns.tolist()))}"
        )

        response["data"] = {
            "columns": [
                str(col) for col in df.columns
            ]
        }

        return await save_response()

    # =========================================================
    # MISSING VALUES
    # =========================================================

    if any(word in query_lower for word in [
        "missing",
        "null",
        "empty",
        "blank",
        "nan"
    ]):
        missing = df.isnull().sum()
        missing = missing[missing > 0]

        if len(missing) == 0:
            response["answer"] = (
                "No missing values were found."
            )

        else:
            details = []

            for col, count in missing.items():
                details.append(
                    f"{col}: {int(count)}"
                )

            response["answer"] = (
                "Missing values found:\n"
                + "\n".join(details)
            )

            response["data"] = {
                str(col): int(count)
                for col, count in missing.items()
            }

        return await save_response()

    # =========================================================
    # DUPLICATES
    # =========================================================

    if any(word in query_lower for word in [
        "duplicate",
        "duplicates"
    ]):
        duplicate_count = int(
            df.duplicated().sum()
        )

        response["answer"] = (
            f"Found {duplicate_count} duplicate rows."
        )

        response["data"] = {
            "duplicate_rows": duplicate_count
        }

        return await save_response()

    # =========================================================
    # AVERAGE
    # =========================================================

    if any(word in query_lower for word in [
        "average",
        "mean",
        "avg"
    ]):
        target = find_column()

        if target in numeric_cols:
            value = df[target].mean()

            response["answer"] = (
                f"The average {target} is "
                f"{value:.2f}."
            )

            response["data"] = {
                "column": str(target),
                "average": float(value)
            }

        elif numeric_cols:
            values = []

            for col in numeric_cols:
                value = df[col].mean()

                if pd.notna(value):
                    values.append(
                        f"{col}: {value:.2f}"
                    )

            response["answer"] = (
                "Average values:\n"
                + "\n".join(values)
            )

        else:
            response["answer"] = (
                "No numeric columns were found."
            )

        return await save_response()

    # =========================================================
    # MEDIAN
    # =========================================================

    if "median" in query_lower:
        target = find_column()

        if target in numeric_cols:
            value = df[target].median()

            response["answer"] = (
                f"The median {target} is "
                f"{value:.2f}."
            )

            response["data"] = {
                "column": str(target),
                "median": float(value)
            }

        else:
            response["answer"] = (
                "Please specify a numeric column "
                "for median calculation."
            )

        return await save_response()

    # =========================================================
    # MAXIMUM
    # =========================================================

    if any(word in query_lower for word in [
        "maximum",
        "highest",
        "largest",
        "max"
    ]):
        target = find_column()

        if target in numeric_cols:
            value = df[target].max()

            response["answer"] = (
                f"The maximum {target} is "
                f"{value:.2f}."
            )

            response["data"] = {
                "column": str(target),
                "maximum": float(value)
            }

        elif numeric_cols:
            values = []

            for col in numeric_cols:
                value = df[col].max()

                if pd.notna(value):
                    values.append(
                        f"{col}: {value:.2f}"
                    )

            response["answer"] = (
                "Maximum values:\n"
                + "\n".join(values)
            )

        else:
            response["answer"] = (
                "No numeric columns were found."
            )

        return await save_response()

    # =========================================================
    # MINIMUM
    # =========================================================

    if any(word in query_lower for word in [
        "minimum",
        "lowest",
        "smallest",
        "min"
    ]):
        target = find_column()

        if target in numeric_cols:
            value = df[target].min()

            response["answer"] = (
                f"The minimum {target} is "
                f"{value:.2f}."
            )

            response["data"] = {
                "column": str(target),
                "minimum": float(value)
            }

        elif numeric_cols:
            values = []

            for col in numeric_cols:
                value = df[col].min()

                if pd.notna(value):
                    values.append(
                        f"{col}: {value:.2f}"
                    )

            response["answer"] = (
                "Minimum values:\n"
                + "\n".join(values)
            )

        else:
            response["answer"] = (
                "No numeric columns were found."
            )

        return await save_response()

    # =========================================================
    # UNIQUE VALUES
    # =========================================================

    if any(word in query_lower for word in [
        "unique",
        "distinct"
    ]):
        target = find_column()

        if target is None:
            response["answer"] = (
                "Please specify a column name. "
                "For example: "
                "'How many unique values are in Gender?'"
            )

        else:
            count = int(
                df[target].nunique(dropna=True)
            )

            response["answer"] = (
                f"'{target}' has "
                f"{count} unique values."
            )

            response["data"] = {
                "column": str(target),
                "unique_count": count
            }

        return await save_response()

    # =========================================================
    # DATASET SUMMARY
    # =========================================================

    if any(word in query_lower for word in [
        "summary",
        "summarize",
        "overview",
        "describe"
    ]):
        missing_count = int(
            df.isnull().sum().sum()
        )

        duplicate_count = int(
            df.duplicated().sum()
        )

        response["answer"] = (
            f"Dataset: {context['dataset_name']}\n"
            f"Rows: {len(df)}\n"
            f"Columns: {len(df.columns)}\n"
            f"Numeric columns: "
            f"{', '.join(map(str, numeric_cols)) if numeric_cols else 'None'}\n"
            f"Categorical columns: "
            f"{', '.join(map(str, categorical_cols)) if categorical_cols else 'None'}\n"
            f"Missing values: {missing_count}\n"
            f"Duplicate rows: {duplicate_count}"
        )

        return await save_response()

    # =========================================================
    # GEMINI
    # =========================================================

    gemini_key = os.getenv("GEMINI_API_KEY", "")

    if gemini_key:
        try:
            numeric_stats = {}

            for col in numeric_cols[:10]:
                numeric_stats[str(col)] = {
                    "mean": (
                        float(df[col].mean())
                        if pd.notna(df[col].mean())
                        else None
                    ),
                    "min": (
                        float(df[col].min())
                        if pd.notna(df[col].min())
                        else None
                    ),
                    "max": (
                        float(df[col].max())
                        if pd.notna(df[col].max())
                        else None
                    )
                }

            prompt = f"""
You are DataDoctor AI, a data analysis assistant.

Dataset name:
{context["dataset_name"]}

Rows:
{len(df)}

Columns:
{", ".join(context["column_names"])}

Numeric columns:
{", ".join(context["numeric_columns"])}

Categorical columns:
{", ".join(context["categorical_columns"])}

Numeric statistics:
{json.dumps(numeric_stats, default=str)}

Missing values:
{int(df.isnull().sum().sum())}

Duplicate rows:
{int(df.duplicated().sum())}

Sample data:
{df.head(5).to_json(orient="records", default_handler=str)}

User question:
{query}

Answer concisely and only using the provided dataset information.
If the question is unrelated to dataset analysis, say:
"I cannot answer this question because it is not related to your dataset analysis."
"""

            async with httpx.AsyncClient(
                timeout=20.0
            ) as client:

                ai_response = await client.post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
                    params={"key": gemini_key},
                    headers={
                        "Content-Type": "application/json"
                    },
                    json={
                        "contents": [
                            {
                                "parts": [
                                    {
                                        "text": prompt
                                    }
                                ]
                            }
                        ]
                    }
                )

            print(
                f"[CHAT DEBUG] Gemini status: "
                f"{ai_response.status_code}"
            )

            if ai_response.status_code == 200:
                ai_data = ai_response.json()

                candidates = ai_data.get(
                    "candidates",
                    []
                )

                if candidates:
                    answer = (
                        candidates[0]
                        .get("content", {})
                        .get("parts", [{}])[0]
                        .get("text")
                    )

                    if answer:
                        response["answer"] = answer
                        response["source"] = "gemini"

                        return await save_response()

            else:
                print(
                    "[CHAT DEBUG] Gemini error: "
                    f"{ai_response.text[:500]}"
                )

        except Exception as e:
            print(
                f"[CHAT DEBUG] Gemini failed: {e}"
            )

    # =========================================================
    # FINAL FALLBACK
    # =========================================================

    data_words = [
        "row",
        "column",
        "data",
        "average",
        "mean",
        "median",
        "min",
        "max",
        "highest",
        "lowest",
        "missing",
        "duplicate",
        "unique",
        "value",
        "dataset",
        "table",
        "count",
        "group",
        "category",
        "price",
        "quantity",
        "order",
        "customer",
        "product"
    ]

    is_dataset_question = any(
        word in query_lower
        for word in data_words
    )

    if is_dataset_question:
        response["answer"] = (
            f"The dataset contains {len(df)} rows "
            f"and {len(df.columns)} columns. "
            "Please ask about a specific column "
            "or statistic."
        )
    else:
        response["answer"] = (
            "I can only answer questions related "
            "to your dataset analysis."
        )

    response["source"] = "fallback"

    return await save_response()
