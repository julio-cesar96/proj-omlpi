import React from 'react';
import { Globe } from 'lucide-react';
import type { MediaFilterKey, MediaSortKey } from '../../lib/strapi';
import type { MediaCounts } from '../../hooks/midiateca/useMediaCounts';

interface MediaFilterBarProps {
  counts: MediaCounts;
  activeFilter: MediaFilterKey;
  onFilter: (filter: MediaFilterKey) => void;
  activeSort: MediaSortKey;
  onSort: (sort: MediaSortKey) => void;
  /** Chamado quando o usuário clica em "Publicar todos" */
  onBulkPublish?: () => void;
}

export const MediaFilterBar: React.FC<MediaFilterBarProps> = ({
  counts,
  activeFilter,
  onFilter,
  activeSort,
  onSort,
  onBulkPublish,
}) => {
  const filterOptions: { key: MediaFilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'pdf', label: 'PDFs', count: counts.pdf },
    { key: 'img', label: 'Imagens', count: counts.img },
    { key: 'video', label: 'Vídeos', count: counts.video },
    { key: 'doc', label: 'Documentos', count: counts.doc },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}
    >
      {filterOptions.map((opt) => {
        const isActive = activeFilter === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onFilter(opt.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              height: '36px',
              padding: '0 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              border: '1px solid var(--border)',
              background: isActive ? 'var(--text)' : 'var(--card)',
              color: isActive ? '#FFFFFF' : 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {opt.label}{' '}
            <span style={{ opacity: 0.6, fontSize: '12px', marginLeft: '2px' }}>
              {opt.count}
            </span>
          </button>
        );
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12.5px', color: 'var(--text-soft)', fontWeight: 600 }}>
          Ordenar:
        </span>
        <select
          value={activeSort}
          onChange={(e) => onSort(e.target.value as MediaSortKey)}
          style={{
            height: '36px',
            padding: '0 12px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="recent">Mais recentes</option>
          <option value="name">Nome (A–Z)</option>
          <option value="size">Tamanho</option>
        </select>

        {onBulkPublish && (
          <button
            type="button"
            onClick={onBulkPublish}
            title="Publicar todos os arquivos do filtro atual"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '36px',
              padding: '0 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Globe size={15} />
            Publicar todos
          </button>
        )}
      </div>
    </div>
  );
};
export default MediaFilterBar;
