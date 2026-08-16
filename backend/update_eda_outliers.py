from pathlib import Path

path = Path("app/services/eda_service.py")
content = path.read_text(encoding="utf-8")

start_marker = "    # 7. Outlier Analysis"
end_marker = "    # 8."

start = content.find(start_marker)

if start == -1:
    print("❌ Outlier Analysis section not found")
    raise SystemExit(1)

end = content.find(end_marker, start)

if end == -1:
    print("❌ End of Outlier Analysis section not found")
    raise SystemExit(1)

new_section = '''    # 7. Outlier Analysis
    # Only meaningful numeric columns are analyzed.
    # Binary and constant columns are skipped.
    for col in numeric_cols:
        series = df[col].dropna()

        # Skip empty columns and binary columns
        if len(series) == 0 or series.nunique() <= 2:
            continue

        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1

        # Skip constant / zero-IQR columns
        if iqr == 0:
            continue

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        outliers = series[
            (series < lower_bound) |
            (series > upper_bound)
        ]

        if len(outliers) > 0:
            eda["outlier_analysis"].append({
                "column": str(col),
                "outlier_count": int(len(outliers)),
                "outlier_percentage": round(
                    len(outliers) / len(series) * 100,
                    2
                ),
                "lower_bound": safe_convert(lower_bound),
                "upper_bound": safe_convert(upper_bound),
                "q1": safe_convert(q1),
                "q3": safe_convert(q3),
                "iqr": safe_convert(iqr),
            })

'''

content = content[:start] + new_section + content[end:]

path.write_text(content, encoding="utf-8")

print("✅ Outlier analysis updated successfully")
