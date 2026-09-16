import React from 'react';

interface ConfiguracoesActionsProps {
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export const ConfiguracoesActions: React.FC<ConfiguracoesActionsProps> = ({ isSaving, onDiscard, onSave }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingBottom: '8px' }}>
    <button
      id="config-discard"
      onClick={onDiscard}
      disabled={isSaving}
      style={{
        height: '44px',
        padding: '0 18px',
        borderRadius: '11px',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        fontSize: '13.5px',
        fontWeight: 700,
        color: 'var(--text)',
        cursor: 'pointer',
        opacity: isSaving ? 0.5 : 1,
      }}
    >
      Descartar
    </button>
    <button
      id="config-save"
      onClick={onSave}
      disabled={isSaving}
      style={{
        height: '44px',
        padding: '0 22px',
        borderRadius: '11px',
        background: isSaving ? 'rgba(242,93,39,0.6)' : 'var(--primary)',
        color: '#fff',
        fontSize: '13.5px',
        fontWeight: 800,
        boxShadow: 'var(--shadow-btn)',
        cursor: isSaving ? 'wait' : 'pointer',
        border: 'none',
        transition: 'background 0.15s',
      }}
    >
      {isSaving ? 'Salvando…' : 'Salvar alterações'}
    </button>
  </div>
);
