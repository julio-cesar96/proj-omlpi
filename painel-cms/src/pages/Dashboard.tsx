import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userName = user?.username || user?.email?.split('@')[0] || 'Usuário';

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Header Boas-vindas */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '27px', fontWeight: 800, letterSpacing: '-.5px' }}>
            Bom dia, {userName} 👋
          </h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
            Bem-vindo ao painel de gerenciamento de conteúdo do Observa RNPI.
          </p>
        </div>
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-soft)',
            fontWeight: 600,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            padding: '8px 14px',
            borderRadius: '11px',
            textTransform: 'capitalize',
          }}
        >
          {todayFormatted}
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          padding: '24px',
          maxWidth: '720px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>
          Atalhos rápidos
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <button
            onClick={() => navigate('/planos')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              padding: '16px',
              borderRadius: '13px',
              border: '1px solid var(--border)',
              textAlign: 'left',
              background: 'var(--bg)',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: '#FDE7DE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              📋
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Gerenciar Planos</span>
            <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
              Cadastre e publique planos de ação
            </span>
          </button>

          <button
            onClick={() => navigate('/midiateca')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              padding: '16px',
              borderRadius: '13px',
              border: '1px solid var(--border)',
              textAlign: 'left',
              background: 'var(--bg)',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              📤
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Enviar Arquivo</span>
            <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
              Upload para a biblioteca de mídias
            </span>
          </button>

          <button
            onClick={() => navigate('/faqs')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              padding: '16px',
              borderRadius: '13px',
              border: '1px solid var(--border)',
              textAlign: 'left',
              background: 'var(--bg)',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: '#FDE7DE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              ❓
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Gerenciar FAQs</span>
            <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
              Dúvidas frequentes e reordenação
            </span>
          </button>

          <button
            onClick={() => navigate('/textos')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              padding: '16px',
              borderRadius: '13px',
              border: '1px solid var(--border)',
              textAlign: 'left',
              background: 'var(--bg)',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              ✍️
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Textos Institucionais</span>
            <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
              Edite páginas como Sobre e Política
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
