import React from 'react';
import type { EditorialState } from '../../lib/strapi';

interface PlanoStepperProps {
  status: EditorialState;
}

const flow: EditorialState[] = ['rascunho', 'revisao', 'publicado', 'arquivado'];

const statusConfig: Record<EditorialState, { label: string; dot: string }> = {
  rascunho: { label: 'Rascunho', dot: '#a49a87' },
  revisao: { label: 'Em revisão', dot: '#F25D27' },
  publicado: { label: 'Publicado', dot: '#17A649' },
  arquivado: { label: 'Arquivado', dot: '#c08585' },
};

export const PlanoStepper: React.FC<PlanoStepperProps> = ({ status }) => {
  const curStage = flow.indexOf(status) !== -1 ? flow.indexOf(status) : 0;

  return (
    <div style={{ padding: '16px 24px', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
      <div
        style={{
          fontSize: '11.5px',
          fontWeight: 700,
          color: 'var(--text-soft)',
          letterSpacing: '.4px',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        Fluxo editorial
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {flow.map((k, i) => {
          const num = i + 1;
          const isDone = i <= curStage;
          const isCurrent = i === curStage;

          const circleBg = isDone ? statusConfig[k].dot : 'var(--card)';
          const circleColor = isDone ? '#FFFFFF' : 'var(--text-soft)';
          const lineBg = i < curStage ? statusConfig[k].dot : 'var(--border)';
          const labelColor = isCurrent ? 'var(--text)' : 'var(--text-soft)';
          const labelWeight = isCurrent ? 700 : 600;

          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--border)',
                    background: circleBg,
                    color: circleColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  {num}
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: labelWeight,
                    color: labelColor,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {statusConfig[k].label}
                </span>
              </div>
              {i < flow.length - 1 && (
                <div style={{ height: '2px', flex: 1, background: lineBg, margin: '0 6px 22px' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
