/**
 * lib/strapi.ts — Cliente tipado para o CMS (Strapi)
 *
 * Base: variável de ambiente STRAPI_API_URL (server-only, nunca expor no client).
 * Todos os parâmetros de query seguem os padrões documentados em API_CONTRACTS.md.
 * NÃO usar populate= nem GraphQL — o front atual não usa nenhum dos dois.
 *
 * Referência: docs/API_CONTRACTS.md §1 — CMS (Strapi)
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStrapiUrl(): string {
  const url = process.env.STRAPI_API_URL;
  if (!url) {
    throw new Error(
      "[strapi] STRAPI_API_URL não está definida. " +
        "Configure a variável de ambiente no .env.local."
    );
  }
  return url.replace(/\/$/, ""); // remove trailing slash
}

/** Parâmetros de query suportados globalmente (API_CONTRACTS.md §1). */
export interface StrapiQueryParams {
  /** Limite de itens retornados */
  _limit?: number;
  /** Ordenação (ex.: "createdAt:desc") */
  _sort?: string;
  /** Busca textual */
  _q?: string;
  /** Filtro condicional (JSON serializado ou string) */
  _where?: string;
  /** Paginação — offset */
  _start?: number;
  /** Filtro por localidade */
  locale_id?: string | number;
  /** Filtro por exclusão de localidade */
  locale_id_ne?: string | number;
}

function buildQuery(params?: StrapiQueryParams): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";
  const qs = new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)])
  ).toString();
  return `?${qs}`;
}

async function strapiGet<T>(
  collection: string,
  params?: StrapiQueryParams,
  fetchOptions?: RequestInit
): Promise<T> {
  const base = getStrapiUrl();
  const url = `${base}/${collection}${buildQuery(params)}`;
  const res = await fetch(url, {
    cache: "no-store", // seguro por padrão; ajustar por seção na Fase 2
    ...fetchOptions,
  });
  if (!res.ok) {
    throw new Error(
      `[strapi] GET /${collection} falhou: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<T>;
}

// ─── Tipos (shapes conservadores baseados em API_CONTRACTS.md §1) ────────────

/** Arquivo aninhado no Strapi (image, file, plan) */
export interface StrapiFile {
  url: string;
  name?: string;
  size?: number;
  mime?: string;
  [key: string]: unknown;
}

/** Tag de artigo */
export interface StrapiTag {
  id: number;
  name: string;
  slug?: string;
}

/** Banner da home */
export interface StrapiBanner {
  id: number;
  title?: string;
  subtitle?: string;
  image?: StrapiFile;
  link?: string;
  order?: number;
  published_at?: string;
  [key: string]: unknown;
}

/** Eixo temático */
export interface StrapiEixo {
  id: number;
  title?: string;
  description?: string;
  icon?: StrapiFile;
  order?: number;
  [key: string]: unknown;
}

/** Notícia */
export interface StrapiNoticia {
  id: number;
  title?: string;
  slug?: string;
  summary?: string;
  content?: string; // markdown
  image?: StrapiFile;
  published_at?: string;
  [key: string]: unknown;
}

/**
 * Texto institucional (seção Sobre).
 *
 * Confirmado: `sobres` retorna N registros, um por aba
 * (Quem somos / Resultados do levantamento / Histórico).
 * Usar `_sort=order:asc` na Fase 2 para garantir a ordem das abas.
 */
export interface StrapiSobre {
  id: number;
  title?: string;
  content?: string; // markdown
  /** Identificador/slug da aba (ex.: "quem-somos", "resultados", "historico") */
  tab?: string;
  /** Ordem de exibição das abas */
  order?: number;
  [key: string]: unknown;
}

/**
 * Texto da página de indicadores.
 *
 * TODO (mapeamento no one-page): confirmar qual seção/componente usará esta
 * collection. Não há mapeamento definitivo no PLANO_ONEPAGE.md.
 */
export interface StrapiTextoIndicador {
  id: number;
  title?: string;
  content?: string; // markdown
  [key: string]: unknown;
}

/** Guia / documento de referência */
export interface StrapiGuia {
  id: number;
  title?: string;
  description?: string;
  file?: StrapiFile;
  category?: string;
  published_at?: string;
  [key: string]: unknown;
}

/**
 * Artigo da biblioteca.
 *
 * Confirmado: a seção Midiateca usa a collection `artigos` com busca,
 * tags e paginação. Endpoint de produção observado:
 *   GET https://omlpi-strapi.rnpiobserva.org.br/artigos?_limit=15&_start=0
 *
 * Padrão de uso na Fase 2: getArtigos({ _limit: 15, _start: offset })
 * para paginação incremental; combinar com _q e tags para busca/filtro.
 */
export interface StrapiArtigo {
  id: number;
  title?: string;
  slug?: string;
  summary?: string;
  content?: string; // markdown
  image?: StrapiFile;
  file?: StrapiFile;
  tags?: StrapiTag[];
  published_at?: string;
  [key: string]: unknown;
}

/** Localidade (município ou estado) */
export interface StrapiLocale {
  id: number;
  name?: string;
  state?: string;
  ibge_code?: string;
  [key: string]: unknown;
}

/** Política de privacidade */
export interface StrapiPrivacyPolicy {
  id: number;
  content?: string; // markdown
  updated_at?: string;
  [key: string]: unknown;
}

// ─── Funções públicas ─────────────────────────────────────────────────────────

/** Banners da home (seção Hero / Início) */
export function getBanners(params?: StrapiQueryParams): Promise<StrapiBanner[]> {
  return strapiGet<StrapiBanner[]>("banners", params);
}

/** Eixos temáticos (seção Início) */
export function getEixos(params?: StrapiQueryParams): Promise<StrapiEixo[]> {
  return strapiGet<StrapiEixo[]>("eixos", params);
}

/** Notícias (news strip — seção Início) */
export function getNoticias(params?: StrapiQueryParams): Promise<StrapiNoticia[]> {
  return strapiGet<StrapiNoticia[]>("noticias", params);
}

/**
 * Textos institucionais da seção Sobre.
 *
 * Retorna N registros, um por aba (order:asc).
 * Uso recomendado na Fase 2:
 *   getSobres({ _sort: "order:asc" })
 */
export function getSobres(params?: StrapiQueryParams): Promise<StrapiSobre[]> {
  return strapiGet<StrapiSobre[]>("sobres", params);
}

/**
 * Texto da página de indicadores.
 *
 * TODO (mapeamento): confirmar seção destino antes de usar.
 */
export function getTextoIndicadors(
  params?: StrapiQueryParams
): Promise<StrapiTextoIndicador[]> {
  return strapiGet<StrapiTextoIndicador[]>("textoindicadors", params);
}

/** Guias / documentos de referência (Midiateca / PNIPI) */
export function getGuias(params?: StrapiQueryParams): Promise<StrapiGuia[]> {
  return strapiGet<StrapiGuia[]>("guias", params);
}

/** Tags de artigos (Midiateca — se biblioteca de artigos for mantida) */
export function getTags(params?: StrapiQueryParams): Promise<StrapiTag[]> {
  return strapiGet<StrapiTag[]>("tags", params);
}

/**
 * Artigos da Midiateca (busca, tags, paginação).
 *
 * Confirmado: Midiateca usa esta collection.
 * Padrão de paginação (espelhando o site atual):
 *   getArtigos({ _limit: 15, _start: 0 })
 * Combinar com _q para busca textual e _where para filtro por tag.
 */
export function getArtigos(params?: StrapiQueryParams): Promise<StrapiArtigo[]> {
  return strapiGet<StrapiArtigo[]>("artigos", params);
}

/** Lista de localidades via Strapi (Consulta pública — busca e seleção) */
export function getStrapiLocales(
  params?: StrapiQueryParams
): Promise<StrapiLocale[]> {
  return strapiGet<StrapiLocale[]>("locales", params);
}

/** Conteúdo da política de privacidade (rodapé / ex-/rastreio) */
export function getPrivacyPolicy(): Promise<StrapiPrivacyPolicy> {
  return strapiGet<StrapiPrivacyPolicy>("privacy-policy");
}
