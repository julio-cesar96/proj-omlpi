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
 * Clique num estado → navega para ?tab=municipais&location_id=<strapi_id>
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
      item["stateAbbr"] = stateAbbr;
      item["value"] = status === "approved" ? 2 : status === "inProgress" ? 1 : 0;
    });

    chartRef.current = H.mapChart(containerRef.current, {
      chart: {
        backgroundColor: "rgba(0,0,0,0)",
        style: { fontFamily: "var(--font-body, sans-serif)" },
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
                const stateAbbr = point["stateAbbr"] as string | undefined;
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
      credits: { enabled: false },
    });
  }, [stateLocales, cityLocalesByState, router]);

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
          const mapScript = document.createElement("script");
          mapScript.src =
            "https://unpkg.com/@highcharts/map-collection@2.0.0/countries/br/br-all.js";
          mapScript.onload = () => setHcLoaded(true);
          document.head.appendChild(mapScript);
        }}
      />

      {/* Controles do mapa */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          Clique em um estado para ver os planos municipais
        </p>
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
