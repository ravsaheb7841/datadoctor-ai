from pathlib import Path
import re

path = Path("app/services/ai_service.py")
content = path.read_text(encoding="utf-8")

start_marker = "    # RULE-BASED FALLBACK"
start = content.find(start_marker)

if start == -1:
    print("ERROR: RULE-BASED FALLBACK section not found")
    raise SystemExit(1)

# Find the existing history insert + return response at the end of fallback
end_marker = '''    await db.chat_history.insert_one({
        "dataset_id": dataset_id,
        "user_query": query,
        "response": response,
        "created_at": datetime.utcnow()
    })
    
    return response'''

end = content.find(end_marker, start)

if end == -1:
    print("ERROR: End of fallback section not found")
    raise SystemExit(1)

end += len(end_marker)

new_fallback = '''    # RULE-BASED FALLBACK (comprehensive)
    print(f"[CHAT DEBUG] Using rule-based fallback for: {query}")
    
    response = {
        "query": query,
        "answer": "",
        "source": "rule-based",
        "data": None,
        "chart_data": None
    }
    
    # GREETING
    if query_lower in ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]:
        response["answer"] = (
            "Hello! I can help you analyze this dataset. "
            "Try asking:\\n"
            "- How many rows are in the dataset?\\n"
            "- What is the average of Unit_Price?\\n"
            "- Which column has the highest value?\\n"
            "- What are the top 5 values?\\n"
            "- Are there missing values or duplicates?"
        )

    elif "who are you" in query_lower or "what are you" in query_lower:
        response["answer"] = (
            "I am DataDoctor AI's data analysis assistant. "
            "I can answer questions about your dataset such as statistics, "
            "missing values, duplicates, and data quality."
        )

    elif "name" in query_lower and (
        "dataset" in query_lower or
        "file" in query_lower or
        "data" in query_lower
    ):
        dataset_info = await db.datasets.find_one({"_id": ObjectId(dataset_id)})

        if dataset_info:
            response["answer"] = (
                f"The dataset is named "
                f"'{dataset_info.get('filename', 'Unknown')}'."
            )
        else:
            response["answer"] = "Dataset information not found."

    elif "clean" in query_lower:
        active_issues_count = len(context.get("active_issues", []))

        response["answer"] = (
            f"There are {active_issues_count} active data quality issues. "
            f"Go to Cleaning Center to fix them. Common operations include "
            f"filling missing values, removing duplicates, and handling outliers."
        )

    elif (
        "row" in query_lower and
        (
            "how many" in query_lower or
            "count" in query_lower or
            "number" in query_lower
        )
    ):
        response["answer"] = f"The dataset contains {len(df)} rows."

    elif (
        "column" in query_lower and
        (
            "how many" in query_lower or
            "count" in query_lower or
            "number" in query_lower
        )
    ):
        response["answer"] = (
            f"The dataset has {len(df.columns)} columns: "
            f"{', '.join(map(str, df.columns.tolist()))}"
        )

    elif (
        "missing" in query_lower or
        "null" in query_lower or
        "empty" in query_lower
    ):
        missing = df.isnull().sum()
        missing = missing[missing > 0]

        if len(missing) > 0:
            response["answer"] = (
                f"Found missing values in {len(missing)} columns: "
                f"{', '.join(f'{k}={v}' for k, v in missing.items())}"
            )
        else:
            response["answer"] = "No missing values found."

    elif "duplicate" in query_lower:
        dup_count = int(df.duplicated().sum())
        response["answer"] = f"Found {dup_count} duplicate rows."

    elif (
        "average" in query_lower or
        "mean" in query_lower or
        "avg" in query_lower
    ):
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        target = None

        for col in numeric_cols:
            if str(col).lower() in query_lower:
                target = col
                break

        if target:
            avg = df[target].mean()
            response["answer"] = f"The average {target} is {avg:.2f}."

        elif numeric_cols:
            avgs = {
                str(col): float(df[col].mean())
                for col in numeric_cols[:5]
            }

            response["answer"] = (
                "Average values: "
                + ", ".join(
                    f"{k}={v:.2f}"
                    for k, v in avgs.items()
                )
            )

        else:
            response["answer"] = "No numeric columns found."

    elif (
        "highest" in query_lower or
        "maximum" in query_lower or
        "max" in query_lower
    ):
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        target = None

        for col in numeric_cols:
            if str(col).lower() in query_lower:
                target = col
                break

        if target:
            max_val = df[target].max()
            response["answer"] = (
                f"The maximum {target} is {max_val:.2f}."
            )

        elif numeric_cols:
            maxes = {
                str(col): float(df[col].max())
                for col in numeric_cols[:5]
            }

            response["answer"] = (
                "Maximum values: "
                + ", ".join(
                    f"{k}={v:.2f}"
                    for k, v in maxes.items()
                )
            )

        else:
            response["answer"] = "No numeric columns found."

    else:
        response["answer"] = (
            f"The dataset has {len(df)} rows and {len(df.columns)} columns. "
            f"Columns: {', '.join(map(str, df.columns.tolist()))}"
        )

    await db.chat_history.insert_one({
        "dataset_id": dataset_id,
        "user_query": query,
        "response": response,
        "created_at": datetime.utcnow()
    })
    
    return response'''

content = content[:start] + new_fallback + content[end:]

path.write_text(content, encoding="utf-8")

print("Rule-based fallback expanded")
print("File updated:", path)
