const express = require('express');
const SecurityUtils = require('../utils/security');
const { pool } = require('../database/init-users');

const router = express.Router();

/**
 * POST /api/auth/register - Cadastro com verificação de email
 */
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  try {
    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Validar força da senha
    const passwordValidation = SecurityUtils.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha não atende aos critérios de segurança',
        errors: passwordValidation.errors
      });
    }

    // Hash seguro da senha
    const { hash: passwordHash, salt: passwordSalt } = await SecurityUtils.hashPassword(password);
    
    // Gerar tokens
    const uuid = SecurityUtils.generateUUID();
    const emailVerificationToken = SecurityUtils.generateSecureToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Inserir usuário no banco com trial de 15 dias
    const trialExpires = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 dias
    
    const result = await pool.query(
      `INSERT INTO users (
        uuid, email, password_hash, password_salt, 
        first_name, last_name, 
        email_verification_token, email_verification_expires,
        status, role, subscription_status, subscription_expires,
        created_by_ip, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, uuid, email, first_name, last_name, status, role, subscription_status, subscription_expires, created_at`,
      [
        uuid, email, passwordHash, passwordSalt,
        firstName || null, lastName || null,
        emailVerificationToken, emailVerificationExpires,
        'pending_verification', 'user', 'active', trialExpires,
        req.ip, req.get('User-Agent')
      ]
    );

    const user = result.rows[0];

    // Enviar email de verificação
    const emailService = require('../services/emailService');
    await emailService.sendVerificationEmail(email, emailVerificationToken, user.first_name);

    console.log('✅ User registered:', user.email);

    res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso! Verifique seu email para ativar a conta.',
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        status: user.status
      },
      requiresVerification: true
    });

  } catch (error) {
    console.error('❌ Registration error:', error.message);

    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/auth/verify-email/:token - Verificar email
 */
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    console.log('🔍 Email verification attempt:', token.slice(-8));

    // Buscar usuário pelo token
    const result = await pool.query(
      `SELECT id, email, first_name, email_verification_expires, status
       FROM users 
       WHERE email_verification_token = $1 
       AND status = 'pending_verification'`,
      [token]
    );

    if (result.rows.length === 0) {
      console.log('❌ Invalid verification token');
      return res.status(400).json({
        success: false,
        message: 'Token de verificação inválido ou já utilizado'
      });
    }

    const user = result.rows[0];

    // Verificar se token expirou
    if (new Date() > user.email_verification_expires) {
      console.log('❌ Expired verification token');
      return res.status(400).json({
        success: false,
        message: 'Token de verificação expirado. Solicite um novo.',
        expired: true
      });
    }

    // Ativar conta
    await pool.query(
      `UPDATE users 
       SET status = 'active', 
           email_verified = true,
           email_verification_token = NULL,
           email_verification_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id]
    );

    console.log('✅ Email verified successfully:', user.email);

    res.json({
      success: true,
      message: 'Email verificado com sucesso! Sua conta está ativa.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('❌ Email verification failed:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/resend-verification - Reenviar email de verificação
 */
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  try {
    console.log('🔄 Resend verification request:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Buscar usuário não verificado
    const result = await pool.query(
      `SELECT id, email, first_name, email_verification_token 
       FROM users 
       WHERE email = $1 AND status = 'pending_verification'`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado ou já verificado'
      });
    }

    const user = result.rows[0];
    let token = user.email_verification_token;

    // Se não tem token ou expirou, gerar novo
    if (!token) {
      token = SecurityUtils.generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await pool.query(
        `UPDATE users 
         SET email_verification_token = $1, email_verification_expires = $2
         WHERE id = $3`,
        [token, emailVerificationExpires, user.id]
      );
    }

    // Reenviar email
    const emailService = require('../services/emailService');
    await emailService.sendVerificationEmail(email, token, user.first_name);

    console.log('✅ Verification email resent:', email);

    res.json({
      success: true,
      message: 'Email de verificação reenviado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Resend verification error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/login - Login (só permite se email verificado)
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    console.log('🔐 Login attempt:', email);

    // Buscar usuário
    const result = await pool.query(
      `SELECT id, uuid, email, password_hash, password_salt, first_name, last_name, 
              status, role, email_verified, subscription_status, subscription_expires
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const user = result.rows[0];

    // Verificar se email foi verificado
    if (!user.email_verified || user.status === 'pending_verification') {
      console.log('❌ Email not verified:', user.email);
      return res.status(403).json({
        success: false,
        message: 'Email não verificado. Verifique sua caixa de entrada.',
        requiresVerification: true
      });
    }

    // Verificar senha
    const isPasswordValid = await SecurityUtils.verifyPassword(
      password, 
      user.password_hash, 
      user.password_salt
    );

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar tokens JWT
    const tokenPayload = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      status: user.status,
      subscription: user.subscription_status
    };

    const accessToken = SecurityUtils.generateAccessToken(tokenPayload);
    const refreshToken = SecurityUtils.generateRefreshToken({ id: user.id, uuid: user.uuid });

    // Atualizar último login
    await pool.query(
      `UPDATE users 
       SET last_login = CURRENT_TIMESTAMP, last_login_ip = $1
       WHERE id = $2`,
      [req.ip, user.id]
    );

    console.log('✅ Login successful:', user.email);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        status: user.status,
        role: user.role,
        subscription: user.subscription_status
      },
      token: accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/grant-trial - Dar trial de 15 dias para todos (admin)
 */
router.post('/grant-trial', async (req, res) => {
  try {
    console.log('🎁 Granting 15-day trial to all users...');

    // Atualizar todos os usuários para ter trial de 15 dias
    const result = await pool.query(`
      UPDATE users 
      SET 
        subscription_status = 'active',
        subscription_expires = CURRENT_TIMESTAMP + INTERVAL '15 days',
        updated_at = CURRENT_TIMESTAMP
      WHERE subscription_status = 'none' OR subscription_expires IS NULL OR subscription_expires < CURRENT_TIMESTAMP
      RETURNING email, subscription_expires
    `);

    console.log(`✅ Trial granted to ${result.rows.length} users`);

    res.json({
      success: true,
      message: `Trial de 15 dias concedido para ${result.rows.length} usuários`,
      users: result.rows
    });

  } catch (error) {
    console.error('❌ Grant trial error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/remove-subscription - Remover subscription de usuário para teste
 */
router.post('/remove-subscription', async (req, res) => {
  const { email } = req.body;
  
  try {
    console.log('❌ Removing subscription from:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    const result = await pool.query(`
      UPDATE users 
      SET 
        subscription_status = 'none',
        subscription_expires = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id, email, status, subscription_status, subscription_expires
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = result.rows[0];
    console.log('❌ Subscription removed from:', user.email);

    res.json({
      success: true,
      message: 'Subscription removida com sucesso!',
      user: {
        email: user.email,
        status: user.status,
        subscription_status: user.subscription_status,
        subscription_expires: user.subscription_expires
      }
    });

  } catch (error) {
    console.error('❌ Remove subscription error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/grant-premium - Dar premium vitalício para usuário específico
 */
router.post('/grant-premium', async (req, res) => {
  const { email } = req.body;
  
  try {
    console.log('💎 Granting lifetime premium to:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Dar premium vitalício (100 anos)
    const premiumExpires = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    
    const result = await pool.query(`
      UPDATE users 
      SET 
        status = 'active',
        email_verified = true,
        email_verification_token = NULL,
        email_verification_expires = NULL,
        subscription_status = 'active',
        subscription_expires = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id, email, status, subscription_status, subscription_expires
    `, [email, premiumExpires]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = result.rows[0];
    console.log('💎 Premium granted to:', user.email, 'until:', user.subscription_expires);

    res.json({
      success: true,
      message: 'Premium vitalício concedido com sucesso!',
      user: {
        email: user.email,
        status: user.status,
        subscription_status: user.subscription_status,
        subscription_expires: user.subscription_expires
      }
    });

  } catch (error) {
    console.error('❌ Grant premium error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/force-activate - Forçar ativação de usuário específico (admin)
 */
router.post('/force-activate', async (req, res) => {
  const { email, newPassword } = req.body;
  
  try {
    console.log('🔧 Force activating user:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Ativar usuário e dar trial de 15 dias
    const trialExpires = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    let updateQuery = `
      UPDATE users 
      SET 
        status = 'active',
        email_verified = true,
        email_verification_token = NULL,
        email_verification_expires = NULL,
        subscription_status = 'active',
        subscription_expires = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id, email, status, subscription_status, subscription_expires
    `;
    let queryParams = [email, trialExpires];

    // Se nova senha fornecida, incluir no update
    if (newPassword) {
      const { hash: passwordHash, salt: passwordSalt } = await SecurityUtils.hashPassword(newPassword);
      updateQuery = `
        UPDATE users 
        SET 
          status = 'active',
          email_verified = true,
          email_verification_token = NULL,
          email_verification_expires = NULL,
          subscription_status = 'active',
          subscription_expires = $2,
          password_hash = $3,
          password_salt = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE email = $1
        RETURNING id, email, status, subscription_status, subscription_expires
      `;
      queryParams = [email, trialExpires, passwordHash, passwordSalt];
    }
    
    const result = await pool.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = result.rows[0];
    console.log('✅ User force activated:', user.email);

    res.json({
      success: true,
      message: newPassword ? 'Usuário ativado, trial concedido e senha redefinida!' : 'Usuário ativado e trial concedido com sucesso!',
      user: {
        email: user.email,
        status: user.status,
        subscription_status: user.subscription_status,
        subscription_expires: user.subscription_expires
      }
    });

  } catch (error) {
    console.error('❌ Force activate error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;