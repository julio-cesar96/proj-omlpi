/**
 * lib/strapi-media.ts — Resolução de URLs de arquivos do Strapi
 *
 * Módulo **client-safe** por design: lê apenas `NEXT_PUBLIC_STRAPI_URL`.
 * `lib/strapi.ts` continua server-only (usa `STRAPI_API_URL` e faz fetch);
 * por isso o resolver de URL mora aqui, e não lá — assim Client Components
 * podem importá-lo sem arrastar o cliente de fetch para o bundle.
 *
 * Referência: docs/API_CONTRACTS.md §1 — CMS (Strapi)
 */

/**
 * Base pública do Strapi.
 *
 * ⚠️ `NEXT_PUBLIC_STRAPI_URL` ainda não está em `.env.local.example`; enquanto
 * não estiver, o fallback de produção é o que roda em todo ambiente.
 */
export const STRAPI_PUBLIC_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://omlpi-strapi.rnpiobserva.org.br";

/**
 * Resolve a URL de um arquivo vindo do Strapi.
 *
 * O provider de upload é o local (padrão do Strapi v3), que devolve caminhos
 * relativos (`/uploads/...`) — usá-los crus aponta para o domínio do Next e dá
 * 404. URLs absolutas (caso o provider mude para S3) passam intactas.
 */
export function resolveStrapiFileUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${STRAPI_PUBLIC_URL.replace(/\/$/, "")}${url}`;
}
