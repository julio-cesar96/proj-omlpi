/**
 * HistoricoClient — Server Component
 *
 * Renderiza a seção Memória / Histórico (#historico).
 *
 * Suporta customização dinâmica de:
 *  - Rótulo superior / tarja laranja (padrão: "Memória", configurável via CMS com section_label)
 *  - Título principal H2 (padrão: "Histórico", configurável via CMS com section_title)
 *
 * Suporte a marcador {{imagem}} no campo `text`:
 *  - Se {{imagem}} estiver no texto E a aba tiver imagem → imagem inserida no fluxo.
 *  - Se tiver imagem sem marcador → imagem no TOPO do bloco como fallback.
 *  - Se não houver imagem → marcador removido silenciosamente.
 *
 * O nome mantém o sufixo `Client` por compatibilidade com os imports, mas o
 * componente não tem estado nem eventos: renderiza no servidor.
 */

import Image from "next/image";
import { StrapiSobre } from "@/lib/strapi";
import { resolveStrapiFileUrl } from "@/lib/strapi-media";
import { renderText } from "@/lib/markdown";
import { parseSobreText } from "@/lib/frontmatter";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface Props {
  abas: StrapiSobre[];
}

/** Bloco de conteúdo já renderizado de uma aba. */
interface BlocoHistorico {
  id: number;
  html: string;
  imageFallback: boolean;
  imageSrc: string | null;
  title?: string;
}

export function HistoricoClient({ abas }: Props): React.JSX.Element {
  let sectionLabel = "Memória";
  let sectionTitle = "Histórico";

  const historicoContent: BlocoHistorico[] = [];

  abas.forEach((aba) => {
    const rawText = aba.text ?? "";
    const { meta, content: parsedContent } = parseSobreText(rawText);

    // Metadados de frontmatter têm precedência
    if (meta.section_label) {
      sectionLabel = meta.section_label;
    }
    if (meta.section_title) {
      sectionTitle = meta.section_title;
    }

    const imageSrc = resolveStrapiFileUrl(aba.image?.url);

    let textToRender = parsedContent;

    // Fallback para conteúdo legado que ainda tenha split por '## Histórico'
    const historicoMatchIndex = textToRender.search(
      /^##\s*(Histórico|Memória)/m
    );
    if (historicoMatchIndex !== -1) {
      textToRender = textToRender
        .slice(historicoMatchIndex)
        .replace(/^##\s*(Histórico|Memória)\s*\n?/, "")
        .trim();
    }

    if (textToRender) {
      const res = renderText(textToRender, aba.image?.url, aba.title ?? "");
      historicoContent.push({
        ...res,
        id: aba.id,
        imageSrc,
        title: aba.title ?? undefined,
      });
    }
  });

  return (
    <section
      id="historico"
      aria-label={sectionTitle}
      className="py-20 lg:py-28 border-t border-border/40 bg-muted/30"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <SectionLabel>{sectionLabel}</SectionLabel>
        <h2
          className="text-[30px] lg:text-[40px] font-black text-foreground mb-10"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {sectionTitle}
        </h2>

        {historicoContent.length === 0 ? (
          <p className="text-muted-foreground leading-[1.75]">
            A Rede Nacional Primeira Infância (RNPI) foi criada em 2007 como uma
            articulação de organizações da sociedade civil, do governo e do setor
            privado para promover os direitos da criança de 0 a 6 anos no
            Brasil. O Observa surge no âmbito desse movimento como instrumento
            permanente de monitoramento e transparência das políticas públicas
            pela primeira infância.
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {historicoContent.map((item) => (
              <div key={item.id} className="max-w-none">
                {item.imageFallback && item.imageSrc && (
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-7">
                    <Image
                      src={item.imageSrc}
                      alt={item.title ?? ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 1200px"
                      unoptimized
                    />
                  </div>
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
  );
}
