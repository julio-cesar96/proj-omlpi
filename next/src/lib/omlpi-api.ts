/**
 * lib/omlpi-api.ts — Cliente tipado para a API custom (Perl/Mojolicious)
 *
 * Base: variável de ambiente OMLPI_API_URL (server-only, nunca expor no client).
 * Todos os endpoints seguem os contratos documentados em API_CONTRACTS.md §2.
 * Não inventar parâmetros além dos documentados — itens marcados "a confirmar"
 * ficam como TODO comentado.
 *
 * Referência: docs/API_CONTRACTS.md §2 — API custom (Perl/Mojolicious)
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOmlpiUrl(): string {
  const url = process.env.OMLPI_API_URL;
  if (!url) {
    throw new Error(
      "[omlpi-api] OMLPI_API_URL não está definida. " +
        "Configure a variável de ambiente no .env.local."
    );
  }
  return url.replace(/\/$/, ""); // remove trailing slash
}

async function omlpiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
  fetchOptions?: RequestInit
): Promise<T> {
  const base = getOmlpiUrl();
  const qs = params
    ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null && v !== "")
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : "";
  const url = `${base}/${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    cache: "no-store",
    ...fetchOptions,
  });
  if (!res.ok) {
    throw new Error(
      `[omlpi-api] GET /${path} falhou: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<T>;
}

async function omlpiPost<T>(
  path: string,
  body: BodyInit,
  fetchOptions?: RequestInit
): Promise<T> {
  const base = getOmlpiUrl();
  const url = `${base}/${path}`;
  const res = await fetch(url, {
    method: "POST",
    body,
    cache: "no-store",
    ...fetchOptions,
  });
  if (!res.ok) {
    throw new Error(
      `[omlpi-api] POST /${path} falhou: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<T>;
}

// ─── Tipos (shapes conservadores baseados em API_CONTRACTS.md §2) ────────────

/** Localidade retornada pela API Perl */
export interface OmlpiLocale {
  id: number | string;
  name?: string;
  state?: string;
  ibge_code?: string;
  [key: string]: unknown;
}

/**
 * Dados do dashboard de uma localidade (ex-/city).
 * Shape detalhado a mapear na Fase 3 a partir de populateData.js.
 */
export interface OmlpiLocaleData {
  locale_id?: string | number;
  [key: string]: unknown;
}

/**
 * Parâmetros de comparação entre localidades.
 *
 * TODO (antes da Fase 3): confirmar parâmetros exatos de data/compare com quem
 * mantém a API Perl. Não inferir apenas do front antigo (compare.js). Os
 * parâmetros podem diferir do que está no JS do cliente atual.
 */
export interface OmlpiCompareParams {
  [key: string]: unknown; // substituir pelos params reais quando confirmados
}

/** Dados retornados por data/compare */
export interface OmlpiCompareData {
  [key: string]: unknown;
}

/**
 * Parâmetros de dados históricos de uma localidade.
 *
 * TODO (antes da Fase 3): confirmar parâmetros exatos de data/historical com
 * quem mantém a API Perl. Não inferir apenas do front antigo (history.js).
 */
export interface OmlpiHistoricalParams {
  [key: string]: unknown; // substituir pelos params reais quando confirmados
}

/** Dados retornados por data/historical */
export interface OmlpiHistoricalData {
  [key: string]: unknown;
}

/** Indicador aleatório (usado no rotator da home) */
export interface OmlpiRandomIndicator {
  id?: string | number;
  title?: string;
  value?: string | number;
  [key: string]: unknown;
}

/**
 * Resumo/sumário de uma localidade.
 *
 * TODO (antes da Fase 2 — seção Hero): confirmar se este endpoint é a fonte
 * dos números exibidos no Hero (ex.: 5.570 municípios, 2.022 com plano, etc.).
 * Se não for, identificar qual endpoint fornece esses dados.
 */
export interface OmlpiLocaleResume {
  locale_id?: string | number;
  [key: string]: unknown;
}

/**
 * Parâmetros para download de indicador específico.
 *
 * TODO (antes da Fase 3 — Midiateca/Open Data): confirmar parâmetros exatos
 * de data/download_indicator com quem mantém a API Perl.
 */
export interface OmlpiDownloadIndicatorParams {
  [key: string]: unknown; // substituir pelos params reais quando confirmados
}

// ─── Funções públicas ─────────────────────────────────────────────────────────

/**
 * Lista de localidades (municípios/estados) para busca/autocomplete.
 * Consulta pública — busca e seleção.
 */
export function getLocales(): Promise<OmlpiLocale[]> {
  return omlpiGet<OmlpiLocale[]>("locales");
}

/**
 * Dados do dashboard de uma localidade (Painel Municipal — ex-/city).
 * @param localeId — identificador da localidade (locale_id)
 */
export function getLocaleData(localeId: string | number): Promise<OmlpiLocaleData> {
  return omlpiGet<OmlpiLocaleData>("data", { locale_id: localeId });
}

/**
 * Dados de comparação entre localidades (Painel Nacional — ex-/comparacao).
 *
 * TODO (Fase 3): substituir `params: OmlpiCompareParams` pelos tipos reais
 * assim que os parâmetros forem confirmados com o backend.
 */
export function compareLocales(
  params: OmlpiCompareParams
): Promise<OmlpiCompareData> {
  // TODO: montar a query string corretamente quando os params forem confirmados
  return omlpiGet<OmlpiCompareData>("data/compare", params as Record<string, string | number>);
}

/**
 * Dados históricos de uma localidade (Painel Nacional — ex-/historico).
 *
 * TODO (Fase 3): substituir `params: OmlpiHistoricalParams` pelos tipos reais
 * assim que os parâmetros forem confirmados com o backend.
 */
export function getHistoricalData(
  params: OmlpiHistoricalParams
): Promise<OmlpiHistoricalData> {
  // TODO: montar a query string corretamente quando os params forem confirmados
  return omlpiGet<OmlpiHistoricalData>("data/historical", params as Record<string, string | number>);
}

/**
 * Indicador aleatório — usado no rotator da seção Hero (Início).
 */
export function getRandomIndicator(): Promise<OmlpiRandomIndicator> {
  return omlpiGet<OmlpiRandomIndicator>("data/random_indicator");
}

/**
 * Resumo/sumário de uma localidade.
 *
 * TODO (antes da Fase 2): confirmar se é a fonte dos números do Hero.
 * @param localeId — identificador da localidade
 */
export function getLocaleResume(localeId: string | number): Promise<OmlpiLocaleResume> {
  return omlpiGet<OmlpiLocaleResume>("data/resume/", { locale_id: localeId });
}

/**
 * Download de dados abertos (Open Data / Midiateca).
 * Retorna o Response diretamente pois pode ser um stream de arquivo.
 */
export async function downloadData(): Promise<Response> {
  const base = getOmlpiUrl();
  const res = await fetch(`${base}/data/download`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `[omlpi-api] GET /data/download falhou: ${res.status} ${res.statusText}`
    );
  }
  return res;
}

/**
 * Download de indicador específico (Open Data / Midiateca).
 *
 * TODO (antes da Fase 3): confirmar parâmetros exatos com o backend antes de
 * usar. Ver OmlpiDownloadIndicatorParams.
 */
export async function downloadIndicator(
  params?: OmlpiDownloadIndicatorParams
): Promise<Response> {
  const base = getOmlpiUrl();
  const qs =
    params && Object.keys(params).length > 0
      ? // TODO: substituir pela serialização correta quando params forem confirmados
        `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
  const res = await fetch(`${base}/data/download_indicator${qs}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `[omlpi-api] GET /data/download_indicator falhou: ${res.status} ${res.statusText}`
    );
  }
  return res;
}

/**
 * Upload de plano municipal (POST multipart) — Consulta pública.
 * @param formData — FormData contendo o arquivo do plano
 */
export function uploadPlan(formData: FormData): Promise<unknown> {
  return omlpiPost<unknown>("upload_plan", formData);
}
