@echo off
echo ========================================
echo DEPLOY COMPLETO - TODOS OS SERVICOS
echo ========================================
echo.

echo Deployando Backend...
railway up --service proud-spontaneity 2>nul
railway up --service selfless-gentleness 2>nul
railway up --service giving-communication 2>nul
railway up --service glistening-passion 2>nul

echo.
echo Deployando Principal...
railway up --service empresas_brasil

echo.
echo ========================================
echo DEPLOY ENVIADO!
echo Verifique em: https://railway.app/dashboard
echo ========================================
pause