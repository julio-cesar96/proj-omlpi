/**
 * Pnipi — Server Component (seção PNIPI)
 *
 * Busca guias para a aba "Leis e decretos" e passa para PnipiClient.
 * As abas "Planos de ação" e "Dúvidas frequentes" usam dados estáticos
 * enquanto as collections correspondentes não estão confirmadas em API_CONTRACTS.md.
 *
 * Referência: docs/API_CONTRACTS.md §1 — collection `guias`
 */

import { getGuias, StrapiGuia } from "@/lib/strapi";
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

  try {
    guias = await getGuias({ _sort: "order:asc" });
  } catch {
    // Sem API configurada: usa array vazio (PnipiClient lida com isso)
  }

  return (
    <section id="pnipi" aria-label="PNIPI" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <SectionLabel>PNIPI</SectionLabel>
        <h2
          className="text-[30px] lg:text-[40px] font-black text-foreground mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Programa Nacional Integrado
        </h2>
        <p className="text-muted-foreground mb-8 text-[15px]">
          pela Primeira Infância
        </p>

        <PnipiClient guias={guias} />
      </div>
    </section>
  );
}
