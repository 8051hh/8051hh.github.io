@echo off
cd /d "%~dp0"
echo ============================================
echo   HaHa Open Source Radar - local server
echo ============================================
echo.
echo   Keep this window open, then visit:
echo   http://localhost:8000
echo.
echo   (Press Ctrl+C to stop)
echo.
start "" "http://localhost:8000"
python -m http.server 8000 --bind 127.0.0.1
