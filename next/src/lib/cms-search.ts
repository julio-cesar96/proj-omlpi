/**
 * lib/cms-search.ts — Cliente tipado para o serviço de busca full-text (omlpi-cms-search)
 *
 * Base: variável de ambiente CMS_SEARCH_API_URL (server-only, nunca expor no client).
 * Este serviço é a fonte correta para busca, filtro por tags e paginação de
 * artigos na Midiateca. O Strapi NÃO tem full-text search nativo — usar este
 * serviço para todo o fluxo de busca da aba "Artigos".
 *
 * Referência: docs/API_CONTRACTS.md §3 — Busca full-text (omlpi-cms-search)
 * Contratos extraídos de: omlpi-cms-search/src/index.js (somente leitura)
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCmsSearchUrl(): string {
  const url = process.env.CMS_SEARCH_API_URL;
  if (!url) {
    throw new Error(
      "[cms-search] CMS_SEARCH_API_URL não está definida. " +
        "Configure a variável de ambiente no .env.local."
    );
  }
  return url.replace(/\/$/, ""); // remove trailing slash
}

async function cmsSearchGet<T>(
  path: string,
  params?: URLSearchParams,
  fetchOptions?: RequestInit
): Promise<T> {
  const base = getCmsSearchUrl();
  const qs = params && params.toString() ? `?${params.toString()}` : "";
  const url = `${base}/${path}${qs}`;
  const res = await fetch(url, {
    cache: "no-store",
    ...fetchOptions,
  });
  if (!res.ok) {
    throw new Error(
      `[cms-search] GET /${path} falhou: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<T>;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Tag de artigo retornada pelo omlpi-cms-search.
 * Shape idêntico ao do Strapi (compatibilidade).
 */
export interface CmsSearchTag {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Arquivo (imagem ou documento) retornado como ROW_TO_JSON pelo omlpi-cms-search.
 * Garante o campo `url` para uso no componente.
 */
export interface CmsSearchFile {
  id?: number;
  url: string;
  name?: string;
  size?: number;
  mime?: string;
  [key: string]: unknown;
}

/**
 * Artigo retornado pelo serviço omlpi-cms-search (GET /artigos).
 *
 * Atenção às diferenças em relação ao StrapiArtigo:
 *   - O campo de resumo chama-se `description` (não `summary`)
 *   - Inclui `author`, `organization`, `youtube` (não existem no Strapi)
 *   - `file` e `image` podem ser null (ROW_TO_JSON retorna null se não houver upload)
 *   - `date` é a data editorial (diferente de `published_at`)
 *
 * Fonte: omlpi-cms-search/src/index.js — query SELECT (somente leitura)
 */
export interface CmsSearchArtigo {
  id: number;
  title: string;
  date?: string;
  /** Resumo/descrição do artigo. Campo correspondente a `summary` no Strapi. */
  description?: string;
  author?: string;
  organization?: string;
  /** URL de vídeo YouTube (quando o artigo é um vídeo, não um arquivo). */
  youtube?: string;
  tags: CmsSearchTag[];
  /** Arquivo para download — null quando não há upload associado. */
  file: CmsSearchFile | null;
  /** Imagem de capa — null quando não há upload associado. */
  image: CmsSearchFile | null;
  created_at: string;
  updated_at: string;
}

/**
 * Resposta paginada de GET /artigos.
 *
 * O omlpi-cms-search usa o padrão LIMIT + 1 para determinar `hasMore`:
 *   - `hasMore: true`  → há pelo menos mais um item além dos `limit` retornados
 *   - `results`        → sempre contém no máximo `limit` itens
 */
export interface CmsSearchArtigosResponse {
  hasMore: boolean;
  limit: number;
  offset: number;
  results: CmsSearchArtigo[];
}

/**
 * Parâmetros aceitos por GET /artigos do omlpi-cms-search.
 *
 * Nota: o filtro de tags usa `URLSearchParams.append("_where[tags][]", id)`
 * (array de IDs). Este tipo é um objeto simples — para tags, usar a função
 * `searchArtigos()` que monta os parâmetros corretamente.
 */
export interface CmsSearchArtigosParams {
  /** Busca full-text (PostgreSQL plainto_tsquery, pt-BR, sem acento). */
  _q?: string;
  /** Limite de itens por página (default: 10 no serviço). */
  _limit?: number;
  /**
   * Offset de paginação.
   * O serviço aceita `_offset` e `_start` como aliases — usar `_start` por
   * consistência com o padrão já adotado no front.
   */
  _start?: number;
  /** IDs das tags para filtro inclusivo (qualquer das tags informadas). */
  tagIds?: number[];
}

// ─── Funções públicas ─────────────────────────────────────────────────────────

/**
 * Busca artigos na Midiateca via omlpi-cms-search.
 *
 * Esta é a fonte correta para busca full-text, filtro por tags e paginação
 * de artigos. NÃO usar `getArtigos()` de `lib/strapi.ts` para este fluxo.
 *
 * @param params - Parâmetros de busca, filtro e paginação
 *
 * @example
 * // Carga inicial (SSR)
 * const data = await searchArtigos({ _limit: 15, _start: 0 });
 *
 * @example
 * // Busca com texto e tags
 * const data = await searchArtigos({ _q: "plano", _limit: 15, _start: 0, tagIds: [3, 7] });
 */
export async function searchArtigos(
  params?: CmsSearchArtigosParams
): Promise<CmsSearchArtigosResponse> {
  const qs = new URLSearchParams();

  if (params?._q) qs.set("_q", params._q);
  if (params?._limit !== undefined) qs.set("_limit", String(params._limit));
  if (params?._start !== undefined) qs.set("_start", String(params._start));
  if (params?.tagIds?.length) {
    // _where[tags][] é o formato aceito pelo omlpi-cms-search
    params.tagIds.forEach((id) => qs.append("_where[tags][]", String(id)));
  }

  return cmsSearchGet<CmsSearchArtigosResponse>("artigos", qs);
}
