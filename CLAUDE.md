# Claude Code - Configuração do Projeto

## ✅ SETUP VERIFICADO E FUNCIONANDO

### Portas e URLs
- **Frontend**: http://localhost:4001 (Vite)
- **Backend**: http://localhost:6000 (Express)
- **Database**: Railway PostgreSQL

### Arquivos de Configuração Importantes

#### 1. frontend/vite.config.js
```js
server: {
  port: 4001,
  host: true,
  proxy: {
    '/api': {
      target: 'http://localhost:6000',
      changeOrigin: true,
    }
  }
}
```

#### 2. claude-startup.js
- Usa `run-server.js` para evitar timeout
- Frontend: `npm run dev` (usa configuração do vite.config.js)
- Backend: `node run-server.js`

### Para Iniciar a Aplicação

```bash
node claude-startup.js
```

### Verificações de Status

1. **Backend funcionando**:
   ```bash
   curl http://localhost:6000/api/filters/options
   ```
   Deve retornar JSON com segmentos de negócio.

2. **Frontend funcionando**:
   ```bash
   curl http://localhost:4001
   ```
   Deve retornar HTML da aplicação React.

### Estrutura do Dashboard
- Dashboard.jsx usa a API `/api/companies/filtered` (POST)
- Filtros carregados de `/api/filters/options` (GET)
- Proxy configurado no Vite para rotear /api para localhost:6000

### Problemas Comuns Resolvidos

❌ **Erro**: Frontend não carrega
✅ **Solução**: Verificar se vite.config.js tem `port: 4001` e `host: true`

❌ **Erro**: API não responde  
✅ **Solução**: Backend deve estar rodando na porta 6000

❌ **Erro**: Timeout no startup
✅ **Solução**: Usar `run-server.js` no claude-startup.js

### Status dos Serviços (Último Check)
- ✅ Backend: Conectado ao Railway PostgreSQL
- ✅ Frontend: Vite rodando com hot-reload
- ✅ API: Endpoints respondendo corretamente
- ✅ Database: 66M empresas disponíveis

### Comandos de Teste Rápido

```bash
# Testar backend
curl http://localhost:6000/api/filters/options

# Testar frontend  
curl http://localhost:4001

# Ver processos Node
tasklist | findstr node
```

---
**Data da última verificação**: 2025-08-18  
**Status**: ✅ FUNCIONANDO CORRETAMENTE