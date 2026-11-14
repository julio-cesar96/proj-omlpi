/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Highcharts from "highcharts/highmaps";
import "highcharts/modules/drilldown";
import brazilGeoJson from "@highcharts/map-collection/countries/br/br-all.geo.json";
import type { StateMapSummary } from "./MapaBrasil";

/**
 * MapaBrasilChart — Client Component
 *
 * Componente interno do mapa interativo do Brasil com Highcharts Maps empacotado via npm.
 * Carregado sob demanda via dynamic import e IntersectionObserver pelo wrapper MapaBrasil.
 */

// Cores do mapa — alinhadas com tokens do design (theme.css)
const MAP_COLORS = {
  approved: "#009045",       // --secondary: verde = aprovado
  inProgress: "#f25d27",     // --primary: laranja = em elaboração / lei
  none: "#e8f0e8",           // branco-esverdeado sutil para "sem plano"
  hover: "#444525",          // --foreground: escuro no hover
  border: "#ffffff",
} as const;

interface MapaBrasilChartProps {
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

export function MapaBrasilChart({ statesSummary }: MapaBrasilChartProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);
  const [isDrilldown, setIsDrilldown] = useState(false);
  const [currentState, setCurrentState] = useState<{ id: number; name: string; state: string } | null>(null);

  const initChart = useCallback(() => {
    if (!containerRef.current) return;

    if (chartRef.current) {
      (chartRef.current as any).destroy?.();
      chartRef.current = null;
    }

    const H = Highcharts;
    const mapData = H.geojson(brazilGeoJson);

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
        formatter(this: any) {
          const point = this.point || {};
          const isDrill = Boolean(point.isDrill);

          if (isDrill) {
            const humanName = String(point.humanName ?? point.name);
            const planUrl = point.planUrl as string | null;
            const isLaw = Boolean(point.isLaw);

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
          const name = String(point.name ?? "");
          const total = Number(point.totalPlans ?? 0);
          const planUrl = point.planUrl as string | null;
          const isDF = Boolean(point.isDF);

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

  useEffect(() => {
    initChart();
    return () => {
      if (chartRef.current) {
        (chartRef.current as any).destroy?.();
        chartRef.current = null;
      }
    };
  }, [initChart]);

  return (
    <div className="relative">
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
    </div>
  );
}
