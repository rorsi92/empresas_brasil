const bcrypt = require('bcryptjs');

// Simulação de banco de dados em memória para teste
const users = [];

class UserSimple {
  async createUser(email, password) {
    try {
      // Verificar se usuário já existe
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error('Usuário já existe');
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = {
        id: users.length + 1,
        email,
        password: hashedPassword,
        created_at: new Date(),
        is_active: true
      };
      
      users.push(user);
      return { id: user.id, email: user.email };
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const user = users.find(u => u.email === email && u.is_active);
      return user || null;
    } catch (error) {
      throw error;
    }
  }

  validatePassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
  }
}

module.exports = new UserSimple();