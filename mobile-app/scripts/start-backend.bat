@echo off
echo ========================================
echo  Starting Backend Server
echo ========================================
echo.

cd backend

echo Backend server starting on port 3001...
echo Press Ctrl+C to stop the server
echo.

call npm start

pause
