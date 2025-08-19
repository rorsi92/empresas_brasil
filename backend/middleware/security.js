const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const SecurityUtils = require('../utils/security');
const winston = require('winston');
const { pool } = require('../database/init-users');

// Configurar logger de segurança
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Rate Limiting para diferentes tipos de operações
 */
const createRateLimiter = (windowMs, max, message, skipSuccessfulRequests = true) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    keyGenerator: (req) => {
      // Usar combinação de IP e user ID se disponível
      return `${req.ip}_${req.user?.id || 'anonymous'}`;
    },
    onLimitReached: (req, res, options) => {
      securityLogger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        endpoint: req.originalUrl,
        limit: options.max,
        window: options.windowMs
      });
    }
  });
};

// Rate limiters específicos
const rateLimiters = {
  // Login: máximo 5 tentativas por 15 minutos
  login: createRateLimiter(
    15 * 60 * 1000, // 15 minutos
    5,
    'Muitas tentativas de login. Tente novamente em 15 minutos.',
    false // Não pular tentativas bem-sucedidas
  ),

  // Registro: máximo 3 contas por hora
  register: createRateLimiter(
    60 * 60 * 1000, // 1 hora
    3,
    'Limite de cadastros excedido. Tente novamente em 1 hora.'
  ),

  // Reset de senha: máximo 3 tentativas por hora
  passwordReset: createRateLimiter(
    60 * 60 * 1000, // 1 hora
    3,
    'Muitas tentativas de recuperação de senha. Tente novamente em 1 hora.'
  ),

  // API geral: máximo 1000 requests por 15 minutos
  api: createRateLimiter(
    15 * 60 * 1000, // 15 minutos
    1000,
    'Limite de requisições excedido. Tente novamente em alguns minutos.'
  ),

  // Stripe webhook: sem limite (mas com validação de signature)
  webhook: createRateLimiter(
    60 * 1000, // 1 minuto
    100,
    'Limite de webhooks excedido.'
  )
};

/**
 * Validadores de entrada
 */
const validators = {
  register: [
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail()
      .isLength({ max: 320 })
      .withMessage('Email muito longo')
      .custom(async (email) => {
        const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
          throw new Error('Email já está em uso');
        }
        return true;
      }),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Senha deve ter entre 8 e 128 caracteres')
      .custom((password) => {
        const validation = SecurityUtils.validatePasswordStrength(password);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
        return true;
      }),
    
    body('firstName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Nome muito longo')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome deve conter apenas letras'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Sobrenome muito longo')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Sobrenome deve conter apenas letras'),
    
    body('phone')
      .optional()
      .isMobilePhone('pt-BR')
      .withMessage('Número de telefone inválido')
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('Senha é obrigatória')
      .isLength({ max: 128 })
      .withMessage('Senha muito longa')
  ],

  passwordReset: [
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail()
  ],

  passwordUpdate: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Senha atual é obrigatória'),
    
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('Nova senha deve ter entre 8 e 128 caracteres')
      .custom((password) => {
        const validation = SecurityUtils.validatePasswordStrength(password);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
        return true;
      })
  ]
};

/**
 * Middleware para verificar validação
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    securityLogger.warn('Validation failed', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      errors: errors.array(),
      body: { ...req.body, password: '[REDACTED]' }
    });
    
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Middleware para log de segurança
 */
const logSecurityEvent = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log do evento de segurança
      const logData = {
        user_id: req.user?.id || null,
        action,
        details: {
          endpoint: req.originalUrl,
          method: req.method,
          success: res.statusCode < 400,
          statusCode: res.statusCode
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        success: res.statusCode < 400,
        session_id: req.sessionID
      };

      // Salvar no banco de dados
      pool.query(
        `INSERT INTO security_logs (user_id, action, details, ip_address, user_agent, success, session_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          logData.user_id,
          logData.action,
          JSON.stringify(logData.details),
          logData.ip_address,
          logData.user_agent,
          logData.success,
          logData.session_id
        ]
      ).catch(err => {
        securityLogger.error('Failed to save security log', { error: err.message });
      });

      // Log no arquivo
      securityLogger.info('Security event', logData);
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware para verificar tentativas de brute force
 */
const checkBruteForce = async (req, res, next) => {
  const email = req.body.email;
  const ip = req.ip;
  
  if (!email) return next();
  
  try {
    // Verificar tentativas por email
    const emailAttempts = await pool.query(
      `SELECT created_at FROM security_logs 
       WHERE details->>'email' = $1 
       AND action = 'login_attempt' 
       AND success = false 
       AND created_at > NOW() - INTERVAL '15 minutes'
       ORDER BY created_at DESC`,
      [email]
    );

    // Verificar tentativas por IP
    const ipAttempts = await pool.query(
      `SELECT created_at FROM security_logs 
       WHERE ip_address = $1 
       AND action = 'login_attempt' 
       AND success = false 
       AND created_at > NOW() - INTERVAL '15 minutes'
       ORDER BY created_at DESC`,
      [ip]
    );

    const maxAttempts = 5;
    const isEmailBlocked = emailAttempts.rows.length >= maxAttempts;
    const isIPBlocked = ipAttempts.rows.length >= maxAttempts;

    if (isEmailBlocked || isIPBlocked) {
      securityLogger.warn('Brute force attempt detected', {
        email,
        ip,
        emailAttempts: emailAttempts.rows.length,
        ipAttempts: ipAttempts.rows.length
      });

      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas de login falharam. Tente novamente em 15 minutos.',
        blocked: true,
        resetTime: new Date(Date.now() + 15 * 60 * 1000)
      });
    }

    // Adicionar informações ao request para uso posterior
    req.securityContext = {
      emailAttempts: emailAttempts.rows.length,
      ipAttempts: ipAttempts.rows.length
    };

    next();
  } catch (error) {
    securityLogger.error('Error checking brute force', { error: error.message });
    next(); // Continuar mesmo com erro para não bloquear o sistema
  }
};

/**
 * Middleware para sanitizar entrada
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string' && key !== 'password') {
        req.body[key] = SecurityUtils.sanitizeInput(req.body[key]);
      }
    }
  }
  next();
};

module.exports = {
  rateLimiters,
  validators,
  handleValidationErrors,
  logSecurityEvent,
  checkBruteForce,
  sanitizeInput,
  securityLogger
};