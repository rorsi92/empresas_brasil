import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { 
  Search, 
  Database, 
  Zap, 
  Download, 
  Building2, 
  Users, 
  FileText, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Globe,
  BarChart3,
  Shield,
  Sparkles
} from 'lucide-react';

// Global styles to prevent horizontal scroll
const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html, body {
    overflow-x: hidden;
    max-width: 100vw;
  }
  
  body {
    margin: 0;
    padding: 0;
  }
`;

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
`;

const typing = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const neonWave = keyframes`
  0% {
    background: linear-gradient(135deg, 
      #0f0f23 0%, 
      #1a1a2e 25%, 
      #16213e 50%, 
      #0f0f23 100%
    );
  }
  25% {
    background: linear-gradient(135deg, 
      #0f0f23 0%, 
      #1a1a2e 20%, 
      #16213e 45%, 
      rgba(0, 255, 170, 0.08) 60%,
      #16213e 75%,
      #0f0f23 100%
    );
  }
  50% {
    background: linear-gradient(135deg, 
      #0f0f23 0%, 
      rgba(59, 130, 246, 0.08) 15%,
      #1a1a2e 30%, 
      #16213e 50%, 
      rgba(147, 51, 234, 0.08) 70%,
      #0f0f23 100%
    );
  }
  75% {
    background: linear-gradient(135deg, 
      #0f0f23 0%, 
      #1a1a2e 25%, 
      rgba(6, 182, 212, 0.08) 40%,
      #16213e 55%, 
      #1a1a2e 80%,
      #0f0f23 100%
    );
  }
  100% {
    background: linear-gradient(135deg, 
      #0f0f23 0%, 
      #1a1a2e 25%, 
      #16213e 50%, 
      #0f0f23 100%
    );
  }
`;

const neonOverlay = keyframes`
  0%, 100% {
    background: 
      radial-gradient(circle at 20% 80%, rgba(0, 255, 170, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
  }
  33% {
    background: 
      radial-gradient(circle at 30% 70%, rgba(147, 51, 234, 0.06) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(0, 255, 170, 0.06) 0%, transparent 50%),
      radial-gradient(circle at 50% 60%, rgba(59, 130, 246, 0.06) 0%, transparent 50%);
  }
  66% {
    background: 
      radial-gradient(circle at 60% 40%, rgba(6, 182, 212, 0.07) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(147, 51, 234, 0.07) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 255, 170, 0.07) 0%, transparent 50%);
  }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  animation: ${neonWave} 12s ease-in-out infinite;
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    animation: ${neonOverlay} 15s ease-in-out infinite;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 50% 50%, rgba(0, 255, 170, 0.02) 0%, transparent 70%);
    animation: ${pulse} 8s ease-in-out infinite;
    pointer-events: none;
  }
`;

const Section = styled.section`
  padding: 6rem 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 4rem 1rem;
    max-width: 100vw;
  }

  @media (max-width: 480px) {
    padding: 3rem 0.5rem;
  }
`;

// Header
const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  z-index: 100;
  backdrop-filter: blur(20px);
  background: rgba(15, 15, 35, 0.8);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  box-sizing: border-box;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem 1rem;
    max-width: 100vw;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
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
  white-space: nowrap;
  min-width: 0;
  flex-shrink: 0;

  @media (max-width: 480px) {
    font-size: 1.2rem;
    gap: 0.25rem;
  }
`;

// Hero Section
const HeroSection = styled(Section)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding-top: 8rem;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #ffffff, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  text-align: center;
  max-width: 100%;
  word-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
    line-height: 1.3;
  }

  @media (max-width: 320px) {
    font-size: 1.8rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
  max-width: 600px;
  width: 100%;
  font-weight: 300;
  letter-spacing: 0.5px;
  text-align: center;
  line-height: 1.5;
  box-sizing: border-box;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    max-width: 90%;
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const CTAButton = styled.button`
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
  white-space: nowrap;
  min-width: fit-content;
  max-width: 100%;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #1e40af, #3b82f6);
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.875rem 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.75rem 1.25rem;
    gap: 0.25rem;
  }
`;

// Glass Cards
const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
  }

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

// Stats Section
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 4rem;
  max-width: 600px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 90%;
    margin-top: 3rem;
  }

  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-top: 2rem;
    max-width: 95%;
  }
`;

const StatCard = styled(GlassCard)`
  text-align: center;
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  text-align: center;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    letter-spacing: 0.5px;
  }
`;

// Features Section
const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 3rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
    margin-top: 2rem;
  }
`;

const FeatureCard = styled(GlassCard)`
  &:hover {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1), 
      rgba(147, 51, 234, 0.1)
    );
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
`;

const FeatureTitle = styled.h3`
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
`;

// Section Titles
const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffffff, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  max-width: 100%;
  word-wrap: break-word;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
    line-height: 1.3;
  }
`;

const SectionSubtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  line-height: 1.6;
  box-sizing: border-box;
  padding: 0 1rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 90%;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    max-width: 95%;
    padding: 0 0.5rem;
  }
`;

// Pricing Section
const PricingCard = styled(GlassCard)`
  max-width: 400px;
  width: 100%;
  margin: 4rem auto 0;
  text-align: center;
  position: relative;
  border: 2px solid rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1), 
    rgba(147, 51, 234, 0.1)
  );
  box-sizing: border-box;

  &::before {
    content: 'MAIS POPULAR';
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #3b82f6, #1e40af);
    color: white;
    padding: 0.5rem 2rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 1px;
    white-space: nowrap;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px rgba(59, 130, 246, 0.3);
  }

  @media (max-width: 768px) {
    max-width: 90%;
    margin: 3rem auto 0;
  }

  @media (max-width: 480px) {
    max-width: 95%;
    margin: 2rem auto 0;
    
    &::before {
      font-size: 0.7rem;
      padding: 0.4rem 1.5rem;
    }
  }
`;

const PriceDisplay = styled.div`
  font-size: 4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 2rem 0 1rem;
  line-height: 1;
`;

const PriceSubtext = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const PricingFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  text-align: left;

  li {
    color: rgba(255, 255, 255, 0.8);
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: '✓';
      color: #00ff88;
      font-weight: bold;
      font-size: 1.2rem;
    }
  }
`;

// Footer
const Footer = styled.footer`
  background: rgba(15, 15, 35, 0.9);
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  padding: 4rem 2rem 2rem;
  margin-top: 6rem;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 3rem 1rem 1.5rem;
    margin-top: 4rem;
  }

  @media (max-width: 480px) {
    padding: 2rem 0.5rem 1rem;
    margin-top: 3rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  box-sizing: border-box;
  padding: 0 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    max-width: 90%;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 95%;
  }
`;

const FooterSection = styled.div`
  h4 {
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p, a {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    text-decoration: none;
    display: block;
    margin-bottom: 0.5rem;

    &:hover {
      color: #3b82f6;
      transition: color 0.3s ease;
    }
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  margin-top: 3rem;
  padding-top: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    empresas: 0,
    velocidade: 0,
    segmentos: 0,
    estados: 0
  });

  // Animated counters
  useEffect(() => {
    const animateCounters = () => {
      const targets = {
        empresas: 66000000,
        velocidade: 50000,
        segmentos: 20,
        estados: 27
      };

      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);

        setCounts({
          empresas: Math.floor(targets.empresas * easeOutProgress),
          velocidade: Math.floor(targets.velocidade * easeOutProgress),
          segmentos: Math.floor(targets.segmentos * easeOutProgress),
          estados: Math.floor(targets.estados * easeOutProgress)
        });

        if (step >= steps) {
          clearInterval(interval);
          setCounts(targets);
        }
      }, stepDuration);
    };

    const timer = setTimeout(animateCounters, 500);
    return () => clearTimeout(timer);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  return (
    <>
      <GlobalStyles />
      <Container>
        <Header>
          <HeaderContent>
            <Logo>
              <Database size={28} />
              Empresas Brasil
            </Logo>
            <CTAButton onClick={() => navigate('/register')}>
              Acessar Sistema
              <ArrowRight size={20} />
            </CTAButton>
          </HeaderContent>
        </Header>

        {/* Hero Section */}
        <HeroSection>
          <HeroTitle>
            A Maior Base de Dados<br />
            Empresariais do Brasil
          </HeroTitle>
          <HeroSubtitle>
            Acesse informações completas de 66 milhões de empresas brasileiras.
            Performance superior, dados atualizados da Receita Federal.
          </HeroSubtitle>
          <CTAButton onClick={() => navigate('/register')}>
            <Search size={20} />
            Começar Consulta Gratuita
          </CTAButton>

          <StatsGrid>
            <StatCard delay="0s">
              <StatNumber>{formatNumber(counts.empresas)}+</StatNumber>
              <StatLabel>Empresas Cadastradas</StatLabel>
            </StatCard>
            <StatCard delay="0.2s">
              <StatNumber>{formatNumber(counts.velocidade)}</StatNumber>
              <StatLabel>Empresas / 2.5min</StatLabel>
            </StatCard>
            <StatCard delay="0.4s">
              <StatNumber>{counts.segmentos}</StatNumber>
              <StatLabel>Segmentos Mapeados</StatLabel>
            </StatCard>
            <StatCard delay="0.6s">
              <StatNumber>{counts.estados}</StatNumber>
              <StatLabel>Estados Conectados</StatLabel>
            </StatCard>
          </StatsGrid>
        </HeroSection>

        {/* Features Section */}
        <Section>
          <SectionTitle>Funcionalidades Avançadas</SectionTitle>
          <SectionSubtitle>
            Sistema completo com filtros inteligentes, consultas em massa e exportação profissional
          </SectionSubtitle>

          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>
                <Search size={24} color="white" />
              </FeatureIcon>
              <FeatureTitle>Filtros Inteligentes</FeatureTitle>
              <FeatureDescription>
                20 segmentos de negócio, todos os estados, situação cadastral, 
                CNPJ, razão social e muito mais
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <Zap size={24} color="white" />
              </FeatureIcon>
              <FeatureTitle>Consulta em Massa</FeatureTitle>
              <FeatureDescription>
                De 1 a 50.000 empresas por consulta. Performance otimizada 
                com barra de progresso em tempo real
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <Database size={24} color="white" />
              </FeatureIcon>
              <FeatureTitle>Dados Completos</FeatureTitle>
              <FeatureDescription>
                Informações da empresa, sócios detalhados, endereço completo,
                contatos e status do Simples Nacional
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <Download size={24} color="white" />
              </FeatureIcon>
              <FeatureTitle>Exportação Profissional</FeatureTitle>
              <FeatureDescription>
                Excel (.xlsx) formatado e CSV estruturado. 32+ colunas organizadas 
                com cada sócio em campos separados
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </Section>

        {/* Pricing Section */}
        <Section style={{ textAlign: 'center' }}>
          <SectionTitle>Escolha Seu Plano</SectionTitle>
          <SectionSubtitle>
            Acesso completo à maior base de dados empresariais do Brasil
          </SectionSubtitle>
          
          <PricingCard onClick={() => navigate('/checkout')}>
            <h3 style={{ color: 'white', fontSize: '1.5rem', margin: '0 0 1rem 0' }}>
              Plano Profissional
            </h3>
            <PriceDisplay>R$ 79,90</PriceDisplay>
            <PriceSubtext>por mês</PriceSubtext>
            
            <PricingFeatures>
              <li>Acesso a 66 milhões de empresas</li>
              <li>Consultas ilimitadas até 50k por vez</li>
              <li>Exportação profissional Excel/CSV</li>
              <li>Dados completos + sócios</li>
              <li>Todos os 20 segmentos</li>
              <li>Filtros avançados</li>
              <li>Performance otimizada</li>
              <li>Suporte técnico</li>
            </PricingFeatures>
            
            <CTAButton style={{ 
              width: '100%', 
              fontSize: '1.2rem', 
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <Sparkles size={24} />
              Começar Agora
            </CTAButton>
          </PricingCard>
        </Section>

        <Footer>
          <FooterContent>
            <FooterSection>
              <h4>Empresas Brasil</h4>
              <p>A maior e mais completa base de dados empresariais do Brasil. 
                 66 milhões de empresas com informações atualizadas da Receita Federal.</p>
            </FooterSection>
            
            <FooterSection>
              <h4>Funcionalidades</h4>
              <a href="#features">Consulta em Massa</a>
              <a href="#features">Filtros Avançados</a>
              <a href="#features">Exportação Excel/CSV</a>
              <a href="#features">20 Segmentos</a>
            </FooterSection>
            
            <FooterSection>
              <h4>Suporte</h4>
              <a href="mailto:contato@empresasbrasil.com">contato@empresasbrasil.com</a>
              <a href="tel:+5511999999999">(11) 99999-9999</a>
              <a href="#help">Central de Ajuda</a>
              <a href="#docs">Documentação</a>
            </FooterSection>
            
            <FooterSection>
              <h4>Empresa</h4>
              <Link to="/about">Sobre Nós</Link>
              <Link to="/privacy">Política de Privacidade</Link>
              <Link to="/terms">Termos de Uso</Link>
              <Link to="/security">Segurança</Link>
            </FooterSection>
          </FooterContent>
          
          <FooterBottom>
            <p>&copy; 2025 Empresas Brasil. Todos os direitos reservados.</p>
            <p>Dados oficiais da Receita Federal • CNPJ • Sistema Seguro</p>
          </FooterBottom>
        </Footer>
      </Container>
    </>
  );
};

export default LandingPage;