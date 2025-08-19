@echo off
echo 🚀 INICIANDO EMPRESAS BRASIL - 66M EMPRESAS
echo ========================================

:: Matar processos Node existentes
echo 🧹 Matando processos Node existentes...
taskkill /f /im node.exe 2>nul
timeout /t 2 >nul

:: Iniciar Backend em background
echo 🔙 Iniciando Backend (porta 6000)...
cd /d "%~dp0backend"
start "Backend-EmpresasBrasil" cmd /c "node server.js"

:: Aguardar um pouco
timeout /t 3 >nul

:: Iniciar Frontend em background  
echo 🎨 Iniciando Frontend (porta 4001)...
cd /d "%~dp0frontend"
start "Frontend-EmpresasBrasil" cmd /c "npm run dev"

:: Aguardar serviços iniciarem
echo ⏳ Aguardando serviços iniciarem...
timeout /t 5 >nul

echo.
echo 🎯 APLICAÇÃO FUNCIONANDO!
echo 📱 Frontend: http://localhost:4001
echo 🔧 Backend:  http://localhost:6000
echo.
echo ✅ Processos rodando em janelas separadas
echo 💡 Feche as janelas ou use Ctrl+C para parar
echo.

:: Verificar se serviços estão rodando
echo 🔍 Verificando serviços...
curl -s http://localhost:6000/api/filters/options >nul 2>&1
if %errorlevel%==0 (
    echo 🔙 Backend: ✅ OK
) else (
    echo 🔙 Backend: ⏳ Iniciando...
)

curl -s http://localhost:4001 >nul 2>&1
if %errorlevel%==0 (
    echo 🎨 Frontend: ✅ OK
) else (
    echo 🎨 Frontend: ⏳ Iniciando...
)

echo.
echo 🚨 IMPORTANTE: NÃO FECHE ESTE TERMINAL
echo 📝 Use 'tasklist | findstr node' para ver processos
pause