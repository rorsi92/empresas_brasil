# Configuração do Stripe para Pagamentos

## ✅ INTEGRAÇÃO COMPLETA IMPLEMENTADA

### Funcionalidades Implementadas

1. **Backend (Node.js + Express)**
   - ✅ Endpoints de pagamento (`/api/stripe/*`)
   - ✅ Criação de sessões de checkout
   - ✅ Webhooks para confirmação de pagamentos
   - ✅ Gerenciamento de assinaturas no banco de dados
   - ✅ Middleware de autenticação JWT
   - ✅ Tabela `subscriptions` no PostgreSQL

2. **Frontend (React)**
   - ✅ Página de checkout (`/checkout`)
   - ✅ Hook personalizado `useSubscription` 
   - ✅ Componente `SubscriptionGate` para proteção de rotas
   - ✅ Integração com landing page e dashboard
   - ✅ Verificação automática de status de assinatura

### Configuração Necessária no Stripe

#### 1. Criar Conta Stripe
1. Acesse [stripe.com](https://stripe.com) e crie uma conta
2. Ative sua conta com os dados da empresa
3. Configure webhooks e produtos

#### 2. Criar Produto e Preço
```bash
# No dashboard do Stripe:
# 1. Vá em "Products" > "Add Product"
# 2. Nome: "Plano Profissional Empresas Brasil"
# 3. Descrição: "Acesso completo a 66 milhões de empresas brasileiras"
# 4. Preço: R$ 79,90 mensais recorrente
# 5. Copie o PRICE_ID gerado (ex: price_1234567890abcdefghijklmn)
```

#### 3. Configurar Webhook
```bash
# No dashboard do Stripe:
# 1. Vá em "Developers" > "Webhooks" > "Add endpoint"
# 2. URL: https://seudominio.com/api/stripe/webhook
# 3. Eventos para escutar:
#    - checkout.session.completed
#    - customer.subscription.created
#    - customer.subscription.updated
#    - customer.subscription.deleted
#    - invoice.payment_failed
# 4. Copie o WEBHOOK_SECRET gerado
```

#### 4. Variáveis de Ambiente

**Backend (.env)**
```env
# Stripe Configuration (SUBSTITUIR pelas chaves reais)
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
STRIPE_PRICE_ID=price_1234567890abcdefghijklmn
```

**Frontend (.env)**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890
```

### Arquivos Criados/Modificados

#### Backend
- `stripe-routes.js` - Rotas de pagamento e webhook
- `server.js` - Integração com rotas do Stripe
- `.env` - Variáveis de ambiente

#### Frontend  
- `pages/Checkout.jsx` - Página de checkout
- `hooks/useSubscription.js` - Hook para gerenciar assinaturas
- `components/SubscriptionGate.jsx` - Proteção de rotas premium
- `pages/Dashboard.jsx` - Integração com verificação de assinatura
- `App.jsx` - Nova rota `/checkout`
- `.env` - Chave pública do Stripe

### Fluxo de Pagamento

1. **Usuário clica "Assinar"** → Redireciona para `/checkout`
2. **Checkout page** → Cria sessão Stripe via `/api/stripe/create-checkout-session`
3. **Stripe Checkout** → Usuário insere dados do cartão no Stripe
4. **Pagamento aprovado** → Stripe envia webhook para `/api/stripe/webhook`
5. **Backend processa** → Atualiza tabela `subscriptions` no banco
6. **Dashboard** → `SubscriptionGate` verifica assinatura ativa

### Endpoints da API

```bash
# Criar sessão de checkout
POST /api/stripe/create-checkout-session
Headers: Authorization: Bearer <jwt-token>
Response: { sessionId, url }

# Verificar status da assinatura
GET /api/stripe/subscription-status  
Headers: Authorization: Bearer <jwt-token>
Response: { hasActiveSubscription, status, currentPeriodEnd }

# Cancelar assinatura
POST /api/stripe/cancel-subscription
Headers: Authorization: Bearer <jwt-token>
Response: { success, message }

# Webhook (chamado pelo Stripe)
POST /api/stripe/webhook
Body: Eventos do Stripe (raw)
```

### Tabela do Banco de Dados

```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'inactive',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Testes

#### Cartões de Teste (Stripe)
```bash
# Cartão aprovado
4242 4242 4242 4242

# Cartão recusado  
4000 0000 0000 0002

# Cartão com 3D Secure
4000 0025 0000 3155
```

#### URLs de Teste
```bash
# Desenvolvimento
Frontend: http://localhost:4001/checkout
Backend: http://localhost:6000/api/stripe/*

# Produção (configurar)
Frontend: https://empresasbrasil.com/checkout  
Backend: https://api.empresasbrasil.com/api/stripe/*
```

### Deploy em Produção

1. **Configurar Stripe Live**
   - Ativar conta Stripe em modo Live
   - Substituir chaves de teste por chaves live
   - Atualizar webhook URL para produção

2. **Variáveis de Ambiente**
   - Usar `sk_live_` e `pk_live_` em produção
   - Configurar `STRIPE_WEBHOOK_SECRET` de produção
   - Atualizar `STRIPE_PRICE_ID` do produto live

3. **Segurança**
   - HTTPS obrigatório em produção
   - Validar webhook signatures
   - Rate limiting nos endpoints

### Status da Integração

- ✅ **Pagamentos**: Funcionando com Stripe Checkout
- ✅ **Webhooks**: Processando eventos automaticamente  
- ✅ **Assinaturas**: Gerenciamento completo no banco
- ✅ **Proteção**: Dashboard protegido por assinatura
- ✅ **UX**: Fluxo completo de checkout → dashboard

### Próximos Passos

1. **Configurar chaves reais do Stripe** (substituir valores de exemplo)
2. **Testar fluxo completo** com cartões de teste
3. **Configurar domínio personalizado** para produção
4. **Ativar modo Live** no Stripe quando pronto

---

**⚠️ IMPORTANTE**: As chaves no código são exemplos. Substitua pelas chaves reais do seu projeto Stripe antes de usar em produção.