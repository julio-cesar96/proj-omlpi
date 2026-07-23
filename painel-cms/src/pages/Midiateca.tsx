import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaFiles } from '../hooks/midiateca/useMediaFiles';
import { useMediaCounts } from '../hooks/midiateca/useMediaCounts';
import { useMediaUpload } from '../hooks/midiateca/useMediaUpload';
import { useMediaDelete } from '../hooks/midiateca/useMediaDelete';
import { MediaDropzone } from '../components/midiateca/MediaDropzone';
import { UploadProgressPanel } from '../components/midiateca/UploadProgressPanel';
import { MediaFilterBar } from '../components/midiateca/MediaFilterBar';
import { MediaGrid } from '../components/midiateca/MediaGrid';
import { Toast } from '../components/ui/Toast';
import type { MediaFilterKey, MediaSortKey } from '../lib/strapi';

export const Midiateca: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<MediaFilterKey>('all');
  const [activeSort, setActiveSort] = useState<MediaSortKey>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const LIMIT = 25;

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleFilter = (f: MediaFilterKey) => {
    setActiveFilter(f);
    setCurrentPage(1);
  };

  const handleSort = (s: MediaSortKey) => {
    setActiveSort(s);
    setCurrentPage(1);
  };

  const { data: files, isLoading } = useMediaFiles({
    start: (currentPage - 1) * LIMIT,
    limit: LIMIT,
    sortKey: activeSort,
    filterType: activeFilter,
  });

  const { counts } = useMediaCounts();
  const { uploads, uploadFiles, clearCompleted } = useMediaUpload();
  const deleteMutation = useMediaDelete();

  // Handle file deletion
  const handleDelete = (id: number, name: string, relatedCount: number) => {
    const message = relatedCount > 0
      ? `Este arquivo está em uso por ${relatedCount} registro(s) — excluir mesmo assim?`
      : `Excluir o arquivo "${name}" permanentemente?`;

    if (window.confirm(message)) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          showToast('Arquivo excluído com sucesso');
        },
        onError: (err) => {
          showToast(err.message || 'Erro ao excluir o arquivo');
        },
      });
    }
  };

  // Trigger uploads
  const handleDrop = async (acceptedFiles: File[]) => {
    uploadFiles(acceptedFiles);
    showToast(`${acceptedFiles.length} arquivo(s) sendo enviado(s)`);
  };

  // Storage and pagination counts
  const total = activeFilter === 'all' ? counts.all : activeFilter === 'pdf' ? counts.pdf : activeFilter === 'img' ? counts.img : activeFilter === 'video' ? counts.video : counts.doc;
  const startRecord = total === 0 ? 0 : (currentPage - 1) * LIMIT + 1;
  const endRecord = Math.min(currentPage * LIMIT, total);
  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-.5px', color: 'var(--text)' }}>
            Midiateca
          </h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
            Envie e organize arquivos, imagens, vídeos e documentos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '9px', alignItems: 'center' }}>
          <div
            style={{
              fontSize: '12.5px',
              color: 'var(--text-soft)',
              fontWeight: 600,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              padding: '9px 14px',
              borderRadius: '11px',
            }}
          >
            6,4 GB de 20 GB usados
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <MediaDropzone onDrop={handleDrop} />

      {/* Upload Progress Panel */}
      {uploads.length > 0 && (
        <UploadProgressPanel uploads={uploads} onClear={clearCompleted} />
      )}

      {/* Filters and Sort */}
      <MediaFilterBar
        counts={counts}
        activeFilter={activeFilter}
        onFilter={handleFilter}
        activeSort={activeSort}
        onSort={handleSort}
      />

      {/* Media Grid */}
      <MediaGrid files={files || []} isLoading={isLoading} onDelete={handleDelete} />

      {/* Pagination Footer */}
      {!isLoading && files && files.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            marginTop: '20px',
            borderTop: '1px solid var(--border)',
            fontSize: '13px',
            color: 'var(--text-soft)',
            fontWeight: 600,
          }}
        >
          <div>
            Mostrando {startRecord}–{endRecord} de {total} arquivos
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text)',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text)',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.5 : 1,
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};
