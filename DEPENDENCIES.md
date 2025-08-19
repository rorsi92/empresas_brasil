# 📦 Dependências e Configurações do Projeto

## 🔧 Backend Dependencies (backend/package.json)

### Produção:
```json
{
  "bcryptjs": "^2.4.3",           // Criptografia de senhas
  "better-sqlite3": "^12.2.0",    // SQLite local (backup)
  "cli-progress": "^3.12.0",      // Barras de progresso
  "colors": "^1.4.0",             // Cores no terminal
  "cors": "^2.8.5",               // CORS para frontend
  "dotenv": "^16.4.5",            // Variáveis de ambiente
  "express": "^5.1.0",            // Framework web
  "express-rate-limit": "^7.4.1", // Rate limiting
  "express-validator": "^7.2.0",  // Validação de dados
  "helmet": "^8.0.0",             // Segurança HTTP
  "jsonwebtoken": "^9.0.2",       // JWT tokens
  "pg": "^8.16.3",                // PostgreSQL client
  "pg-copy-streams": "^7.0.0",    // Streaming PostgreSQL
  "xlsx": "^0.18.5"               // Exportação Excel
}
```

### Desenvolvimento:
```json
{
  "nodemon": "^3.1.7"             // Auto-restart do servidor
}
```

## 🎨 Frontend Dependencies (frontend/package.json)

### Produção:
```json
{
  "react": "^18.3.1",             // React framework
  "react-dom": "^18.3.1",         // React DOM
  "react-router-dom": "^6.x",     // Roteamento
  "styled-components": "^6.x",    // CSS-in-JS
  "axios": "^1.x",                // HTTP client
  "react-toastify": "^10.x"       // Notificações
}
```

### Desenvolvimento:
```json
{
  "@vitejs/plugin-react": "^4.x", // Plugin React para Vite
  "vite": "^5.x",                 // Build tool
  "eslint": "^8.x",               // Linting
  "@types/react": "^18.x",        // TypeScript types
  "@types/react-dom": "^18.x"     // TypeScript types
}
```

## 🔐 Variáveis de Ambiente

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://postgres:SENHA@HOST:PORT/railway

# Server
NODE_ENV=production
PORT=5001

# JWT (opcional - tem fallback)
JWT_SECRET=secret123
```

### Frontend (.env)
```bash
# API Configuration
VITE_API_URL=http://localhost:5001/api
```

## 🗄️ Configuração do Banco (Railway PostgreSQL)

### Schema Principal:
- **estabelecimentos**: Dados principais das empresas
- **empresas**: Dados complementares (capital, natureza jurídica)
- **socios**: Informações dos sócios
- **cnae_segments**: Segmentos de negócio
- **municipios**: Dados dos municípios

### Índices Importantes:
```sql
-- Performance crítica
CREATE INDEX idx_estabelecimentos_uf ON estabelecimentos(uf);
CREATE INDEX idx_estabelecimentos_situacao ON estabelecimentos(situacao_cadastral);
CREATE INDEX idx_estabelecimentos_cnae ON estabelecimentos(cnae_fiscal);
CREATE INDEX idx_estabelecimentos_cnpj_basico ON estabelecimentos(cnpj_basico);
```

## ⚙️ Configurações do Servidor (server.js)

### Portas:
- **Backend**: 5001 (evita conflito com porta 5000)
- **Frontend**: 5173 (padrão Vite)

### CORS:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

### Rate Limiting:
```javascript
// 100 requests por 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### Pool de Conexões PostgreSQL:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

## 📁 Estrutura de Arquivos Críticos

### Arquivos que DEVEM existir:
```
✅ backend/server.js          # Servidor principal
✅ backend/package.json       # Dependências backend
✅ backend/.env              # Variáveis de ambiente
✅ frontend/package.json     # Dependências frontend
✅ frontend/.env             # Config API URL
✅ frontend/src/App.jsx      # App principal React
✅ run-server.js             # Script de inicialização
```

### Arquivos legados (podem deletar):
```
❌ server_complete.js         # Arquivo antigo
❌ server_simple.js          # Arquivo antigo
❌ test_*.js                 # Arquivos de teste antigos
```

## 🔍 Scripts de Package.json

### Backend:
```json
{
  "scripts": {
    "start": "node server.js",      // Produção
    "dev": "nodemon server.js",     // Desenvolvimento
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### Frontend:
```json
{
  "scripts": {
    "dev": "vite",                  // Desenvolvimento
    "build": "vite build",          // Build produção
    "preview": "vite preview"       // Preview build
  }
}
```

## 🚨 Configurações Críticas

### 1. Database Connection:
- **OBRIGATÓRIO**: DATABASE_URL no .env do backend
- **SSL**: Sempre true para Railway
- **Pool**: Configurado para Railway shared resources

### 2. CORS:
- Frontend deve estar em localhost:5173
- Backend em localhost:5001
- Credenciais habilitadas

### 3. JWT:
- Secret configurável via .env
- Fallback: 'secret123'
- Expiração: 24 horas

### 4. File Structure:
- **run-server.js** aponta para backend/server.js
- **start-all.bat** inicia ambos os serviços
- **.env** files configurados corretamente

## ✅ Checklist de Verificação

Antes de iniciar, verifique:

- [ ] Node.js instalado (v18+)
- [ ] DATABASE_URL configurado
- [ ] Portas 5001 e 5173 livres
- [ ] backend/.env existe
- [ ] frontend/.env existe
- [ ] Dependências instaladas (npm install)
- [ ] server.js é o arquivo principal

## 🎯 Performance Settings

### Railway PostgreSQL:
- Shared resources (limited CPU/memory)
- Connection pooling configurado
- Queries otimizadas para Railway
- Timeout de 30 segundos

### Frontend:
- Vite para desenvolvimento rápido
- Lazy loading de componentes
- Paginação para grandes datasets
- Cache de resultados