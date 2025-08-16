import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      authService.setAuthToken(token);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      authService.setAuthToken(response.token);
      
      setUser(response.user);
      toast.success('Login realizado com sucesso!');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await authService.register(email, password);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      authService.setAuthToken(response.token);
      
      setUser(response.user);
      toast.success('Cadastro realizado com sucesso!');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao fazer cadastro';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authService.removeAuthToken();
    setUser(null);
    toast.info('Logout realizado com sucesso!');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};