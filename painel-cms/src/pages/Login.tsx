import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ identifier, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '420px',
          maxWidth: '100%',
          background: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          padding: '36px 32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-btn)',
              marginBottom: '16px',
            }}
          >
            <Eye size={26} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-.4px' }}>
            Observa RNPI
          </h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '13.5px', marginTop: '4px' }}>
            Painel administrativo de conteúdo
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--badge-error-bg)',
              color: 'var(--destructive)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
              border: '1px solid rgba(212, 24, 61, 0.2)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '7px',
              }}
            >
              E-mail ou Usuário
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="var(--text-soft)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="seu.email@rnpi.org.br"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px 0 42px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '7px',
              }}
            >
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--text-soft)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px 0 42px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              height: '44px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 800,
              boxShadow: 'var(--shadow-btn)',
              marginTop: '8px',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>
      </div>
    </div>
  );
};
