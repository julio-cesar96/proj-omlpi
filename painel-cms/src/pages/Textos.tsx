import React from 'react';

export const Textos: React.FC = () => {
  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-.5px' }}>
          Textos Institucionais
        </h1>
        <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
          Páginas de conteúdo do site com editor rich text, SEO e histórico.
        </p>
      </div>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '40px 24px',
          textAlign: 'center',
          color: 'var(--text-soft)',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>✍️</div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
          Módulo de Textos Institucionais
        </h3>
        <p style={{ fontSize: '13.5px', marginTop: '4px' }}>
          Estrutura da Fase 1 carregada. O editor rich text e SEO serão ativados na Fase 3.
        </p>
      </div>
    </div>
  );
};
