import React from 'react';

export const FaqsSeedBanner: React.FC = () => (
  <div
    style={{
      background: 'var(--muted)',
      border: '1px solid var(--border)',
      borderRadius: '11px',
      padding: '10px 16px',
      fontSize: '13px',
      color: 'var(--text-soft)',
      marginBottom: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
    Organizando a ordem das FAQs…
  </div>
);
