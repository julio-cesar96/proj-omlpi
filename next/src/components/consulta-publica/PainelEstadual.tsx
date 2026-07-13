import type { StrapiLocale } from "@/lib/strapi";
import { LocalidadeBusca } from "./LocalidadeBusca";
import { PainelMunicipal } from "./PainelMunicipal";

/**
 * PainelEstadual — Server Component
 *
 * Exibe estados/Distrito Federal com seus dados.
 * Usa getLocales() para obter locales do tipo "state" (inclui dados de plano).
 * Se um estado for selecionado via location_id, exibe seus dados via PainelMunicipal.
 */

interface PainelEstadualProps {
  locationId?: number;
  areaId?: number;
  allLocales: StrapiLocale[];
}

// Cores de status alinhadas com tokens do design
const STATUS_STYLES = {
  approved: {
    dot: "bg-secondary",
    label: "Aprovado",
    badge: "bg-accent text-secondary",
  },
  inProgress: {
    dot: "bg-primary",
    label: "Em elaboração / Lei",
    badge: "bg-orange-50 text-primary",
  },
  none: {
    dot: "bg-muted-foreground/30",
    label: "Sem plano",
    badge: "bg-muted text-muted-foreground",
  },
} as const;

function getStatus(locale: StrapiLocale) {
  if (!locale.plan || locale.hide_plan) return "none" as const;
  return locale.is_law ? "inProgress" as const : "approved" as const;
}

export async function PainelEstadual({
  locationId,
  areaId,
  allLocales,
}: PainelEstadualProps) {
  const stateLocales = allLocales.filter((l) => l.type === "state");

  // Se há estado selecionado, reutiliza PainelMunicipal
  if (locationId) {
    const stateLocale = stateLocales.find((l) => l.id === locationId);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href="?tab=estaduais#consulta-publica"
            className="text-sm text-primary font-medium hover:underline"
          >
            ← Todos os estados
          </a>
          {stateLocale && (
            <span className="text-muted-foreground text-sm">
              / {stateLocale.name}
            </span>
          )}
        </div>
        <PainelMunicipal
          locationId={locationId}
          areaId={areaId}
          locales={allLocales}
        />
      </div>
    );
  }

  // Grid de todos os estados
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            Estaduais / Distrital
          </h3>
          <p className="text-sm text-muted-foreground">
            {stateLocales.filter((l) => l.plan && !l.hide_plan).length} de{" "}
            {stateLocales.length} estados com plano
          </p>
        </div>
        <LocalidadeBusca
          locales={stateLocales}
          placeholder="Buscar estado..."
        />
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {(Object.keys(STATUS_STYLES) as Array<keyof typeof STATUS_STYLES>).map(
          (key) => (
            <span key={key} className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${STATUS_STYLES[key].dot}`}
              />
              {STATUS_STYLES[key].label}
            </span>
          )
        )}
      </div>

      {/* Grid de estados */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stateLocales
          .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"))
          .map((locale) => {
            const status = getStatus(locale);
            const style = STATUS_STYLES[status];

            return (
              <a
                key={locale.id}
                href={`?tab=estaduais&location_id=${locale.id}#consulta-publica`}
                className={[
                  "group block bg-card border border-border rounded-xl p-4",
                  "hover:border-primary/40 hover:shadow-sm transition-all",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {locale.name}
                    </p>
                    {locale.state && (
                      <p className="text-xs text-muted-foreground">
                        {locale.state}
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${style.badge}`}
                  >
                    {locale.is_law ? "Lei" : status === "approved" ? "✓" : "—"}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className="text-xs text-muted-foreground">
                    {style.label}
                  </span>
                </div>

                {/* Link de download (se tiver plano) */}
                {locale.plan?.url && !locale.hide_plan && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <a
                      href={locale.plan.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      ↓ Baixar {locale.is_law ? "Lei" : "Plano"}
                    </a>
                  </div>
                )}
              </a>
            );
          })}
      </div>
    </div>
  );
}
