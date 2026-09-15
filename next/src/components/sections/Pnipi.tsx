/**
 * Pnipi — Server Component (seção PNIPI)
 *
 * Busca guias para a aba "Leis e decretos" e passa para PnipiClient.
 * As abas "Planos de ação" e "Dúvidas frequentes" usam dados estáticos
 * enquanto as collections correspondentes não estão confirmadas em API_CONTRACTS.md.
 *
 * Referência: docs/API_CONTRACTS.md §1 — collection `guias`
 */

import { getGuias, getGuiasCount, getFaqs, getPlanos, StrapiGuia, StrapiFaq, StrapiPlano } from "@/lib/strapi";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PnipiClient } from "./PnipiClient";

export async function Pnipi(): Promise<React.JSX.Element> {
  let guias: StrapiGuia[] = [];
  let totalGuias = 0;
  let faqs: StrapiFaq[] = [];
  let planos: StrapiPlano[] = [];

  // allSettled: uma coleção indisponível não derruba as outras abas, mas o erro
  // é logado por origem — os .catch(() => []) anteriores engoliam tudo em silêncio.
  const [resGuias, resCount, resFaqs, resPlanos] = await Promise.allSettled([
    getGuias({ _limit: 6, _sort: "created_at:desc" }),
    getGuiasCount(),
    getFaqs({ _sort: "ordem:asc" }),
    getPlanos({ _sort: "titulo:asc" }),
  ]);

  if (resGuias.status === "fulfilled") guias = resGuias.value;
  else console.error("[Pnipi] Falha ao buscar getGuias():", resGuias.reason);

  if (resCount.status === "fulfilled") totalGuias = resCount.value;
  else console.error("[Pnipi] Falha ao buscar getGuiasCount():", resCount.reason);

  if (resFaqs.status === "fulfilled") faqs = resFaqs.value;
  else console.error("[Pnipi] Falha ao buscar getFaqs():", resFaqs.reason);

  if (resPlanos.status === "fulfilled") planos = resPlanos.value;
  else console.error("[Pnipi] Falha ao buscar getPlanos():", resPlanos.reason);

  return (
    <section id="pnipi" aria-label="PNIPI" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <SectionLabel>PNIPI</SectionLabel>
        <h2
          className="text-[30px] lg:text-[40px] font-black text-foreground mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Planos Intersetoriais pela Primeira Infância
        </h2>
        <p className="text-muted-foreground mb-8 text-[15px]">
          Na plataforma, é possível consultar os planos cadastrados a partir de levantamento realizado pela Subsecretaria da Política Nacional Integrada pela Primeira Infância (SNPPI/MEC) em 2026, conhecer experiências de diferentes localidades e acompanhar informações sobre sua elaboração e implementação. 
          <br />
          O Observa convida municípios e demais instituições responsáveis pelos Planos pela Primeira Infância a compartilhar seus documentos, ampliando o acervo e fortalecendo a memória das políticas públicas para a primeira infância no Brasil.
          <br />
          Consulte os planos disponíveis, envie o de sua localidade e conheça os resultados dos estudos realizados pelo Observa.
        </p>

        <PnipiClient guiasIniciais={guias} totalGuias={totalGuias} faqs={faqs} planos={planos} />
      </div>
    </section>
  );
}
