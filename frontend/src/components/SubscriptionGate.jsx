import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  CreditCard, 
  AlertTriangle, 
  Sparkles, 
  Database 
} from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #0f0f23 0%, 
    #1a1a2e 25%, 
    #16213e 50%, 
    #0f0f23 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
  }
`;

const Icon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #1e40af, #3b82f6);
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SubscriptionGate = ({ children, showTrialMessage = false }) => {
  const navigate = useNavigate();
  const { subscriptionStatus } = useSubscription();
  const { hasActiveSubscription, isLoading, status } = subscriptionStatus;

  if (isLoading) {
    return (
      <Container>
        <Card>
          <LoadingSpinner />
          <Title>Verificando Assinatura</Title>
          <Description>
            Aguarde enquanto verificamos seu plano...
          </Description>
        </Card>
      </Container>
    );
  }

  // TEMPORARIAMENTE DESABILITADO PARA DEBUG - rodyrodrigo@gmail.com
  if (hasActiveSubscription) {
    return children;
  }
  
  // DEBUG: Permitir acesso para rodyrodrigo@gmail.com
  const debugEmails = ['rodyrodrigo@gmail.com', 'rodrigo.orsi.pagotto@hotmail.com'];
  const userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))?.email : null;
  
  if (debugEmails.includes(userEmail)) {
    console.log('🐛 DEBUG: Allowing access for', userEmail);
    return children;
  }

  // Status específicos sem assinatura ativa
  if (status === 'no_auth') {
    // NUNCA redirecionar para login quando já estamos em rotas livres
    const currentPath = window.location.pathname;
    const freeRoutes = ['/', '/register', '/login', '/verify-email', '/about', '/privacy', '/terms', '/security'];
    const isFreeRoute = freeRoutes.some(route => currentPath.startsWith(route));
    
    console.log('🔒 SubscriptionGate no_auth:', { currentPath, isFreeRoute });
    
    if (isFreeRoute) {
      return children;
    }
    
    // Só redirecionar se estiver tentando acessar dashboard/app
    if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/app')) {
      navigate('/login');
      return null;
    }
    
    // Para outras rotas, permitir acesso
    return children;
  }

  if (status === 'canceled' || status === 'past_due') {
    return (
      <Container>
        <Card>
          <Icon>
            <AlertTriangle size={32} color="white" />
          </Icon>
          <Title>
            {status === 'canceled' ? 'Assinatura Cancelada' : 'Pagamento Pendente'}
          </Title>
          <Description>
            {status === 'canceled' 
              ? 'Sua assinatura foi cancelada. Reative para continuar acessando a plataforma.'
              : 'Há um problema com seu pagamento. Atualize suas informações de pagamento.'}
          </Description>
          <Button onClick={() => navigate('/checkout')}>
            <CreditCard size={20} />
            {status === 'canceled' ? 'Reativar Assinatura' : 'Atualizar Pagamento'}
          </Button>
        </Card>
      </Container>
    );
  }

  // Sem assinatura - mostrar upgrade
  return (
    <Container>
      <Card>
        <Icon>
          <Database size={32} color="white" />
        </Icon>
        <Title>Upgrade Necessário</Title>
        <Description>
          {showTrialMessage 
            ? 'Para acessar consultas em massa e exportação de dados, você precisa do Plano Profissional.'
            : 'Para acessar esta funcionalidade, você precisa de uma assinatura ativa do Plano Profissional.'
          }
        </Description>
        <Description>
          <strong style={{ color: '#3b82f6' }}>R$ 79,90/mês</strong> - Acesso completo a 66 milhões de empresas
        </Description>
        <Button onClick={() => navigate('/checkout')}>
          <Sparkles size={20} />
          Assinar Plano Profissional
        </Button>
      </Card>
    </Container>
  );
};

export default SubscriptionGate;