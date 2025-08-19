const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false }
});

const createUsersTable = async () => {
  try {
    console.log('🗄️ Creating comprehensive users table...');
    
    // Criar extensões se não existirem
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    
    // Criar enum para status do usuário
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
          CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
        END IF;
      END $$;
    `);

    // Criar enum para roles
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('user', 'admin', 'premium', 'trial');
        END IF;
      END $$;
    `);

    // Tabela users completa
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255),
        email_verification_expires TIMESTAMP,
        password_hash VARCHAR(255) NOT NULL,
        password_salt VARCHAR(255) NOT NULL,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        role user_role DEFAULT 'user',
        status user_status DEFAULT 'pending_verification',
        subscription_status VARCHAR(50) DEFAULT 'none',
        subscription_expires TIMESTAMP,
        last_login TIMESTAMP,
        last_login_ip INET,
        login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        two_factor_secret VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by_ip INET,
        user_agent TEXT,
        preferences JSONB DEFAULT '{}'::jsonb,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);

    // Índices para performance e segurança
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
      CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
      CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
      CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    `);

    // Tabela para logs de segurança
    await pool.query(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        details JSONB DEFAULT '{}'::jsonb,
        ip_address INET,
        user_agent TEXT,
        success BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_id VARCHAR(255),
        risk_score INTEGER DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_security_logs_action ON security_logs(action);
      CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);
      CREATE INDEX IF NOT EXISTS idx_security_logs_success ON security_logs(success);
    `);

    // Tabela para sessões ativas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        refresh_token VARCHAR(255) UNIQUE NOT NULL,
        ip_address INET,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
    `);

    // Função para atualizar updated_at automaticamente
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Trigger para atualizar updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Função para limpar tokens expirados
    await pool.query(`
      CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
      RETURNS void AS $$
      BEGIN
        -- Limpar tokens de verificação de email expirados
        UPDATE users 
        SET email_verification_token = NULL, email_verification_expires = NULL
        WHERE email_verification_expires < CURRENT_TIMESTAMP;
        
        -- Limpar tokens de reset de senha expirados
        UPDATE users 
        SET password_reset_token = NULL, password_reset_expires = NULL
        WHERE password_reset_expires < CURRENT_TIMESTAMP;
        
        -- Limpar sessões expiradas
        DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
        
        -- Limpar logs antigos (mais de 1 ano)
        DELETE FROM security_logs WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year';
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ Users table and security infrastructure created successfully!');
    console.log('📊 Created tables: users, security_logs, user_sessions');
    console.log('🔧 Created functions: update_updated_at_column, cleanup_expired_tokens');
    
  } catch (error) {
    console.error('❌ Error creating users table:', error);
    throw error;
  }
};

module.exports = { createUsersTable, pool };

// Executar se chamado diretamente
if (require.main === module) {
  createUsersTable()
    .then(() => {
      console.log('🎉 Database initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error);
      process.exit(1);
    });
}