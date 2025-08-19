# INSTRUÇÕES WEBHOOK STRIPE

## PASSO A PASSO DETALHADO:

### 1. Acesse: https://dashboard.stripe.com/webhooks

### 2. Clique "Add endpoint" (botão azul)

### 3. Na tela que abrir:

**Endpoint URL (cole exatamente isso):**
```
https://webhook.site/generate
```
(Vamos usar este site temporário primeiro para testar)

**Description:** 
```
Empresas Brasil - Pagamentos
```

### 4. Events to send:
Clique em "Select events" e marque:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_failed

### 5. Clique "Add endpoint"

### 6. Após criar, você vai ver uma página com detalhes do webhook

### 7. Procure por "Signing secret" e clique no ícone do olho (👁️) para revelar

### 8. Copie o código que começa com "whsec_"

---

## Se não conseguir encontrar o signing secret:

1. Na lista de webhooks, clique no webhook que você criou
2. Vá na aba "Details" ou "Detalhes" 
3. Role para baixo até "Signing secret"
4. Clique no ícone do olho para mostrar