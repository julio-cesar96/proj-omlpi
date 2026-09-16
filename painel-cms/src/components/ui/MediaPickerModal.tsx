import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Image as ImageIcon, FileText, Film } from 'lucide-react';
import { useMediaPickerFiles } from '../../hooks/midiateca/useMediaPickerFiles';
import { getMediaType, formatFileSize } from '../../lib/media';
import type { StrapiFile, MediaFilterKey } from '../../lib/strapi';
import { STRAPI_URL } from '../../lib/api';

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
      <div className="w-10 h-10 rounded-[10px] bg-[var(--badge-purple-bg)] flex items-center justify-center shrink-0">
        <Film size={20} color="#8a6bd6" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-[10px] bg-[rgba(242,93,39,0.1)] flex items-center justify-center shrink-0">
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
        className="fixed inset-0 bg-[rgba(20,20,20,0.55)] z-[400] animate-[fadeIn_.18s_ease]"
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[860px] max-w-[96vw] max-h-[88vh] bg-card rounded-[18px] shadow-[0_24px_60px_rgba(0,0,0,0.3)] z-[401] flex flex-col overflow-hidden animate-[slideIn_.22s_ease]"
      >
        {/* Header */}
        <div className="flex items-center justify-between py-[18px] px-[22px] border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            {filterType === 'img' ? (
              <ImageIcon size={18} color="var(--primary)" />
            ) : filterType === 'video' ? (
              <Film size={18} color="#8a6bd6" />
            ) : (
              <FileText size={18} color="var(--primary)" />
            )}
            <h2 className="m-0 text-[16px] font-extrabold text-foreground font-heading tracking-[-0.3px]">
              {modalTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[9px] border-0 bg-transparent text-muted-foreground cursor-pointer flex items-center justify-center transition-colors duration-150 ease-in-out hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="pt-[14px] px-[22px] pb-3 shrink-0 border-b border-border">
          <div className="relative max-w-[400px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              ref={searchRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome…"
              className="w-full h-[38px] pl-9 pr-3 py-0 rounded-[10px] border border-border bg-background text-foreground text-[13.5px] outline-none box-border transition-colors duration-150 ease-in-out focus:border-primary"
            />
          </div>
        </div>

        {/* Grid / List */}
        <div className="flex-1 overflow-y-auto py-[18px] px-[22px] min-h-0">
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
          <div className="flex items-center justify-center gap-3 py-3 px-[22px] border-t border-border shrink-0">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-foreground cursor-pointer transition-all duration-150 ease-in-out disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[13px] font-bold text-muted-foreground min-w-[40px] text-center">
              {page}
            </span>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-foreground cursor-pointer transition-all duration-150 ease-in-out disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40"
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
  <div className="grid grid-cols-[repeat(auto-fill,minmax(152px,1fr))] gap-3">
    {files.map((file) => (
      <ImageTile key={file.id} file={file} onSelect={onSelect} />
    ))}
  </div>
);

const ImageTile: React.FC<{ file: StrapiFile; onSelect: (f: StrapiFile) => void }> = ({
  file,
  onSelect,
}) => {
  const thumbUrl = getThumbnailUrl(file);

  return (
    <button
      type="button"
      onClick={() => onSelect(file)}
      title={file.name}
      className="group relative rounded-xl border-2 border-border bg-muted cursor-pointer overflow-hidden p-0 flex flex-col transition-[border-color,transform,box-shadow] duration-150 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,93,39,0.2)]"
    >
      {/* Thumbnail */}
      <div className="w-full aspect-square overflow-hidden shrink-0">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={file.alternativeText || file.name}
            className="w-full h-full object-cover block"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageIcon size={32} color="var(--text-soft)" />
          </div>
        )}
      </div>

      {/* Overlay "Selecionar" no hover */}
      <div className="hidden group-hover:flex absolute inset-0 bg-[rgba(242,93,39,0.18)] items-center justify-center">
        <span className="bg-primary text-white text-[11px] font-extrabold py-1 px-2.5 rounded-full tracking-[0.3px]">
          Selecionar
        </span>
      </div>

      {/* Nome */}
      <div className="pt-[7px] px-2 pb-2 bg-card border-t border-border">
        <div className="text-[11.5px] font-semibold text-foreground truncate text-left">
          {file.name}
        </div>
        <div className="text-[10.5px] text-muted-foreground mt-px text-left">
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
  <div className="flex flex-col gap-2">
    {files.map((file) => (
      <DocRow key={file.id} file={file} onSelect={onSelect} />
    ))}
  </div>
);

const DocRow: React.FC<{ file: StrapiFile; onSelect: (f: StrapiFile) => void }> = ({
  file,
  onSelect,
}) => {
  const mediaType = getMediaType(file.mime);

  return (
    <button
      type="button"
      onClick={() => onSelect(file)}
      title={file.name}
      className="group flex items-center gap-3.5 py-2.5 px-3.5 rounded-xl border border-border bg-background cursor-pointer text-left w-full transition-[border-color,background-color] duration-150 ease-in-out hover:border-primary hover:bg-[rgba(242,93,39,0.04)]"
    >
      <DocIcon mime={file.mime} />
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold text-foreground truncate">
          {file.name}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {mediaType.toUpperCase()} · {formatFileSize(file.size)}
        </div>
      </div>
      <span className="hidden group-hover:inline-flex text-xs font-bold text-primary shrink-0 pr-1">
        Selecionar →
      </span>
    </button>
  );
};

function SkeletonGrid({ isImageMode }: { isImageMode: boolean }) {
  if (isImageMode) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(152px,1fr))] gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="aspect-square bg-muted animate-pulse" />
            <div className="pt-[7px] px-2 pb-2">
              <div className="h-[11px] w-4/5 bg-muted rounded-[4px] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-[60px] px-6 text-muted-foreground gap-2.5">
      <div className="text-[36px]">🗂</div>
      <p className="m-0 text-sm font-bold">Nenhum arquivo encontrado</p>
      <p className="m-0 text-[13px]">
        Tente outro termo de busca ou envie arquivos pela Midiateca.
      </p>
    </div>
  );
}
