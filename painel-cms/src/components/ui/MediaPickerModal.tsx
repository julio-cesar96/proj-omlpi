import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Image as ImageIcon, FileText, Film } from 'lucide-react';
import { useMediaPickerFiles } from '../../hooks/midiateca/useMediaPickerFiles';
import { getMediaType, formatFileSize } from '../../lib/media';
import type { StrapiFile, MediaFilterKey } from '../../lib/strapi';

const STRAPI_URL =
  import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

const LIMIT = 20;

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (file: StrapiFile) => void;
  filterType?: MediaFilterKey;
  title?: string;
}

/** Retorna a URL de thumbnail para imagens, ou null para docs/vídeos */
function getThumbnailUrl(file: StrapiFile): string | null {
  if (!file.mime.startsWith('image/')) return null;
  const thumb = file.formats?.thumbnail?.url ?? file.formats?.small?.url ?? file.url;
  return thumb.startsWith('http') ? thumb : `${STRAPI_URL}${thumb}`;
}

function DocIcon({ mime }: { mime: string }) {
  if (mime.startsWith('video/')) {
    return (
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: '#efe6fb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Film size={20} color="#8a6bd6" />
      </div>
    );
  }
  return (
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'rgba(242,93,39,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <FileText size={20} color="var(--primary)" />
    </div>
  );
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  open,
  onClose,
  onSelect,
  filterType = 'all',
  title,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);

  const isImageMode = filterType === 'img' || filterType === 'all';

  const modalTitle =
    title ??
    (filterType === 'img'
      ? 'Selecionar imagem da Midiateca'
      : filterType === 'doc' || filterType === 'pdf'
      ? 'Selecionar arquivo da Midiateca'
      : filterType === 'video'
      ? 'Selecionar vídeo da Midiateca'
      : 'Selecionar da Midiateca');

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setSearchInput('');
      setDebouncedSearch('');
      setPage(1);
      setTimeout(() => searchRef.current?.focus(), 120);
    }
  }, [open]);

  // Debounce de 300ms na busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: files = [], isLoading } = useMediaPickerFiles({
    searchQuery: debouncedSearch,
    page,
    limit: LIMIT,
    filterType,
  });

  const hasPrev = page > 1;
  const hasNext = files.length === LIMIT;

  if (!open) return null;

  const handleSelect = (file: StrapiFile) => {
    onSelect(file);
    onClose();
  };

  const handleOverlayKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={modalTitle}
        onClick={onClose}
        onKeyDown={handleOverlayKey}
        tabIndex={-1}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20,20,20,.55)',
          zIndex: 400,
          animation: 'fadeIn .18s ease',
        }}
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '860px',
          maxWidth: '96vw',
          maxHeight: '88vh',
          background: 'var(--card)',
          borderRadius: '18px',
          boxShadow: '0 24px 60px rgba(0,0,0,.3)',
          zIndex: 401,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideIn .22s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {filterType === 'img' ? (
              <ImageIcon size={18} color="var(--primary)" />
            ) : filterType === 'video' ? (
              <Film size={18} color="#8a6bd6" />
            ) : (
              <FileText size={18} color="var(--primary)" />
            )}
            <h2
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--text)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-.3px',
              }}
            >
              {modalTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-soft)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div
          style={{
            padding: '14px 22px 12px',
            flexShrink: 0,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '400px',
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-soft)',
                pointerEvents: 'none',
              }}
            />
            <input
              ref={searchRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome…"
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px 0 36px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '13.5px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color .15s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
          </div>
        </div>

        {/* Grid / List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px 22px',
            minHeight: 0,
          }}
        >
          {isLoading ? (
            <SkeletonGrid isImageMode={isImageMode} />
          ) : files.length === 0 ? (
            <EmptyState />
          ) : isImageMode ? (
            <ImageGrid files={files} onSelect={handleSelect} />
          ) : (
            <DocList files={files} onSelect={handleSelect} />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && files.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '12px 22px',
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: hasPrev ? 'var(--text)' : 'var(--text-soft)',
                cursor: hasPrev ? 'pointer' : 'not-allowed',
                opacity: hasPrev ? 1 : 0.4,
                transition: 'all .15s ease',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-soft)',
                minWidth: '40px',
                textAlign: 'center',
              }}
            >
              {page}
            </span>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: hasNext ? 'var(--text)' : 'var(--text-soft)',
                cursor: hasNext ? 'pointer' : 'not-allowed',
                opacity: hasNext ? 1 : 0.4,
                transition: 'all .15s ease',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Sub-componentes ───────────────────────────────────────────────────────────

const ImageGrid: React.FC<{ files: StrapiFile[]; onSelect: (f: StrapiFile) => void }> = ({
  files,
  onSelect,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))',
      gap: '12px',
    }}
  >
    {files.map((file) => (
      <ImageTile key={file.id} file={file} onSelect={onSelect} />
    ))}
  </div>
);

const ImageTile: React.FC<{ file: StrapiFile; onSelect: (f: StrapiFile) => void }> = ({
  file,
  onSelect,
}) => {
  const [hovered, setHovered] = useState(false);
  const thumbUrl = getThumbnailUrl(file);

  return (
    <button
      type="button"
      onClick={() => onSelect(file)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={file.name}
      style={{
        position: 'relative',
        borderRadius: '12px',
        border: `2px solid ${hovered ? 'var(--primary)' : 'var(--border)'}`,
        background: 'var(--muted)',
        cursor: 'pointer',
        overflow: 'hidden',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color .15s ease, transform .15s ease, box-shadow .15s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 6px 20px rgba(242,93,39,.2)' : 'none',
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', flexShrink: 0 }}>
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={file.alternativeText || file.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--muted)',
            }}
          >
            <ImageIcon size={32} color="var(--text-soft)" />
          </div>
        )}
      </div>

      {/* Overlay "Selecionar" no hover */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(242,93,39,.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '20px',
              letterSpacing: '.3px',
            }}
          >
            Selecionar
          </span>
        </div>
      )}

      {/* Nome */}
      <div
        style={{
          padding: '7px 8px 8px',
          background: 'var(--card)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'left',
          }}
        >
          {file.name}
        </div>
        <div style={{ fontSize: '10.5px', color: 'var(--text-soft)', marginTop: '1px', textAlign: 'left' }}>
          {formatFileSize(file.size)}
        </div>
      </div>
    </button>
  );
};

const DocList: React.FC<{ files: StrapiFile[]; onSelect: (f: StrapiFile) => void }> = ({
  files,
  onSelect,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {files.map((file) => (
      <DocRow key={file.id} file={file} onSelect={onSelect} />
    ))}
  </div>
);

const DocRow: React.FC<{ file: StrapiFile; onSelect: (f: StrapiFile) => void }> = ({
  file,
  onSelect,
}) => {
  const [hovered, setHovered] = useState(false);
  const mediaType = getMediaType(file.mime);

  return (
    <button
      type="button"
      onClick={() => onSelect(file)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={file.name}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '10px 14px',
        borderRadius: '12px',
        border: `1px solid ${hovered ? 'var(--primary)' : 'var(--border)'}`,
        background: hovered ? 'rgba(242,93,39,.04)' : 'var(--bg)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'border-color .15s ease, background .15s ease',
      }}
    >
      <DocIcon mime={file.mime} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '13.5px',
            fontWeight: 600,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '2px' }}>
          {mediaType.toUpperCase()} · {formatFileSize(file.size)}
        </div>
      </div>
      {hovered && (
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--primary)',
            flexShrink: 0,
            paddingRight: '4px',
          }}
        >
          Selecionar →
        </span>
      )}
    </button>
  );
};

function SkeletonGrid({ isImageMode }: { isImageMode: boolean }) {
  if (isImageMode) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))',
          gap: '12px',
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              borderRadius: '12px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              background: 'var(--card)',
            }}
          >
            <div
              style={{
                aspectRatio: '1',
                background: 'var(--muted)',
                animation: 'pulse 1.5s ease infinite',
              }}
            />
            <div style={{ padding: '7px 8px 8px' }}>
              <div
                style={{
                  height: '11px',
                  width: '80%',
                  background: 'var(--muted)',
                  borderRadius: '4px',
                  animation: 'pulse 1.5s ease infinite',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '64px',
            borderRadius: '12px',
            background: 'var(--muted)',
            animation: 'pulse 1.5s ease infinite',
          }}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        color: 'var(--text-soft)',
        gap: '10px',
      }}
    >
      <div style={{ fontSize: '36px' }}>🗂</div>
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Nenhum arquivo encontrado</p>
      <p style={{ margin: 0, fontSize: '13px' }}>
        Tente outro termo de busca ou envie arquivos pela Midiateca.
      </p>
    </div>
  );
}
