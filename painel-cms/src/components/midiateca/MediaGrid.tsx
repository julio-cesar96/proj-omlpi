import React, { useState } from 'react';
import { Globe, Lock, X } from 'lucide-react';
import type { StrapiFile } from '../../lib/strapi';
import { MediaCard } from './MediaCard';
import { useMediaBulkTogglePublic } from '../../hooks/midiateca/useMediaBulkTogglePublic';

interface MediaGridProps {
  files: StrapiFile[];
  isLoading: boolean;
  onDelete: (id: number, name: string, relatedCount: number) => void;
  onToast?: (message: string, type?: 'success' | 'error') => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ files, isLoading, onDelete, onToast }) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const selectionMode = selectedIds.size > 0;

  const bulkToggle = useMediaBulkTogglePublic({
    onSuccess: (count) => {
      onToast?.(`${count} arquivo${count !== 1 ? 's' : ''} atualizado${count !== 1 ? 's' : ''}.`, 'success');
      setSelectedIds(new Set());
    },
  });

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => setSelectedIds(new Set());

  const handleBulkPublic = (is_public: boolean) => {
    bulkToggle.mutate({ ids: Array.from(selectedIds), is_public });
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
        }}
      >
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            key={idx}
            style={{
              height: '172px',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '110px',
                background: 'var(--muted)',
                opacity: 0.6,
              }}
            />
            <div style={{ padding: '11px 13px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  height: '12px',
                  background: 'var(--muted)',
                  borderRadius: '4px',
                  width: '80%',
                }}
              />
              <div
                style={{
                  height: '10px',
                  background: 'var(--muted)',
                  borderRadius: '4px',
                  width: '40%',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div
        style={{
          padding: '48px',
          textAlign: 'center',
          color: 'var(--text-soft)',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 16px)',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        Nenhum arquivo encontrado nesta categoria.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toolbar contextual de seleção múltipla */}
      {selectionMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            background: 'var(--card)',
            border: '1px solid var(--primary)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(68,69,37,0.08)',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text)',
              flex: 1,
              minWidth: '120px',
            }}
          >
            {selectedIds.size} arquivo{selectedIds.size !== 1 ? 's' : ''} selecionado{selectedIds.size !== 1 ? 's' : ''}
          </span>

          <button
            onClick={() => handleBulkPublic(true)}
            disabled={bulkToggle.isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#065f46',
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              cursor: bulkToggle.isPending ? 'not-allowed' : 'pointer',
              opacity: bulkToggle.isPending ? 0.6 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <Globe size={14} />
            Tornar público
          </button>

          <button
            onClick={() => handleBulkPublic(false)}
            disabled={bulkToggle.isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text)',
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: bulkToggle.isPending ? 'not-allowed' : 'pointer',
              opacity: bulkToggle.isPending ? 0.6 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <Lock size={14} />
            Tornar privado
          </button>

          <button
            onClick={handleClearSelection}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '7px 12px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-soft)',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={14} />
            Cancelar
          </button>
        </div>
      )}

      {/* Grid de cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
        }}
      >
        {files.map((file) => (
          <MediaCard
            key={file.id}
            file={file}
            onDelete={onDelete}
            selectionMode={selectionMode}
            isSelected={selectedIds.has(file.id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>

      {/* Dica de como entrar em modo de seleção (quando nenhum selecionado) */}
      {!selectionMode && files.length > 0 && (
        <p
          style={{
            fontSize: '11px',
            color: 'var(--text-soft)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Clique em um arquivo enquanto segura{' '}
          <kbd
            style={{
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              fontSize: '10px',
              fontFamily: 'monospace',
              background: 'var(--muted)',
            }}
          >
            Ctrl
          </kbd>{' '}
          ou ative a seleção clicando no ícone de checkbox para selecionar múltiplos arquivos.
        </p>
      )}
    </div>
  );
};
export default MediaGrid;
