/**
 * Referencia — Server Component (seção Referências)
 *
 * Busca em paralelo:
 *   - getGuias()          → aba "Documentos" (grade por categoria)
 *   - getMidiaPublica()   → aba "Mídias" (arquivos públicos da Media Library)
 *
 * A aba "Artigos" (omlpi-cms-search) foi removida — decisão Q1 confirmada.
 * As funções getArtigos(), searchArtigos() e getTags() não são mais usadas aqui.
 *
 * Paginação de Mídias: o SSR carrega os primeiros 20 registros.
 * O componente client ReferenciaClient usa /api/midiateca-publica (Route Handler)
 * para paginação incremental via botão "Carregar mais".
 *
 * Referência: docs/API_CONTRACTS.md §1 — CMS (Strapi)
 */

import { getGuias, getGuiasCount, getMidiaPublica, StrapiGuia, StrapiMidiaPublica } from '@/lib/strapi';
import { ReferenciaClient } from './ReferenciaClient';

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

export async function Referencia() {
  let guias: StrapiGuia[] = [];
  let totalGuias = 0;
  let midias: StrapiMidiaPublica[] = [];
  let totalMidias = 0;

  try {
    const [guiasResult, guiasCountResult, midiasResult] = await Promise.all([
      getGuias({ _limit: 6, _sort: 'created_at:desc' }),
      getGuiasCount(),
      getMidiaPublica({ _limit: 20, _start: 0 } as Parameters<typeof getMidiaPublica>[0]),
    ]);
    guias = guiasResult;
    totalGuias = guiasCountResult;
    midias = midiasResult.results;
    totalMidias = midiasResult.count;
  } catch {
    // Sem API configurada: renderiza com arrays vazios
  }

  return (
    <section
      id="referencia"
      aria-label="Referências"
      className="py-20 lg:py-28 bg-white"
    >
      <span id="referencias" className="sr-only" />
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <SectionLabel>Referências</SectionLabel>
        <h2
          className="text-[30px] lg:text-[40px] font-black text-foreground mb-8"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Conteúdos e legislações
        </h2>

        <ReferenciaClient
          guiasIniciais={guias}
          totalGuias={totalGuias}
          midias={midias}
          totalMidias={totalMidias}
        />
      </div>
    </section>
  );
}
