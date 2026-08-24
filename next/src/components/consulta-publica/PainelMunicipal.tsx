import { getStrapiUrl, type StrapiLocale } from "@/lib/strapi";
import { LocalidadeBusca } from "./LocalidadeBusca";

/**
 * PainelMunicipal — Server Component
 *
 * Exibe a localidade selecionada e o card de download do plano municipal/lei,
 * quando houver plano associado no Strapi.
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

      {/* Card de download do plano */}
      {planUrl && (
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
      )}
    </div>
  );
}
