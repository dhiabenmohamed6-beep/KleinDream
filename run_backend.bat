@echo off
title KleinDream Backend API (:8001)
cd /d "%~dp0"
echo Starting KleinDream Django Backend on http://127.0.0.1:8001 ...
.\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8001
pause
