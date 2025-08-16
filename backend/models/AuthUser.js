const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

class AuthUser {
  constructor() {
    this.pool = new Pool({
      connectionString: 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
      ssl: { rejectUnauthorized: false },
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    
    this.initDatabase();
  }

  async initDatabase() {
    try {
      // Usar a tabela permanente user_profiles (criada pelo setup-permanent-users.js)
      // Verificar se a tabela existe, se não existir, executar o setup automático
      const tableExists = await this.pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'user_profiles'
        )
      `);
      
      if (!tableExists.rows[0].exists) {
        console.log('⚠️  Tabela user_profiles não encontrada, executando setup automático...');
        const PermanentUserSetup = require('../setup-permanent-users');
        const setup = new PermanentUserSetup();
        await setup.setupPermanentDatabase();
        await setup.close();
      }
      
      console.log('✅ Sistema de usuários permanentes ativo');
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema de usuários:', error.message);
    }
  }

  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  async createUser(email, password, name = null) {
    try {
      const passwordHash = await this.hashPassword(password);
      
      const result = await this.pool.query(`
        INSERT INTO user_profiles (email, password_hash, name, email_verified)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, name, is_active, email_verified, created_at
      `, [email.toLowerCase().trim(), passwordHash, name, true]);
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email já está em uso');
      }
      throw error;
    }
  }

  async findUserByEmail(email) {
    try {
      const result = await this.pool.query(`
        SELECT id, email, password_hash, name, is_active, email_verified, 
               failed_login_attempts, locked_until, last_login, created_at
        FROM user_profiles
        WHERE email = $1 AND is_active = true
      `, [email.toLowerCase().trim()]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  async findUserById(id) {
    try {
      const result = await this.pool.query(`
        SELECT id, email, name, is_active, email_verified, last_login, created_at
        FROM user_profiles
        WHERE id = $1 AND is_active = true
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return null;
    }
  }

  async authenticateUser(email, password) {
    try {
      const user = await this.findUserByEmail(email);
      
      if (!user) {
        return { success: false, message: 'Email ou senha incorretos' };
      }

      // Check if account is locked
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        return { success: false, message: 'Conta temporariamente bloqueada. Tente novamente mais tarde.' };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      
      if (!isValidPassword) {
        // Increment failed attempts
        await this.incrementFailedAttempts(user.id);
        return { success: false, message: 'Email ou senha incorretos' };
      }

      // Reset failed attempts and update last login
      await this.resetFailedAttempts(user.id);
      
      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = user;
      return { 
        success: true, 
        user: userWithoutPassword 
      };
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  async incrementFailedAttempts(userId) {
    try {
      const result = await this.pool.query(`
        UPDATE user_profiles 
        SET failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE 
              WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
              ELSE locked_until 
            END,
            updated_at = NOW()
        WHERE id = $1
        RETURNING failed_login_attempts
      `, [userId]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao incrementar tentativas:', error);
    }
  }

  async resetFailedAttempts(userId) {
    try {
      await this.pool.query(`
        UPDATE user_profiles 
        SET failed_login_attempts = 0,
            locked_until = NULL,
            last_login = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `, [userId]);
    } catch (error) {
      console.error('Erro ao resetar tentativas:', error);
    }
  }

  async getAllUsers() {
    try {
      const result = await this.pool.query(`
        SELECT id, email, name, is_active, email_verified, last_login, created_at, is_permanent
        FROM user_profiles
        WHERE is_active = true
        ORDER BY is_permanent DESC, created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return [];
    }
  }

  async deactivateUser(id) {
    try {
      const result = await this.pool.query(`
        UPDATE user_profiles 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1 AND is_permanent = false
        RETURNING id, email
      `, [id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new AuthUser();