import React from 'react';

export type StatusType = 'rascunho' | 'revisao' | 'publicado' | 'arquivado' | 'ativo' | 'inativo';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const statusMap: Record<StatusType, { label: string; color: string; bg: string; dot: string }> = {
  rascunho: {
    label: 'Rascunho',
    color: 'var(--text-soft)',
    bg: 'var(--muted)',
    dot: '#a49a87',
  },
  revisao: {
    label: 'Em revisão',
    color: '#d94e1c',
    bg: '#FDE7DE',
    dot: '#F25D27',
  },
  publicado: {
    label: 'Publicado',
    color: '#17A649',
    bg: 'var(--accent)',
    dot: '#17A649',
  },
  arquivado: {
    label: 'Arquivado',
    color: 'var(--destructive)',
    bg: '#fbeaee',
    dot: 'var(--destructive)',
  },
  ativo: {
    label: 'Ativo',
    color: '#17A649',
    bg: 'var(--accent)',
    dot: '#17A649',
  },
  inativo: {
    label: 'Inativo',
    color: 'var(--text-soft)',
    bg: 'var(--muted)',
    dot: '#a49a87',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const config = statusMap[status] || statusMap.rascunho;
  const displayLabel = label || config.label;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: 700,
        color: config.color,
        background: config.bg,
        padding: '4px 11px',
        borderRadius: '20px',
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: config.dot,
        }}
      />
      {displayLabel}
    </span>
  );
};
