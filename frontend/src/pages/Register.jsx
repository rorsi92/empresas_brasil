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
  max-width: 440px;
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
    width: 120px;
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

const Register = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await registerUser(data.email, data.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <Container>
      <FormContainer>
        <Title>Cadastro</Title>
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
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres'
                }
              })}
            />
            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Confirmar Senha</Label>
            <Input
              type="password"
              {...register('confirmPassword', {
                required: 'Confirmação de senha é obrigatória',
                validate: value => value === password || 'Senhas não coincidem'
              })}
            />
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </Form>
        
        <LinkText>
          Já tem uma conta?{' '}
          <StyledLink to="/login">Faça login</StyledLink>
        </LinkText>
      </FormContainer>
    </Container>
  );
};

export default Register;