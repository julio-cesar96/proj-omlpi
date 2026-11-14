"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * MapaBrasil — Client Component
 *
 * Mapa interativo do Brasil com Highcharts Maps (licença não-comercial).
 * Nível estado:
 *   - Cor por status do plano estadual (3 categorias fixas do design)
 *   - Tooltip: nome + contagem de planos municipais + link PDF estadual (se houver)
 * Clique num estado → navega para ?tab=municipais&location_id=<strapi_id>
 */

// Cores do mapa — alinhadas com tokens do design (theme.css)
const MAP_COLORS = {
  approved: "#009045",       // --secondary: verde = aprovado
  inProgress: "#f25d27",     // --primary: laranja = em elaboração / lei
  none: "#e8f0e8",           // branco-esverdeado sutil para "sem plano"
  hover: "#444525",          // --foreground: escuro no hover
  border: "#ffffff",
} as const;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Highcharts: any;
  }
}

export interface StateMapSummary {
  id: number;
  name: string;
  state: string;
  status: "approved" | "inProgress" | "none";
  planUrl: string | null;
  totalPlans: number;
  totalCities: number;
  isDF: boolean;
}

interface MapaBrasilProps {
  statesSummary: StateMapSummary[];
}

/** Shape retornado por GET /api/locales?state=UF */
interface DrilldownCity {
  cod_ibge: number;
  name: string;
  planUrl: string | null;
  isLaw: boolean;
  hasPlan: boolean;
}

const STATE_TO_HCKEY: Record<string, string> = {
  AC: "br-ac", AL: "br-al", AM: "br-am", AP: "br-ap", BA: "br-ba",
  CE: "br-ce", DF: "br-df", ES: "br-es", GO: "br-go", MA: "br-ma",
  MG: "br-mg", MS: "br-ms", MT: "br-mt", PA: "br-pa", PB: "br-pb",
  PE: "br-pe", PI: "br-pi", PR: "br-pr", RJ: "br-rj", RN: "br-rn",
  RO: "br-ro", RR: "br-rr", RS: "br-rs", SC: "br-sc", SE: "br-se",
  SP: "br-sp", TO: "br-to",
};

export function MapaBrasil({ statesSummary }: MapaBrasilProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);
  const [hcLoaded, setHcLoaded] = useState(false);
  const [isDrilldown, setIsDrilldown] = useState(false);
  const [currentState, setCurrentState] = useState<{ id: number; name: string; state: string } | null>(null);

  const initChart = useCallback(() => {
    if (!containerRef.current || !window.Highcharts) return;
    const H = window.Highcharts;
    const mapData = H.geojson(H.maps["countries/br/br-all"]);

    // Enriquece cada estado com dados de plano a partir do resumo agregado
    mapData.forEach((item: Record<string, unknown>) => {
      const properties = (item["properties"] as Record<string, unknown>) || {};
      const hcKey = properties["hc-key"] as string | undefined;
      const stateAbbr = properties["hc-a2"] as string | undefined;

      const stateData = statesSummary.find((s) => s.state === stateAbbr);
      const status = stateData?.status ?? "none";

      item["planStatus"] = status;
      item["planUrl"] = stateData?.planUrl ?? null;
      item["isDF"] = stateData?.isDF ?? (stateAbbr === "DF");
      item["totalPlans"] = stateData?.totalPlans ?? 0;
      item["totalCities"] = stateData?.totalCities ?? 0;
      item["stateAbbr"] = stateAbbr;
      item["drilldown"] = hcKey;
      item["value"] = status === "approved" ? 2 : status === "inProgress" ? 1 : 0;
    });

    chartRef.current = H.mapChart(containerRef.current, {
      chart: {
        backgroundColor: "rgba(0,0,0,0)",
        style: { fontFamily: "var(--font-body, sans-serif)" },
        events: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          drilldown(e: any) {
            setIsDrilldown(true);
            const point = e.point as Record<string, unknown>;
            const stateKey = point["drilldown"] as string;
            const stateAbbr = Object.entries(STATE_TO_HCKEY).find(
              ([, v]) => v === stateKey
            )?.[0];
            const stateData = statesSummary.find((s) => s.state === stateAbbr);
            if (stateData) {
              setCurrentState({
                id: stateData.id,
                name: stateData.name,
                state: stateData.state || "",
              });
            }

            if (e.seriesOptions) return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const chart = this as any;
            chart.showLoading("Carregando...");

            // Handler do Highcharts é síncrono — a carga assíncrona roda numa função interna
            async function loadStateDrilldown() {
              try {
                const [geoRes, citiesRes] = await Promise.all([
                  fetch(`/maps/${stateKey}.json`),
                  fetch(`/api/locales?state=${stateAbbr}`),
                ]);
                if (!geoRes.ok) throw new Error(`GeoJSON ${stateKey}: ${geoRes.status}`);

                const geoJson: { mapData?: Record<string, unknown>[] } = await geoRes.json();
                const citiesData: DrilldownCity[] = citiesRes.ok ? await citiesRes.json() : [];

                const cityMapData = geoJson.mapData ?? [];
                cityMapData.forEach((city) => {
                  const codIbge = Number(String(city["name"]).replace("mun_", ""));
                  const locale = citiesData.find((c) => c.cod_ibge === codIbge);
                  const hasPlan = locale?.hasPlan ?? false;

                  city["isDrill"] = true;
                  city["humanName"] = locale?.name ?? String(city["name"]);
                  city["planUrl"] = locale?.planUrl ?? null;
                  city["isLaw"] = locale?.isLaw ?? false;
                  city["value"] = hasPlan ? 100 : 0;
                });

                chart.hideLoading();
                chart.addSeriesAsDrilldown(e.point, {
                  name: stateData?.name ?? stateAbbr ?? "",
                  data: cityMapData,
                  joinBy: "id",
                });

                chart.setTitle(null, {
                  text: stateData?.name ?? stateAbbr ?? "",
                  align: "right",
                  style: {
                    fontSize: "1rem",
                    color: "var(--primary, #f25d27)",
                    fontWeight: "700",
                  },
                });
              } catch (err) {
                console.error("[MapaBrasil] Erro ao carregar mapa do estado:", err);
                chart.hideLoading();
              }
            }

            loadStateDrilldown();
          },
          drillup() {
            setIsDrilldown(false);
            setCurrentState(null);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any).setTitle(null, { text: "" });
          },
        },
      },
      title: { text: "" },
      subtitle: { text: "" },
      mapNavigation: {
        enabled: true,
        buttonOptions: { verticalAlign: "bottom" },
      },
      legend: {
        enabled: true,
        layout: "horizontal",
        align: "left",
        verticalAlign: "bottom",
        itemStyle: {
          fontSize: "12px",
          color: "var(--foreground, #444525)",
          fontWeight: "400",
        },
      },
      colorAxis: {
        dataClasses: [
          { to: 0.5, color: MAP_COLORS.none, name: "Sem plano" },
          { from: 0.5, to: 1.5, color: MAP_COLORS.inProgress, name: "Em elaboração / Lei" },
          { from: 1.5, color: MAP_COLORS.approved, name: "Aprovado" },
        ],
      },
      tooltip: {
        useHTML: true,
        followPointer: false,
        style: { pointerEvents: "auto", textAlign: "center", fontSize: "13px" },
        formatter(this: Record<string, unknown>) {
          const point = this["point"] as Record<string, unknown>;
          const isDrill = Boolean(point["isDrill"]);

          if (isDrill) {
            const humanName = String(point["humanName"] ?? point["name"]);
            const planUrl = point["planUrl"] as string | null;
            const isLaw = Boolean(point["isLaw"]);

            if (planUrl) {
              const linkText = isLaw ? "↓ Baixar Lei" : "↓ Baixar Plano";
              return `<strong>${humanName}</strong><br>
                <a href="${planUrl}" target="_blank" rel="noopener noreferrer nofollow"
                   style="color:var(--primary,#f25d27);font-weight:600;">
                  ${linkText}
                </a>`;
            }
            return `<strong>${humanName}</strong>`;
          }

          // Nível estado
          const name = String(point["name"] ?? "");
          const total = Number(point["totalPlans"] ?? 0);
          const planUrl = point["planUrl"] as string | null;
          const isDF = Boolean(point["isDF"]);

          let html = `<strong>${name}</strong><br>${total} plano${total === 1 ? "" : "s"} ${total === 1 ? "municipal" : "municipais"}`;
          if (planUrl) {
            html += `<br><a href="${planUrl}" target="_blank" rel="noopener noreferrer nofollow"
              style="color:var(--primary,#f25d27);font-weight:600;">
              ↓ Baixar Plano ${isDF ? "Distrital" : "Estadual"}
            </a>`;
          }
          return html;
        },
      },
      series: [
        {
          joinBy: ["hc-key", "hc-key"],
          data: mapData,
          name: "Brasil",
          states: { hover: { color: MAP_COLORS.hover } },
          dataLabels: { enabled: false },
        },
      ],
      drilldown: { activeAxisLabelStyle: { textDecoration: "none" } },
      credits: { enabled: false },
    });
  }, [statesSummary]);

  /**
   * Sincronização de hcLoaded na remontagem do componente.
   *
   * O <Script> do Next.js (strategy="afterInteractive") não re-dispara onLoad
   * para scripts que já estão no DOM de uma montagem anterior. Sem isso,
   * hcLoaded ficaria preso em false eternamente na segunda (e subsequentes)
   * montagens — causando o skeleton de "Carregando mapa..." infinito.
   *
   * Segurança contra volta rápida (antes do HC ter carregado):
   *   - Se window.Highcharts ainda não existe, o effect é no-op e o onLoad
   *     do <Script> cuida do caso normalmente.
   *   - O guard `!hcLoaded` via setHcLoaded é idempotente (React bate shallow
   *     equality em booleans, não re-renderiza se já for true).
   */
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.Highcharts &&
      window.Highcharts.maps?.["countries/br/br-all"]
    ) {
      setHcLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intencional: roda só na montagem para detectar HC já presente

  useEffect(() => {
    if (hcLoaded) {
      initChart();
    }
    return () => {
      if (chartRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (chartRef.current as any).destroy?.();
        chartRef.current = null;
      }
    };
  }, [hcLoaded, initChart]);

  return (
    <div className="relative">
      {/* Scripts Highcharts Maps — carregados uma vez, em sequência via unpkg CDN */}
      <Script
        src="https://unpkg.com/highcharts@10.0.0/highmaps.js"
        strategy="afterInteractive"
        onLoad={() => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/highcharts@10.0.0/modules/drilldown.js";
          script.onload = () => {
            const mapScript = document.createElement("script");
            mapScript.src =
              "https://unpkg.com/@highcharts/map-collection@2.0.0/countries/br/br-all.js";
            mapScript.onload = () => setHcLoaded(true);
            document.head.appendChild(mapScript);
          };
          document.head.appendChild(script);
        }}
      />

      {/* Controles do mapa */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          {isDrilldown
            ? `Visualizando municípios de ${currentState?.name || ""}`
            : "Clique em um estado para ver os planos municipais"}
        </p>
        {isDrilldown && currentState && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                router.replace(
                  `?tab=estaduais&location_id=${currentState.id}#consulta-publica`,
                  { scroll: false }
                );
              }}
              className="text-sm font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-md shadow hover:bg-primary/95 transition-colors cursor-pointer"
            >
              Ver como lista
            </button>
            <button
              onClick={() => {
                if (chartRef.current) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (chartRef.current as any).drillUp?.();
                }
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              ← Voltar ao Brasil
            </button>
          </div>
        )}
      </div>

      {/* Container do mapa */}
      <div
        ref={containerRef}
        id="map-container"
        style={{ height: "520px", width: "100%" }}
        className="rounded-lg overflow-hidden"
      />

      {/* Skeleton enquanto o Highcharts carrega */}
      {!hcLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg"
          aria-label="Carregando mapa..."
        >
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Carregando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
}
