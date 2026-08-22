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
    if m.start() > start
]

end = next_defs[0] if next_defs else len(content)

new_function = '''async def process_chat_query(dataset_id, query, db):
    """Smart rule-based chat for dataset analysis."""

    import os
    import re as re_module
    import pandas as pd
    import numpy as np
    from datetime import datetime
    from bson import ObjectId

    file_path = f"uploads/{dataset_id}.pkl"

    if not os.path.exists(file_path):
        return {
            "error": "Dataset file not found",
            "query": query,
            "answer": "The dataset file could not be found.",
            "source": "rule-based",
            "data": None,
            "chart_data": None
        }

    df = pd.read_pickle(file_path)
    query_lower = query.lower().strip()

    print(f"[CHAT DEBUG] query: {query}")

    numeric_cols = df.select_dtypes(
        include=[np.number]
    ).columns.tolist()

    cat_cols = df.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    date_cols = [
        col for col in df.columns
        if "date" in str(col).lower()
        or "time" in str(col).lower()
    ]

    response = {
        "query": query,
        "answer": "",
        "source": "rule-based",
        "data": None,
        "chart_data": None
    }

    def find_target_column():
        for col in df.columns:
            if str(col).lower() in query_lower:
                return col
        return None

    async def save_and_return():
        await db.chat_history.insert_one({
            "dataset_id": dataset_id,
            "user_query": query,
            "response": response,
            "created_at": datetime.utcnow()
        })
        return response

    # ---------------------------------------------------------
    # GREETING
    # ---------------------------------------------------------
    if query_lower in [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening"
    ]:
        response["answer"] = (
            "Hello! I can help you analyze your dataset. "
            "You can ask about rows, columns, averages, "
            "missing values, duplicates, highest/lowest values, "
            "unique values, top values, or group-by analysis."
        )
        return await save_and_return()

    # ---------------------------------------------------------
    # WHO ARE YOU
    # ---------------------------------------------------------
    if (
        "who are you" in query_lower
        or "what are you" in query_lower
        or "what can you do" in query_lower
    ):
        response["answer"] = (
            "I am DataDoctor AI's data analysis assistant. "
            "I can analyze your dataset and answer questions "
            "about statistics, data quality, columns, missing "
            "values, duplicates, and grouped results."
        )
        return await save_and_return()

    # ---------------------------------------------------------
    # DATASET NAME
    # ---------------------------------------------------------
    if any(word in query_lower for word in [
        "dataset name",
        "file name",
        "what is this data",
        "data name"
    ]):
        try:
            dataset_info = await db.datasets.find_one(
                {"_id": ObjectId(dataset_id)}
            )

            if dataset_info:
                filename = dataset_info.get(
                    "filename",
                    os.path.basename(file_path)
                )
                response["answer"] = (
                    f"This dataset is named '{filename}'."
                )
            else:
                response["answer"] = (
                    f"The dataset file is "
                    f"'{os.path.basename(file_path)}'."
                )
        except Exception:
            response["answer"] = (
                f"The dataset file is "
                f"'{os.path.basename(file_path)}'."
            )

        return await save_and_return()

    # ---------------------------------------------------------
    # DATASET SUMMARY
    # ---------------------------------------------------------
    if any(word in query_lower for word in [
        "summary",
        "summarize",
        "overview",
        "describe",
        "what does this dataset",
        "about dataset"
    ]):
        missing_count = int(df.isnull().sum().sum())
        duplicate_count = int(df.duplicated().sum())

        response["answer"] = (
            f"Dataset summary:\\n"
            f"Rows: {len(df)}\\n"
            f"Columns: {len(df.columns)}\\n"
            f"Numeric columns: "
            f"{', '.join(map(str, numeric_cols)) if numeric_cols else 'None'}\\n"
            f"Categorical columns: "
            f"{', '.join(map(str, cat_cols)) if cat_cols else 'None'}\\n"
            f"Missing values: {missing_count}\\n"
            f"Duplicate rows: {duplicate_count}"
        )

        response["data"] = {
            "rows": int(len(df)),
            "columns": int(len(df.columns)),
            "numeric_columns": [
                str(c) for c in numeric_cols
            ],
            "categorical_columns": [
                str(c) for c in cat_cols
            ],
            "missing_values": missing_count,
            "duplicate_rows": duplicate_count
        }

        return await save_and_return()

    # ---------------------------------------------------------
    # ROW COUNT
    # ---------------------------------------------------------
    if any(word in query_lower for word in [
        "how many row",
        "number of row",
        "total row",
        "count row",
        "row count"
    ]):
        response["answer"] = (
            f"The dataset contains {len(df)} rows."
        )
        response["data"] = {
            "rows": int(len(df))
        }
        return await save_and_return()

    # ---------------------------------------------------------
    # COLUMN COUNT
    # ---------------------------------------------------------
    if any(word in query_lower for word in [
        "how many column",
        "number of column",
        "total column",
        "count column",
        "column count"
    ]):
        response["answer"] = (
            f"The dataset has {len(df.columns)} columns: "
            f"{', '.join(map(str, df.columns.tolist()))}"
        )

        response["data"] = {
            "columns": [
                str(c) for c in df.columns
            ]
        }

        return await save_and_return()

    # ---------------------------------------------------------
    # NUMERIC COLUMNS
    # ---------------------------------------------------------
    if (
        "numeric" in query_lower
        and (
            "which" in query_lower
            or "what" in query_lower
            or "list" in query_lower
        )
    ):
        response["answer"] = (
            "Numeric columns: "
            + (
                ", ".join(map(str, numeric_cols))
                if numeric_cols
                else "None found"
            )
        )
        return await save_and_return()

    # ---------------------------------------------------------
    # CATEGORICAL COLUMNS
    # ---------------------------------------------------------
    if (
        "categorical" in query_lower
        or "category columns" in query_lower
    ):
        response["answer"] = (
            "Categorical columns: "
            + (
                ", ".join(map(str, cat_cols))
                if cat_cols
                else "None found"
            )
        )
        return await save_and_return()

    # ---------------------------------------------------------
    # AVERAGE / MEAN
    # ---------------------------------------------------------
    if any(word in query_lower for word in [
        "average",
        "mean",
        "avg"
    ]):
        target = find_target_column()

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
            averages = {}

            for col in numeric_cols:
                value = df[col].mean()

                if pd.notna(value):
                    averages[str(col)] = float(value)

            response["answer"] = (
                "Average values:\\n"
                + "\\n".join(
                    f"  {col}: {value:.2f}"
                    for col, value in averages.items()
                )
            )

            response["data"] = {
                "averages": averages
            }

        else:
            response["answer"] = (
                "No numeric columns were found."
            )

        return await save_and_return()

    # ---------------------------------------------------------
    # MEDIAN
    # ---------------------------------------------------------
    if "median" in query_lower:
        target = find_target_column()

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

        elif numeric_cols:
            medians = {}

            for col in numeric_cols:
                value = df[col].median()

                if pd.notna(value):
                    medians[str(col)] = float(value)

            response["answer"] = (
                "Median values:\\n"
                + "\\n".join(
                    f"  {col}: {value:.2f}"
                    for col, value in medians.items()
                )
            )

            response["data"] = {
                "medians": medians
            }

        else:
            response["answer"] = (
                "No numeric columns were found."
            )

        return await save_and_return()

    # ---------------------------------------------------------
    # MINIMUM
    # ---------------------------------------------------------
    if any(word in query_lower for word in [
        "minimum",
        "lowest",
        "smallest",
        "min value"
    ]):
        target = find_target_column()

        if target in numeric_cols:
            value = df[target].min()

            response["answer"] = (
                f"The minimum {target} is "
                f"{value:.2f}."
            )

            response["data"] = {
                "column": str(target),
                "min_value": float(value)
            }

        elif numeric_cols:
            values = {
                str(col): float(df[col].min())
                for col in numeric_cols
                if pd.notna(df[col].min())
            }

            response["answer"] = (
                "Minimum values:\\n"
                + "\\n".join(
                    f"  {col}: {value:.2f}"
                    for col, value in values.items()
                )
            )

            response["data"] = {
                "minimums": values
            }

        else:
            response["answer"] = (
                "No numeric columns were found."
            )

        return await save_and_return()

    # ---------------------------------------------------------
    # MAXIMUM / HIGHEST
    # ---------------------------------------------------------
    if any(word in query_lower for word in [
        "maximum",
        "highest",
        "largest",
        "max value"
    ]):
        target = find_target_column()

        if target in numeric_cols:
            value = df[target].max()

            response["answer"] = (
                f"The maximum {target} is "
                f"{value:.2f}."
            )

            response["data"] = {
                "column": str(target),
                "max_value": float(value)
            }

        elif numeric_cols:
            values = {
                str(col): float(df[col].max())
                for col in numeric_cols
                if pd.notna(df[col].max())
            }

            response["answer"] = (
                "Maximum values:\\n"
                + "\\n".join(
                    f"  {col}: {value:.2f}"
                    for col, value in values.items()
                )
            )

            response["data"] = {
                "maximums": values
            }

        else:
            response["answer"] = (
                "No numeric columns were found."
            )

        return await save_and_return()

    # ---------------------------------------------------------
    # MISSING VALUES
    # ---------------------------------------------------------
    if any(word in query_lower for word in [
        "missing",
        "null",
        "empty",
        "blank",
        "nan"
    ]):
        missing = df.isnull().sum()
        missing = missing[missing > 0]

        if len(missing) > 0:
            details = "\\n".join(
                f"  {col}: {int(count)} missing"
                for col, count in missing.items()
            )

            response["answer"] = (
                f"Found {len(missing)} columns with "
                f"missing values:\\n{details}"
            )

            response["data"] = {
                str(k): int(v)
                for k, v in missing.items()
            }

        else:
            response["answer"] = (
                "No missing values found. "
                "Your data is complete."
            )

            response["data"] = {
                "missing_values": 0
            }

        return await save_and_return()

    # ---------------------------------------------------------
    # DUPLICATES
    # ---------------------------------------------------------
    if any(word in query_lower for word in [
        "duplicate",
        "duplicates",
        "dup"
    ]):
        duplicate_count = int(
            df.duplicated().sum()
        )

        if duplicate_count > 0:
            percentage = (
                duplicate_count / len(df) * 100
                if len(df) > 0
                else 0
            )

            response["answer"] = (
                f"Found {duplicate_count} duplicate rows "
                f"({percentage:.1f}% of the data)."
            )
        else:
            response["answer"] = (
                "No duplicate rows found."
            )

        response["data"] = {
            "duplicate_rows": duplicate_count
        }

        return await save_and_return()

    # ---------------------------------------------------------
    # UNIQUE VALUES
    # ---------------------------------------------------------
    if any(word in query_lower for word in [
        "unique",
        "distinct"
    ]):
        target = find_target_column()

        if target:
            unique_values = (
                df[target]
                .dropna()
                .unique()
            )

            response["answer"] = (
                f"Column '{target}' has "
                f"{len(unique_values)} unique values.\\n"
                f"First 10: "
                f"{', '.join(map(str, unique_values[:10]))}"
            )

            response["data"] = {
                "column": str(target),
                "unique_count": int(
                    len(unique_values)
                )
            }

        else:
            response["answer"] = (
                "Please specify a column name. "
                "For example: 'How many unique values "
                "are in Gender?'"
            )

        return await save_and_return()

    # ---------------------------------------------------------
    # TOP N
    # ---------------------------------------------------------
    top_match = re_module.search(
        r"top\\s*(\\d+)?",
        query_lower
    )

    if top_match or "top" in query_lower:
        n = (
            int(top_match.group(1))
            if top_match and top_match.group(1)
            else 5
        )

        target = find_target_column()

        if target not in numeric_cols:
            target = (
                numeric_cols[0]
                if numeric_cols
                else None
            )

        if target:
            top_n = df.nlargest(
                min(n, len(df)),
                target
            )

            lines = []

            for _, row in top_n.iterrows():
                lines.append(
                    f"  {target}={row[target]:.2f}"
                )

            response["answer"] = (
                f"Top {n} rows by {target}:\\n"
                + "\\n".join(lines)
            )

            response["data"] = {
                "column": str(target),
                "values": [
                    float(v)
                    for v in top_n[target].tolist()
                ]
            }

        else:
            response["answer"] = (
                "No numeric columns found for "
                "top-value analysis."
            )

        return await save_and_return()

    # ---------------------------------------------------------
    # MOST COMMON VALUE
    # ---------------------------------------------------------
    if (
        "most common" in query_lower
        or "most frequent" in query_lower
        or "frequent" in query_lower
    ):
        target = find_target_column()

        if target in cat_cols:
            counts = df[target].value_counts()

            if len(counts) > 0:
                value = counts.index[0]
                count = int(counts.iloc[0])

                response["answer"] = (
                    f"The most common {target} is "
                    f"'{value}' ({count} times)."
                )

        elif cat_cols:
            results = []

            for col in cat_cols[:5]:
                counts = df[col].value_counts()

                if len(counts) > 0:
                    results.append(
                        f"  {col}: {counts.index[0]}"
                    )

            response["answer"] = (
                "Most common values:\\n"
                + "\\n".join(results)
            )

        else:
            response["answer"] = (
                "No categorical columns found."
            )

        return await save_and_return()

    # ---------------------------------------------------------
    # GROUP BY
    # ---------------------------------------------------------
    if (
        "group by" in query_lower
        or "by category" in query_lower
        or "grouped by" in query_lower
    ):
        if cat_cols and numeric_cols:
            cat_col = cat_cols[0]
            num_col = numeric_cols[0]

            for col in cat_cols:
                if str(col).lower() in query_lower:
                    cat_col = col
                    break

            for col in numeric_cols:
                if str(col).lower() in query_lower:
                    num_col = col
                    break

            grouped = (
                df.groupby(cat_col)[num_col]
                .sum()
                .sort_values(ascending=False)
            )

            lines = []

            for key, value in grouped.head(10).items():
                lines.append(
                    f"  {key}: {value:.2f}"
                )

            response["answer"] = (
                f"Sum of {num_col} by {cat_col}:\\n"
                + "\\n".join(lines)
            )

            response["chart_data"] = {
                "type": "bar",
                "labels": [
                    str(k)
                    for k in grouped.head(10).index
                ],
                "values": [
                    float(v)
                    for v in grouped.head(10).values
                ]
            }

        else:
            response["answer"] = (
                "Group-by analysis requires at least "
                "one categorical and one numeric column."
            )

        return await save_and_return()

    # ---------------------------------------------------------
    # DATE COLUMNS
    # ---------------------------------------------------------
    if (
        "date" in query_lower
        or "time" in query_lower
        or "datetime" in query_lower
    ):
        if date_cols:
            response["answer"] = (
                "Date/time columns: "
                + ", ".join(map(str, date_cols))
            )
        else:
            response["answer"] = (
                "No date/time columns were detected."
            )

        return await save_and_return()

    # ---------------------------------------------------------
    # COLUMN INFORMATION
    # ---------------------------------------------------------
    target = find_target_column()

    if target is not None:
        col_data = df[target]

        response["answer"] = (
            f"Column: {target}\\n"
            f"Data type: {col_data.dtype}\\n"
            f"Missing values: "
            f"{int(col_data.isnull().sum())}\\n"
            f"Unique values: "
            f"{int(col_data.nunique())}"
        )

        if target in numeric_cols:
            response["answer"] += (
                f"\\nMean: {col_data.mean():.2f}"
                f"\\nMin: {col_data.min():.2f}"
                f"\\nMax: {col_data.max():.2f}"
            )

        response["data"] = {
            "column": str(target),
            "dtype": str(col_data.dtype),
            "missing": int(col_data.isnull().sum()),
            "unique": int(col_data.nunique())
        }

        return await save_and_return()

    # ---------------------------------------------------------
    # CLEANING HELP
    # ---------------------------------------------------------
    if any(word in query_lower for word in [
        "clean",
        "fix data",
        "repair data",
        "data quality"
    ]):
        try:
            active_count = await db.data_quality_issues.count_documents({
                "dataset_id": dataset_id,
                "status": {"$ne": "resolved"}
            })
        except Exception:
            active_count = 0

        response["answer"] = (
            f"There are {active_count} active data quality "
            f"issues. Go to Cleaning Center to fix them."
        )

        return await save_and_return()

    # ---------------------------------------------------------
    # DEFAULT
    # ---------------------------------------------------------
    response["answer"] = (
        f"This dataset has {len(df)} rows and "
        f"{len(df.columns)} columns.\\n\\n"
        f"Columns: "
        f"{', '.join(map(str, df.columns.tolist()))}\\n\\n"
        f"Try asking:\\n"
        f"- How many rows are there?\\n"
        f"- What is the average of Unit_Price?\\n"
        f"- What is the median of Quantity?\\n"
        f"- Are there missing values?\\n"
        f"- Which column has the highest value?\\n"
        f"- Show top 5 values by Unit_Price\\n"
        f"- Group by Category"
    )

    return await save_and_return()
'''

content = content[:start] + new_function + content[end:]

path.write_text(
    content,
    encoding="utf-8"
)

print("SUCCESS: process_chat_query updated")
print("Backup: app/services/ai_service.py.backup")
