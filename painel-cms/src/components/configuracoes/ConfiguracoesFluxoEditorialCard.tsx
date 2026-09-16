import React from 'react';
import { Toggle } from '../ui/Toggle';

interface ConfiguracoesFluxoEditorialCardProps {
  requireReview: boolean;
  autosaveEnabled: boolean;
  onChangeRequireReview: (value: boolean) => void;
  onChangeAutosaveEnabled: (value: boolean) => void;
}

export const ConfiguracoesFluxoEditorialCard: React.FC<ConfiguracoesFluxoEditorialCardProps> = ({
  requireReview,
  autosaveEnabled,
  onChangeRequireReview,
  onChangeAutosaveEnabled,
}) => (
  <div style={{
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    padding: '20px 22px',
  }}>
    <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '6px' }}>
      Fluxo editorial
    </h3>
    <p style={{ fontSize: '12.5px', color: 'var(--text-soft)', margin: '0 0 16px' }}>
      Controle o comportamento de publicação do conteúdo.
    </p>

    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '12px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <label
            htmlFor="toggle-require-review"
            style={{ fontSize: '13.5px', fontWeight: 700, cursor: 'pointer' }}
          >
            Exigir revisão antes de publicar
          </label>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '.3px',
            background: '#FDE7DE',
            color: 'var(--primary)',
            padding: '2px 7px',
            borderRadius: '6px',
            textTransform: 'uppercase',
          }}>
            Pendente
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-soft)', lineHeight: 1.5 }}>
          Conteúdo passa por Revisor antes de ir ao ar.{' '}
          <span style={{ fontStyle: 'italic' }}>
            Salvo, mas sem efeito operacional nesta fase — requer paridade de schema entre Planos, FAQ e Textos.
          </span>
        </div>
      </div>
      <Toggle
        id="toggle-require-review"
        checked={requireReview}
        onChange={onChangeRequireReview}
      />
    </div>

    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '12px 0',
    }}>
      <div>
        <label
          htmlFor="toggle-autosave"
          style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '3px', cursor: 'pointer' }}
        >
          Salvamento automático de rascunhos
        </label>
        <div style={{ fontSize: '12px', color: 'var(--text-soft)', lineHeight: 1.5 }}>
          Salva rascunho automaticamente alguns segundos após cada alteração.
          Nunca publica automaticamente — apenas salva o estado atual como rascunho.
        </div>
      </div>
      <Toggle
        id="toggle-autosave"
        checked={autosaveEnabled}
        onChange={onChangeAutosaveEnabled}
      />
    </div>
  </div>
);
