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
- **OBRIGATÓRIO**: Usa `run-server.js` para evitar timeout no Claude Code
- Frontend: `npm run dev` (usa configuração do vite.config.js)
- Backend: `node run-server.js` (através do claude-startup.js)
- **NÃO execute comandos npm diretamente no backend - sempre use claude-startup.js**

### Para Iniciar a Aplicação

**IMPORTANTE**: SEMPRE usar este comando para evitar timeout:

```bash
node claude-startup.js
```

**NUNCA use comandos separados** como `npm run dev` no backend - isso causa timeout no Claude Code. O `claude-startup.js` já está configurado para usar o `run-server.js` que evita problemas de timeout.

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
**⚠️ CONFIGURAÇÃO CRÍTICA - NUNCA ALTERAR**

### 🎯 SISTEMA 100% FUNCIONAL 

#### Performance Confirmada:
- **1.000 empresas**: 1,7-2,0 segundos ✅
- **50.000 empresas**: ~2,5 minutos (50 páginas) ✅  
- **Barra de progresso**: Corrigida - não trava em 90% ✅
- **Dados completos**: Empresas + Sócios + Representantes ✅

#### 🔒 REGRAS OBRIGATÓRIAS:
1. **SEMPRE usar**: `node claude-startup.js`
2. **NUNCA mexer**: Dashboard.jsx linhas 442-449 (barra de progresso)  
3. **NUNCA mexer**: server.js query SQL (linhas 419-468)
4. **NUNCA usar**: comandos npm separados no backend

#### 📊 Último Teste de Produção:
- **Data**: 2025-08-18 14:05
- **Filtro**: SP + Vestuário + 50.000 empresas
- **Resultado**: 1,7s por 1000 empresas
- **Status**: ✅ ZERO BUGS

**🚨 ATENÇÃO**: Qualquer alteração nessas configurações quebra o sistema!