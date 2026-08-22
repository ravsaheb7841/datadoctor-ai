from pathlib import Path
import re

path = Path("app/services/ai_service.py")
content = path.read_text(encoding="utf-8")

start = content.find("async def process_chat_query")

if start == -1:
    print("ERROR: process_chat_query not found")
    raise SystemExit(1)

next_defs = [
    m.start()
    for m in re.finditer(r"^async def ", content, re.MULTILINE)
]

end = None

for pos in next_defs:
    if pos > start:
        end = pos
        break

if end is None:
    end = len(content)

new_function = '''async def process_chat_query(dataset_id, query, db):
    """Process natural language query using Gemini AI."""

    import pandas as pd
    import numpy as np
    import os
    import json
    import httpx
    from datetime import datetime
    from bson import ObjectId

    file_path = f"uploads/{dataset_id}.pkl"

    if not os.path.exists(file_path):
        return {"error": "Dataset file not found"}

    df = pd.read_pickle(file_path)
    query_lower = query.lower().strip()

    print(f"[CHAT DEBUG] process_chat_query query: {query}")

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(include=["object"]).columns.tolist()

    context = {
        "dataset_name": "",
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": [str(col) for col in df.columns],
        "numeric_columns": [str(col) for col in numeric_cols],
        "categorical_columns": [str(col) for col in cat_cols],
        "sample_data": df.head(5).to_dict("records"),
        "numeric_stats": {}
    }

    try:
        dataset_info = await db.datasets.find_one(
            {"_id": ObjectId(dataset_id)}
        )

        if dataset_info:
            context["dataset_name"] = dataset_info.get(
                "filename", ""
            )
    except Exception:
        pass

    for col in numeric_cols[:10]:
        try:
            mean_value = df[col].mean()
            max_value = df[col].max()
            min_value = df[col].min()

            context["numeric_stats"][str(col)] = {
                "mean": float(mean_value) if pd.notna(mean_value) else None,
                "max": float(max_value) if pd.notna(max_value) else None,
                "min": float(min_value) if pd.notna(min_value) else None
            }
        except Exception:
            pass

    missing_series = df.isnull().sum()
    context["missing_values"] = {
        str(k): int(v)
        for k, v in missing_series[missing_series > 0].items()
    }

    context["duplicate_rows"] = int(df.duplicated().sum())

    # GEMINI AI
    gemini_key = os.getenv("GEMINI_API_KEY", "")

    if gemini_key:
        try:
            prompt = f"""You are a data analysis assistant.

Dataset: {context["dataset_name"]}
Rows: {context["rows"]}
Columns: {context["columns"]}
Column names: {", ".join(context["column_names"])}
Numeric columns: {", ".join(context["numeric_columns"]) if context["numeric_columns"] else "None"}

Numeric stats:
{json.dumps(context["numeric_stats"], default=str)[:800]}

Missing values:
{json.dumps(context["missing_values"], default=str)}

Duplicates:
{context["duplicate_rows"]}

Sample data:
{json.dumps(context["sample_data"], default=str)[:800]}

User question:
{query}

Answer directly and concisely using only the provided data."""

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={gemini_key}",
                    headers={
                        "Content-Type": "application/json"
                    },
                    json={
                        "contents": [
                            {
                                "parts": [
                                    {"text": prompt}
                                ]
                            }
                        ]
                    }
                )

                if response.status_code == 200:
                    data = response.json()

                    answer = data["candidates"][0]["content"]["parts"][0]["text"]

                    result = {
                        "query": query,
                        "answer": answer,
                        "source": "gemini",
                        "data": None,
                        "chart_data": None
                    }

                    await db.chat_history.insert_one({
                        "dataset_id": dataset_id,
                        "user_query": query,
                        "response": result,
                        "created_at": datetime.utcnow()
                    })

                    return result

                print(
                    f"[CHAT DEBUG] Gemini error: "
                    f"{response.status_code}"
                )
                print(
                    f"[CHAT DEBUG] Gemini response: "
                    f"{response.text[:500]}"
                )

        except Exception as e:
            print(f"[CHAT DEBUG] Gemini failed: {e}")

    # RULE-BASED FALLBACK
    answer = ""

    if query_lower in ["hi", "hello", "hey"]:
        answer = (
            "Hello! Ask me about your dataset - rows, columns, "
            "averages, missing values, etc."
        )

    elif "how many row" in query_lower:
        answer = f"The dataset contains {len(df)} rows."

    elif "how many column" in query_lower:
        answer = (
            f"The dataset has {len(df.columns)} columns: "
            f"{', '.join(map(str, df.columns.tolist()))}"
        )

    elif "missing" in query_lower:
        missing_count = int(df.isnull().sum().sum())
        answer = f"Found {missing_count} missing values."

    elif "duplicate" in query_lower:
        answer = (
            f"Found {int(df.duplicated().sum())} duplicate rows."
        )

    elif "average" in query_lower or "mean" in query_lower:
        target = None

        for col in numeric_cols:
            if str(col).lower() in query_lower:
                target = col
                break

        if target:
            answer = (
                f"The average {target} is "
                f"{df[target].mean():.2f}."
            )
        elif numeric_cols:
            answer = (
                "Average values: "
                + ", ".join(
                    f"{col}={df[col].mean():.2f}"
                    for col in numeric_cols[:5]
                )
            )
        else:
            answer = "No numeric columns found."

    elif (
        "name" in query_lower
        and (
            "dataset" in query_lower
            or "file" in query_lower
        )
    ):
        answer = (
            f"The dataset is named "
            f"'{context['dataset_name']}'."
        )

    else:
        answer = (
            f"The dataset has {len(df)} rows and "
            f"{len(df.columns)} columns."
        )

    result = {
        "query": query,
        "answer": answer,
        "source": "rule-based",
        "data": None,
        "chart_data": None
    }

    await db.chat_history.insert_one({
        "dataset_id": dataset_id,
        "user_query": query,
        "response": result,
        "created_at": datetime.utcnow()
    })

    return result
'''

content = content[:start] + new_function + content[end:]

path.write_text(content, encoding="utf-8")

print("process_chat_query completely rewritten with Gemini")
print("Backup created: app/services/ai_service.py.backup")
