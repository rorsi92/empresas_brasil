# Configuração do Webhook Stripe

## Passo a passo:

1. **Acessar Webhooks**
   - Dashboard Stripe → **"Developers"** → **"Webhooks"**
   - Clique **"Add endpoint"**

2. **Configurar URL do Webhook**
   ```
   Desenvolvimento: http://localhost:6000/api/stripe/webhook
   Produção: https://seudominio.com/api/stripe/webhook
   ```

3. **Selecionar Eventos** (Marque todos estes):
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`  
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.payment_succeeded`

4. **Salvar e Copiar**
   - Clique **"Add endpoint"**
   - Copie o **"Signing secret"** (começa com `whsec_`)

## URLs por Ambiente:

### Desenvolvimento (Local):
```
http://localhost:6000/api/stripe/webhook
```

### Produção (quando fizer deploy):
```
https://api.empresasbrasil.com/api/stripe/webhook
```

⚠️ **IMPORTANTE**: O webhook só funciona com HTTPS em produção!