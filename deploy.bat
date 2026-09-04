@echo off
cd /d "%~dp0"
git remote remove origin >nul 2>&1
git remote add origin https://github.com/8051hh/8051hh.github.io.git
git branch -M main
git add -A
git commit -m "Update site" >nul 2>&1
echo ============================================
echo   Deploy HaHa Open Source Radar
echo ============================================
echo.
echo   First time only: a browser window may open
echo   for you to sign in to GitHub. Complete it,
echo   then the push will continue automatically.
echo.
git push -u origin main
echo.
echo   Done! Visit: https://8051hh.github.io/
echo.
pause
