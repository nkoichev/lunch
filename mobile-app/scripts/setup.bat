@echo off
echo ========================================
echo  Lunch Orders App - Setup Script
echo ========================================
echo.

echo [1/4] Installing mobile app dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install mobile app dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Installing global tools...
call npm install -g expo-cli eas-cli
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Failed to install global tools
    echo You may need to run this as Administrator
)

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo  Next Steps:
echo ========================================
echo 1. Find your computer's IP address:
echo    Run: ipconfig
echo    Look for "IPv4 Address"
echo.
echo 2. Update services/googleSheets.js:
echo    Change BACKEND_URL to http://YOUR_IP:3001
echo.
echo 3. Start backend server:
echo    cd backend
echo    npm start
echo.
echo 4. In a new terminal, test the app:
echo    npm start
echo.
echo 5. Build APK:
echo    eas login
echo    eas build -p android --profile production
echo.
echo ========================================

pause
