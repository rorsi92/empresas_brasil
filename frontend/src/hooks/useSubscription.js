import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    hasActiveSubscription: false,
    status: 'loading',
    currentPeriodEnd: null,
    isLoading: true
  });
  
  const { token } = useAuth();

  const checkSubscriptionStatus = async () => {
    // Se não tem token, verificar se está em rota livre
    if (!token) {
      const currentPath = window.location.pathname;
      const freeRoutes = ['/', '/register', '/login', '/verify-email', '/about', '/privacy', '/terms', '/security'];
      const isFreeRoute = freeRoutes.some(route => currentPath.startsWith(route));
      
      console.log('🔍 useSubscription no token:', { currentPath, isFreeRoute });
      
      if (isFreeRoute) {
        // Para rotas livres, simular que tem acesso
        setSubscriptionStatus({
          hasActiveSubscription: true,
          status: 'free_route',
          currentPeriodEnd: null,
          isLoading: false
        });
        return;
      }
      
      setSubscriptionStatus({
        hasActiveSubscription: false,
        status: 'no_auth',
        currentPeriodEnd: null,
        isLoading: false
      });
      return;
    }

    try {
      const response = await fetch('/api/stripe/subscription-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus({
          ...data,
          isLoading: false
        });
      } else {
        throw new Error('Erro ao verificar assinatura');
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      setSubscriptionStatus({
        hasActiveSubscription: false,
        status: 'error',
        currentPeriodEnd: null,
        isLoading: false
      });
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, [token]);

  const cancelSubscription = async () => {
    if (!token) return { success: false, error: 'Não autenticado' };

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        await checkSubscriptionStatus(); // Atualizar status
        return { success: true, message: data.message };
      } else {
        throw new Error(data.error || 'Erro ao cancelar assinatura');
      }
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    subscriptionStatus,
    checkSubscriptionStatus,
    cancelSubscription,
    refreshStatus: checkSubscriptionStatus
  };
};