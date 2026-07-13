"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StrapiLocale } from "@/lib/strapi";

/**
 * MapaBrasil — Client Component
 *
 * Mapa interativo do Brasil com Highcharts Maps (licença não-comercial).
 * Nível estado:
 *   - Cor por status do plano estadual (3 categorias fixas do design)
 *   - Tooltip: nome + contagem de planos municipais + link PDF estadual (se houver)
 * Nível cidade (drilldown):
 *   - Fetch de /api/maps/br-XX ao clicar num estado
 *   - Cor por status do plano municipal
 *   - Tooltip: nome + link "Baixar Plano" (se houver)
 *   - URL do PDF: plan.url DIRETAMENTE — sem concatenar base URL
 *
 * ⚠ Bug conhecido: se plan.url vier com barra dupla da origem, é limitação
 *   de backend — não tratar aqui, documentado em docs/progresso/.
 */

// Cores do mapa — alinhadas com tokens do design (theme.css)
const MAP_COLORS = {
  approved: "#17a649",       // --secondary: verde = aprovado
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

interface MapaBrasilProps {
  locales: StrapiLocale[];
}

// Mapa de abreviação de estado → hc-key do Highcharts
const STATE_TO_HCKEY: Record<string, string> = {
  AC: "br-ac", AL: "br-al", AM: "br-am", AP: "br-ap", BA: "br-ba",
  CE: "br-ce", DF: "br-df", ES: "br-es", GO: "br-go", MA: "br-ma",
  MG: "br-mg", MS: "br-ms", MT: "br-mt", PA: "br-pa", PB: "br-pb",
  PE: "br-pe", PI: "br-pi", PR: "br-pr", RJ: "br-rj", RN: "br-rn",
  RO: "br-ro", RR: "br-rr", RS: "br-rs", SC: "br-sc", SE: "br-se",
  SP: "br-sp", TO: "br-to",
};

function getLocaleStatus(locale: StrapiLocale | undefined, plansCount: number = 0): "approved" | "inProgress" | "none" {
  if (locale?.plan && !locale.hide_plan) {
    return locale.is_law ? "inProgress" : "approved";
  }
  if (plansCount > 0) return "inProgress";
  return "none";
}

export function MapaBrasil({ locales }: MapaBrasilProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);
  const [hcLoaded, setHcLoaded] = useState(false);
  const [isDrilldown, setIsDrilldown] = useState(false);

  // Indexa locales por estado para lookup rápido
  const stateLocales = locales.filter((l) => l.type === "state");
  const cityLocalesByState = locales.reduce<Record<string, StrapiLocale[]>>(
    (acc, l) => {
      if (l.type === "city" && l.state) {
        (acc[l.state] ??= []).push(l);
      }
      return acc;
    },
    {}
  );

  const initChart = useCallback(() => {
    if (!containerRef.current || !window.Highcharts) return;
    const H = window.Highcharts;
    const mapData = H.geojson(H.maps["countries/br/br-all"]);

    // Enriquece cada estado com dados de plano
    mapData.forEach((item: Record<string, unknown>) => {
      const properties = (item["properties"] as Record<string, unknown>) || {};
      const hcKey = properties["hc-key"] as string | undefined;
      const stateAbbr = properties["hc-a2"] as string | undefined;

      const statePlan = stateLocales.find((l) => l.state === stateAbbr);
      const cities = stateAbbr ? (cityLocalesByState[stateAbbr] ?? []) : [];
      const plansCount = cities.filter((c) => c.plan && !c.hide_plan).length;

      const status = getLocaleStatus(statePlan, plansCount);

      item["planStatus"] = status;
      item["planUrl"] = statePlan?.plan?.url ?? null;
      item["isDF"] = stateAbbr === "DF";
      item["totalPlans"] = plansCount;
      item["totalCities"] = cities.length;
      item["drilldown"] = hcKey;
      item["value"] = status === "approved" ? 2 : status === "inProgress" ? 1 : 0;
    });

    const isDrilldownRef = { current: false };

    chartRef.current = H.mapChart(containerRef.current, {
      chart: {
        backgroundColor: "rgba(0,0,0,0)",
        style: { fontFamily: "var(--font-body, sans-serif)" },
        events: {
          drilldown(e: Record<string, unknown>) {
            isDrilldownRef.current = true;
            setIsDrilldown(true);
            const chart = this as Record<string, unknown>;
            if (e.seriesOptions) return;

            const point = e.point as Record<string, unknown>;
            const stateKey = point["drilldown"] as string;
            const stateAbbr = Object.entries(STATE_TO_HCKEY).find(
              ([, v]) => v === stateKey
            )?.[0];
            const cities = stateAbbr ? (cityLocalesByState[stateAbbr] ?? []) : [];

            (chart as { showLoading: (s: string) => void }).showLoading("Carregando...");

            fetch(`/api/maps/${stateKey}`)
              .then((r) => r.json())
              .then((json) => {
                const cityMapData: Record<string, unknown>[] = json.mapData ?? [];
                cityMapData.forEach((city) => {
                  // name = "mun_3550308" → cod_ibge = 3550308
                  const codIbge = Number(
                    String(city["name"]).replace("mun_", "")
                  );
                  const locale = cities.find((c) => c.cod_ibge === codIbge);
                  const status = getLocaleStatus(locale);
                  city["humanName"] = locale?.name ?? String(city["name"]);
                  city["planStatus"] = status;
                  city["planUrl"] = locale?.plan?.url ?? null;
                  city["isLaw"] = locale?.is_law ?? false;
                  city["value"] = status === "approved" ? 2 : status === "inProgress" ? 1 : 0;
                });

                (chart as { hideLoading: () => void }).hideLoading();
                (chart as { addSeriesAsDrilldown: (p: unknown, s: unknown) => void })
                  .addSeriesAsDrilldown(e.point, {
                    name: String(point["name"]),
                    data: cityMapData,
                    joinBy: "id",
                  });

                // Atualiza subtitle com nome do estado
                (chart as { setTitle: (t: null, s: unknown) => void })
                  .setTitle(null, {
                    text: String(point["name"]),
                    align: "right",
                    style: {
                      fontSize: "1rem",
                      color: "var(--primary, #f25d27)",
                      fontWeight: "700",
                    },
                  });
              })
              .catch(() => {
                (chart as { hideLoading: () => void }).hideLoading();
              });
          },
          drillup() {
            isDrilldownRef.current = false;
            setIsDrilldown(false);
            (this as unknown as { setTitle: (t: null, s: unknown) => void })
              .setTitle(null, { text: "" });
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
          const isDrill = isDrilldownRef.current;

          if (isDrill) {
            const humanName = String(point["humanName"] ?? point["name"]);
            const planUrl = point["planUrl"] as string | null;
            const isLaw = Boolean(point["isLaw"]);
            if (planUrl) {
              return `<strong>${humanName}</strong><br>
                <a href="${planUrl}" target="_blank" rel="noopener noreferrer"
                   style="color:var(--primary,#f25d27);font-weight:600;">
                  ↓ Baixar ${isLaw ? "Lei" : "Plano"}
                </a>`;
            }
            return `<strong>${humanName}</strong><br><span style="color:var(--muted-foreground,#a49a87)">Sem plano</span>`;
          }

          // Nível estado
          const name = String(point["name"] ?? "");
          const total = Number(point["totalPlans"] ?? 0);
          const planUrl = point["planUrl"] as string | null;
          const isDF = Boolean(point["isDF"]);

          let html = `<strong>${name}</strong><br>${total} plano${total === 1 ? "" : "s"} municipal${total === 1 ? "" : "is"}`;
          if (planUrl) {
            html += `<br><a href="${planUrl}" target="_blank" rel="noopener noreferrer"
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
          point: {
            events: {
              click(this: Record<string, unknown>) {
                const point = this as Record<string, unknown>;
                const hcKey = point["drilldown"] as string | undefined;
                if (!hcKey) return;
                const stateAbbr = Object.entries(STATE_TO_HCKEY).find(
                  ([, v]) => v === hcKey
                )?.[0];
                if (stateAbbr) {
                  // Redireciona para aba municipais filtrando pelo estado
                  const stateLocale = stateLocales.find(
                    (l) => l.state === stateAbbr
                  );
                  if (stateLocale) {
                    router.replace(
                      `?tab=municipais&location_id=${stateLocale.id}#consulta-publica`,
                      { scroll: false }
                    );
                  }
                }
              },
            },
          },
        },
      ],
      drilldown: { activeAxisLabelStyle: { textDecoration: "none" } },
      credits: { enabled: false },
    });
  }, [stateLocales, cityLocalesByState, router]);

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
          // Aguarda o mapa do Brasil carregar antes de sinalizar pronto
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
            ? "Clique em uma cidade para ver os detalhes"
            : "Clique em um estado para ver as cidades"}
        </p>
        {isDrilldown && (
          <button
            onClick={() => {
              if (chartRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (chartRef.current as any).drillUp?.();
              }
            }}
            className="text-sm text-primary font-medium hover:underline"
          >
            ← Voltar ao Brasil
          </button>
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
