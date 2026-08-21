/**
 * ElaborePlano — Server Component (seção estática "Elabore o plano do seu município")
 *
 * Posicionada logo abaixo da seção PNIPI na home.
 * Exibe o placeholder da capa do guia e as informações editoriais para elaboração dos planos.
 */

import { Image as ImageIcon } from "lucide-react";

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

export function ElaborePlano() {
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
          Elabore o plano do seu município
        </h2>

        {/* Bloco editorial em largura total */}
        <div className="space-y-8">
          {/* Placeholder de imagem em largura total */}
          <div className="w-full aspect-[3/2] bg-[#F5F0E8] border-2 border-dashed border-muted-foreground/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-sm">
            <ImageIcon className="w-10 h-10 text-muted-foreground/60 mb-2" aria-hidden="true" />
            <span className="text-sm font-medium text-muted-foreground">
              Capa do Guia — imagem a ser inserida
            </span>
          </div>

          {/* Título do guia e parágrafos descritivos alinhados à esquerda */}
          <div className="space-y-4 text-left">
            <h3
              className="text-xl lg:text-2xl font-bold text-foreground leading-snug"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Guia para elaboração de Planos Intersetoriais para a Primeira Infância
            </h3>

            <p className="text-muted-foreground text-[15px] lg:text-base leading-relaxed">
              O Guia para elaboração de planos intersetoriais pela primeira infância, publicação histórica da RNPI, agora se torna normativa governamental para a criação, implementação e monitoramento de planos municipais e estaduais no Brasil.
            </p>

            <p className="text-muted-foreground text-[15px] lg:text-base leading-relaxed">
              Publicado em parceria com a Subsecretaria da Política Nacional Integrada da Primeira Infância, do Ministério da Educação, o material, atualizado com novos conteúdos, traz um novo capítulo dedicado à PNIPI. E inclui também orientações sobre temas transversais fundamentais na atualidade, como a diversidade das múltiplas infâncias brasileiras, educação antirracista, eliminação de violências e proteção no ambiente digital.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
