@echo off
echo ==============================================
echo    Starting Rehman Agro Invoice Generator
echo ==============================================

if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo.
echo Starting the development server...
call npm run dev
pause
