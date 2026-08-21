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
  /** Filtro por slug (ex.: "sobre") */
  slug?: string;
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

/**
 * Banner da home (seção Hero).
 *
 * ⚠️ ATENÇÃO: `banners` é um **singleType** no Strapi — retorna um único
 * objeto, não um array. Schema real confirmado (07/2026):
 * apenas `title` (string) e `text` (richtext). Campos `image`, `subtitle`,
 * `link` e `order` **NÃO existem** no schema real.
 *
 * O Hero usa o campo `text` para o parágrafo descritivo, com fallback estático
 * caso o campo esteja vazio. A imagem do Hero é decorativa (SVG hardcoded).
 */
export interface StrapiBanner {
  id?: number;
  title?: string;
  /** Conteúdo rich-text descritivo do banner. Campo real: `text`. */
  text?: string;
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
 * `sobres` retorna N registros (collectionType), um por aba
 * (Quem somos / Resultados do levantamento / Histórico).
 *
 * ⚠️ ATENÇÃO (confirmado 07/2026):
 * - Campo real é `text` (richtext), **não** `content`.
 * - **Não existe campo `order`** no schema real do Strapi.
 *   Ordenação por `createdAt:asc` é usada como proxy — se a ordem das abas
 *   precisar ser controlável via CMS, será necessário adicionar um campo
 *   `order` ao content-type (decisão de escopo do redesign do CMS).
 */
export interface StrapiSobre {
  id: number;
  title?: string;
  /** Conteúdo rich-text da aba. Campo real: `text` (não `content`). */
  text?: string;
  /** Upload de imagem opcional da aba. */
  image?: StrapiFile;
  link?: string;
  link_title?: string;
  link2?: string;
  link2_title?: string;
  [key: string]: unknown;
}

/**
 * Texto introdutório da seção Midiateca (equivalente a `/indicadores` no site antigo).
 *
 * `textoindicadors` é um **singleType** no Strapi — retorna um único objeto.
 *
 * ⚠️ ATENÇÃO (confirmado 07/2026): campos reais são em português:
 * - `titulo` (string) — não `title`
 * - `texto` (richtext)  — não `content`
 *
 * A função `getTextoIndicador()` retorna `StrapiTextoIndicador` (não array).
 */
export interface StrapiTextoIndicador {
  id?: number;
  /** Título do texto introdutório. Campo real: `titulo` (em português). */
  titulo?: string;
  /** Conteúdo rich-text. Campo real: `texto` (em português). */
  texto?: string;
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


/** Política de privacidade */
export interface StrapiPrivacyPolicy {
  id: number;
  content?: string; // markdown
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Localidade (Estado ou Município)
 *
 * Confirmado: a collection `locales` do Strapi é a fonte oficial de dados
 * para o Mapa e Painéis, contendo `cod_ibge` e os arquivos do plano (`plan`).
 */
export interface StrapiLocale {
  id: number;
  name: string;
  state?: string;
  region?: string;
  type: "country" | "region" | "state" | "city";
  is_capital?: boolean | null;
  cod_ibge?: number | string | null;
  is_law?: boolean | null;
  hide_plan?: boolean | null;
  plan?: StrapiFile | null;
  [key: string]: unknown;
}

/** Categoria de plano/faq */
export interface StrapiCategoria {
  id: number;
  nome: string;
  slug?: string;
  [key: string]: unknown;
}

/** FAQ / Dúvida frequente */
export interface StrapiFaq {
  id: number;
  pergunta: string;
  resposta: string; // texto puro, não markdown
  categoria?: StrapiCategoria | null;
  ordem?: number;
  published_at?: string;
  [key: string]: unknown;
}

/** Plano de Ação */
export interface StrapiPlano {
  id: number;
  titulo: string;
  descricao?: string;
  documento?: StrapiFile | null;
  categoria?: StrapiCategoria | null;
  tags?: StrapiTag[];
  estado_editorial: "rascunho" | "revisao" | "publicado" | "arquivado";
  published_at?: string;
  [key: string]: unknown;
}

/** Página institucional */
export interface StrapiPaginaInstitucional {
  id: number;
  titulo: string;
  slug: string;
  conteudo: string; // HTML puro, vindo do editor Tiptap
  capa?: StrapiFile | null;
  seo_meta_titulo?: string;
  seo_meta_descricao?: string;
  published_at?: string;
  [key: string]: unknown;
}

// ─── Funções públicas ─────────────────────────────────────────────────────────

/**
 * Banner da home (seção Hero).
 *
 * `banners` é **singleType** — retorna um único objeto `StrapiBanner`,
 * não um array. Campos disponíveis: `title`, `text`.
 * Não passar `_sort` — singleType ignora parâmetros de sort.
 */
export function getBanner(): Promise<StrapiBanner> {
  return strapiGet<StrapiBanner>("banners");
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
 * Retorna N registros (collectionType), um por aba.
 * Ordenação por `createdAt:asc` como proxy de ordem de inserção —
 * o schema real **não tem campo `order`**. Se a ordem das abas precisar
 * ser controlável via CMS, adicionar campo `order` ao content-type.
 *
 * Uso: getSobres({ _sort: "createdAt:asc" })
 */
export function getSobres(params?: StrapiQueryParams): Promise<StrapiSobre[]> {
  return strapiGet<StrapiSobre[]>("sobres", params);
}

/**
 * Texto introdutório da seção Midiateca.
 *
 * `textoindicadors` é **singleType** — retorna um único objeto.
 * Campos: `titulo` (string), `texto` (richtext) — ambos em português.
 *
 * Renomeada de `getTextoIndicadors` (plural, array) para refletir
 * o tipo real de retorno. A forma plural antiga foi removida.
 */
export function getTextoIndicador(): Promise<StrapiTextoIndicador> {
  return strapiGet<StrapiTextoIndicador>("textoindicadors");
}

/** Guias / documentos de referência (Midiateca / PNIPI) */
export function getGuias(params?: StrapiQueryParams): Promise<StrapiGuia[]> {
  return strapiGet<StrapiGuia[]>("guias", { _sort: "created_at:desc", ...params });
}

/** Total de guias / documentos de referência */
export function getGuiasCount(params?: StrapiQueryParams): Promise<number> {
  return strapiGet<number>("guias/count", params);
}

/** Tags de artigos (mantida para uso futuro; não mais usada na Midiateca após remoção da aba Artigos) */
export function getTags(params?: StrapiQueryParams): Promise<StrapiTag[]> {
  return strapiGet<StrapiTag[]>("tags", params);
}

/**
 * Artigos da collection `artigos` do Strapi.
 *
 * ⚠️  NÃO usar para o fluxo de busca/filtro/paginação da Midiateca.
 *     O Strapi não tem full-text search nativo. A Midiateca usava
 *     `searchArtigos()` de `lib/cms-search.ts` (omlpi-cms-search).
 *     A aba Artigos foi removida da Midiateca. Mantida aqui para
 *     eventuais usos futuros que não dependam de busca textual.
 */
export function getArtigos(params?: StrapiQueryParams): Promise<StrapiArtigo[]> {
  return strapiGet<StrapiArtigo[]>("artigos", params);
}

/** Arquivo retornado pelo endpoint público /midiateca-publica */
export interface StrapiMidiaPublica {
  id: number;
  name: string;
  url: string;
  mime: string;
  ext: string;
  /** Tamanho em KB (float) */
  size: number;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, unknown> | null;
  created_at: string;
  [key: string]: unknown;
}

export interface MidiatecaPublicaResponse {
  results: StrapiMidiaPublica[];
  /** Total de arquivos públicos (para calcular hasMore na paginação) */
  count: number;
}

/**
 * Arquivos públicos da Midiateca via endpoint customizado /midiateca-publica.
 * Nunca expõe /upload/files inteiro — só os marcados como is_public: true.
 *
 * Parâmetros aceitos: _start, _limit, _sort, name_contains, mime_contains.
 */
export function getMidiaPublica(
  params?: StrapiQueryParams & { name_contains?: string; mime_contains?: string }
): Promise<MidiatecaPublicaResponse> {
  return strapiGet<MidiatecaPublicaResponse>('midiateca-publica', params as StrapiQueryParams);
}


/** Conteúdo da política de privacidade (rodapé / ex-/rastreio) */
export function getPrivacyPolicy(): Promise<StrapiPrivacyPolicy> {
  return strapiGet<StrapiPrivacyPolicy>("privacy-policy");
}

/** Localidades com dados de planos, cod_ibge, etc. */
export function getStrapiLocales(params?: StrapiQueryParams): Promise<StrapiLocale[]> {
  return strapiGet<StrapiLocale[]>("locales", params);
}

/** FAQs / Dúvidas frequentes (PNIPI) */
export function getFaqs(params?: StrapiQueryParams): Promise<StrapiFaq[]> {
  return strapiGet<StrapiFaq[]>("faqs", params);
}

/** Planos de Ação (PNIPI) */
export function getPlanos(params?: StrapiQueryParams): Promise<StrapiPlano[]> {
  return strapiGet<StrapiPlano[]>("planos", params);
}

/**
 * Busca uma página institucional específica pelo slug.
 * Retorna null se nenhuma for encontrada.
 */
export async function getPaginaInstitucional(slug: string): Promise<StrapiPaginaInstitucional | null> {
  const paginas = await strapiGet<StrapiPaginaInstitucional[]>("paginas-institucionais", {
    slug,
  });
  return paginas.length > 0 ? paginas[0] : null;
}
