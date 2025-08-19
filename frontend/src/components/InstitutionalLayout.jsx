import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Database } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #0f0f23 0%, 
    #1a1a2e 25%, 
    #16213e 50%, 
    #0f0f23 100%
  );
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  background: rgba(15, 15, 35, 0.8);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }
`;

const Content = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 6rem 1rem 2rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #ffffff, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 3rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
  }

  h2 {
    color: #3b82f6;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 2rem 0 1rem 0;
  }

  h3 {
    color: #06b6d4;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1.5rem 0 1rem 0;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.7;
    margin-bottom: 1rem;
  }

  ul {
    margin: 1rem 0 1rem 2rem;
    
    li {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin-bottom: 0.5rem;
    }
  }

  strong {
    color: white;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const InstitutionalLayout = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo onClick={() => navigate('/')}>
            <Database size={28} />
            Empresas Brasil
          </Logo>
          <BackButton onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
            Voltar
          </BackButton>
        </HeaderContent>
      </Header>

      <Content>
        <Title>{title}</Title>
        <ContentCard>
          {children}
        </ContentCard>
      </Content>
    </Container>
  );
};

export default InstitutionalLayout;