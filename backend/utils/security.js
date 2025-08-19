const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class SecurityUtils {
  
  /**
   * Gerar salt seguro para senha
   */
  static generateSalt() {
    return bcrypt.genSaltSync(12); // 12 rounds para máxima segurança
  }

  /**
   * Hash seguro da senha com salt personalizado
   */
  static async hashPassword(password, salt = null) {
    if (!salt) {
      salt = this.generateSalt();
    }
    const hash = await bcrypt.hash(password, salt);
    return { hash, salt };
  }

  /**
   * Verificar senha
   */
  static async verifyPassword(password, hash, salt) {
    const testHash = await bcrypt.hash(password, salt);
    return testHash === hash;
  }

  /**
   * Validar força da senha
   */
  static validatePasswordStrength(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }
    if (password.length > 128) {
      errors.push('Senha deve ter no máximo 128 caracteres');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }
    
    // Verificar padrões comuns fracos
    const weakPatterns = [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8}$/, // Apenas letras e números
      /(.)\1{3,}/, // Caracteres repetidos
      /123456|password|qwerty|abc123/i, // Padrões comuns
    ];
    
    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        errors.push('Senha muito comum ou previsível');
        break;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      score: this.calculatePasswordScore(password)
    };
  }

  /**
   * Calcular score de segurança da senha (0-100)
   */
  static calculatePasswordScore(password) {
    let score = 0;
    
    // Comprimento
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    
    // Complexidade
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    
    // Diversidade
    const uniqueChars = new Set(password.split('')).size;
    if (uniqueChars >= password.length * 0.7) score += 15;
    
    return Math.min(score, 100);
  }

  /**
   * Validar formato de email
   */
  static validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const isValid = emailRegex.test(email) && email.length <= 320;
    
    return {
      isValid,
      normalized: email.toLowerCase().trim(),
      errors: isValid ? [] : ['Formato de email inválido']
    };
  }

  /**
   * Gerar token seguro para verificação/reset
   */
  static generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Gerar UUID seguro
   */
  static generateUUID() {
    return uuidv4();
  }

  /**
   * Criar JWT access token
   */
  static generateAccessToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback-secret-key',
      { 
        expiresIn: '15m',
        issuer: 'empresas-brasil',
        audience: 'web-app'
      }
    );
  }

  /**
   * Criar JWT refresh token
   */
  static generateRefreshToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key',
      { 
        expiresIn: '7d',
        issuer: 'empresas-brasil',
        audience: 'web-app'
      }
    );
  }

  /**
   * Verificar JWT token
   */
  static verifyToken(token, secret = null) {
    try {
      const secretKey = secret || process.env.JWT_SECRET || 'fallback-secret-key';
      return jwt.verify(token, secretKey);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Detectar tentativa de brute force
   */
  static isRateLimited(attempts, timeWindow = 15 * 60 * 1000) { // 15 minutos
    const now = Date.now();
    const maxAttempts = 5;
    
    // Filtrar tentativas dentro da janela de tempo
    const recentAttempts = attempts.filter(attempt => 
      (now - attempt.timestamp) < timeWindow
    );
    
    return {
      isLimited: recentAttempts.length >= maxAttempts,
      remainingAttempts: Math.max(0, maxAttempts - recentAttempts.length),
      resetTime: recentAttempts.length > 0 
        ? new Date(recentAttempts[0].timestamp + timeWindow)
        : null
    };
  }

  /**
   * Calcular score de risco da sessão
   */
  static calculateRiskScore(context) {
    let risk = 0;
    
    // IP diferente do último login
    if (context.currentIP !== context.lastLoginIP) {
      risk += 20;
    }
    
    // User agent diferente
    if (context.currentUserAgent !== context.lastUserAgent) {
      risk += 15;
    }
    
    // Login fora do horário normal (00:00-06:00)
    const hour = new Date().getHours();
    if (hour >= 0 && hour <= 6) {
      risk += 10;
    }
    
    // Múltiplas tentativas de login falharam recentemente
    if (context.recentFailedAttempts > 2) {
      risk += 25;
    }
    
    // Localização geográfica muito diferente (se disponível)
    if (context.locationRisk) {
      risk += context.locationRisk;
    }
    
    return Math.min(risk, 100);
  }

  /**
   * Sanitizar dados de entrada
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/[<>]/g, '') // Remove < e >
      .slice(0, 1000); // Limite de tamanho
  }

  /**
   * Gerar código 2FA
   */
  static generate2FACode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Verificar se IP está em lista negra básica
   */
  static isIPBlacklisted(ip) {
    // IPs privados e localhost são permitidos
    const privateIPs = [
      /^127\./, // localhost
      /^192\.168\./, // private
      /^10\./, // private
      /^172\.(1[6-9]|2\d|3[01])\./ // private
    ];
    
    return privateIPs.some(pattern => pattern.test(ip)) ? false : false;
    // TODO: Implementar verificação contra base de IPs maliciosos
  }
}

module.exports = SecurityUtils;