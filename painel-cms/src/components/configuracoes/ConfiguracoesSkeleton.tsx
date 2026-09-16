import React from 'react';
import { ConfiguracoesHeader } from './ConfiguracoesHeader';

export const ConfiguracoesSkeleton: React.FC = () => (
  <div style={{ animation: 'fadeIn .3s ease', maxWidth: '820px' }}>
    <ConfiguracoesHeader />
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '40px 24px',
      textAlign: 'center',
      color: 'var(--text-soft)',
      fontSize: '14px',
    }}>
      Carregando configurações…
    </div>
  </div>
);
