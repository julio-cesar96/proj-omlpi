/**
 * lib/omlpi-api.ts — Cliente tipado para a API custom (Perl/Mojolicious)
 *
 * Base: variável de ambiente OMLPI_API_URL (server-only, nunca expor no client).
 * Todos os endpoints seguem os contratos documentados em API_CONTRACTS.md §2
 * e confirmados em omlpi-api/public/openapi.yaml (somente leitura).
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOmlpiUrl(): string {
  const url = process.env.OMLPI_API_URL;
  if (!url) {
    throw new Error(
      "[omlpi-api] OMLPI_API_URL não está definida. " +
        "Configure a variável de ambiente no .env.local."
    );
  }
  return url.replace(/\/$/, "");
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
  const res = await fetch(url, { cache: "no-store", ...fetchOptions });
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

// ─── Tipos (confirmados via omlpi-api/public/openapi.yaml) ────────────────────

/** Eixo temático — ex: Educação, Saúde */
export interface OmlpiArea {
  id: number;
  name: string;
}

/** Estado brasileiro */
export interface OmlpiState {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

/** Município */
export interface OmlpiCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

/** Valor de um indicador para um ano específico */
export interface OmlpiIndicatorValue {
  year: 2017 | 2018 | 2019;
  value_relative: number;
  value_absolute: number;
}

/** Item de subindicador (ex: "Feminino" dentro de "Sexo") */
export interface OmlpiSubindicatorItem {
  description: string;
  id: number;
  values: OmlpiIndicatorValue | OmlpiIndicatorValue[];
}

/** Desagregação de um indicador por classificação (Sexo, Raça/Cor…) */
export interface OmlpiSubindicator {
  classification: string;
  data: OmlpiSubindicatorItem[];
}

/**
 * Indicador com subindicadores — shape $ref: IndicatorWithSubindicator do OpenAPI.
 * Em GET /data, `values` é objeto (não array). Em compare/historical é array.
 */
export interface OmlpiIndicatorWithSubindicator {
  id: number;
  name: string;
  area: OmlpiArea;
  base: string;
  values: OmlpiIndicatorValue | OmlpiIndicatorValue[];
  subindicators: OmlpiSubindicator[];
}

/**
 * Response de GET /data — shape $ref: Locale do OpenAPI.
 * `{ id, name, type, latitude, longitude, indicators[] }`
 */
export interface OmlpiLocaleData {
  id: number;
  name: string;
  type: "country" | "region" | "state" | "city";
  latitude: number;
  longitude: number;
  indicators: OmlpiIndicatorWithSubindicator[];
}

/** Envelope real da resposta de GET /data — o objeto locale vem embrulhado. */
interface OmlpiLocaleDataResponse {
  locale: OmlpiLocaleData;
}

/**
 * Localidade retornada pelo GET /locales (lista completa para mapa e busca).
 *
 * IMPORTANTE: o campo `plan.url` deve ser usado DIRETAMENTE para link de PDF —
 * NÃO concatenar com base URL (bug conhecido: barra dupla → erro 400 "Malicious Path").
 */
export interface OmlpiLocale {
  id: number;
  name: string;
  type: "country" | "region" | "state" | "city";
  latitude?: number;
  longitude?: number;
  /** Sigla do estado, ex: "SP" — usado para matching com hc-key do Highcharts */
  state?: string;
  /** Sigla da região, ex: "SE" */
  region?: string;
  /** Código IBGE — matching com mapData[].name = "mun_XXXXXXX" */
  cod_ibge?: number;
  is_capital?: boolean;
  /** true = plano é na forma de lei (exibe "Baixar Lei" no tooltip) */
  is_law?: boolean;
  /** true = plano existe mas não deve ser exibido publicamente */
  hide_plan?: boolean;
  /** Usar plan.url DIRETAMENTE — ver nota sobre bug de URL acima */
  plan?: { url: string } | null;
  [key: string]: unknown;
}

/** Resposta de POST /upload_plan */
export interface OmlpiUploadPlanResponse {
  id: number;
}

/** Resposta de GET /data/random_indicator */
export interface OmlpiRandomIndicator {
  locales?: Array<{
    id: number;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    indicators: OmlpiIndicatorWithSubindicator[];
  }>;
}

/** Tipos de Comparação (GET /data/compare) */
export interface OmlpiCompareSubindicatorItem {
  id: number;
  description: string;
  is_percentage?: boolean;
  values: OmlpiIndicatorValue[];
}

export interface OmlpiCompareSubindicator {
  classification: string;
  data: OmlpiCompareSubindicatorItem[];
}

export interface OmlpiCompareIndicator {
  id: number;
  name?: string;
  description?: string;
  area: OmlpiArea;
  base: string;
  concept?: string;
  is_percentage?: boolean;
  values: OmlpiIndicatorValue[];
  subindicators: OmlpiCompareSubindicator[];
}

export interface OmlpiCompareLocale {
  id: number;
  name: string;
  type: "country" | "region" | "state" | "city";
  indicators: OmlpiCompareIndicator[];
}

export interface OmlpiCompareResponse {
  comparison: OmlpiCompareLocale[];
}

/** Tipos de Série Histórica (GET /data/historical) */
export interface OmlpiHistoricalSubindicatorItem {
  id: number;
  description: string;
  is_percentage?: boolean;
  values: OmlpiIndicatorValue[];
}

export interface OmlpiHistoricalSubindicator {
  classification: string;
  data: OmlpiHistoricalSubindicatorItem[];
}

export interface OmlpiHistoricalIndicator {
  id: number;
  name?: string;
  description?: string;
  area: OmlpiArea;
  base: string;
  concept?: string;
  is_percentage?: boolean;
  values: OmlpiIndicatorValue[];
  subindicators: OmlpiHistoricalSubindicator[];
}

export interface OmlpiHistoricalLocale {
  id: number;
  name: string;
  type: "country" | "region" | "state" | "city";
  latitude?: number;
  longitude?: number;
  indicators: OmlpiHistoricalIndicator[];
}

export interface OmlpiHistoricalResponse {
  historical: OmlpiHistoricalLocale[];
}

// ─── Funções públicas ──────────────────────────────────────────────────────────

/**
 * Lista de localidades para busca/autocomplete e mapa.
 * ATENÇÃO: a API retorna `{ locales: [...] }` — NÃO array plano.
 * Esta função normaliza os dois formatos por segurança.
 */
export async function getLocales(): Promise<OmlpiLocale[]> {
  const res = await omlpiGet<{ locales: OmlpiLocale[] } | OmlpiLocale[]>(
    "locales"
  );
  if (Array.isArray(res)) return res;
  return (res as { locales: OmlpiLocale[] }).locales ?? [];
}

/**
 * Lista de estados brasileiros em ordem alfabética.
 * CONFIRMADO openapi.yaml: retorna `{ states: State[] }`.
 */
export async function getStates(): Promise<OmlpiState[]> {
  const res = await omlpiGet<{ states: OmlpiState[] }>("states");
  return res.states ?? [];
}

/**
 * Lista de municípios, opcionalmente filtrados por estado.
 * CONFIRMADO openapi.yaml: retorna `{ cities: City[] }`, state_id opcional.
 */
export async function getCities(stateId?: number): Promise<OmlpiCity[]> {
  const res = await omlpiGet<{ cities: OmlpiCity[] }>(
    "cities",
    stateId !== undefined ? { state_id: stateId } : undefined
  );
  return res.cities ?? [];
}

/**
 * Lista de eixos temáticos (taxonomia de dado).
 * Distinto do conteúdo de marketing da collection `eixos` do Strapi.
 */
export async function getAreas(): Promise<OmlpiArea[]> {
  const res = await omlpiGet<{ areas: OmlpiArea[] }>("areas");
  return res.areas ?? [];
}

/**
 * Dados do dashboard de uma localidade.
 * CONFIRMADO openapi.yaml: locale_id obrigatório, area_id e year opcionais.
 */
export async function getLocaleData(
  localeId: number,
  params?: { area_id?: number; year?: 2017 | 2018 | 2019 }
): Promise<OmlpiLocaleData> {
  const response = await omlpiGet<OmlpiLocaleDataResponse>("data", {
    locale_id: localeId,
    area_id: params?.area_id,
    year: params?.year,
  });
  return response.locale;
}

/**
 * Indicador aleatório — rotator da seção Hero.
 */
export function getRandomIndicator(): Promise<OmlpiRandomIndicator> {
  return omlpiGet<OmlpiRandomIndicator>("data/random_indicator");
}

/**
 * Download de relatório PDF de uma localidade. Retorna Response (stream).
 */
export async function getLocaleResume(
  localeId: number,
  year?: 2017 | 2018 | 2019
): Promise<Response> {
  const base = getOmlpiUrl();
  const qs = new URLSearchParams({ locale_id: String(localeId) });
  if (year) qs.set("year", String(year));
  const res = await fetch(`${base}/data/resume?${qs}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `[omlpi-api] GET /data/resume falhou: ${res.status} ${res.statusText}`
    );
  }
  return res;
}

/** Download de dados abertos (Open Data / Midiateca). Retorna Response (stream). */
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
 * Download de indicador específico (XLSX).
 * CONFIRMADO openapi.yaml: locale_id e indicator_id obrigatórios.
 */
export async function downloadIndicator(
  localeId: number,
  indicatorId: number
): Promise<Response> {
  const base = getOmlpiUrl();
  const qs = new URLSearchParams({
    locale_id: String(localeId),
    indicator_id: String(indicatorId),
  });
  const res = await fetch(`${base}/data/download_indicator?${qs}`, {
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
 * Upload de plano municipal (POST multipart).
 * Campos obrigatórios: file (PDF), name, message, email.
 */
export function uploadPlan(
  formData: FormData
): Promise<OmlpiUploadPlanResponse> {
  return omlpiPost<OmlpiUploadPlanResponse>("upload_plan", formData);
}

/**
 * Dados de comparação (Nacional)
 */
export function getCompareData(
  localeId: number,
  year?: 2017 | 2018 | 2019
): Promise<OmlpiCompareResponse> {
  return omlpiGet<OmlpiCompareResponse>("data/compare", {
    locale_id: localeId,
    year,
  });
}

/**
 * Dados de série histórica (Nacional)
 */
export function getHistoricalData(
  localeId: number,
  areaId?: number
): Promise<OmlpiHistoricalResponse> {
  return omlpiGet<OmlpiHistoricalResponse>("data/historical", {
    locale_id: localeId,
    area_id: areaId,
  });
}

