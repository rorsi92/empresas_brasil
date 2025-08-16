# 🚀 Deploy para Railway - Guia Completo

## 🏗️ Arquitetura (Tudo no Railway)

- **Backend**: Railway
- **Frontend**: Railway (Static Site)
- **Database**: PostgreSQL Railway (já ativo)

---

## 🔧 Preparação Inicial

### 1. Instalar Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login no Railway
```bash
railway login
```

### 3. Conectar ao Projeto
```bash
# Na pasta raiz do projeto
railway link [PROJECT_ID]
```

---

## 🔙 Deploy do Backend

### 1. Configurar Environment Variables
No Railway Dashboard > Backend Service:
```bash
DATABASE_URL=postgresql://postgres:SENHA@HOST:PORT/railway
NODE_ENV=production
PORT=5001
JWT_SECRET=seu_jwt_secreto_super_seguro
```

### 2. Deploy Backend
```bash
cd backend
railway up
```

---

## 🎨 Deploy do Frontend

### 1. Preparar Frontend para Produção
```bash
cd frontend

# Atualizar .env para produção
echo "VITE_API_URL=https://backend-service.up.railway.app/api" > .env

# Build
npm run build
```

### 2. Criar Novo Service no Railway
No Railway Dashboard:
1. Create New Service
2. Select "Empty Service"
3. Connect GitHub repo ou upload files

### 3. Configurar Environment Variables
No Railway Dashboard > Frontend Service:
```bash
VITE_API_URL=https://backend-service.up.railway.app/api
```

### 4. Deploy Frontend
```bash
cd frontend
railway up
```

---

## 📋 Scripts Automatizados

### deploy-railway.bat
```batch
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
```

---

## 🔧 Configurações Railway Específicas

### Backend (railway.toml)
```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 30
restartPolicyType = "never"

[[services]]
name = "backend"
source = "backend"

[services.variables]
NODE_ENV = "production"
PORT = "5001"
```

### Frontend (railway.toml)
```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/"
healthcheckTimeout = 30

[[services]]
name = "frontend"
source = "frontend"

[build.env]
VITE_API_URL = "https://backend-service.up.railway.app/api"
```

---

## 🔐 Ajustes de Segurança para Produção

### CORS no Backend (server.js)
```javascript
const allowedOrigins = [
  'http://localhost:5173',                    // Development
  'https://frontend-service.up.railway.app', // Production Frontend
  'https://seu-dominio-custom.com'            // Custom domain se tiver
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### Package.json do Frontend
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "serve": "vite preview --port 3000 --host 0.0.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 🌍 Environment Variables Completas

### Development (.env)
```bash
# Backend
DATABASE_URL=postgresql://postgres:SENHA@HOST:PORT/railway
NODE_ENV=development
PORT=5001
JWT_SECRET=secret123

# Frontend
VITE_API_URL=http://localhost:5001/api
```

### Production (Railway Dashboard)
```bash
# Backend Service
DATABASE_URL=postgresql://postgres:SENHA@HOST:PORT/railway
NODE_ENV=production
PORT=5001
JWT_SECRET=jwt_secreto_super_seguro_producao_123456

# Frontend Service
VITE_API_URL=https://backend-service.up.railway.app/api
```

---

## 📊 Monitoramento

### Health Check
```javascript
// Já existe no server.js
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'connected'
  });
});
```

### URLs de Verificação
- **Backend Health**: https://backend-service.up.railway.app/api/health
- **Frontend**: https://frontend-service.up.railway.app
- **Database**: Railway Dashboard

---

## 🚀 Processo Completo

### Primeira vez:
```bash
# 1. Instalar CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link projeto
railway link [PROJECT_ID]

# 4. Deploy
./deploy-railway.bat
```

### Deploys subsequentes:
```bash
# Só executar:
./deploy-railway.bat
```

---

## 🔍 Verificação Pós-Deploy

### Checklist:
- [ ] Backend responde: `curl https://backend-service.up.railway.app/api/health`
- [ ] Frontend carrega: `https://frontend-service.up.railway.app`
- [ ] Login funciona na produção
- [ ] Busca de empresas funciona
- [ ] Paginação funciona
- [ ] Exportação funciona

### Comandos de Debug:
```bash
# Ver logs do backend
railway logs --service backend

# Ver logs do frontend  
railway logs --service frontend

# Status dos serviços
railway status
```

---

## ⚡ Para Claude Code Executar:

### Deploy Completo:
> **"Execute deploy-railway.bat para fazer deploy completo no Railway conforme DEPLOY.md"**

### Deploy só Backend:
> **"Execute deploy do backend no Railway conforme DEPLOY.md"**

### Deploy só Frontend:
> **"Execute deploy do frontend no Railway conforme DEPLOY.md"**

---

## 🎯 URLs Finais

Após deploy completo no Railway:

- **Aplicação**: https://frontend-service.up.railway.app
- **API**: https://backend-service.up.railway.app/api
- **Health Check**: https://backend-service.up.railway.app/api/health
- **Database**: Railway PostgreSQL Dashboard

## 💡 Vantagens do Railway:

✅ Tudo em um lugar só
✅ Database já configurado
✅ SSL automático
✅ Logs centralizados
✅ Scaling automático
✅ Deploy simples