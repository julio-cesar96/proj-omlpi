/**
 * MidiatecaClient — Client Component (seção Midiateca)
 *
 * 2 abas:
 *   1. Documentos — grade de StrapiGuia por categoria (dados passados como prop)
 *   2. Mídias     — arquivos públicos da Media Library, paginados via
 *                   /api/midiateca-publica (Route Handler proxy)
 *
 * A aba "Artigos" foi removida (decisão Q1). O proxy /api/artigos e
 * lib/cms-search.ts foram removidos junto.
 */

'use client';

import { useState, useCallback } from 'react';
import { StrapiGuia, StrapiMidiaPublica } from '@/lib/strapi';

const LIMIT = 20;

// ─── Tipos locais ─────────────────────────────────────────────────────────────

type MidiatecaTab = 'documentos' | 'midias';
type MidiaFilterKey = 'all' | 'pdf' | 'img' | 'video' | 'doc';

// ─── Utilitários de tipo de mídia ─────────────────────────────────────────────

function getMediaType(mime: string): Exclude<MidiaFilterKey, 'all'> {
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('image/')) return 'img';
  if (mime.startsWith('video/')) return 'video';
  return 'doc';
}

function formatFileSize(sizeKB: number): string {
  if (sizeKB >= 1024 * 1024) return `${(sizeKB / (1024 * 1024)).toFixed(1).replace('.', ',')} GB`;
  if (sizeKB >= 1024) return `${(sizeKB / 1024).toFixed(1).replace('.', ',')} MB`;
  return `${Math.round(sizeKB)} KB`;
}

const TYPE_CONFIG: Record<
  Exclude<MidiaFilterKey, 'all'>,
  { label: string; bg: string; color: string; mimeParam?: string }
> = {
  pdf:   { label: 'PDF', bg: '#FDE7DE', color: '#F25D27', mimeParam: 'application/pdf' },
  img:   { label: 'IMG', bg: '#E8F5EE', color: '#17A649', mimeParam: 'image/' },
  video: { label: 'VÍD', bg: '#efe6fb', color: '#8a6bd6', mimeParam: 'video/' },
  doc:   { label: 'DOC', bg: '#e6eefb', color: '#3b6bd6' },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function DownloadIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-muted-foreground"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── Documentos (Guias por categoria) ────────────────────────────────────────

const CATEGORY_ORDER = ['Legislação', 'Plano Nacional', 'Guia', 'Relatório'];

function groupByCategory(guias: StrapiGuia[]): Map<string, StrapiGuia[]> {
  const map = new Map<string, StrapiGuia[]>();
  for (const guia of guias) {
    const cat = guia.category ?? 'Outros';
    const list = map.get(cat) ?? [];
    list.push(guia);
    map.set(cat, list);
  }
  return map;
}

function DocumentCard({ guia }: { guia: StrapiGuia }) {
  return (
    <div className="bg-background rounded-2xl p-5 border border-border hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-[#fff3ee] flex items-center justify-center flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f25d27"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            {guia.category ?? 'Documento'}
          </div>
          <div
            className="font-bold text-foreground text-sm leading-snug"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {guia.title}
          </div>
        </div>
      </div>
      {guia.description && (
        <div className="text-xs text-muted-foreground leading-[1.55] mb-4 flex-1">
          {guia.description}
        </div>
      )}
      {guia.file?.url ? (
        <a
          href={guia.file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center gap-2 py-2.5 bg-foreground text-white text-xs font-semibold rounded-xl hover:bg-[#333418] transition-colors"
        >
          <DownloadIcon /> Baixar
        </a>
      ) : (
        <span className="mt-auto flex items-center justify-center gap-2 py-2.5 bg-muted text-muted-foreground text-xs font-semibold rounded-xl">
          Indisponível
        </span>
      )}
    </div>
  );
}

function DocumentosTab({ guias }: { guias: StrapiGuia[] }) {
  if (guias.length === 0) {
    return <p className="text-sm text-muted-foreground">Documentos em breve.</p>;
  }

  const grouped = groupByCategory(guias);
  const categories = [
    ...CATEGORY_ORDER.filter((c) => grouped.has(c)),
    ...[...grouped.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="space-y-10">
      {categories.map((cat) => (
        <div key={cat}>
          <h3
            className="text-base font-bold text-foreground mb-5 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <span className="w-4 h-0.5 bg-primary rounded-full inline-block" />
            {cat}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {grouped.get(cat)!.map((guia) => (
              <DocumentCard key={guia.id} guia={guia} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Mídias (arquivos públicos da Media Library) ──────────────────────────────

function MidiaCard({ midia }: { midia: StrapiMidiaPublica }) {
  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    'https://omlpi-strapi.rnpiobserva.org.br';

  const type = getMediaType(midia.mime);
  const config = TYPE_CONFIG[type];
  const isImg = type === 'img';

  const fileUrl = midia.url.startsWith('http')
    ? midia.url
    : `${STRAPI_URL}${midia.url}`;

  const thumbnail =
    isImg && midia.formats
      ? (
          (midia.formats as Record<string, { url: string }>)?.thumbnail?.url ||
          (midia.formats as Record<string, { url: string }>)?.small?.url
        ) ?? null
      : null;

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-background rounded-2xl border border-border hover:shadow-md hover:border-primary transition-all flex flex-col overflow-hidden group"
      aria-label={`Abrir ${midia.name}`}
    >
      {/* Thumbnail */}
      <div
        className="h-28 flex items-center justify-center flex-shrink-0 relative"
        style={{ background: config.bg }}
      >
        {isImg && thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail.startsWith('http') ? thumbnail : `${STRAPI_URL}${thumbnail}`}
            alt={midia.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: '18px',
              color: config.color,
              letterSpacing: '.5px',
            }}
          >
            {config.label}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 min-w-0">
        <div
          className="text-sm font-bold text-foreground leading-snug mb-1 truncate"
          title={midia.name}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {midia.name}
        </div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-[11px] text-muted-foreground font-semibold">
            {formatFileSize(midia.size)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-primary font-semibold group-hover:underline">
            <DownloadIcon size={10} /> Baixar
          </span>
        </div>
      </div>
    </a>
  );
}

function MidiasTab({
  initialMidias,
  totalMidias,
}: {
  initialMidias: StrapiMidiaPublica[];
  totalMidias: number;
}) {
  const [midias, setMidias] = useState<StrapiMidiaPublica[]>(initialMidias);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MidiaFilterKey>('all');
  const [offset, setOffset] = useState(initialMidias.length);
  const [hasMore, setHasMore] = useState(initialMidias.length < totalMidias);
  const [loading, setLoading] = useState(false);

  const fetchMidias = useCallback(
    async (loadMore = false, currentOffset = 0, filter = activeFilter, search = searchQuery) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('_start', String(currentOffset));
        params.set('_limit', String(LIMIT));
        params.set('_sort', 'created_at:DESC');

        if (search) params.set('name_contains', search);

        // Filtro por tipo MIME
        if (filter === 'pdf') params.set('mime_contains', 'application/pdf');
        else if (filter === 'img') params.set('mime_contains', 'image/');
        else if (filter === 'video') params.set('mime_contains', 'video/');
        // 'doc' e 'all' sem mime_contains (filtro doc seria complexo de fazer no servidor)

        const res = await fetch(`/api/midiateca-publica?${params}`);
        if (!res.ok) throw new Error('Erro ao carregar mídias');
        const data = await res.json();

        const results: StrapiMidiaPublica[] = Array.isArray(data?.results) ? data.results : [];
        const total: number = typeof data?.count === 'number' ? data.count : 0;

        // Filtro doc é feito no cliente (arquivos que não são pdf/img/video)
        const filtered =
          filter === 'doc'
            ? results.filter((m) => {
                const t = getMediaType(m.mime);
                return t === 'doc';
              })
            : results;

        if (loadMore) {
          setMidias((prev) => [...prev, ...filtered]);
        } else {
          setMidias(filtered);
        }

        const nextOffset = currentOffset + results.length;
        setOffset(nextOffset);
        setHasMore(nextOffset < total);
      } catch (err) {
        console.error('[MidiatecaClient] erro ao carregar mídias:', err);
      } finally {
        setLoading(false);
      }
    },
    [activeFilter, searchQuery]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchMidias(false, 0, activeFilter, searchQuery);
  }

  function handleFilter(filter: MidiaFilterKey) {
    setActiveFilter(filter);
    fetchMidias(false, 0, filter, searchQuery);
  }

  const filterOptions: { key: MidiaFilterKey; label: string }[] = [
    { key: 'all',   label: 'Todos' },
    { key: 'pdf',   label: 'PDFs' },
    { key: 'img',   label: 'Imagens' },
    { key: 'video', label: 'Vídeos' },
    { key: 'doc',   label: 'Documentos' },
  ];

  return (
    <div>
      {/* Busca */}
      <form
        onSubmit={handleSearch}
        className="flex gap-3 mb-5"
        role="search"
        aria-label="Buscar mídias"
      >
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do arquivo..."
            id="midiateca-midia-search"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-[#e04d18] transition-colors disabled:opacity-60"
        >
          Buscar
        </button>
      </form>

      {/* Filtros por tipo */}
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filtrar por tipo">
        {filterOptions.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleFilter(key)}
            aria-pressed={activeFilter === key}
            className={`h-9 px-4 rounded-xl text-sm font-bold border transition-all duration-200 ${
              activeFilter === key
                ? 'bg-foreground text-white border-foreground'
                : 'bg-background text-foreground border-border hover:border-primary hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grade de mídias */}
      {midias.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {midias.map((midia) => (
              <MidiaCard key={midia.id} midia={midia} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => fetchMidias(true, offset)}
                disabled={loading}
                className="px-8 py-3 border-2 border-border text-foreground text-sm font-semibold rounded-full hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
              >
                {loading ? 'Carregando...' : 'Carregar mais'}
              </button>
            </div>
          )}
        </>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {searchQuery || activeFilter !== 'all'
            ? 'Nenhuma mídia encontrada para este filtro.'
            : 'Nenhuma mídia pública disponível no momento.'}
        </p>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  guias: StrapiGuia[];
  /** Mídias públicas carregadas via getMidiaPublica() no SSR */
  midias: StrapiMidiaPublica[];
  /** Total de arquivos públicos (para hasMore inicial) */
  totalMidias: number;
}

const TAB_LABELS: Record<MidiatecaTab, string> = {
  documentos: 'Documentos',
  midias: 'Mídias',
};

export function MidiatecaClient({ guias, midias, totalMidias }: Props) {
  const [activeTab, setActiveTab] = useState<MidiatecaTab>('documentos');

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap mb-8 p-1.5 bg-background rounded-2xl border border-border w-fit shadow-sm">
        {(Object.keys(TAB_LABELS) as MidiatecaTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'documentos' && <DocumentosTab guias={guias} />}
      {activeTab === 'midias' && (
        <MidiasTab initialMidias={midias} totalMidias={totalMidias} />
      )}
    </>
  );
}
