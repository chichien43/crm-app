@echo off
chcp 65001 >nul
echo ===================================================
echo     CRM System (React + Vite) Startup Script
echo ===================================================
echo.
echo Starting development server...
echo.

:: Fix npm certificate issue if any
call npm config set strict-ssl false

:: Install dependencies if node_modules is missing
if not exist node_modules (
    echo First run detected. Installing dependencies... 
    echo (This may take a few minutes)
    call npm install
)

:: Start vite and open browser
start http://localhost:5173
call npm run dev
