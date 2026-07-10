/**
 * Midiateca — Server Component (seção Midiateca)
 *
 * Busca em paralelo:
 *   - getGuias()                              → aba "Documentos" (grade por categoria)
 *   - searchArtigos({ _limit: 15, _start: 0 }) → aba "Artigos" (busca, tags, paginação)
 *   - getTags({ _limit: -1 })                 → filtro de tags na aba Artigos
 *
 * Artigos: fonte é o omlpi-cms-search (busca full-text + filtro por tags).
 *   NÃO usar getArtigos() de lib/strapi.ts para este fluxo — o Strapi não
 *   tem full-text search nativo. Ver docs/API_CONTRACTS.md §3.
 *
 * Guias e Tags: fonte continua sendo o Strapi (metadados que ele serve corretamente).
 *
 * A paginação client-side de artigos usa /api/artigos (Route Handler proxy)
 * para não expor CMS_SEARCH_API_URL no browser.
 *
 * Referência: docs/API_CONTRACTS.md §3 — omlpi-cms-search
 */

import { getGuias, getTags, StrapiGuia, StrapiTag } from "@/lib/strapi";
import { searchArtigos, CmsSearchArtigo } from "@/lib/cms-search";
import { MidiatecaClient } from "./MidiatecaClient";

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

export async function Midiateca() {
  let guias: StrapiGuia[] = [];
  let artigos: CmsSearchArtigo[] = [];
  let tags: StrapiTag[] = [];

  try {
    [guias, { results: artigos }, tags] = await Promise.all([
      getGuias({ _sort: "published_at:desc" }),
      searchArtigos({ _limit: 15, _start: 0 }),
      getTags({ _limit: -1 } as Parameters<typeof getTags>[0]),
    ]);
  } catch {
    // Sem API configurada: renderiza com arrays vazios
  }

  return (
    <section
      id="midiateca"
      aria-label="Midiateca"
      className="py-20 lg:py-28 bg-white"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <SectionLabel>Midiateca</SectionLabel>
        <h2
          className="text-[30px] lg:text-[40px] font-black text-foreground mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Documentos e recursos
        </h2>

        <MidiatecaClient guias={guias} artigos={artigos} tags={tags} />
      </div>
    </section>
  );
}
