@echo off
title KleinDream Luxury Maison - Dev Server
echo ========================================================
echo        Starting KleinDream Luxury Maison
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching Django REST API on port 8001...
start "KleinDream Backend (Django :8001)" cmd /k ".\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8001"

echo [2/2] Launching Next.js Storefront on port 3000...
start "KleinDream Frontend (Next.js :3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  All servers are starting:
echo   - Backend API:  http://127.0.0.1:8001/api/v1
echo   - Storefront:   http://localhost:3000
echo   - Login Page:   http://localhost:3000/auth/login
echo ========================================================
echo.
timeout /t 3 >nul
start http://localhost:3000/auth/login
