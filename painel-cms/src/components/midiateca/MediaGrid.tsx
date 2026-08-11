import React from 'react';
import type { StrapiFile } from '../../lib/strapi';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  files: StrapiFile[];
  isLoading: boolean;
  onDelete: (id: number, name: string, relatedCount: number) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ files, isLoading, onDelete }) => {
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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
      }}
    >
      {files.map((file) => (
        <MediaCard key={file.id} file={file} onDelete={onDelete} />
      ))}
    </div>
  );
};
export default MediaGrid;
