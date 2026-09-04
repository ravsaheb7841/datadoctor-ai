# 🩺 DataDoctor AI

![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal)
![Python](https://img.shields.io/badge/Python-3.8%2B-yellow)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-Vercel-black)
![Backend](https://img.shields.io/badge/Backend-Render-purple)

> **AI-powered platform for data cleaning, quality analysis, EDA, and intelligent insights.**

DataDoctor AI is a full-stack web application that helps users upload datasets, detect data-quality issues, clean and analyze their data, run exploratory data analysis, and understand their datasets through AI-powered insights — all from a single dashboard.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [How It Works](#-how-it-works)
- [Data Quality Analysis](#-data-quality-analysis)
- [AI Insights](#-ai-insights)
- [Deployment](#-deployment)
- [Security](#-security)
- [Author](#-author)
- [License](#-license)

---

## ✨ Features

- 📂 Upload CSV, XLSX, and XLS files
- 🔍 Automatic data profiling
- 🩺 Data health score
- ⚠️ Data-quality issue detection
- 🧹 Smart data cleaning suggestions
- 📊 Exploratory Data Analysis (EDA)
- 📈 Interactive visualizations
- 🤖 AI-powered insights
- 💬 AI data assistant (chat with your dataset)
- 📋 Dataset preview and statistics
- 🎯 Semantic column-type detection
- 📑 Report generation
- 🗑️ Dataset management (view, organize, delete)

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, JavaScript, Tailwind CSS, Recharts, Lucide React, Vercel |
| **Backend** | Python, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn, Motor, MongoDB, Render |
| **AI & Analysis** | Data Profiling, Data Cleaning, EDA, Statistical Analysis, Machine Learning, AI-powered Insights |

## 📁 Project Structure

```text
datadoctor-ai/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vercel.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── services/
│   │   └── utils/
│   ├── requirements.txt
│   ├── uploads/
│   └── reports/
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- A MongoDB connection string (local or Atlas)

### Clone the Repository

```bash
git clone https://github.com/ravsaheb7841/datadoctor-ai.git
cd datadoctor-ai
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

### Backend Setup

Open a new terminal:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

Install dependencies and start the server:

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: `http://localhost:8000`

## 🔐 Environment Variables

Create a `.env` file inside the `backend` folder:

```env
MONGODB_URL=your_mongodb_connection_string
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

> ⚠️ Never commit `.env` files or API keys to GitHub.

## 🔄 How It Works

```text
Upload Dataset → File Validation → Data Profiling → Health Score
       → Quality Issue Detection → Cleaning Suggestions
       → Data Cleaning → EDA & Visualization → AI Insights → Reports
```

## 📊 Data Quality Analysis

DataDoctor AI automatically detects common data-quality problems, including:

- Missing values
- Duplicate records
- Invalid values
- Outliers
- Inconsistent categories
- Incorrect data types
- Identifier columns
- Statistical anomalies

Columns are also analyzed by **semantic type**, so cleaning suggestions are tailored to what the data actually represents rather than just its raw type.

## 🤖 AI Insights

The built-in AI assistant helps users understand their datasets by providing:

- Dataset summaries
- Key patterns and trends
- Data-quality explanations
- Cleaning recommendations
- EDA interpretation
- Business-oriented insights
- Direct answers to questions about the dataset

## 🌐 Deployment

```text
React Frontend  →  Vercel
FastAPI Backend →  Render
Database        →  MongoDB
```

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB |

## 🔒 Security

- User authentication
- User-specific dataset access
- File type validation
- 100 MB upload limit
- Environment variables for secrets
- Protected API endpoints
- Sensitive files excluded via `.gitignore`

## 👨‍💻 Author

**Ravsaheb Bansode**

- LinkedIn: [ravsaheb-bansode](https://www.linkedin.com/in/ravsaheb-bansode/)
- GitHub: [@ravsaheb7841](https://github.com/ravsaheb7841/)

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

⭐ If you find DataDoctor AI useful, consider giving the repository a star!