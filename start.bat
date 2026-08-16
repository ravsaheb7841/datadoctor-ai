@echo off
echo DataDoctor AI is starting...

:: 1. Start MongoDB 
start "DataDoctor MongoDB" /min mongod --dbpath "C:\data\db"

:: 2. Start Backend 
start "DataDoctor Backend" cmd /k "cd backend && ..\venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: 3. Start Frontend
set PORT=3000
start "DataDoctor Frontend" cmd /k "cd frontend && npm start"

echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
