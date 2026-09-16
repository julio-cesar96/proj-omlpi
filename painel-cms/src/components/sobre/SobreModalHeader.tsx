import React from 'react';

interface SobreModalHeaderProps {
  isEditing: boolean; // false = modo criação
  isPublished: boolean;
  onClose: () => void;
}

export const SobreModalHeader: React.FC<SobreModalHeaderProps> = ({
  isEditing,
  isPublished,
  onClose,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px 0',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--text-h)',
            margin: 0,
            letterSpacing: '-.3px',
          }}
        >
          {isEditing ? 'Editar aba' : 'Nova aba'}
        </h2>
        {isEditing && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '20px',
              background: isPublished ? '#e6f4ea' : 'var(--muted)',
              color: isPublished ? '#1a7f37' : 'var(--text-soft)',
            }}
          >
            {isPublished ? 'Publicado' : 'Rascunho'}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          border: 'none',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-soft)',
          cursor: 'pointer',
          transition: 'background .15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
