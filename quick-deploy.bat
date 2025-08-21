@echo off
echo ==========================================
echo    QUICK RAILWAY DEPLOY
echo ==========================================
echo.
echo This will open your browser to login with GitHub
echo.
start railway login
timeout /t 10
echo.
echo After logging in, press any key to continue...
pause
echo.
echo Deploying to Railway...
cd C:\Users\rodri\empresas_brasil
railway link
railway up
echo.
echo ==========================================
echo DEPLOYMENT COMPLETE!
echo Check: https://railway.app/dashboard
echo ==========================================
pause