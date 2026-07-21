import React from 'react';

export const Planos: React.FC = () => {
  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-.5px' }}>Planos</h1>
        <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
          Gerencie planos, diretrizes e documentos com fluxo editorial.
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
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
          Módulo de Planos
        </h3>
        <p style={{ fontSize: '13.5px', marginTop: '4px' }}>
          Estrutura da Fase 1 carregada. O CRUD completo de Planos será ativado na Fase 2.
        </p>
      </div>
    </div>
  );
};
