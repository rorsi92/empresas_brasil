import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const CheckoutSimple = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCheckout = async () => {
    console.log('🔍 Starting checkout...');
    console.log('User:', user);
    console.log('Token:', token ? 'exists' : 'missing');

    if (!user || !token) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📡 Making API call to /api/stripe/create-checkout-session');
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      const data = await response.json();
      console.log('📡 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento');
      }

      if (data.url) {
        console.log('✅ Redirecting to:', data.url);
        setSuccess('Redirecionando para pagamento...');
        window.location.href = data.url;
      } else {
        throw new Error('URL de pagamento não encontrada');
      }

    } catch (error) {
      console.error('❌ Checkout error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f0f23',
      color: 'white',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1>Checkout Debug</h1>
      
      <div style={{ margin: '1rem 0' }}>
        <strong>Status:</strong>
        <ul>
          <li>Usuário: {user ? `✅ ${user.email}` : '❌ Não logado'}</li>
          <li>Token: {token ? '✅ Presente' : '❌ Ausente'}</li>
        </ul>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(255, 0, 0, 0.1)', 
          border: '1px solid red',
          padding: '1rem', 
          margin: '1rem 0',
          borderRadius: '8px'
        }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      {success && (
        <div style={{ 
          background: 'rgba(0, 255, 0, 0.1)', 
          border: '1px solid green',
          padding: '1rem', 
          margin: '1rem 0',
          borderRadius: '8px'
        }}>
          <strong>Sucesso:</strong> {success}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading || !user}
        style={{
          background: loading ? '#666' : '#3b82f6',
          color: 'white',
          padding: '1rem 2rem',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processando...' : 'Testar Checkout'}
      </button>

      <p style={{ marginTop: '2rem', textAlign: 'center' }}>
        Esta é uma versão de debug. Abra o console do navegador (F12) para ver os logs detalhados.
      </p>
    </div>
  );
};

export default CheckoutSimple;