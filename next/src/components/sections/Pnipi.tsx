/**
 * Pnipi — Server Component (seção PNIPI)
 *
 * Busca guias para a aba "Leis e decretos" e passa para PnipiClient.
 * As abas "Planos de ação" e "Dúvidas frequentes" usam dados estáticos
 * enquanto as collections correspondentes não estão confirmadas em API_CONTRACTS.md.
 *
 * Referência: docs/API_CONTRACTS.md §1 — collection `guias`
 */

import { getGuias, getFaqs, getPlanos, StrapiGuia, StrapiFaq, StrapiPlano } from "@/lib/strapi";
import { PnipiClient } from "./PnipiClient";

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

export async function Pnipi() {
  let guias: StrapiGuia[] = [];
  let faqs: StrapiFaq[] = [];
  let planos: StrapiPlano[] = [];

  try {
    const [fetchedGuias, fetchedFaqs, fetchedPlanos] = await Promise.all([
      getGuias({ _sort: "order:asc" }).catch(() => []),
      getFaqs({ _sort: "ordem:asc" }).catch(() => []),
      getPlanos({ _sort: "titulo:asc" }).catch(() => []),
    ]);
    guias = fetchedGuias;
    faqs = fetchedFaqs;
    planos = fetchedPlanos;
  } catch {
    // Sem API configurada: usa arrays vazios
  }

  return (
    <section id="pnipi" aria-label="PNIPI" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <SectionLabel>PNIPI</SectionLabel>
        <h2
          className="text-[30px] lg:text-[40px] font-black text-foreground mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Planos pela Primeira Infância
        </h2>
        <p className="text-muted-foreground mb-8 text-[15px]">
          Na plataforma, é possível consultar os planos cadastrados a partir de levantamento realizado pela Subsecretaria da Política Nacional Integrada pela Primeira Infância (SNPPI/MEC) em 2026, conhecer experiências de diferentes localidades e acompanhar informações sobre sua elaboração e implementação.
          <br />
          O Observa convida municípios e demais instituições responsáveis pelos Planos pela Primeira Infância a compartilhar seus documentos, ampliando o acervo e fortalecendo a memória das políticas públicas para a primeira infância no Brasil.
          <br />
          Consulte os planos disponíveis, envie o de sua localidade e conheça os resultados dos estudos realizados pelo Observa

        </p>

        <PnipiClient guias={guias} faqs={faqs} planos={planos} />
      </div>
    </section>
  );
}
