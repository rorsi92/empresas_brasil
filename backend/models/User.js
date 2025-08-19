const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const CONNECTION_STRING = 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway';

class User {
  constructor() {
    this.pool = new Pool({
      connectionString: CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
      max: 5,
      min: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    
    this.initDatabase();
  }

  async initDatabase() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      // Create indexes
      await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      
      console.log('✅ Users table initialized in PostgreSQL');
    } catch (error) {
      console.error('❌ Error initializing users table:', error.message);
    }
  }

  async create(email, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await this.pool.query(`
        INSERT INTO users (email, password)
        VALUES ($1, $2)
        RETURNING id, email, created_at
      `, [email, hashedPassword]);
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email já está em uso');
      }
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const result = await this.pool.query(`
        SELECT id, email, password, created_at
        FROM users
        WHERE email = $1
      `, [email]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async findById(id) {
    try {
      const result = await this.pool.query(`
        SELECT id, email, created_at
        FROM users
        WHERE id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by id:', error);
      return null;
    }
  }

  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const result = await this.pool.query(`
        UPDATE users 
        SET password = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, email
      `, [hashedPassword, id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.pool.query(`
        DELETE FROM users
        WHERE id = $1
        RETURNING id, email
      `, [id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const result = await this.pool.query(`
        SELECT id, email, created_at
        FROM users
        ORDER BY created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new User();