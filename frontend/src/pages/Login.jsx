import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  background-attachment: fixed;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(rgba(0, 255, 200, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 200, 0.02) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
  }
`;

const FormContainer = styled.div`
  background: rgba(15, 15, 35, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 200, 0.2);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 
    0 0 30px rgba(0, 255, 200, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 255, 200, 0.05), rgba(255, 0, 150, 0.05));
    border-radius: 12px;
    z-index: -1;
  }
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #00ffaa;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 2.2rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 0 0 20px rgba(0, 255, 170, 0.5);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00ffaa, transparent);
    box-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #00ffaa;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.85rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(10, 10, 25, 0.8);
  border: 1px solid rgba(0, 255, 200, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  color: #e0e0e0;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #00ffaa;
    box-shadow: 
      0 0 15px rgba(0, 255, 170, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    background: rgba(10, 10, 25, 0.95);
  }
  
  &::placeholder {
    color: rgba(224, 224, 224, 0.5);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #00ffaa 0%, #0088cc 100%);
  color: #0a0a19;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  margin-top: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    box-shadow: 
      0 0 25px rgba(0, 255, 170, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: rgba(224, 224, 224, 0.8);
  font-family: 'JetBrains Mono', monospace;
`;

const StyledLink = styled(Link)`
  color: #00ffaa;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    color: #00cc88;
    text-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
  }
`;

const ErrorMessage = styled.span`
  color: #ff4757;
  font-size: 0.825rem;
  margin-top: 0.5rem;
  display: block;
  font-family: 'JetBrains Mono', monospace;
  text-shadow: 0 0 5px rgba(255, 71, 87, 0.3);
`;

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔍 Login: useEffect detected authentication, checking user subscription status');
      
      // Check if user is free (trial or no subscription)
      if (user && (user.subscription === 'none' || user.role === 'trial' || !user.subscription)) {
        console.log('🔍 Login: Free user detected, redirecting to checkout');
        navigate('/checkout');
      } else {
        console.log('🔍 Login: Premium user, navigating to dashboard');
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    console.log('🔍 Login: Submitting login form for:', data.email);
    
    const result = await login(data.email, data.password);
    console.log('🔍 Login: Login result:', result);
    
    if (result.success) {
      console.log('🔍 Login: Login successful, checking user status...');
      
      // Se o trial expirou, redirecionar para página de assinatura
      if (result.trialExpired && result.redirectToSubscription) {
        console.log('🔍 Login: Trial expired, redirecting to subscription page');
        navigate('/subscription');
        setLoading(false);
        return;
      }
      
      // Check if user is free and redirect to checkout
      if (result.user && (result.user.subscription === 'none' || result.user.role === 'trial' || !result.user.subscription)) {
        console.log('🔍 Login: Free user detected, redirecting to checkout');
        navigate('/checkout');
        setLoading(false);
        return;
      }
      
      // Premium user goes to dashboard (useEffect will handle this case)
    }
    
    setLoading(false);
  };

  return (
    <Container>
      <FormContainer>
        <Title>Login</Title>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Email inválido'
                }
              })}
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label>Senha</Label>
            <Input
              type="password"
              {...register('password', {
                required: 'Senha é obrigatória'
              })}
            />
            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>
        
        <LinkText>
          Não tem uma conta?{' '}
          <StyledLink to="/register">Cadastre-se</StyledLink>
        </LinkText>
      </FormContainer>
    </Container>
  );
};

export default Login;