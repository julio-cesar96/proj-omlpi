import React from 'react';
import { X, Loader2 } from 'lucide-react';
import type { UploadItem } from '../../hooks/midiateca/useMediaUpload';
import { formatFileSize } from '../../lib/media';

interface UploadProgressPanelProps {
  uploads: UploadItem[];
  onClear: () => void;
}

export const UploadProgressPanel: React.FC<UploadProgressPanelProps> = ({ uploads, onClear }) => {
  if (uploads.length === 0) return null;

  const uploadingCount = uploads.filter((u) => !u.done && !u.error).length;

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius, 16px)',
        boxShadow: 'var(--shadow)',
        padding: '16px 18px',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          fontSize: '13px',
          fontWeight: 800,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {uploadingCount > 0 ? (
            <>
              <span>Enviando {uploadingCount} arquivo(s)...</span>
              <Loader2
                size={14}
                style={{
                  color: 'var(--primary)',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            </>
          ) : (
            <span>Todos os uploads concluídos</span>
          )}
        </div>
        {uploadingCount === 0 && (
          <button
            onClick={onClear}
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-soft)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Limpar lista <X size={12} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {uploads.map((u) => {
          const sizeStr = formatFileSize(u.file.size / 1024); // file.size is in bytes, convert to KB
          const progressPercent = u.progress;
          const statusText = u.error
            ? `Erro: ${u.error}`
            : u.done
            ? 'Concluído'
            : `${progressPercent}%`;

          const statusColor = u.error
            ? 'var(--destructive)'
            : u.done
            ? '#17A649' // var(--secondary)
            : '#7a7663'; // var(--text-soft)

          const barColor = u.error
            ? 'var(--destructive)'
            : u.done
            ? 'var(--secondary)'
            : 'var(--primary)';

          return (
            <div key={u.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '70%',
                  }}
                  title={u.file.name}
                >
                  {u.file.name}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: statusColor }}>
                  {statusText} · {sizeStr}
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  background: 'var(--muted)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: barColor,
                    borderRadius: '20px',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default UploadProgressPanel;
