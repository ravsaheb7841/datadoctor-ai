from pathlib import Path

path = Path("app/services/cleaning_service.py")
content = path.read_text(encoding="utf-8")

# ============================================================
# CAP OUTLIERS
# ============================================================

old_cap = """        elif op_type == "cap_outliers":
            if column and df[column].dtype in ['int64', 'float64', 'int32', 'float32']:
                q1 = df[column].quantile(0.25)
                q3 = df[column].quantile(0.75)
                iqr = q3 - q1
                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr
                df[column] = df[column].clip(lower, upper)"""

new_cap = """        elif op_type == "cap_outliers":
            if column and df[column].dtype in ['int64', 'float64', 'int32', 'float32']:

                # Binary columns are not suitable for outlier capping
                if df[column].nunique() <= 2:
                    raise Exception(
                        f"Cannot apply outlier capping on binary column "
                        f"'{column}'. This column has only 0/1 values."
                    )

                q1 = df[column].quantile(0.25)
                q3 = df[column].quantile(0.75)
                iqr = q3 - q1

                # Skip constant / zero-IQR columns
                if iqr == 0:
                    raise Exception(
                        f"Cannot apply outlier capping on column "
                        f"'{column}'. IQR is zero."
                    )

                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr

                df[column] = df[column].clip(lower, upper)"""

if old_cap in content:
    content = content.replace(old_cap, new_cap)
    print("✅ cap_outliers updated")
else:
    print("⚠️ cap_outliers target code not found")


# ============================================================
# REMOVE OUTLIERS
# ============================================================

old_remove = """        elif op_type == "remove_outliers":
            if column and df[column].dtype in ['int64', 'float64', 'int32', 'float32']:
                q1 = df[column].quantile(0.25)
                q3 = df[column].quantile(0.75)
                iqr = q3 - q1
                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr
                df = df[(df[column] >= lower) & (df[column] <= upper)]"""

new_remove = """        elif op_type == "remove_outliers":
            if column and df[column].dtype in ['int64', 'float64', 'int32', 'float32']:

                # Binary columns are not suitable for outlier removal
                if df[column].nunique() <= 2:
                    raise Exception(
                        f"Cannot remove outliers from binary column "
                        f"'{column}'. This column has only 0/1 values."
                    )

                q1 = df[column].quantile(0.25)
                q3 = df[column].quantile(0.75)
                iqr = q3 - q1

                # Skip constant / zero-IQR columns
                if iqr == 0:
                    raise Exception(
                        f"Cannot remove outliers from column "
                        f"'{column}'. IQR is zero."
                    )

                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr

                df = df[
                    (df[column] >= lower) &
                    (df[column] <= upper)
                ]"""

if old_remove in content:
    content = content.replace(old_remove, new_remove)
    print("✅ remove_outliers updated")
else:
    print("⚠️ remove_outliers target code not found")


# ============================================================
# SAVE
# ============================================================

path.write_text(content, encoding="utf-8")

print("✅ Cleaning service update completed")
