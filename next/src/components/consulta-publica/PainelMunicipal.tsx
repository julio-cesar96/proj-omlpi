import { getStrapiUrl, type StrapiLocale } from "@/lib/strapi";
import { LocalidadeBusca } from "./LocalidadeBusca";
import { UploadPlanoDrawer } from "./UploadPlanoDrawer";

/**
 * PainelMunicipal — Server Component
 *
 * Exibe a localidade selecionada e o card de download do plano municipal/estadual/lei,
 * quando houver plano associado no Strapi.
 * Se a localidade for um estado, exibe também a lista completa dos municípios daquele
 * estado que possuem plano cadastrado.
 * Quando não há plano, exibe um estado vazio informativo com CTAs.
 */

export interface CityPlanItem {
  id: number;
  name: string;
  isLaw: boolean;
  planUrl: string | null;
}

interface PainelMunicipalProps {
  locationId: number;
  areaId?: number;
  selectedLocale?: StrapiLocale;
  citiesWithPlan?: CityPlanItem[];
}

export function PainelMunicipal({
  locationId,
  selectedLocale,
  citiesWithPlan,
}: PainelMunicipalProps) {
  const matchedLocale = selectedLocale;
  const planUrl = matchedLocale?.plan?.url
    ? `${getStrapiUrl()}${matchedLocale.plan.url}`
    : null;
  const isLaw = matchedLocale?.is_law ?? false;
  const isState = matchedLocale?.type === "state";

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
      {/* Navegação de volta ao mapa */}
      <div className="flex items-center gap-3">
        <a
          href="?tab=mapa#consulta-publica"
          className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1.5 cursor-pointer"
        >
          ← Voltar ao mapa do Brasil
        </a>
        {isState && (
          <span className="text-sm text-muted-foreground">
            / {matchedLocale?.name} (Estado)
          </span>
        )}
      </div>

      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{localeName}</h3>
          <p className="text-sm text-muted-foreground">{typeLabel}</p>
        </div>
        <LocalidadeBusca selectedId={locationId} initialName={matchedLocale?.name} />
      </div>

      {/* Card de download do plano (quando existir) */}
      {planUrl && (
        <div className="bg-white border border-border rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
              {isState
                ? isLaw
                  ? "Lei Estadual"
                  : "Plano Estadual"
                : isLaw
                ? "Lei Municipal"
                : "Plano Municipal"}
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
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex-shrink-0 cursor-pointer"
          >
            <span>↓</span>
            {isLaw ? "Baixar Lei" : "Baixar Plano"}
          </a>
        </div>
      )}

      {/* Se for estado e NÃO tiver plano estadual próprio */}
      {isState && !planUrl && (
        <div className="bg-muted/40 border border-border/80 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Plano Estadual
            </p>
            <p className="text-sm font-medium text-foreground">
              O Estado de {matchedLocale?.name} ainda não possui um Plano Estadual cadastrado em nossa base.
            </p>
          </div>
          <UploadPlanoDrawer localeName={localeName}>
            <button
              type="button"
              className="text-xs font-semibold bg-background border border-border px-3.5 py-2 rounded-lg text-foreground hover:bg-muted transition-colors whitespace-nowrap cursor-pointer"
            >
              Enviar documento do estado
            </button>
          </UploadPlanoDrawer>
        </div>
      )}

      {/* Lista de municípios do estado com plano cadastrado (quando for estado) */}
      {isState && citiesWithPlan && citiesWithPlan.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-lg font-bold text-foreground">
                Planos Municipais em {localeName}
              </h4>
              <p className="text-sm text-muted-foreground">
                {citiesWithPlan.length} município{citiesWithPlan.length === 1 ? "" : "s"} com plano cadastrado
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[640px] overflow-y-auto pr-1">
            {citiesWithPlan.map((city) => (
              <div
                key={city.id}
                className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-primary/50 transition-colors shadow-xs"
              >
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {city.isLaw ? "Lei Municipal" : "Plano Municipal"}
                  </span>
                  <h5 className="font-semibold text-foreground text-sm mt-0.5">
                    {city.name}
                  </h5>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                  {city.planUrl ? (
                    <a
                      href={city.planUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>↓</span> {city.isLaw ? "Baixar Lei" : "Baixar Plano"}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Documento indisponível</span>
                  )}
                  <a
                    href={`?tab=municipais&location_id=${city.id}#consulta-publica`}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                  >
                    Ver detalhes →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio para município sem plano OU estado sem plano e sem municípios com plano */}
      {((!isState && !planUrl) ||
        (isState && !planUrl && (!citiesWithPlan || citiesWithPlan.length === 0))) && (
        <PlanoNaoEncontrado localeName={localeName} localeType={matchedLocale?.type} />
      )}
    </div>
  );
}

/* ─── Sub-componente: estado vazio ─────────────────────────────────────────── */

function PlanoNaoEncontrado({
  localeName,
  localeType,
}: {
  localeName: string;
  localeType?: string;
}) {
  const isState = localeType === "state";
  const entityText = isState ? "esse estado" : "esse município";

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
          Ainda não temos um plano cadastrado para {entityText}. Você pode
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted active:scale-[0.98] transition-all cursor-pointer"
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

        {/* CTA 3 — Voltar ao mapa do Brasil */}
        <a
          href="?tab=mapa#consulta-publica"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-background text-muted-foreground text-sm font-semibold hover:text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          ← Voltar ao mapa
        </a>
      </div>
    </div>
  );
}
