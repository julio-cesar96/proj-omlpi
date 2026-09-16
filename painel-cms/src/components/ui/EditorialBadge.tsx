import React from 'react';
import type { EditorialState } from '../../lib/strapi';

interface EditorialBadgeProps {
  status?: EditorialState | null;
  publishedAt?: string | null;
  size?: 'sm' | 'md';
}

const statusConfig: Record<EditorialState, { label: string; bgClass: string; colorClass: string; dotClass: string }> = {
  rascunho: {
    label: 'Rascunho',
    bgClass: 'bg-[#F3F0E6]',
    colorClass: 'text-[#605B4E]',
    dotClass: 'bg-[#A49A87]',
  },
  revisao: {
    label: 'Em revisão',
    bgClass: 'bg-[#FEF3EB]',
    colorClass: 'text-[#C84517]',
    dotClass: 'bg-primary',
  },
  publicado: {
    label: 'Publicado',
    bgClass: 'bg-[#EBF7EE]',
    colorClass: 'text-[#117835]',
    dotClass: 'bg-secondary',
  },
  arquivado: {
    label: 'Arquivado',
    bgClass: 'bg-[#FBF0F0]',
    colorClass: 'text-[#9C3D3D]',
    dotClass: 'bg-[#C08585]',
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
      className={`inline-flex items-center rounded-full font-bold whitespace-nowrap ${config.bgClass} ${config.colorClass} ${
        isSmall ? 'gap-1 px-2 py-0.5 text-[11px]' : 'gap-1.5 px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`rounded-full ${config.dotClass} ${isSmall ? 'w-[5px] h-[5px]' : 'w-1.5 h-1.5'}`} />
      {config.label}
    </span>
  );
};
