import { getStrapiUrl, type StrapiLocale } from "@/lib/strapi";
import { LocalidadeBusca } from "./LocalidadeBusca";
import { UploadPlanoDrawer } from "./UploadPlanoDrawer";

/**
 * PainelMunicipal — Server Component
 *
 * Exibe a localidade selecionada e o card de download do plano municipal/lei,
 * quando houver plano associado no Strapi.
 * Quando não há plano, exibe um estado vazio informativo com CTAs para:
 *   1. Seção "Elabore o Plano" (guia de elaboração)
 *   2. Formulário de upload de plano
 */

interface PainelMunicipalProps {
  locationId: number;
  areaId?: number;
  locales: StrapiLocale[];
}

export function PainelMunicipal({
  locationId,
  locales,
}: PainelMunicipalProps) {
  const matchedLocale = locales.find((l) => l.id === locationId);
  const planUrl = matchedLocale?.plan?.url
    ? `${getStrapiUrl()}${matchedLocale.plan.url}`
    : null;
  const isLaw = matchedLocale?.is_law ?? false;

  const localeName = matchedLocale?.name ?? "Município";
  const typeLabel =
    matchedLocale?.type === "city"
      ? "Cidade"
      : matchedLocale?.type === "state"
      ? "Estado"
      : matchedLocale?.type === "country"
      ? "País"
      : "Cidade";

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{localeName}</h3>
          <p className="text-sm text-muted-foreground">{typeLabel}</p>
        </div>
        <LocalidadeBusca locales={locales} selectedId={locationId} />
      </div>

      {/* Card de download do plano — ou estado vazio */}
      {planUrl ? (
        <div className="bg-white border border-border rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
              {isLaw ? "Lei Municipal" : "Plano Municipal"}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {matchedLocale?.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Documento oficial disponível para download
            </p>
          </div>
          <a
            href={planUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <span>↓</span>
            {isLaw ? "Baixar Lei" : "Baixar Plano"}
          </a>
        </div>
      ) : (
        /* Estado vazio — município sem plano cadastrado */
        <PlanoNaoEncontrado localeName={localeName} />
      )}
    </div>
  );
}

/* ─── Sub-componente: estado vazio ─────────────────────────────────────────── */

function PlanoNaoEncontrado({ localeName }: { localeName: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-5 animate-[fadeIn_0.3s_ease]">
      {/* Ícone ilustrativo */}
      <div className="mx-auto w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="11" y2="17" />
        </svg>
      </div>

      {/* Mensagem principal */}
      <div className="space-y-1.5">
        <p className="text-base font-semibold text-foreground">
          Nenhum plano encontrado para {localeName}
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Ainda não temos um plano cadastrado para esse município. Você pode
          aprender como elaborar um ou, se já tiver o documento, enviá-lo para
          nossa base de dados.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
        {/* CTA 1 — Guia de elaboração */}
        <a
          href="#elabore-plano"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Como montar um plano
        </a>

        {/* CTA 2 — Formulário de upload via drawer */}
        <UploadPlanoDrawer localeName={localeName}>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted active:scale-[0.98] transition-all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Sou o responsável — enviar plano
          </button>
        </UploadPlanoDrawer>
      </div>
    </div>
  );
}
