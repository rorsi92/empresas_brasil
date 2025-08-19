const express = require('express');
const Stripe = require('stripe');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false }
});

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Criar tabela de assinaturas se não existir
const createSubscriptionsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
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
      
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
    `);
    console.log('✅ Tabela de assinaturas criada/verificada');
  } catch (error) {
    console.error('❌ Erro ao criar tabela de assinaturas:', error);
  }
};

// Inicializar tabela
createSubscriptionsTable();

// POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Permitir upgrade durante trial - remover verificação de assinatura ativa
    console.log('🛒 Creating checkout session for user:', userId);

    // Buscar dados do usuário
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Criar ou recuperar customer no Stripe
    let customerId = null;
    const existingCustomer = await pool.query(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (existingCustomer.rows.length > 0 && existingCustomer.rows[0].stripe_customer_id) {
      customerId = existingCustomer.rows[0].stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: userId.toString()
        }
      });
      customerId = customer.id;
    }

    // Criar sessão de checkout - usando product ID temporariamente
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product: process.env.STRIPE_PRICE_ID || 'prod_Stc4IcknaHUG1F',
            unit_amount: 7990, // R$ 79,90 em centavos
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'http://localhost:4001'}/dashboard?success=true`,
      cancel_url: `${req.headers.origin || 'http://localhost:4001'}/?canceled=true`,
      metadata: {
        userId: userId.toString()
      },
      subscription_data: {
        metadata: {
          userId: userId.toString()
        }
      }
    });

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
});

// GET /api/stripe/subscription-status
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Primeiro verificar na tabela users (trial/subscription direto)
    const userResult = await pool.query(
      `SELECT subscription_status, subscription_expires 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const now = new Date();
      const expires = user.subscription_expires ? new Date(user.subscription_expires) : null;
      
      console.log('🔍 Checking subscription for user:', userId, {
        status: user.subscription_status,
        expires: user.subscription_expires,
        isExpired: expires ? now > expires : null
      });

      // Se tem subscription ativa e não expirou
      if (user.subscription_status === 'active' && expires && now <= expires) {
        return res.json({
          hasActiveSubscription: true,
          status: 'active',
          currentPeriodEnd: user.subscription_expires,
          isLoading: false,
          type: 'trial'
        });
      }
    }
    
    // Fallback: verificar na tabela subscriptions (Stripe)
    const result = await pool.query(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ 
        hasActiveSubscription: false,
        status: 'no_subscription' 
      });
    }

    const subscription = result.rows[0];
    const isActive = subscription.status === 'active' && 
                    new Date(subscription.current_period_end) > new Date();

    res.json({
      hasActiveSubscription: isActive,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      stripeSubscriptionId: subscription.stripe_subscription_id
    });

  } catch (error) {
    console.error('Erro ao verificar status da assinatura:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar assinatura' 
    });
  }
});

// POST /api/stripe/cancel-subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscriptionResult = await pool.query(
      'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (subscriptionResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Assinatura ativa não encontrada' 
      });
    }

    const stripeSubscriptionId = subscriptionResult.rows[0].stripe_subscription_id;

    // Cancelar no Stripe
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Atualizar no banco
    await pool.query(
      'UPDATE subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      ['canceled', userId]
    );

    res.json({ 
      success: true, 
      message: 'Assinatura cancelada com sucesso. Acesso mantido até o fim do período.' 
    });

  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ 
      error: 'Erro ao cancelar assinatura' 
    });
  }
});

// POST /api/stripe/webhook - Webhook do Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;

      case 'customer.subscription.created':
        const createdSubscription = event.data.object;
        await handleSubscriptionCreated(createdSubscription);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// Funções auxiliares para webhooks
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const customerId = session.customer;
  
  console.log('✅ Checkout completed for user:', userId);
  
  // Atualizar ou criar registro de assinatura
  await pool.query(
    `INSERT INTO subscriptions (user_id, stripe_customer_id, status, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) 
     DO UPDATE SET stripe_customer_id = $2, status = $3, updated_at = CURRENT_TIMESTAMP`,
    [userId, customerId, 'processing']
  );
}

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata.userId;
  
  await pool.query(
    `UPDATE subscriptions 
     SET stripe_subscription_id = $1, 
         stripe_price_id = $2,
         status = $3,
         current_period_start = to_timestamp($4),
         current_period_end = to_timestamp($5),
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $6`,
    [
      subscription.id,
      subscription.items.data[0].price.id,
      subscription.status,
      subscription.current_period_start,
      subscription.current_period_end,
      userId
    ]
  );
  
  console.log('✅ Subscription created for user:', userId);
}

async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata.userId;
  
  await pool.query(
    `UPDATE subscriptions 
     SET status = $1,
         current_period_start = to_timestamp($2),
         current_period_end = to_timestamp($3),
         updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $4`,
    [
      subscription.status,
      subscription.current_period_start,
      subscription.current_period_end,
      subscription.id
    ]
  );
  
  console.log('✅ Subscription updated:', subscription.id, 'Status:', subscription.status);
}

async function handleSubscriptionDeleted(subscription) {
  await pool.query(
    `UPDATE subscriptions 
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $2`,
    ['canceled', subscription.id]
  );
  
  console.log('✅ Subscription deleted:', subscription.id);
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  
  await pool.query(
    `UPDATE subscriptions 
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $2`,
    ['past_due', subscriptionId]
  );
  
  console.log('❌ Payment failed for subscription:', subscriptionId);
}

module.exports = router;