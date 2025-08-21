@echo off
echo ==========================================
echo    DEPLOY RAPIDO PARA RAILWAY
echo ==========================================
echo.
echo Fazendo deploy das mudancas para o Railway...
echo.

cd C:\Users\rodri\empresas_brasil

echo Passo 1: Fazendo login no Railway...
echo.
echo VAI ABRIR O NAVEGADOR - FAZ LOGIN COM GITHUB!
echo.
railway login

echo.
echo Passo 2: Conectando ao projeto...
railway link

echo.
echo Passo 3: Fazendo deploy...
echo Isso pode levar 2-5 minutos...
railway up

echo.
echo ==========================================
echo DEPLOY COMPLETO!
echo.
echo Seu site deve estar atualizado em:
echo https://frontend-service.up.railway.app
echo.
echo Verifique o dashboard:
echo https://railway.app/dashboard
echo ==========================================
pause