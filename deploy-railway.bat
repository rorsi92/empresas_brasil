@echo off
echo ==========================================
echo    DEPLOY COMPLETO PARA RAILWAY
echo ==========================================
echo.

echo 🔧 Verificando Railway CLI...
where railway >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI não encontrado. Instalando...
    npm install -g @railway/cli
)

echo.
echo 🔐 Verificando login...
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Não logado no Railway. Execute: railway login
    pause
    exit /b 1
)

echo.
echo 🔙 Deploy do Backend...
cd backend
echo Fazendo deploy do backend para Railway...
railway up
if %errorlevel% neq 0 (
    echo ❌ Erro no deploy do backend!
    pause
    exit /b 1
)

echo.
echo 🎨 Preparando Frontend...
cd ..\frontend

echo Configurando URL da API para produção...
echo VITE_API_URL=https://backend-service.up.railway.app/api > .env

echo Construindo frontend...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Erro no build do frontend!
    pause
    exit /b 1
)

echo Deploy do frontend para Railway...
railway up
if %errorlevel% neq 0 (
    echo ❌ Erro no deploy do frontend!
    pause
    exit /b 1
)

cd ..

echo.
echo ✅ Deploy completo finalizado!
echo.
echo 🌐 URLs de Produção:
echo Backend:  https://backend-service.up.railway.app/api
echo Frontend: https://frontend-service.up.railway.app
echo Database: Railway PostgreSQL (já ativo)
echo.
echo 📋 Próximos passos:
echo 1. Verificar se ambos serviços estão rodando
echo 2. Testar login no frontend
echo 3. Testar consulta de empresas
echo.
pause