import React from 'react';
import { CheckCircle2, Clock, Archive, FileText, X, Loader2 } from 'lucide-react';
import type { EditorialState } from '../../lib/strapi';

interface PlanoBatchToolbarProps {
  selectedCount: number;
  isProcessing: boolean;
  onActionClick: (targetState: EditorialState) => void;
  onClearSelection: () => void;
}

export const PlanoBatchToolbar: React.FC<PlanoBatchToolbarProps> = ({
  selectedCount,
  isProcessing,
  onActionClick,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: '#FDE7DE',
        borderBottom: '1px solid var(--border)',
        gap: '12px',
        flexWrap: 'wrap',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            fontSize: '13.5px',
            fontWeight: 800,
            color: 'var(--primary)',
            background: '#FFFFFF',
            padding: '4px 12px',
            borderRadius: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {selectedCount} {selectedCount === 1 ? 'selecionado' : 'selecionados'}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-soft)', fontWeight: 600 }}>
          Ações em lote:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Publicar */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onActionClick('publicado')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '34px',
            padding: '0 12px',
            borderRadius: '8px',
            border: 'none',
            background: '#166534',
            color: '#FFFFFF',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: isProcessing ? 'wait' : 'pointer',
            opacity: isProcessing ? 0.6 : 1,
            transition: 'all 0.15s ease',
          }}
          title="Publicar planos selecionados"
        >
          <CheckCircle2 size={15} />
          Publicar
        </button>

        {/* Enviar p/ Revisão */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onActionClick('revisao')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '34px',
            padding: '0 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: '#1E40AF',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: isProcessing ? 'wait' : 'pointer',
            opacity: isProcessing ? 0.6 : 1,
            transition: 'all 0.15s ease',
          }}
          title="Enviar planos selecionados para revisão"
        >
          <Clock size={15} />
          Enviar p/ Revisão
        </button>

        {/* Arquivar */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onActionClick('arquivado')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '34px',
            padding: '0 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: '#9A3412',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: isProcessing ? 'wait' : 'pointer',
            opacity: isProcessing ? 0.6 : 1,
            transition: 'all 0.15s ease',
          }}
          title="Arquivar planos selecionados"
        >
          <Archive size={15} />
          Arquivar
        </button>

        {/* Mover p/ Rascunho */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onActionClick('rascunho')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '34px',
            padding: '0 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--text)',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: isProcessing ? 'wait' : 'pointer',
            opacity: isProcessing ? 0.6 : 1,
            transition: 'all 0.15s ease',
          }}
          title="Mover planos selecionados para rascunho"
        >
          <FileText size={15} />
          Rascunho
        </button>

        {/* Limpar Seleção */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={onClearSelection}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-soft)',
            cursor: isProcessing ? 'wait' : 'pointer',
            marginLeft: '4px',
          }}
          title="Limpar seleção"
        >
          {isProcessing ? (
            <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <X size={16} />
          )}
        </button>
      </div>
    </div>
  );
};
