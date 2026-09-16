import React from 'react';

interface FaqsHeaderProps {
  onCreateNew: () => void;
}

export const FaqsHeader: React.FC<FaqsHeaderProps> = ({ onCreateNew }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px',
    }}
  >
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-.5px', margin: 0 }}>
        FAQs
      </h1>
      <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
        Perguntas frequentes. Arraste para reordenar como aparecem no site.
      </p>
    </div>

    <button
      type="button"
      onClick={onCreateNew}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        height: '40px',
        padding: '0 18px',
        borderRadius: '11px',
        background: 'var(--primary)',
        color: '#fff',
        fontSize: '13.5px',
        fontWeight: 700,
        border: 'none',
        boxShadow: '0 4px 12px rgba(242,93,39,.28)',
        cursor: 'pointer',
        transition: 'background .15s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#e0521f'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Nova FAQ
    </button>
  </div>
);
