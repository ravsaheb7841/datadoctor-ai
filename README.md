# DataDoctor AI

> AI-powered data quality, cleaning, profiling, and exploratory data analysis platform.

DataDoctor AI lets users upload a dataset, automatically detect data quality issues and column types, clean the data intelligently, run EDA, and generate AI-powered insights — without doing every step manually.

---

## Features

- **Dataset Management** — upload CSVs, view history, get profiling and a health score
- **Data Quality Analysis** — missing values, duplicates, type analysis, column-level profiling
- **Semantic Column Type Detection** — classifies columns as Numeric, Categorical, Text, Datetime, Identifier, Boolean, Binary, or Ordinal (beyond basic Pandas dtypes), so cleaning suggestions actually fit the data. Binary columns are protected from inappropriate operations like outlier removal.
- **Intelligent Cleaning** — mean/median/mode, custom value, drop rows, forward/backward fill, duplicate removal, outlier detection/capping/removal, type handling — suggested based on detected semantic type
- **Exploratory Data Analysis** — distributions, correlations, categorical breakdowns, outlier and time-based analysis, all semantic-type-aware (e.g. identifiers aren't treated as analytical variables)
- **AI-Powered Insights** — AI diagnosis, business insights, relationship analysis, suggested cleaning actions
- **Reports** — downloadable before/after cleaning PDF reports with quality score, issues found, cleaning log, and EDA summary

---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React, Tailwind CSS, Recharts, Lucide React, Axios |
| Backend | Python, FastAPI, Pandas, NumPy, Pydantic |
| Database | MongoDB (via Motor) |
| AI/Data | Semantic classification, statistical analysis, LLM-based diagnosis |

---

## Architecture

```
frontend/    React app (components, layouts, pages)
backend/     FastAPI app (api, auth, services, utils)
```

**Pipeline:** Auth → Upload → Profiling → Data Quality Analysis → Cleaning Center → EDA → AI Diagnosis & Insights → Reports

---

## Semantic Type Detection (example)

| Column | Detected Type |
|---|---|
| Age, Salary | Numeric |
| Customer_ID, Phone | Identifier |
| Gender, City | Categorical |
| Comments | Text |
| Order_Date | Datetime |
| Rating | Ordinal |
| Is_Active | Boolean |
| is_fraud | Binary |

---

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Frontend: `http://localhost:3000` · Backend: `http://localhost:8000`

### Environment Variables
```env
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
HF_API_KEY=your_huggingface_api_key
SECRET_KEY=your_secret_key
```
Never commit API keys or secrets to GitHub.

### Tests
```bash
python test_column_types.py
python test_binary.py
python test_eda_semantic.py
```

---

## Status

**Done:** upload, profiling, health score, quality detection, semantic typing, cleaning suggestions & operations, semantic-aware EDA, correlation/outlier/time analysis, AI diagnosis & insights, reusable UI components.

**In progress:** UI polish, PDF report generation (before/after comparison), final styling pass.

**Planned:** automated data transformation, data lineage, cleaning rollback, Docker/cloud deployment, production monitoring.

---

## Contributing

Fork → feature branch → make changes → test → PR.

## License

Educational / portfolio project.

## Author

**Ravsaheb Bansode** — Data Analyst | Python | SQL | Power BI
GitHub: [ravsaheb7841](https://github.com/ravsaheb7841) · LinkedIn: [ravsaheb-bansode](https://www.linkedin.com/in/ravsaheb-bansode/)