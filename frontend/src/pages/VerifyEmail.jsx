import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { CheckCircle, XCircle, Mail, RefreshCw, ArrowRight } from 'lucide-react';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

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

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  
  ${props => props.status === 'loading' && `
    background: rgba(59, 130, 246, 0.2);
    border: 2px solid rgba(59, 130, 246, 0.3);
    
    svg {
      animation: ${spin} 1s linear infinite;
    }
  `}
  
  ${props => props.status === 'success' && `
    background: rgba(34, 197, 94, 0.2);
    border: 2px solid rgba(34, 197, 94, 0.3);
  `}
  
  ${props => props.status === 'error' && `
    background: rgba(239, 68, 68, 0.2);
    border: 2px solid rgba(239, 68, 68, 0.3);
  `}
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #1e40af, #3b82f6);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorDetails = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: left;
  
  h4 {
    color: #ef4444;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin: 0;
  }
`;

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  // Adicionar tratamento de erro global
  useEffect(() => {
    const handleError = (event) => {
      console.error('❌ Global error:', event.error);
      if (status === 'loading') {
        setStatus('error');
        setMessage('Erro inesperado. Tente recarregar a página.');
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [status]);

  useEffect(() => {
    console.log('🔍 VerifyEmail component mounted, token:', token);
    if (token) {
      verifyEmailToken();
    } else {
      console.error('❌ No token provided');
      setStatus('error');
      setMessage('Token de verificação não fornecido.');
    }
  }, [token]);

  const verifyEmailToken = async () => {
    console.log('🔄 Starting email verification for token:', token);
    
    if (!token) {
      console.error('❌ No token in verifyEmailToken');
      setStatus('error');
      setMessage('Token de verificação não fornecido.');
      return;
    }

    try {
      setStatus('loading');
      console.log('📡 Making API request to verify email...');
      
      const response = await fetch(`/api/auth/verify-email/${token}`, {
        method: 'GET'
      });
      
      console.log('📡 Response received:', response.status, response.ok);

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
        setUser(data.user);
      } else {
        setStatus('error');
        setMessage(data.message || 'Erro ao verificar email');
        
        if (data.expired) {
          // TODO: Implementar botão para reenviar email
        }
      }

    } catch (error) {
      console.error('❌ Email verification error:', error);
      setStatus('error');
      setMessage('Erro de conexão. Tente novamente.');
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw size={32} color="#3b82f6" />;
      case 'success':
        return <CheckCircle size={32} color="#22c55e" />;
      case 'error':
        return <XCircle size={32} color="#ef4444" />;
      default:
        return <Mail size={32} color="#6b7280" />;
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Title>Verificando Email...</Title>
            <Message>
              Aguarde enquanto verificamos seu token de confirmação.
            </Message>
          </>
        );

      case 'success':
        return (
          <>
            <Title>Email Verificado!</Title>
            <Message>
              {message}
              {user && (
                <>
                  <br /><br />
                  Bem-vindo, {user.firstName || user.email}! 🎉
                  <br />
                  Sua conta está ativa e pronta para uso.
                </>
              )}
            </Message>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button onClick={handleGoToLogin}>
                <Mail size={20} />
                Fazer Login
              </Button>
              <Button onClick={handleGoToDashboard}>
                <ArrowRight size={20} />
                Ir para Dashboard
              </Button>
            </div>
          </>
        );

      case 'error':
        return (
          <>
            <Title>Erro na Verificação</Title>
            <Message>{message}</Message>
            
            <ErrorDetails>
              <h4>Possíveis causas:</h4>
              <p>• Token de verificação inválido ou já utilizado</p>
              <p>• Token expirado (válido por 24 horas)</p>
              <p>• Link corrompido ou incompleto</p>
              <p>• Conta já verificada anteriormente</p>
            </ErrorDetails>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button onClick={() => navigate('/register')}>
                <RefreshCw size={20} />
                Cadastrar Novamente
              </Button>
              <Button onClick={handleGoToLogin}>
                <ArrowRight size={20} />
                Tentar Login
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <Card>
        <IconContainer status={status}>
          {renderIcon()}
        </IconContainer>
        {renderContent()}
      </Card>
    </Container>
  );
};

export default VerifyEmail;