/**
 * MidiatecaClient — Client Component (seção Midiateca)
 *
 * 2 abas:
 *   1. Documentos — grade de StrapiGuia por categoria (dados passados como prop)
 *   2. Artigos    — busca, filtro por tag e paginação via /api/artigos (Route Handler proxy)
 *
 * Artigos: fonte é o omlpi-cms-search (busca full-text real).
 *   O Route Handler /api/artigos traduz _where[tags_in][] → _where[tags][]
 *   transparentemente, então este componente usa o padrão Strapi na query string.
 *
 * Lógica de paginação portada de omlpi-www/src/assets/scripts/articles.js:
 *   - offset incremental no "Carregar mais"
 *   - reset do offset em nova busca/filtro
 *   - hasMore = response.hasMore (flag nativa do omlpi-cms-search)
 *   - selectedTags: array de IDs de tags (filtro _where[tags_in][]=id)
 */

"use client";

import { useState, useCallback } from "react";
import { StrapiGuia, StrapiTag } from "@/lib/strapi";
import type { CmsSearchArtigo } from "@/lib/cms-search";

const LIMIT = 15;

// ─── Tipos locais ─────────────────────────────────────────────────────────────

type MidiatecaTab = "documentos" | "artigos";

// ─── Icons ───────────────────────────────────────────────────────────────────

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

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
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

const CATEGORY_ORDER = ["Legislação", "Plano Nacional", "Guia", "Relatório"];

function groupByCategory(guias: StrapiGuia[]): Map<string, StrapiGuia[]> {
  const map = new Map<string, StrapiGuia[]>();
  for (const guia of guias) {
    const cat = guia.category ?? "Outros";
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
            {guia.category ?? "Documento"}
          </div>
          <div
            className="font-bold text-foreground text-sm leading-snug"
            style={{ fontFamily: "var(--font-heading)" }}
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
    return (
      <p className="text-sm text-muted-foreground">Documentos em breve.</p>
    );
  }

  const grouped = groupByCategory(guias);
  // Ordena categorias pela ordem definida, com "Outros" no final
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
            style={{ fontFamily: "var(--font-heading)" }}
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

// ─── Artigos (busca, tags, paginação) ────────────────────────────────────────

function ArtigoCard({ artigo }: { artigo: CmsSearchArtigo }) {
  return (
    <div className="bg-background rounded-2xl p-5 border border-border hover:shadow-md transition-shadow flex flex-col">
      {artigo.image?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={artigo.image.url}
          alt={artigo.title ?? ""}
          className="w-full h-36 object-cover rounded-xl mb-4"
        />
      )}
      {artigo.tags && artigo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {artigo.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="px-2.5 py-0.5 bg-accent text-secondary rounded-full text-[10px] font-bold uppercase tracking-wide"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <div
        className="font-bold text-foreground text-sm leading-snug mb-2 flex-1"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {artigo.title}
      </div>
      {/* omlpi-cms-search usa `description` como campo de resumo (≠ `summary` do Strapi) */}
      {artigo.description && (
        <div className="text-xs text-muted-foreground leading-[1.6] mb-4 line-clamp-3">
          {artigo.description}
        </div>
      )}
      <div className="mt-auto flex gap-2">
        {artigo.file?.url && (
          <a
            href={artigo.file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
          >
            <DownloadIcon /> PDF
          </a>
        )}
        {/* TODO: exibir player/link de YouTube quando artigo.youtube estiver presente */}
        {artigo.youtube && (
          <a
            href={artigo.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-secondary font-semibold hover:underline"
          >
            <ExternalLinkIcon /> Assistir
          </a>
        )}
      </div>
    </div>
  );
}

function ArtigosTab({
  initialArtigos,
  tags,
}: {
  initialArtigos: CmsSearchArtigo[];
  tags: StrapiTag[];
}) {
  const [artigos, setArtigos] = useState<CmsSearchArtigo[]>(initialArtigos);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [offset, setOffset] = useState(initialArtigos.length);
  const [hasMore, setHasMore] = useState(initialArtigos.length === LIMIT);
  const [loading, setLoading] = useState(false);

  const fetchArtigos = useCallback(
    async (loadMore = false, currentOffset = 0) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("_q", searchQuery);
        if (selectedTagIds.length) {
          // _where[tags_in][]=id1&_where[tags_in][]=id2
          selectedTagIds.forEach((id) =>
            params.append("_where[tags_in][]", String(id))
          );
        }
        params.set("_limit", String(LIMIT));
        params.set("_start", String(currentOffset));

        const res = await fetch(`/api/artigos?${params}`);
        if (!res.ok) throw new Error("Erro ao buscar artigos");
        const data = await res.json();

        // omlpi-cms-search retorna { hasMore, limit, offset, results[] } — sempre
        const results: CmsSearchArtigo[] = Array.isArray(data?.results)
          ? data.results
          : [];
        const more: boolean = data?.hasMore ?? false;

        if (loadMore) {
          setArtigos((prev) => [...prev, ...results]);
        } else {
          setArtigos(results);
        }
        setHasMore(more);
        setOffset(currentOffset + results.length);
      } catch (err) {
        console.error("[MidiatecaClient] erro ao buscar artigos:", err);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedTagIds]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchArtigos(false, 0);
  }

  function toggleTag(id: number) {
    const next = selectedTagIds.includes(id)
      ? selectedTagIds.filter((t) => t !== id)
      : [...selectedTagIds, id];
    setSelectedTagIds(next);
    // Busca imediata ao mudar tag
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("_q", searchQuery);
    next.forEach((tid) =>
      params.append("_where[tags_in][]", String(tid))
    );
    params.set("_limit", String(LIMIT));
    params.set("_start", "0");
    fetch(`/api/artigos?${params}`)
      .then((r) => r.json())
      .then((data) => {
        // omlpi-cms-search retorna { hasMore, limit, offset, results[] } — sempre
        const results: CmsSearchArtigo[] = Array.isArray(data?.results)
          ? data.results
          : [];
        setArtigos(results);
        setHasMore(data?.hasMore ?? false);
        setOffset(results.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  return (
    <div>
      {/* Busca */}
      <form
        onSubmit={handleSearch}
        className="flex gap-3 mb-6"
        role="search"
        aria-label="Buscar artigos"
      >
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar artigos..."
            id="midiateca-search"
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

      {/* Tags */}
      {tags.length > 0 && (
        <div
          className="flex flex-wrap gap-2 mb-6"
          role="group"
          aria-label="Filtrar por tag"
        >
          {tags.map((tag) => {
            const active = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                aria-pressed={active}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  active
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Grade de artigos */}
      {artigos.length > 0 ? (
        <>
          <div
            id="js-search-results"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {artigos.map((artigo) => (
              <ArtigoCard key={artigo.id} artigo={artigo} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => fetchArtigos(true, offset)}
                disabled={loading}
                className="px-8 py-3 border-2 border-border text-foreground text-sm font-semibold rounded-full hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
              >
                {loading ? "Carregando..." : "Carregar mais"}
              </button>
            </div>
          )}
        </>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum artigo encontrado.
        </p>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  guias: StrapiGuia[];
  /** Artigos carregados via omlpi-cms-search no SSR (não via Strapi). */
  artigos: CmsSearchArtigo[];
  tags: StrapiTag[];
}

const TAB_LABELS: Record<MidiatecaTab, string> = {
  documentos: "Documentos",
  artigos: "Artigos",
};

export function MidiatecaClient({ guias, artigos, tags }: Props) {
  const [activeTab, setActiveTab] = useState<MidiatecaTab>("documentos");

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
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === "documentos" && <DocumentosTab guias={guias} />}
      {activeTab === "artigos" && (
        <ArtigosTab initialArtigos={artigos} tags={tags} />
      )}
    </>
  );
}
