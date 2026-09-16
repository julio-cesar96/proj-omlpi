import React from 'react';

interface FaqsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const FaqsSearchBar: React.FC<FaqsSearchBarProps> = ({ value, onChange }) => (
  <div style={{ position: 'relative', marginBottom: '16px' }}>
    <svg
      style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
      width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7a7663" strokeWidth="2" strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Pesquisar perguntas…"
      style={{
        width: '100%',
        height: '42px',
        padding: '0 14px 0 40px',
        borderRadius: '11px',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        fontSize: '13.5px',
        color: 'var(--text)',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color .15s ease',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    />
  </div>
);
