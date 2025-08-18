@echo off
echo ========================================
echo    EMPRESAS BRASIL - STARTUP FINAL
echo    VERSAO FUNCIONAL - 66M EMPRESAS
echo ========================================
echo.
echo 🚀 CONFIGURACAO ATUAL:
echo    - Backend: http://localhost:6000
echo    - Frontend: http://localhost:4001
echo    - 23 colunas de dados completos
echo    - 20 segmentos baseados em CNAEs reais
echo    - +66 milhoes de empresas da Receita Federal
echo.

REM Verificar se estamos na pasta correta
if not exist "backend\server.js" (
    echo ❌ ERRO: Execute este script na pasta raiz do projeto!
    echo    Esperado: backend\server.js
    pause
    exit /b 1
)

echo ✅ Verificando estrutura do projeto...
if not exist "frontend\src" (
    echo ❌ ERRO: Pasta frontend não encontrada!
    pause
    exit /b 1
)

echo ✅ Estrutura OK!
echo.

echo 🔙 Iniciando Backend (porta 6000)...
start "Backend Server" cmd /k "cd /d "%cd%\backend" && node server.js"

echo ⏳ Aguardando 3 segundos para o backend inicializar...
timeout /t 3 /nobreak > nul

echo 🎨 Iniciando Frontend (porta 4001)...
start "Frontend Dev Server" cmd /k "cd /d "%cd%\frontend" && npm run dev -- --port 4001"

echo.
echo ✅ APLICACAO INICIADA COM SUCESSO!
echo.
echo 📱 URLs:
echo    Frontend: http://localhost:4001
echo    Backend:  http://localhost:6000
echo.
echo 🔧 CONFIGURACAO FINAL:
echo    ✅ Backend na porta 6000 (server.js)
echo    ✅ Frontend na porta 4001 (vite dev)
echo    ✅ Proxy configurado no vite.config.js
echo    ✅ 23 colunas de dados visiveis
echo    ✅ 20 segmentos de negocio
echo    ✅ Sistema salvo no GitHub
echo.
echo ⚠️  IMPORTANTE:
echo    - Mantenha as janelas "Backend Server" e "Frontend Dev Server" abertas
echo    - Para parar: feche as janelas ou use Ctrl+C em cada uma
echo.
echo 🎯 Para usar no Claude Code:
echo    1. cd "D:\Projetos Cursor\Youtube Aula\backend" ^&^& node server.js
echo    2. cd "D:\Projetos Cursor\Youtube Aula\frontend" ^&^& npm run dev -- --port 4001
echo    (Ambos com run_in_background: true)
echo.
echo Pressione qualquer tecla para fechar este script...
pause > nul