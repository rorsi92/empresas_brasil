import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import styled from 'styled-components';
import { 
  Database, 
  CheckCircle, 
  Sparkles, 
  ArrowLeft, 
  CreditCard,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
  max-width: 900px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 6rem 1rem 2rem;
  }
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const PlansContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const PlanCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 2px solid ${props => props.selected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.3)'};
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: ${props => props.selected ? 'scale(1.02)' : 'scale(1)'};
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.6);
    transform: ${props => props.selected ? 'scale(1.02)' : 'scale(1.01)'};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
  }
  
  ${props => props.selected && `
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
    
    &::after {
      content: '✓';
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
  `}
`;

const PlanTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PriceDisplay = styled.div`
  font-size: ${props => props.compact ? '2rem' : '3rem'};
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 1rem 0;
  line-height: 1;
`;

const PriceSubtext = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-bottom: 2rem;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;

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

const CheckoutCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2.5rem;
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
`;

const CheckoutTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`;

const CheckoutButton = styled.button`
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
  margin-bottom: 1rem;

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

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const InfoText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const DiscountBadge = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
  margin-right: 0.5rem;
`;

// Plan configuration
const PLANS = {
  pro: {
    name: 'Plano Pro',
    price: 97.00,
    features: [
      'Acesso a 66 milhões de empresas',
      'Consultas de até 10.000 empresas',
      'Exportação profissional Excel/CSV',
      'Dados completos + sócios',
      'Filtros avançados',
      'Suporte por email'
    ]
  },
  premium: {
    name: 'Plano Premium',
    price: 147.00,
    features: [
      'Acesso a 66 milhões de empresas',
      'Consultas de até 25.000 empresas',
      'Exportação profissional Excel/CSV',
      'Dados completos + sócios',
      'Todos os 20 segmentos',
      'Filtros avançados',
      'Suporte prioritário'
    ]
  },
  max: {
    name: 'Plano Max',
    price: 197.00,
    features: [
      'Acesso a 66 milhões de empresas',
      'Consultas ilimitadas até 50k por vez',
      'Exportação profissional Excel/CSV',
      'Dados completos + sócios',
      'Todos os 20 segmentos',
      'Filtros avançados',
      'Performance otimizada',
      'Suporte técnico prioritário'
    ]
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [affiliateCode, setAffiliateCode] = useState('');

  // Capture affiliate code from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setAffiliateCode(ref);
    }
  }, []);

  const handleCheckout = async () => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType: selectedPlan,
          affiliateCode: affiliateCode || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento');
      }

      // Redirecionar para o Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error('Erro no checkout:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Helper function to get discounted price
  const getDiscountedPrice = (price) => {
    return affiliateCode ? (price * 0.9).toFixed(2) : price.toFixed(2);
  };

  const getOriginalPrice = (price) => {
    return price.toFixed(2);
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo onClick={() => navigate('/')}>
            <Database size={28} />
            Empresas Brasil
          </Logo>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Voltar
          </BackButton>
        </HeaderContent>
      </Header>

      <Content>
        <CheckoutGrid>
          <div>
            <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
              Escolha seu Plano
            </h1>
            
            {affiliateCode && (
              <DiscountBadge>
                🎉 Código de desconto aplicado: 10% OFF
              </DiscountBadge>
            )}

            <PlansContainer>
              {Object.entries(PLANS).map(([planKey, plan]) => (
                <PlanCard 
                  key={planKey}
                  selected={selectedPlan === planKey}
                  onClick={() => setSelectedPlan(planKey)}
                >
                  <PlanTitle>
                    <Sparkles size={20} />
                    {plan.name}
                  </PlanTitle>
                  
                  <div>
                    {affiliateCode && (
                      <OriginalPrice>R$ {getOriginalPrice(plan.price)}</OriginalPrice>
                    )}
                    <PriceDisplay compact>R$ {getDiscountedPrice(plan.price)}</PriceDisplay>
                  </div>
                  
                  <PriceSubtext>por mês • cancelamento a qualquer momento</PriceSubtext>
                  
                  <FeatureList>
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </FeatureList>
                </PlanCard>
              ))}
            </PlansContainer>
          </div>

          <CheckoutCard>
            <CheckoutTitle>Finalizar Assinatura</CheckoutTitle>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'white' }}>Plano selecionado:</strong>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem' }}>
                {PLANS[selectedPlan].name} - R$ {getDiscountedPrice(PLANS[selectedPlan].price)}/mês
              </div>
            </div>
            
            <SecurityBadge>
              <Shield size={16} />
              Pagamento seguro processado pelo Stripe
            </SecurityBadge>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <CheckoutButton 
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Pagar com Cartão
                </>
              )}
            </CheckoutButton>

            <InfoText>
              • Cobrança recorrente mensal de R$ {getDiscountedPrice(PLANS[selectedPlan].price)}<br/>
              {affiliateCode && '• Desconto de 10% aplicado permanentemente<br/>'}
              • Primeiro mês com acesso imediato<br/>
              • Cancelamento a qualquer momento<br/>
              • Sem taxa de adesão ou multa
            </InfoText>

            <SecurityBadge>
              <Zap size={16} />
              Ativação imediata após confirmação do pagamento
            </SecurityBadge>
          </CheckoutCard>
        </CheckoutGrid>
      </Content>
    </Container>
  );
};

export default Checkout;