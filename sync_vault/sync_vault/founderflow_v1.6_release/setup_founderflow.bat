@echo off
echo 🚀 Founderflow v1: Starting Setup...
echo.
echo 📦 1. Downloading Engine Dependencies...
call npm install --quiet

echo.
echo 🌐 2. Preparing Stealth Discovery Browsers...
call npx playwright install chromium --with-deps

echo.
echo ✅ Setup Complete! 
echo.
echo --------------------------------------------------
echo 🏁 HOW TO START:
echo --------------------------------------------------
echo 1. Open 'leads.json' and add your target profiles.
echo 2. Run 'start_founderflow.bat' and Choose '1. Login'.
echo 3. Once logged in, Choose '2. Outreach'.
echo.
pause
