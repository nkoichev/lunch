@echo off
echo ========================================
echo  Your Computer's IP Addresses
echo ========================================
echo.

ipconfig | findstr /i "IPv4"

echo.
echo ========================================
echo Use one of these IP addresses in:
echo services/googleSheets.js
echo.
echo Example:
echo const BACKEND_URL = 'http://192.168.1.100:3001';
echo ========================================
echo.

pause
