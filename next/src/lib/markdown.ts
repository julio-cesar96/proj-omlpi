/**
 * lib/markdown.ts — Renderização de markdown do CMS
 *
 * Extraído das 4 cópias idênticas que viviam em SobreClient, HistoricoClient,
 * ElaborePlano e PrivacyPolicyModal. Parser mínimo, sem dependência externa,
 * cobrindo o subconjunto de markdown que os editores usam no Strapi.
 *
 * ⚠️ Não sanitiza HTML: o conteúdo vem do CMS e é inserido via
 * `dangerouslySetInnerHTML`. Um editor com acesso ao painel consegue injetar
 * markup arbitrário. Sanitização é um passo à parte (ver revisão, item 9) —
 * com o parser centralizado aqui, passa a ser um ponto único de correção.
 */

import { resolveStrapiFileUrl } from "./strapi-media";

/** Converte o subconjunto de markdown usado no CMS para HTML. */
export function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\(([^)\s"]+)(?:\s+"([^"]*)")?\)/g,
      (_, text, href, title) =>
        title
          ? `<a href="${href}" title="${title}" target="_blank" rel="noopener noreferrer" style="color:var(--primary);text-decoration:underline;font-weight:500">${text}</a>`
          : `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:var(--primary);text-decoration:underline;font-weight:500">${text}</a>`
    )
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|u|o|l])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

/** Monta a tag `<img>` inserida no lugar do marcador `{{imagem}}`. */
export function buildImageTag(imageUrl: string, alt: string): string {
  const src = resolveStrapiFileUrl(imageUrl) ?? imageUrl;
  return `<img src="${src}" alt="${alt}" style="width:100%;border-radius:1rem;margin:1.75rem 0;display:block;" />`;
}

/** Resultado de {@link renderText}. */
export interface RenderedText {
  html: string;
  /** true quando há imagem mas o texto não tem marcador `{{imagem}}`. */
  imageFallback: boolean;
}

/**
 * Renderiza o texto de uma aba tratando o marcador `{{imagem}}`:
 *  - marcador + imagem → imagem inserida no fluxo do texto;
 *  - marcador sem imagem → marcador removido silenciosamente;
 *  - imagem sem marcador → `imageFallback: true` (imagem vai para o topo).
 */
export function renderText(
  text: string,
  imageUrl?: string,
  imageAlt?: string
): RenderedText {
  const hasMarker = text.includes("{{imagem}}");
  const hasImage = Boolean(imageUrl);

  if (hasMarker && hasImage) {
    const processed = text.replace(
      "{{imagem}}",
      buildImageTag(imageUrl!, imageAlt ?? "")
    );
    return { html: renderMarkdown(processed), imageFallback: false };
  }

  if (hasMarker && !hasImage) {
    const processed = text.replace(/\n?{{imagem}}\n?/g, "");
    return { html: renderMarkdown(processed), imageFallback: false };
  }

  return { html: renderMarkdown(text), imageFallback: hasImage };
}
