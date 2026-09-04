/**
 * SobreClient — Client Component
 *
 * Renderiza o conteúdo institucional dividindo em duas seções:
 * 1. #sobre     → "Quem somos" (tudo antes de `## Histórico`)
 * 2. #historico  → "Histórico" (tudo a partir de `## Histórico`)
 *
 * Suporte a marcador {{imagem}} no campo `text`:
 *  - Se {{imagem}} estiver no texto E a aba tiver imagem → imagem inserida no fluxo.
 *  - Se tiver imagem sem marcador → imagem no TOPO do bloco como fallback.
 *  - Se não houver imagem → marcador removido silenciosamente.
 */

"use client";

import { StrapiSobre } from "@/lib/strapi";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://omlpi-strapi.rnpiobserva.org.br";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-6 h-0.5 bg-primary rounded-full" />
      <span className="text-xs font-bold uppercase tracking-widest text-primary">
        {children}
      </span>
    </div>
  );
}

// ─── renderMarkdown ────────────────────────────────────────────────────────────
function renderMarkdown(md: string): string {
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
function buildImageTag(imageUrl: string, alt: string): string {
  const src = imageUrl.startsWith("http")
    ? imageUrl
    : `${STRAPI_URL}${imageUrl}`;
  return `<img src="${src}" alt="${alt}" style="width:100%;border-radius:1rem;margin:1.75rem 0;display:block;" />`;
}

// ─── renderText ───────────────────────────────────────────────────────────────
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

interface Props {
  abas: StrapiSobre[];
}

export function SobreClient({ abas }: Props) {
  // Extrai parte 1 (Sobre) e parte 2 (Histórico) das abas do Strapi
  let sobreContent: { html: string; imageFallback: boolean; imageSrc: string | null; title?: string }[] = [];
  let historicoContent: { html: string; imageFallback: boolean; imageSrc: string | null; title?: string }[] = [];

  if (abas.length > 0) {
    abas.forEach((aba) => {
      const text = aba.text ?? "";
      const imageSrc = aba.image?.url
        ? aba.image.url.startsWith("http")
          ? aba.image.url
          : `${STRAPI_URL}${aba.image.url}`
        : null;

      const historicoMatchIndex = text.search(/^##\s*(Histórico|Memória)/m);

      if (historicoMatchIndex !== -1) {
        const parte1Text = text.slice(0, historicoMatchIndex).trim();
        const parte2Text = text.slice(historicoMatchIndex).replace(/^##\s*(Histórico|Memória)\s*\n?/, '').trim();

        if (parte1Text) {
          const res1 = renderText(parte1Text, aba.image?.url, aba.title ?? "");
          sobreContent.push({ ...res1, imageSrc, title: aba.title ?? undefined });
        }

        if (parte2Text) {
          const res2 = renderText(parte2Text, aba.image?.url, aba.title ?? "");
          historicoContent.push({ ...res2, imageSrc, title: "Histórico" });
        }
      } else if (aba.title?.toLowerCase().includes("histórico") || aba.title?.toLowerCase().includes("memória") || aba.title?.toLowerCase().includes("memoria")) {
        const res = renderText(text, aba.image?.url, aba.title ?? "");
        historicoContent.push({ ...res, imageSrc, title: aba.title });
      } else {
        const res = renderText(text, aba.image?.url, aba.title ?? "");
        sobreContent.push({ ...res, imageSrc, title: aba.title ?? undefined });
      }
    });
  }

  return (
    <>
      {/* ── Seção Sobre / Quem somos ── */}
      <section id="sobre" aria-label="Sobre" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <SectionLabel>Sobre</SectionLabel>
          <h2
            className="text-[30px] lg:text-[40px] font-black text-foreground mb-10"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Quem somos
          </h2>

          {sobreContent.length === 0 ? (
            <p className="text-muted-foreground leading-[1.75]">
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
          ) : (
            <div className="flex flex-col gap-12">
              {sobreContent.map((item, idx) => (
                <div key={idx} className="max-w-none">
                  {item.title && sobreContent.length > 1 && (
                    <h3
                      className="text-2xl font-black text-foreground mb-6"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item.title}
                    </h3>
                  )}
                  {item.imageFallback && item.imageSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageSrc}
                      alt={item.title ?? ""}
                      className="w-full rounded-2xl mb-7"
                      style={{ display: "block" }}
                    />
                  )}
                  {item.html && (
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground leading-[1.75]
                        [&_p]:mb-4
                        [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                        [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                        [&_strong]:text-foreground
                        [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1
                        [&_a]:text-primary [&_a]:underline [&_a]:font-medium [&_a]:hover:text-primary/80 [&_a]:transition-colors
                        [&_img]:w-full [&_img]:rounded-2xl [&_img]:my-7"
                      dangerouslySetInnerHTML={{ __html: item.html }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Seção Histórico (nova seção extraída) ── */}
      <section id="historico" aria-label="Histórico" className="py-20 lg:py-28 border-t border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <SectionLabel>Memória</SectionLabel>
          <h2
            className="text-[30px] lg:text-[40px] font-black text-foreground mb-10"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Histórico
          </h2>

          {historicoContent.length === 0 ? (
            <p className="text-muted-foreground leading-[1.75]">
              A Rede Nacional Primeira Infância (RNPI) foi criada em 2007 como uma articulação de organizações da sociedade civil, do governo e do setor privado para promover os direitos da criança de 0 a 6 anos no Brasil. O Observa surge no âmbito desse movimento como instrumento permanente de monitoramento e transparência das políticas públicas pela primeira infância.
            </p>
          ) : (
            <div className="flex flex-col gap-12">
              {historicoContent.map((item, idx) => (
                <div key={idx} className="max-w-none">
                  {item.imageFallback && item.imageSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageSrc}
                      alt={item.title ?? ""}
                      className="w-full rounded-2xl mb-7"
                      style={{ display: "block" }}
                    />
                  )}
                  {item.html && (
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground leading-[1.75]
                        [&_p]:mb-4
                        [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                        [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                        [&_strong]:text-foreground
                        [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1
                        [&_a]:text-primary [&_a]:underline [&_a]:font-medium [&_a]:hover:text-primary/80 [&_a]:transition-colors
                        [&_img]:w-full [&_img]:rounded-2xl [&_img]:my-7"
                      dangerouslySetInnerHTML={{ __html: item.html }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
