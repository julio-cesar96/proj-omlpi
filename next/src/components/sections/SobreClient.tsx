/**
 * SobreClient — Client Component
 *
 * Renderiza todos os registros `sobres` em sequência (sem seletor de abas).
 * Os dados já chegam prontos como prop (buscados pelo Server Component Sobre.tsx).
 *
 * Suporte a marcador {{imagem}} no campo `text`:
 *  - Se {{imagem}} estiver no texto E a aba tiver imagem → imagem inserida
 *    exatamente naquele ponto do fluxo do texto.
 *  - Se a aba tiver imagem mas NÃO tiver {{imagem}} no texto → imagem aparece
 *    no TOPO do bloco como fallback (compatibilidade com conteúdo antigo).
 *  - Se não houver imagem → {{imagem}} (se houver no texto) é removido silenciosamente.
 *
 * Campo real confirmado: `text` (não `content`) — ver lib/strapi.ts e
 * docs/progresso/correcao-schemas-strapi.md.
 */

"use client";

import { StrapiSobre } from "@/lib/strapi";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://omlpi-strapi.rnpiobserva.org.br";

// ─── renderMarkdown ────────────────────────────────────────────────────────────
// Converte Markdown simples para HTML.
// Suporta: ### h3, ## h2, # h1, **negrito**, *itálico*, - lista,
// [texto](url "tooltip") links, e quebras de parágrafo \n\n.
// O marcador {{imagem}} é tratado ANTES desta função ser chamada.
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links: [texto](url) ou [texto](url "tooltip") — ANTES da regra de parágrafo
    .replace(
      /\[([^\]]+)\]\(([^)\s"]+)(?:\s+"([^"]*)")?\)/g,
      (_, text, href, title) =>
        title
          ? `<a href="${href}" title="${title}" target="_blank" rel="noopener noreferrer">${text}</a>`
          : `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
    )
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|u|o|l])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

// ─── buildImageTag ────────────────────────────────────────────────────────────
// Gera a string HTML da imagem inline (substitui o marcador {{imagem}}).
function buildImageTag(imageUrl: string, alt: string): string {
  const src = imageUrl.startsWith("http")
    ? imageUrl
    : `${STRAPI_URL}${imageUrl}`;
  return `<img src="${src}" alt="${alt}" style="width:100%;border-radius:1rem;margin:1.75rem 0;display:block;" />`;
}

// ─── renderText ───────────────────────────────────────────────────────────────
// Processa o texto de uma aba, substituindo {{imagem}} quando aplicável.
function renderText(
  text: string,
  imageUrl?: string,
  imageAlt?: string
): { html: string; imageFallback: boolean } {
  const hasMarker = text.includes("{{imagem}}");
  const hasImage = Boolean(imageUrl);

  let processed = text;

  if (hasMarker && hasImage) {
    processed = processed.replace(
      "{{imagem}}",
      buildImageTag(imageUrl!, imageAlt ?? "")
    );
    return { html: renderMarkdown(processed), imageFallback: false };
  }

  if (hasMarker && !hasImage) {
    processed = processed.replace(/\n?{{imagem}}\n?/g, "");
    return { html: renderMarkdown(processed), imageFallback: false };
  }

  return { html: renderMarkdown(processed), imageFallback: hasImage };
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  abas: StrapiSobre[];
}

export function SobreClient({ abas }: Props) {
  if (abas.length === 0) {
    return (
      <p className="text-muted-foreground">
        O Observa &#x2013; Observatório do Marco Legal da Primeira Infância é uma
        iniciativa da Rede Nacional Primeira Infância &#x2013; RNPI que foi
        desenvolvida sob coordenação da ANDI &#x2013; Comunicação e Direitos,
        entidade que desempenhou a função de secretaria executiva da rede
        para o período 2018-2021. Atualmente, a Plataforma é gerida pela
        União Nacional dos Conselhos Municipais de Educação - UNCME.
        <br />
        <br />
        Formada em 2007, a RNPI é a principal articulação de alcance nacional
        a ter como missão o fomento de políticas públicas voltadas à garantia
        dos direitos das crianças de 0 a 6 anos de idade. Sua composição é
        democrática e plural, acolhendo hoje mais de 200 instituições de
        diferentes dimensões e perfis.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {abas.map((aba) => {
        const { html, imageFallback } = aba.text
          ? renderText(aba.text, aba.image?.url, aba.title ?? "")
          : { html: "", imageFallback: Boolean(aba.image?.url) };

        const imageSrc =
          aba.image?.url
            ? aba.image.url.startsWith("http")
              ? aba.image.url
              : `${STRAPI_URL}${aba.image.url}`
            : null;

        return (
          <div key={aba.id} className="max-w-3xl">
            {aba.title && (
              <h3
                className="text-2xl font-black text-foreground mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {aba.title}
              </h3>
            )}

            {imageFallback && imageSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={aba.title ?? ""}
                className="w-full rounded-2xl mb-7"
                style={{ display: "block" }}
              />
            )}

            {html && (
              <div
                className="prose prose-sm max-w-none text-muted-foreground leading-[1.75]
                  [&_p]:mb-4
                  [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                  [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                  [&_strong]:text-foreground
                  [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1
                  [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
                  [&_img]:w-full [&_img]:rounded-2xl [&_img]:my-7"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
