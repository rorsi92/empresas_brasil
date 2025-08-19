#!/bin/bash

# Deploy Check Script - Empresas Brasil
echo "🚀 VERIFICANDO CONFIGURAÇÕES PARA DEPLOY NO RAILWAY"
echo "=================================================="

# Verificar arquivos necessários
echo "📁 Verificando arquivos necessários..."

files_needed=(
  "backend/package.json"
  "backend/server.js"
  "backend/railway.json"
  "backend/.env.example"
  "frontend/package.json"
  "frontend/vite.config.js"
  "frontend/railway.json"
  "frontend/.env.example"
  "DEPLOY.md"
)

missing_files=()
for file in "${files_needed[@]}"; do
  if [ ! -f "$file" ]; then
    missing_files+=("$file")
  fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
  echo "✅ Todos os arquivos necessários encontrados"
else
  echo "❌ Arquivos faltando:"
  for file in "${missing_files[@]}"; do
    echo "   - $file"
  done
  exit 1
fi

# Verificar configurações do backend
echo ""
echo "🔧 Verificando configurações do backend..."

if grep -q "process.env.PORT" backend/server.js; then
  echo "✅ Porta configurada para Railway"
else
  echo "❌ Porta não configurada para Railway"
fi

if grep -q "process.env.DATABASE_URL" backend/server.js; then
  echo "✅ Database URL configurada"
else
  echo "❌ Database URL não configurada"
fi

if grep -q "corsOptions" backend/server.js; then
  echo "✅ CORS configurado"
else
  echo "❌ CORS não configurado"
fi

# Verificar configurações do frontend
echo ""
echo "🎨 Verificando configurações do frontend..."

if grep -q "VITE_API_URL" frontend/vite.config.js; then
  echo "✅ API URL configurada no Vite"
else
  echo "❌ API URL não configurada no Vite"
fi

if grep -q "preview" frontend/package.json; then
  echo "✅ Script preview configurado"
else
  echo "❌ Script preview não configurado"
fi

# Verificar dependências críticas
echo ""
echo "📦 Verificando dependências críticas..."

backend_deps=(
  "express"
  "cors"
  "pg"
  "dotenv"
  "stripe"
)

for dep in "${backend_deps[@]}"; do
  if grep -q "\"$dep\"" backend/package.json; then
    echo "✅ Backend: $dep instalado"
  else
    echo "❌ Backend: $dep não encontrado"
  fi
done

frontend_deps=(
  "react"
  "vite"
  "axios"
)

for dep in "${frontend_deps[@]}"; do
  if grep -q "\"$dep\"" frontend/package.json; then
    echo "✅ Frontend: $dep instalado"
  else
    echo "❌ Frontend: $dep não encontrado"
  fi
done

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Commite todas as mudanças no GitHub"
echo "2. Crie projeto no Railway para backend (pasta backend)"
echo "3. Configure as variáveis de ambiente do backend"
echo "4. Crie projeto no Railway para frontend (pasta frontend)"  
echo "5. Configure as variáveis de ambiente do frontend"
echo "6. Teste ambos os deployments"
echo ""
echo "📖 Consulte DEPLOY.md para instruções detalhadas!"
echo ""
echo "✨ Configuração para Railway: COMPLETA!"