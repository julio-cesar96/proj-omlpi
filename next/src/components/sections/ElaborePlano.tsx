/**
 * ElaborePlano — Server Component (seção "Elabore o plano do seu município")
 *
 * Posicionada logo abaixo da seção PNIPI na home.
 * Consome os dados do Strapi via GET /elabore-planos com fallback para conteúdo estático.
 */

import Image from "next/image";
import { Image as ImageIcon, Download } from "lucide-react";
import { getElaborePlano, StrapiElaborePlano } from "@/lib/strapi";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://omlpi-strapi.rnpiobserva.org.br";

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

export async function ElaborePlano() {
  let data: StrapiElaborePlano | null = null;

  try {
    data = await getElaborePlano();
  } catch (err) {
    console.error("[ElaborePlano] Erro ao carregar dados do Strapi:", err);
  }

  const tituloSecao = data?.titulo_secao || "Elabore o plano do seu município";
  const tituloGuia = data?.titulo_guia || "Guia para elaboração de Planos Intersetoriais para a Primeira Infância";
  const descricaoMd = data?.descricao;

  const capaUrl = data?.capa?.url
    ? data.capa.url.startsWith("http")
      ? data.capa.url
      : `${STRAPI_URL}${data.capa.url}`
    : null;

  const arquivoUrl = data?.arquivo?.url
    ? data.arquivo.url.startsWith("http")
      ? data.arquivo.url
      : `${STRAPI_URL}${data.arquivo.url}`
    : null;

  const htmlDescricao = descricaoMd ? renderMarkdown(descricaoMd) : null;

  return (
    <section
      id="elabore-plano"
      aria-label="Elabore o plano do seu município"
      className="py-16 lg:py-24 bg-white border-t border-border/40"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <SectionLabel>PNIPI</SectionLabel>
        <h2
          className="text-[30px] lg:text-[40px] font-black text-foreground mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {tituloSecao}
        </h2>

        {/* Bloco editorial em largura total */}
        <div className="space-y-8">
          {/* Imagem de Capa ou Placeholder */}
          {capaUrl ? (
            <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-sm border border-border/40">
              <Image
                src={capaUrl}
                alt={tituloGuia}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-full aspect-[3/2] bg-[#F5F0E8] border-2 border-dashed border-muted-foreground/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-sm">
              <ImageIcon className="w-10 h-10 text-muted-foreground/60 mb-2" aria-hidden="true" />
              <span className="text-sm font-medium text-muted-foreground">
                Capa do Guia — imagem a ser inserida
              </span>
            </div>
          )}

          {/* Título do guia e parágrafos descritivos */}
          <div className="space-y-4 text-left">
            <h3
              className="text-xl lg:text-2xl font-bold text-foreground leading-snug"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {tituloGuia}
            </h3>

            {htmlDescricao ? (
              <div
                className="prose prose-sm max-w-none text-muted-foreground leading-relaxed text-[15px] lg:text-base
                  [&_p]:mb-4
                  [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                  [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                  [&_strong]:text-foreground
                  [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1
                  [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                dangerouslySetInnerHTML={{ __html: htmlDescricao }}
              />
            ) : (
              <>
                <p className="text-muted-foreground text-[15px] lg:text-base leading-relaxed">
                  O Guia para elaboração de planos intersetoriais pela primeira infância, publicação histórica da RNPI, agora se torna normativa governamental para a criação, implementação e monitoramento de planos municipais e estaduais no Brasil.
                </p>
                <p className="text-muted-foreground text-[15px] lg:text-base leading-relaxed">
                  Publicado em parceria com a Subsecretaria da Política Nacional Integrada da Primeira Infância, do Ministério da Educação, o material, atualizado com novos conteúdos, traz um novo capítulo dedicado à PNIPI. E inclui também orientações sobre temas transversais fundamentais na atualidade, como a diversidade das múltiplas infâncias brasileiras, educação antirracista, eliminação de violências e proteção no ambiente digital.
                </p>
              </>
            )}

            {arquivoUrl && (
              <div className="pt-4">
                <a
                  href={arquivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-[#e04d18] transition-colors shadow-sm text-sm"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  Baixar Guia
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

