import React from 'react';
import { Globe, Search, X } from 'lucide-react';
import type { MediaFilterKey, MediaSortKey } from '../../lib/strapi';
import type { MediaCounts } from '../../hooks/midiateca/useMediaCounts';

interface MediaFilterBarProps {
  counts: MediaCounts;
  activeFilter: MediaFilterKey;
  onFilter: (filter: MediaFilterKey) => void;
  activeSort: MediaSortKey;
  onSort: (sort: MediaSortKey) => void;
  /** Valor atual da busca por nome de arquivo */
  searchQuery?: string;
  /** Chamado a cada mudança no campo de busca */
  onSearchChange?: (value: string) => void;
  /** Chamado quando o usuário clica em "Publicar todos" */
  onBulkPublish?: () => void;
}

export const MediaFilterBar: React.FC<MediaFilterBarProps> = ({
  counts,
  activeFilter,
  onFilter,
  activeSort,
  onSort,
  searchQuery = '',
  onSearchChange,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
      {/* Campo de busca por nome */}
      {onSearchChange && (
        <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '11px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-soft)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome do arquivo..."
            style={{
              width: '100%',
              height: '36px',
              paddingLeft: '34px',
              paddingRight: searchQuery ? '32px' : '12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              fontSize: '13px',
              color: 'var(--text)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              title="Limpar busca"
              style={{
                position: 'absolute',
                right: '9px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Filtros de tipo + ordenação */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
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
    </div>
  );
};
export default MediaFilterBar;
