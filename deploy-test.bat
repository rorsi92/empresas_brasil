@echo off
echo ==========================================
echo    TESTE DE DEPLOY RAILWAY
echo ==========================================
echo.

echo Verificando login Railway...
railway whoami

if %errorlevel% neq 0 (
    echo.
    echo Fazendo login no Railway...
    railway login
)

echo.
echo Conectando ao projeto...
railway link

echo.
echo Iniciando deploy...
railway up --detach

echo.
echo ==========================================
echo Deploy iniciado!
echo Verifique em: https://railway.app/dashboard
echo ==========================================
pause