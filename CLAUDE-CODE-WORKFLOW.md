# 🤖 Claude Code - Workflow Específico
## ⚡ INICIALIZAÇÃO OTIMIZADA PARA CLAUDE CODE

### 🎯 COMO INICIAR NO CLAUDE CODE (SEU MÉTODO PREFERIDO)

#### Método 1: Comando Único (RECOMENDADO)
```bash
cd "D:\Projetos Cursor\Youtube Aula" && ./start-all.bat
```

#### Método 2: Passo a Passo com Background
```bash
# 1. Navegar para pasta
cd "D:\Projetos Cursor\Youtube Aula"

# 2. Backend em background (use run_in_background: true)
cd backend && npm start

# 3. Frontend em background (nova execução do Bash tool)
cd "D:\Projetos Cursor\Youtube Aula\frontend" && npm run dev
```

#### Método 3: Verificar Status
```bash
# Verificar se serviços estão rodando
cd "D:\Projetos Cursor\Youtube Aula" && curl -m 5 http://localhost:5001/api && curl -m 5 http://localhost:5173
```

### 🔧 Tools do Claude Code para Monitorar

#### 1. Bash Tool
- Use para executar comandos
- `run_in_background: true` para manter rodando
- `timeout: 60000` para comandos longos

#### 2. BashOutput Tool  
- Use para monitorar processos em background
- `bash_id` do processo que você iniciou
- Monitore logs em tempo real

#### 3. Read Tool
- Para verificar arquivos de log
- Para conferir configurações (.env)

### ⚡ OTIMIZAÇÕES ATIVAS (SAVEPOINT)

Seu sistema agora tem:
- **Query única**: elimina múltiplas consultas
- **Cache inteligente**: lookup tables em cache (node-cache)
- **Connection pooling**: 5-20 conexões otimizadas
- **Busca paralela**: dados em paralelo
- **Performance**: ~30s para 50.000 empresas

### 📋 Checklist Claude Code

#### ✅ Antes de Iniciar:
```bash
# 1. Verificar pasta
cd "D:\Projetos Cursor\Youtube Aula" && pwd

# 2. Verificar node-cache instalado
cd backend && npm list node-cache

# 3. Instalar se necessário
npm install node-cache
```

#### ✅ Inicialização:
```bash
# Comando completo (copie e cole)
cd "D:\Projetos Cursor\Youtube Aula" && ./start-all.bat
```

#### ✅ Verificação:
```bash
# Status dos serviços
netstat -ano | findstr :5001 && netstat -ano | findstr :5173

# Health check
curl http://localhost:5001/api && echo "Backend OK"
curl http://localhost:5173 && echo "Frontend OK"
```

### 🚀 URLs de Acesso

- **Frontend**: http://localhost:5173 (ou 3001 se 5173 ocupado)
- **Backend API**: http://localhost:5001/api  
- **Health Check**: http://localhost:5001

### 🔧 Troubleshooting Claude Code

#### Problema: "start-all.bat não encontrado"
```bash
# Verificar se está na pasta certa
cd "D:\Projetos Cursor\Youtube Aula"
ls -la start-all.bat
```

#### Problema: "Comando trava"
- Use `timeout: 60000` no Bash tool
- Para comandos longos, use `run_in_background: true`
- Monitore com BashOutput tool

#### Problema: "npm install falha"
```bash
# Limpar cache
cd "D:\Projetos Cursor\Youtube Aula\backend"
rm -rf node_modules
npm cache clean --force
npm install
```

### 📊 Performance Esperada

Com as otimizações ativas:
- **1.000 empresas**: ~22s
- **5.000 empresas**: ~18s
- **10.000 empresas**: ~17s
- **25.000 empresas**: ~24s
- **50.000 empresas**: ~30s

### 💡 Dicas Claude Code

1. **Sempre use aspas** para paths com espaços: `"D:\Projetos Cursor\Youtube Aula"`
2. **Use && para comandos em sequência**: `cd pasta && comando`
3. **Use timeout adequado**: 60000ms para comandos lentos
4. **Use run_in_background**: para manter serviços rodando
5. **Use BashOutput**: para monitorar processos

### 🎉 Comando Completo para Copiar/Colar

```bash
cd "D:\Projetos Cursor\Youtube Aula" && echo "Iniciando sistema otimizado..." && ./start-all.bat
```

**Pronto! Seu workflow Claude Code está otimizado para máxima performance! 🚀**