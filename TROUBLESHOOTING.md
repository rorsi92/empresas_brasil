# 🔧 Guia de Troubleshooting - Empresas Brasil
## ⚡ VERSÃO OTIMIZADA v4 - SAVEPOINT LOGIN FUNCIONAL GARANTIDO

### 🚀 OTIMIZAÇÕES ATIVAS v4:
- Query única com JOINs otimizados
- Cache inteligente (node-cache)
- Connection pooling aprimorado
- Busca paralela de dados
- Barra progresso otimizada (sem overhead)
- Logs backend otimizados
- **🆕 LOGIN GARANTIDO** - Configuração testada e funcionando 100%
- **🚨 CRÍTICO**: frontend/.env = VITE_API_URL=/api (NUNCA mudar!)
- Performance v4: ~36s para 50k empresas, ~1.8s para 1k empresas, login instantâneo

## 🚨 Problemas Comuns e Soluções

### 🚨 PROBLEMA #1 MAIS COMUM: LOGIN NÃO FUNCIONA

#### ❌ Sintomas:
- Login retorna erro
- "Failed to fetch" ou erro de rede
- Token não é gerado
- Não consegue autenticar

#### ✅ SOLUÇÃO DEFINITIVA:
**SEMPRE verifique o arquivo `frontend/.env`:**
```bash
# CORRETO (USA PROXY):
VITE_API_URL=/api

# ❌ ERRADO (CONEXÃO DIRETA):
VITE_API_URL=http://localhost:5001/api
```

**Como corrigir:**
```bash
# 1. Editar arquivo
echo "VITE_API_URL=/api" > frontend/.env

# 2. Reiniciar frontend
cd frontend && npm run dev

# 3. Testar login em http://localhost:3003
```

**Por que acontece:**
- `/api` usa proxy do Vite (funciona)
- `http://localhost:5001/api` tenta conexão direta (falha CORS)

---

### 2. ❌ Backend não inicia

#### Problema: "Porta 5001 já está em uso"
```bash
# Verificar que processo está usando a porta
netstat -ano | findstr :5001

# Matar o processo (substitua PID_NUMBER pelo número do processo)
taskkill /PID [PID_NUMBER] /F

# Ou reiniciar o computador se persistir
```

#### Problema: "Cannot connect to database"
```bash
# Verificar se DATABASE_URL está configurado
echo $DATABASE_URL  # Linux/Mac
echo %DATABASE_URL% # Windows

# Verificar arquivo .env existe
ls backend/.env     # Linux/Mac
dir backend\.env    # Windows
```

**Solução:**
1. Criar `backend/.env` com DATABASE_URL
2. Verificar credenciais do Railway
3. Testar conexão internet

#### Problema: "Module not found" ou "Cannot find module 'node-cache'"
```bash
# NOVO: Verificar se node-cache está instalado (dependência das otimizações)
cd backend
npm list node-cache

# Se não estiver instalado:
npm install node-cache

# Ou reinstalar todas as dependências
rm -rf node_modules  # Linux/Mac
rmdir /s node_modules # Windows
npm install
```

#### ⚠️ NOVO v3: Problema: "Serviços não iniciam automaticamente"
**Causa:** Script antigo que não inicia serviços automaticamente
**Solução ESPECÍFICA para Claude Code v3:** 
1. **SEMPRE use o Bash tool** do Claude Code
2. **Navegue para a pasta**: `cd "D:\Projetos Cursor\Youtube Aula"`
3. **Execute start-all.bat**: `./start-all.bat`
4. **🆕 Aguarde**: Script iniciará backend e frontend automaticamente em janelas separadas
5. **🆕 Verificar**: Duas novas janelas devem aparecer ("Backend Server" e "Frontend Dev Server")
6. **🆕 Acesse**: http://localhost:5173 deve estar funcionando em ~10 segundos

**Exemplo correto no Claude Code v3:**
```bash
cd "D:\Projetos Cursor\Youtube Aula"
./start-all.bat
# ✅ Script completa rapidamente 
# ✅ Serviços continuam rodando em janelas separadas
# ✅ URLs prontas para uso
```

---

### 2. ❌ Frontend não inicia

#### Problema: "VITE_API_URL not defined"
**Solução:**
```bash
# Criar frontend/.env
echo "VITE_API_URL=http://localhost:5001/api" > frontend/.env
```

#### Problema: "Port 5173 is already in use"
```bash
# Matar processo Vite
# Windows
taskkill /f /im node.exe
# Linux/Mac
pkill -f vite
```

#### Problema: "Failed to resolve import"
```bash
# Limpar cache e reinstalar
cd frontend
rm -rf node_modules .vite
npm install
npm run dev -- --force
```

---

### 3. 🌐 Problemas de Conexão

#### Frontend não conecta com Backend
**Diagnóstico:**
1. Backend está rodando? → http://localhost:5001/api/health
2. Frontend está na porta correta? → 5173
3. CORS configurado? → Verificar console do navegador

**Soluções:**
```bash
# 1. Verificar se backend responde
curl http://localhost:5001/api/health

# 2. Verificar .env frontend
cat frontend/.env

# 3. Reiniciar ambos serviços
./start-all.bat
```

#### Erro 404 nas rotas da API
**Causa:** Rota incorreta ou servidor não iniciado
**Solução:**
```javascript
// Verificar em frontend/src/services/empresaService.js
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Deve ser: http://localhost:5001/api
```

---

### 4. 🐌 Performance Problems (OTIMIZADA)

#### ✅ NOVO: Performance Melhorada v2 (SAVEPOINT)
**Benchmarks atuais após otimizações v2:**
- 1.000 empresas: ~1.8s (cache ativo)
- 5.000 empresas: ~15s  
- 10.000 empresas: ~20s
- 25.000 empresas: ~25s
- 50.000 empresas: ~36s (primeira consulta +3s devido ao cache)

#### Se ainda estiver lento (40+ segundos):
**Possíveis causes:**
- Cache não ativo (node-cache não instalado)
- Connection pool não otimizado
- Railway com latência alta hoje

**Soluções:**
```bash
# 1. Verificar se otimizações estão ativas
curl -X POST http://localhost:5001/api/companies/filtered \
  -H "Content-Type: application/json" \
  -d '{"companyLimit": 1000, "situacaoCadastral": "02"}' \
  | grep -o '"queryTimeMs":[0-9]*'

# 2. Reinstalar dependências otimizadas
cd backend
npm install node-cache
npm restart

# 3. Usar o start-all.bat atualizado (verifica node-cache)
./start-all.bat
```

#### Timeout de conexão
```javascript
// Aumentar timeout no frontend (empresaService.js)
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000 // 60 segundos
});
```

---

### 5. 📊 Problemas de Dados

#### Paginação não funciona
**Diagnóstico:** Verificar se:
1. Backend retorna `pagination` object
2. Frontend mostra controles de paginação
3. Botões Next/Previous estão funcionais

**Teste rápido:**
```bash
# Testar API diretamente
curl -X POST http://localhost:5001/api/companies/filtered \
  -H "Content-Type: application/json" \
  -d '{"uf": "AC", "situacaoCadastral": "02", "companyLimit": 1000, "page": 1}'
```

#### Exportação não funciona
**Causa comum:** Dados muito grandes
**Solução:**
1. Reduzir filtros para menos empresas
2. Verificar console do navegador
3. Limpar cache do navegador

---

### 6. 🔐 Problemas de Autenticação

#### Token inválido/expirado
```javascript
// Limpar localStorage
localStorage.removeItem('token');
localStorage.removeItem('user');

// Fazer login novamente
```

#### Erro 401 Unauthorized
1. Verificar se token existe no localStorage
2. Token pode ter expirado (24h)
3. Fazer logout/login

---

### 7. 🛠️ Comandos de Reset Completo

#### Reset Total (quando nada funciona):
```bash
# 1. Parar todos os processos
# Windows: Fechar todas as janelas do terminal
# Ou Ctrl+C em todos os terminais

# 2. Limpar tudo
cd backend
rm -rf node_modules
cd ../frontend  
rm -rf node_modules .vite

# 3. Reinstalar tudo
cd ../backend && npm install
cd ../frontend && npm install

# 4. Reiniciar
cd ..
./start-all.bat
```

#### Reset do Banco (Railway):
```sql
-- CUIDADO: Só se necessário
-- Conectar no Railway dashboard e executar:
-- TRUNCATE TABLE estabelecimentos CASCADE;
-- (Isso apagará todos os dados!)
```

---

### 8. 📝 Logs e Debugging

#### Backend Logs:
```bash
# Iniciar com logs detalhados
cd backend
DEBUG=* npm start
```

#### Frontend Console:
```javascript
// Abrir DevTools (F12)
// Verificar:
// 1. Console para erros JavaScript
// 2. Network para requests HTTP
// 3. Application para localStorage
```

---

### 9. 🔍 Verificação de Integridade

#### Checklist de arquivos críticos:
```bash
# Verificar se todos os arquivos existem
ls -la backend/server.js        # ✅ Deve existir
ls -la frontend/.env           # ✅ Deve existir
ls -la backend/.env            # ✅ Deve existir
ls -la run-server.js           # ✅ Deve existir
ls -la start-all.bat           # ✅ Deve existir

# Verificar conteúdo dos .env
cat frontend/.env              # Deve ter VITE_API_URL
cat backend/.env               # Deve ter DATABASE_URL
```

---

### 10. 📞 Quando Pedir Ajuda

Se após seguir este guia o problema persistir, forneça:

1. **Sistema Operacional**: Windows/Linux/Mac
2. **Node.js Version**: `node --version`
3. **Erro específico**: Screenshot ou copy/paste
4. **O que estava fazendo**: Passo a passo
5. **Logs**: Console errors ou terminal output

#### Informações úteis para debug:
```bash
# Versões
node --version
npm --version

# Status dos serviços
curl http://localhost:5001/api/health
curl http://localhost:5173

# Processos rodando
netstat -ano | findstr :5001
netstat -ano | findstr :5173
```

---

## ✅ Prevenção de Problemas

### ⚡ NOVO v4: WORKFLOW GARANTIDO PARA LOGIN FUNCIONAR:
1. **IMPORTANTE**: Use o Bash tool do Claude Code
2. **Navegue**: `cd "D:\Projetos Cursor\Youtube Aula"`
3. **🚨 VERIFICAR frontend/.env**: `cat frontend/.env` deve mostrar `VITE_API_URL=/api`
4. **Se não estiver correto**: `echo "VITE_API_URL=/api" > frontend/.env`
5. **Execute backend**: `cd backend && npm start` (run_in_background: true)
6. **Execute frontend**: `cd frontend && npm run dev` (run_in_background: true)
7. **🆕 Verificar URLs**: Backend em 5001, Frontend em 3003
8. **Teste** http://localhost:3003 (via navegador)
9. **🚨 TESTE LOGIN OBRIGATÓRIO**: rodyrodrigo@gmail.com / 123456
10. **Se login falhar**: Volte ao passo 3 e verifique .env novamente!

### 🔧 Comandos Claude Code Específicos:
```bash
# Inicialização completa (SEMPRE COM ASPAS!)
cd "D:\Projetos Cursor\Youtube Aula" && ./start-all.bat

# Apenas backend (run_in_background: true)
cd "D:\Projetos Cursor\Youtube Aula\backend" && npm start

# Apenas frontend (run_in_background: true)  
cd "D:\Projetos Cursor\Youtube Aula\frontend" && npm run dev

# Verificar se está rodando
curl http://localhost:5001/api && curl http://localhost:5173
```

### Backup das configurações:
- Salve uma cópia do `.env` em local seguro
- Mantenha este TROUBLESHOOTING.md atualizado
- Use `git status` para verificar alterações

### ⚡ Performance tips v2 (OTIMIZADO):
- **NOVO v2**: Sistema otimizado com barra progresso SEM overhead (~36s para 50k)
- **Cache ativo**: Primeira consulta +3s, subsequentes muito rápidas
- **Connection pooling**: 5-20 conexões simultâneas otimizadas
- **Logs otimizados**: Backend com logging mínimo para máxima velocidade
- Use estados pequenos (AC, TO) para testes rápidos (~1.8s)
- Sistema suporta SP, RJ, MG com performance otimizada
- Evite consultas sem filtros (obrigatório pelo menos 1 filtro)
- companyLimit: 1k-50k (otimizado para todos os volumes)
- Feche abas não utilizadas do navegador para economizar RAM

### 🔧 Verificação do SAVEPOINT v4 - LOGIN FUNCIONAL:
```bash
# 🚨 VERIFICAÇÃO CRÍTICA DO LOGIN:
# 1. Verificar .env correto:
cat frontend/.env
# Deve mostrar: VITE_API_URL=/api

# 2. Se incorreto, corrigir:
echo "VITE_API_URL=/api" > frontend/.env

# 3. Verificar vite.config.js:
grep -A5 "proxy" frontend/vite.config.js
# Deve mostrar proxy para localhost:5001

# 4. Testar backend diretamente:
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "rodyrodrigo@gmail.com", "password": "123456"}'
# Deve retornar token

# 5. Testar através do proxy:
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "rodyrodrigo@gmail.com", "password": "123456"}'
# Deve retornar token

# 6. Verificar otimizações v4:
cd backend && npm list node-cache  # Deve mostrar versão instalada

# 7. Teste final obrigatório:
# Abrir http://localhost:3003 no navegador
# Login com rodyrodrigo@gmail.com / 123456
# DEVE FUNCIONAR SEM ERROS!
```