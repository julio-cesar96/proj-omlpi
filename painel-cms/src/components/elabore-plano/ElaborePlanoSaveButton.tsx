import React from 'react';

interface ElaborePlanoSaveButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSaving: boolean;
}

export const ElaborePlanoSaveButton: React.FC<ElaborePlanoSaveButtonProps> = ({
  onClick,
  disabled,
  isSaving,
}) => {
  return (
    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <button
        id="elabore-plano-save-btn"
        onClick={onClick}
        disabled={disabled}
        style={{
          padding: '12px 26px',
          borderRadius: '11px',
          border: 'none',
          background: disabled ? 'var(--muted)' : 'var(--primary)',
          color: disabled ? 'var(--text-soft)' : '#FFFFFF',
          fontSize: '14px',
          fontWeight: 700,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'background 0.15s ease',
          boxShadow: isSaving ? 'none' : 'var(--shadow-btn)',
        }}
      >
        {isSaving && (
          <span
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              display: 'inline-block',
            }}
          />
        )}
        {isSaving ? 'Salvando…' : 'Salvar'}
      </button>
    </div>
  );
};
