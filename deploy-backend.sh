#!/bin/bash
echo "🚀 Deploy Backend para Railway"
echo "================================"

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado. Instalando..."
    npm install -g @railway/cli
fi

# Verificar se está logado
echo "🔐 Verificando login Railway..."
railway whoami || {
    echo "❌ Não logado no Railway. Execute: railway login"
    exit 1
}

# Deploy
echo "📦 Fazendo deploy do backend..."
cd backend
railway up

echo "✅ Deploy do backend concluído!"
echo "🌐 Backend URL: https://seu-projeto.up.railway.app/api"