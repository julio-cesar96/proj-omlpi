import React from 'react';

interface SobreModalFooterProps {
  isSaving: boolean;
  uploading: boolean;
  isValid: boolean;
  isEditingPublished: boolean;
  onClose: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export const SobreModalFooter: React.FC<SobreModalFooterProps> = ({
  isSaving,
  uploading,
  isValid,
  isEditingPublished,
  onClose,
  onSaveDraft,
  onPublish,
}) => {
  const disabled = !isValid || isSaving || uploading;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '10px',
        padding: '16px 24px 20px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isSaving}
        style={{
          height: '42px',
          padding: '0 18px',
          borderRadius: '11px',
          border: '1px solid var(--border)',
          background: 'var(--card)',
          color: 'var(--text)',
          fontSize: '13.5px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'background .15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}
      >
        Cancelar
      </button>

      <button
        type="button"
        onClick={onSaveDraft}
        disabled={disabled}
        style={{
          height: '42px',
          padding: '0 18px',
          borderRadius: '11px',
          border: '1px solid var(--border)',
          background: 'var(--card)',
          color: 'var(--text)',
          fontSize: '13.5px',
          fontWeight: 700,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'background .15s ease',
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.background = 'var(--muted)';
        }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}
      >
        Salvar rascunho
      </button>

      <button
        type="button"
        onClick={onPublish}
        disabled={disabled}
        style={{
          height: '42px',
          padding: '0 20px',
          borderRadius: '11px',
          border: 'none',
          background: 'var(--primary)',
          color: '#fff',
          fontSize: '13.5px',
          fontWeight: 800,
          boxShadow: '0 4px 12px rgba(242,93,39,.28)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'background .15s ease',
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.background = '#e0521f';
        }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
      >
        {isSaving ? 'Salvando…' : isEditingPublished ? 'Atualizar' : 'Publicar'}
      </button>
    </div>
  );
};
