# 🚀 GUIA DE DEPLOY NO RAILWAY

## 📋 Pré-requisitos

1. Conta no Railway (https://railway.app)
2. Conta no GitHub
3. Projeto commitado no GitHub
4. Banco de dados PostgreSQL (já configurado no Railway)

## 🔧 PASSO 1: Deploy do Backend

### 1.1 Criar Projeto no Railway
1. Acesse https://railway.app
2. Clique em "New Project"
3. Escolha "Deploy from GitHub repo"
4. Selecione este repositório
5. Escolha a pasta `backend` como root directory

### 1.2 Configurar Variáveis de Ambiente

No Railway Dashboard do backend, vá em **Variables** e configure:

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway
JWT_SECRET=sua-chave-jwt-super-segura-aqui-32-caracteres-minimo
JWT_REFRESH_SECRET=sua-chave-refresh-super-segura-aqui-32-caracteres-minimo
SENDGRID_API_KEY=SG.sua-chave-sendgrid
EMAIL_FROM=noreply@empresasbrasil.com
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=https://SEU-FRONTEND.railway.app
```

### 1.3 Configurar Custom Domain (Opcional)
1. No Railway Dashboard, vá em **Settings**
2. Clique em **Domains**  
3. Clique em **Custom Domain**
4. Configure seu domínio (ex: api.empresasbrasil.com)

## 🎨 PASSO 2: Deploy do Frontend

### 2.1 Criar Segundo Projeto no Railway
1. No Railway, clique em "New Project"
2. Escolha "Deploy from GitHub repo"
3. Selecione o mesmo repositório
4. Escolha a pasta `frontend` como root directory

### 2.2 Configurar Variáveis de Ambiente do Frontend

No Railway Dashboard do frontend, vá em **Variables** e configure:

```env
VITE_API_URL=https://SEU-BACKEND.railway.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
```

**IMPORTANTE**: Substitua `SEU-BACKEND.railway.app` pela URL real do seu backend.

### 2.3 Configurar Custom Domain (Opcional)
1. Configure domínio principal (ex: empresasbrasil.com)

## ⚙️ PASSO 3: Configurações Finais

### 3.1 Atualizar CORS no Backend
Após deploy do frontend, atualize a variável `FRONTEND_URL` no backend com a URL real do frontend.

### 3.2 Configurar Webhook do Stripe
1. No Stripe Dashboard, vá em **Developers > Webhooks**
2. Adicione endpoint: `https://SEU-BACKEND.railway.app/api/stripe/webhook`
3. Selecione eventos: `payment_intent.succeeded`, `customer.subscription.created`, etc.
4. Copie o webhook secret e atualize `STRIPE_WEBHOOK_SECRET`

## 🔍 PASSO 4: Verificação

### 4.1 Testar Backend
```bash
curl https://SEU-BACKEND.railway.app/api/check-tables
```

### 4.2 Testar Frontend  
Acesse `https://SEU-FRONTEND.railway.app` e teste:
- ✅ Landing page carrega
- ✅ Cadastro funciona
- ✅ Login funciona  
- ✅ Dashboard funciona
- ✅ Busca de empresas funciona
- ✅ Pagamento funciona

## 🚨 Troubleshooting

### Backend não inicia
- Verifique se `PORT` está como variável de ambiente
- Verifique se `DATABASE_URL` está correto
- Verifique logs no Railway Dashboard

### Frontend não carrega API
- Verifique se `VITE_API_URL` aponta para o backend correto
- Verifique CORS no backend
- Verifique se backend está rodando

### Pagamentos não funcionam
- Verifique `STRIPE_SECRET_KEY` e `STRIPE_PUBLISHABLE_KEY`
- Configure webhooks do Stripe corretamente
- Teste em modo sandbox primeiro

## 📊 Monitoring

- Use Railway Dashboard para monitorar logs
- Configure alerts para down time
- Monitore uso de recursos

## 💰 Custos Estimados

**Railway:**
- Backend: ~$5-10/mês
- Frontend: ~$5/mês  
- Database: Incluído

**Total: ~$10-15/mês**

## 🔐 Segurança

- ✅ HTTPS automático (Railway)
- ✅ Variáveis de ambiente protegidas
- ✅ CORS configurado
- ✅ Rate limiting ativado
- ✅ JWT tokens seguros

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs no Railway Dashboard
2. Teste endpoints individualmente
3. Verifique variáveis de ambiente
4. Consulte documentação do Railway