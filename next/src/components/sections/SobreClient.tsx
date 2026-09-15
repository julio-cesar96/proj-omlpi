/**
 * SobreClient — Server Component
 *
 * Renderiza o conteúdo institucional da seção Sobre / Quem somos (#sobre).
 * A seção Histórico (#historico) possui seu próprio componente <Historico />.
 *
 * Suporta customização dinâmica de:
 *  - Rótulo superior / tarja laranja (padrão: "Sobre", configurável via CMS com section_label)
 *  - Título principal H2 (padrão: "Quem somos", configurável via CMS com section_title)
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
interface BlocoSobre {
  id: number;
  html: string;
  imageFallback: boolean;
  imageSrc: string | null;
  title?: string;
}

export function SobreClient({ abas }: Props): React.JSX.Element {
  let sectionLabel = "Sobre";
  let sectionTitle = "Quem somos";

  const sobreContent: BlocoSobre[] = [];

  abas.forEach((aba) => {
    const rawText = aba.text ?? "";
    const { meta, content: parsedContent } = parseSobreText(rawText);

    if (meta.section_label) {
      sectionLabel = meta.section_label;
    }
    if (meta.section_title) {
      sectionTitle = meta.section_title;
    }

    const imageSrc = resolveStrapiFileUrl(aba.image?.url);

    let textToRender = parsedContent;

    // Se ainda contiver a tag antiga de split `## Histórico`, corta para exibir só a parte Sobre
    const historicoMatchIndex = textToRender.search(
      /^##\s*(Histórico|Memória)/m
    );
    if (historicoMatchIndex !== -1) {
      textToRender = textToRender.slice(0, historicoMatchIndex).trim();
    }

    if (textToRender) {
      const res = renderText(textToRender, aba.image?.url, aba.title ?? "");
      sobreContent.push({
        ...res,
        id: aba.id,
        imageSrc,
        title: aba.title ?? undefined,
      });
    }
  });

  return (
    <section id="sobre" aria-label={sectionTitle} className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <SectionLabel>{sectionLabel}</SectionLabel>
        <h2
          className="text-[30px] lg:text-[40px] font-black text-foreground mb-10"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {sectionTitle}
        </h2>

        {sobreContent.length === 0 ? (
          <p className="text-muted-foreground leading-[1.75]">
            O Observa &#x2013; Observatório do Marco Legal da Primeira Infância
            é uma iniciativa da Rede Nacional Primeira Infância &#x2013; RNPI que
            foi desenvolvida sob coordenação da ANDI &#x2013; Comunicação e
            Direitos, entidade que desempenhou a função de secretaria executiva
            da rede para o período 2018-2021. Atualmente, a Plataforma é gerida
            pela União Nacional dos Conselhos Municipais de Educação - UNCME.
            <br />
            <br />
            Formada em 2007, a RNPI é a principal articulação de alcance
            nacional a ter como missão o fomento de políticas públicas voltadas à
            garantia dos direitos das crianças de 0 a 6 anos de idade. Sua
            composição é democrática e plural, acolhendo hoje mais de 200
            instituições de diferentes dimensões e perfis.
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {sobreContent.map((item) => (
              <div key={item.id} className="max-w-none">
                {item.title && sobreContent.length > 1 && (
                  <h3
                    className="text-2xl font-black text-foreground mb-6"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {item.title}
                  </h3>
                )}
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
