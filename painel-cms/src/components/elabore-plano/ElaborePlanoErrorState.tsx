import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ElaborePlanoErrorStateProps {
  onRetry: () => void;
}

export const ElaborePlanoErrorState: React.FC<ElaborePlanoErrorStateProps> = ({ onRetry }) => {
  return (
    <div style={{ padding: '40px 48px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(220,60,60,0.08)',
          border: '1px solid rgba(220,60,60,0.22)',
          borderRadius: '12px',
          padding: '18px 20px',
          maxWidth: '480px',
        }}
      >
        <AlertCircle size={20} color="var(--danger, #dc3c3c)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--danger, #dc3c3c)' }}>
            Erro ao carregar dados do Elabore o Plano
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-soft)', marginTop: '2px' }}>
            Verifique a conexão ou tente recarregar a página.
          </div>
        </div>
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: 'var(--muted)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text)',
          }}
        >
          <RefreshCw size={14} />
          Tentar novamente
        </button>
      </div>
    </div>
  );
};
