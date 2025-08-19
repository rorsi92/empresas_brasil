# Configuração do Produto no Stripe

## Passos para criar o produto:

1. **Login no Stripe Dashboard**
   - Acesse: https://dashboard.stripe.com
   - Faça login com sua conta

2. **Criar Produto**
   - No menu lateral: **"Products"** → **"Add Product"**
   - Preencha:
     ```
     Name: Plano Profissional - Empresas Brasil
     Description: Acesso completo a 66 milhões de empresas brasileiras com consultas ilimitadas, exportação Excel/CSV e suporte técnico.
     ```

3. **Configurar Preço**
   - **Recurring**: Marcar (assinatura)
   - **Price**: R$ 79,90
   - **Billing period**: Monthly (mensal)
   - **Currency**: BRL (Real brasileiro)

4. **Salvar e Copiar IDs**
   Após salvar, você verá:
   - **Product ID**: prod_xxxxxxxxxx
   - **Price ID**: price_xxxxxxxxxx ← **IMPORTANTE: Copie este!**

5. **Configurar Billing Portal**
   - Vá em **"Settings"** → **"Billing"** → **"Customer Portal"**
   - Ative: "Allow customers to cancel subscriptions"
   - Salve as configurações