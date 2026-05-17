@echo off
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js was not found. Please install Node.js, then run this file again.
    pause
    exit /b 1
)

echo Starting portfolio preview...
echo.
echo Open this link in your browser:
echo http://127.0.0.1:8000/index.html
echo.
echo Keep this window open while previewing. Press Ctrl+C to stop.
echo.

node preview_server.js
pause
