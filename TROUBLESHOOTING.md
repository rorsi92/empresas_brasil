# 🚨 Guia de Solução de Problemas - Empresas Brasil

Este guia contém soluções para todos os problemas conhecidos do sistema.

## 🛠️ Problemas de Inicialização

### ❌ Erro: "Terminal fica vermelho e sou expulso"
**Causa**: O comando `taskkill /f /im node.exe` mata o próprio Claude Code  
**Solução**: ✅ CORRIGIDO na versão atual
```bash
# Use sempre este comando:
node claude-startup.js

# O sistema agora mata apenas processos específicos das portas 6000 e 4001
```

### ❌ Erro: "Timeout no startup"
**Causa**: Usar comandos npm diretos no backend  
**Solução**:
```bash
# ✅ CORRETO - usar sempre:
node claude-startup.js

# ❌ NUNCA fazer:
npm run dev  # no backend
cd backend && npm start  # diretamente
```

## 🔍 Problemas de Busca

### ❌ Erro: "CNPJ não encontrado" (PRINCIPAL CORRIGIDO)
**Problema anterior**: CNPJ levava 23+ segundos e às vezes não achava  
**Solução aplicada**: ✅ Otimização de query (80x mais rápido)

**Como testar**:
```bash
# Busca deve ser instantânea (0.3s):
curl -X POST http://localhost:6000/api/companies/filtered \
  -H "Content-Type: application/json" \
  -d '{"cnpj":"17815939000107","companyLimit":1000}'

# Resultado esperado: 1 empresa em ~300ms
```

### ❌ Erro: "Formato CNPJ inválido"
**Causa**: Frontend não limpa formatação antes de enviar  
**Solução**: ✅ CORRIGIDO - Sistema aceita qualquer formato:
- `17815939000107` ✅
- `17.815.939/0001-07` ✅ (formatado automaticamente)

## 📊 Problemas de Performance

### ❌ Erro: "Query muito lenta (>30s)"
**Causas possíveis**:
1. **Query sem índice** - ✅ CORRIGIDO
2. **Muitos resultados** - Use filtros mais específicos
3. **Database timeout** - Normal para >25k empresas

## 🔧 Comandos de Diagnóstico

### Verificação Completa do Sistema
```bash
# 1. Verificar processos
tasklist | findstr node

# 2. Testar backend
curl http://localhost:6000/api/filters/options

# 3. Testar frontend
curl http://localhost:4001

# 4. Testar busca CNPJ (deve ser <1s)
curl -X POST http://localhost:6000/api/companies/filtered \
  -H "Content-Type: application/json" \
  -d '{"cnpj":"17815939000107","companyLimit":1000}'
```

## 🚨 Procedimento de Recuperação Total

Se tudo estiver quebrado:

### 1. Reset Completo
```bash
# Parar tudo (se necessário)
taskkill /f /im node.exe

# Aguardar 5 segundos
timeout 5

# Reiniciar
node claude-startup.js
```

### 2. Verificação Passo-a-Passo
```bash
# Aguardar backend iniciar (10-15s)
# Verificar: 🚀 Server running on port 6000

# Aguardar frontend iniciar (5-10s) 
# Verificar: ➜ Local: http://localhost:4001

# Aguardar verificação final (5s)
# Verificar: 🔙 Backend: ✅ OK | 🎨 Frontend: ✅ OK
```

## 📋 Checklist de Verificação

### ✅ Sistema Funcionando Quando:
- [x] `node claude-startup.js` executa sem erros
- [x] Backend mostra: `🚀 Server running on port 6000`
- [x] Frontend mostra: `➜ Local: http://localhost:4001`
- [x] `curl http://localhost:6000/api/filters/options` retorna JSON
- [x] `curl http://localhost:4001` retorna HTML
- [x] Busca de 1000 empresas leva <5s
- [x] Busca por CNPJ leva <1s

### ❌ Sistema com Problema Quando:
- [x] Terminal fica vermelho/travado
- [x] Timeout na inicialização (>30s)
- [x] API retorna 500/502/504
- [x] Frontend mostra tela branca
- [x] Buscas levam >30s
- [x] CNPJ não encontra empresas existentes

---

**🚀 Sistema testado e funcionando - Siga este guia que tudo funcionará!**