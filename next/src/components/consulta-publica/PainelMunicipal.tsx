import { getLocaleData, getAreas } from "@/lib/omlpi-api";
import type { OmlpiLocale, OmlpiIndicatorWithSubindicator } from "@/lib/omlpi-api";
import { LocalidadeBusca } from "./LocalidadeBusca";

/**
 * PainelMunicipal — Server Component
 *
 * Exibe os dados de um município selecionado via location_id.
 * Shape de GET /data confirmado em omlpi-api/public/openapi.yaml:
 *   Locale = { id, name, type, latitude, longitude, indicators: IndicatorWithSubindicator[] }
 *   IndicatorWithSubindicator = { id, name, area, base, values, subindicators[] }
 *   values = { year, value_relative, value_absolute } (objeto, não array, no GET /data)
 */

interface PainelMunicipalProps {
  locationId: number;
  areaId?: number;
  locales: OmlpiLocale[];
}

function formatValue(v: number | null | undefined) {
  if (v == null || isNaN(v)) return "—";
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function IndicatorCard({ indicator }: { indicator: OmlpiIndicatorWithSubindicator }) {
  const values = Array.isArray(indicator.values)
    ? indicator.values
    : indicator.values
    ? [indicator.values]
    : [];

  const latestValue = values.sort((a, b) => b.year - a.year)[0];

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div>
        <span className="text-xs font-medium text-primary uppercase tracking-wide">
          {indicator.area.name}
        </span>
        <h4 className="mt-1 text-sm font-semibold text-foreground leading-snug">
          {indicator.name}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">{indicator.base}</p>
      </div>

      {latestValue && (
        <div className="flex gap-6 pt-1">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatValue(latestValue.value_relative)}
              <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
            </p>
            <p className="text-xs text-muted-foreground">Valor relativo</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatValue(latestValue.value_absolute)}
            </p>
            <p className="text-xs text-muted-foreground">Valor absoluto</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-medium text-muted-foreground">{latestValue.year}</p>
          </div>
        </div>
      )}

      {/* Série histórica compacta */}
      {values.length > 1 && (
        <div className="flex gap-3 flex-wrap pt-1 border-t border-border">
          {values
            .sort((a, b) => a.year - b.year)
            .map((v) => (
              <div key={v.year} className="text-xs text-center">
                <span className="block text-muted-foreground">{v.year}</span>
                <span className="font-semibold text-foreground">
                  {formatValue(v.value_relative)}%
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Subindicadores */}
      {indicator.subindicators?.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            Ver desagregações ({indicator.subindicators.length})
          </summary>
          <div className="mt-2 space-y-2">
            {indicator.subindicators.map((sub) => (
              <div key={sub.classification} className="pl-3 border-l-2 border-border">
                <p className="font-medium text-foreground mb-1">{sub.classification}</p>
                <div className="flex flex-wrap gap-3">
                  {sub.data.map((item) => {
                    const vals = Array.isArray(item.values)
                      ? item.values
                      : item.values
                      ? [item.values]
                      : [];
                    const latest = vals.sort((a, b) => b.year - a.year)[0];
                    return (
                      <span key={item.id} className="text-muted-foreground">
                        {item.description}:{" "}
                        <strong className="text-foreground">
                          {formatValue(latest?.value_relative)}%
                        </strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export async function PainelMunicipal({
  locationId,
  areaId,
  locales,
}: PainelMunicipalProps) {
  const [data, areas] = await Promise.all([
    getLocaleData(locationId, { area_id: areaId }).catch(() => null),
    getAreas().catch(() => [] as Awaited<ReturnType<typeof getAreas>>),
  ]);

  if (!data) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>Não foi possível carregar os dados desta localidade.</p>
        <p className="text-sm mt-1">Verifique a conexão ou tente novamente.</p>
      </div>
    );
  }

  const indicators = data.indicators ?? [];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{data.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">{data.type}</p>
        </div>
        <LocalidadeBusca locales={locales} selectedId={locationId} />
      </div>

      {/* Filtro por área */}
      {areas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <a
            href={`?tab=municipais&location_id=${locationId}#consulta-publica`}
            className={[
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              !areaId
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70",
            ].join(" ")}
          >
            Todos
          </a>
          {areas.map((area) => (
            <a
              key={area.id}
              href={`?tab=municipais&location_id=${locationId}&area=${area.id}#consulta-publica`}
              className={[
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                areaId === area.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              ].join(" ")}
            >
              {area.name}
            </a>
          ))}
        </div>
      )}

      {/* Indicadores */}
      {indicators.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>Nenhum indicador disponível para este filtro.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {indicators.map((ind) => (
            <IndicatorCard key={ind.id} indicator={ind} />
          ))}
        </div>
      )}
    </div>
  );
}
