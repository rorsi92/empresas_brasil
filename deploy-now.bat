@echo off
echo ==========================================
echo    RAILWAY MANUAL DEPLOYMENT
echo ==========================================
echo.

echo First, you need to login to Railway:
echo.
echo STEP 1: Run this command:
echo         railway login
echo.
echo STEP 2: After login, run this script again
echo.
pause

echo.
echo Checking login status...
railway whoami
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Not logged in to Railway!
    echo Please run: railway login
    pause
    exit /b 1
)

echo.
echo Linking to Railway project...
railway link

echo.
echo Deploying to Railway...
railway up

echo.
echo ==========================================
echo DEPLOYMENT INITIATED!
echo.
echo Check your Railway dashboard at:
echo https://railway.app/dashboard
echo.
echo Your app should be live at:
echo https://frontend-service.up.railway.app
echo ==========================================
pause