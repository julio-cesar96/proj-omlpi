import React from 'react';
import type { EditorialState } from '../../lib/strapi';

interface EditorialBadgeProps {
  status?: EditorialState | null;
  publishedAt?: string | null;
  size?: 'sm' | 'md';
}

const statusConfig: Record<EditorialState, { label: string; bg: string; color: string; dot: string }> = {
  rascunho: {
    label: 'Rascunho',
    bg: '#F3F0E6',
    color: '#605B4E',
    dot: '#A49A87',
  },
  revisao: {
    label: 'Em revisão',
    bg: '#FEF3EB',
    color: '#C84517',
    dot: '#F25D27',
  },
  publicado: {
    label: 'Publicado',
    bg: '#EBF7EE',
    color: '#117835',
    dot: '#17A649',
  },
  arquivado: {
    label: 'Arquivado',
    bg: '#FBF0F0',
    color: '#9C3D3D',
    dot: '#C08585',
  },
};

export const EditorialBadge: React.FC<EditorialBadgeProps> = ({
  status,
  publishedAt,
  size = 'md',
}) => {
  // Resolve o estado com fallback de segurança (Decisão B)
  const resolvedStatus: EditorialState =
    status || (publishedAt ? 'publicado' : 'rascunho');

  const config = statusConfig[resolvedStatus] || statusConfig.rascunho;

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '4px' : '6px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: '20px',
        background: config.bg,
        color: config.color,
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          background: config.dot,
        }}
      />
      {config.label}
    </span>
  );
};
