/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Script from "next/script";
import type { OmlpiHistoricalLocale } from "@/lib/omlpi-api";

interface GraficoHistoricoProps {
  historicalData: OmlpiHistoricalLocale;
  selectedAreaId: number;
}

const CHART_COLORS = [
  "#251351", // Roxo escuro
  "#114B5F", // Azul esverdeado
  "#028090", // Ciano escuro
  "#A85751", // Vermelho terroso
  "#C97B84", // Rosa queimado
  "#F45B69", // Rosa vibrante
  "#91A6FF", // Azul claro
  "#040926", // Azul quase preto
];

function formatSingleIndicatorValue(val: number, isPercentage: boolean | string | undefined) {
  if (val == null || isNaN(val)) return "—";
  const formatted = val.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return isPercentage ? `${formatted}%` : formatted;
}

export function GraficoHistorico({ historicalData, selectedAreaId }: GraficoHistoricoProps) {
  const [hcLoaded, setHcLoaded] = useState(false);

  // Filtra indicadores pertencentes à área selecionada
  const indicators = useMemo(() => {
    if (!historicalData || !historicalData.indicators) return [];
    return historicalData.indicators.filter((ind) => ind.area.id === selectedAreaId);
  }, [historicalData, selectedAreaId]);

  const [selectedIndicatorId, setSelectedIndicatorId] = useState<number | null>(null);

  // Sincroniza indicador selecionado ao trocar de área
  useEffect(() => {
    if (indicators.length > 0) {
      setSelectedIndicatorId(indicators[0].id);
    } else {
      setSelectedIndicatorId(null);
    }
  }, [indicators]);

  const selectedIndicator = useMemo(() => {
    return indicators.find((ind) => ind.id === selectedIndicatorId) || null;
  }, [indicators, selectedIndicatorId]);

  // Subindicadores disponíveis para o indicador selecionado
  const subindicators = useMemo(() => {
    return selectedIndicator?.subindicators || [];
  }, [selectedIndicator]);

  const [selectedSubindicatorClass, setSelectedSubindicatorClass] = useState<string>("");

  useEffect(() => {
    if (subindicators.length > 0) {
      setSelectedSubindicatorClass(subindicators[0].classification);
    } else {
      setSelectedSubindicatorClass("");
    }
  }, [subindicators]);

  const selectedSubindicator = useMemo(() => {
    return subindicators.find((sub) => sub.classification === selectedSubindicatorClass) || null;
  }, [subindicators, selectedSubindicatorClass]);

  // Refs de elemento para gráficos
  const indicatorChartRef = useRef<HTMLDivElement>(null);
  const subindicatorChartRef = useRef<HTMLDivElement>(null);

  const chartInstance1 = useRef<any>(null);
  const chartInstance2 = useRef<any>(null);

  // Renderizar o gráfico do indicador principal
  useEffect(() => {
    if (!hcLoaded || !window.Highcharts || !selectedIndicator || !indicatorChartRef.current) return;

    const H = window.Highcharts;

    // Categorias são os anos da série histórica
    const values = selectedIndicator.values || [];
    // Ordena de forma cronológica (antigo para novo)
    const sortedValues = [...values].sort((a, b) => a.year - b.year);
    const categories = sortedValues.map((v) => String(v.year));

    // Decisão da série com base no número de categorias
    const isLine = categories.length > 2;

    let series: any[] = [];
    if (isLine) {
      // Formato para gráfico de Linha
      series = [
        {
          name: selectedIndicator.description || selectedIndicator.name,
          isPercentage: selectedIndicator.is_percentage,
          data: sortedValues.map((v) => ({
            y: v.value_relative !== null && v.value_relative !== undefined
              ? Number(v.value_relative)
              : Number(v.value_absolute),
            isPercentage: selectedIndicator.is_percentage,
          })),
        },
      ];
    } else {
      // Formato para gráfico de Coluna (quando anos <= 2)
      // Cada ano vira uma série separada (de acordo com logic original formatDataToBarsCharts)
      series = sortedValues.map((v) => ({
        name: String(v.year),
        isPercentage: selectedIndicator.is_percentage,
        data: [
          {
            y: v.value_relative !== null && v.value_relative !== undefined
              ? Number(v.value_relative)
              : Number(v.value_absolute),
            isPercentage: selectedIndicator.is_percentage,
          },
        ],
      }));
    }

    chartInstance1.current?.destroy();
    chartInstance1.current = H.chart(indicatorChartRef.current, {
      chart: {
        type: isLine ? "line" : "column",
        backgroundColor: "rgba(0,0,0,0)",
        style: { fontFamily: "var(--font-body, sans-serif)" },
      },
      title: {
        text: selectedIndicator.description || selectedIndicator.name,
        style: { fontSize: "16px", fontWeight: "600", color: "var(--foreground)" },
      },
      subtitle: { text: null },
      xAxis: {
        categories: isLine ? categories : [""], // Sem label extra para coluna única
        crosshair: true,
        labels: { style: { color: "var(--muted-foreground)" } },
      },
      yAxis: {
        min: 0,
        title: { text: null },
        labels: {
          formatter(this: any) {
            return formatSingleIndicatorValue(this.value, selectedIndicator.is_percentage);
          },
          style: { color: "var(--muted-foreground)" },
        },
      },
      tooltip: {
        shared: false,
        formatter(this: any) {
          const yearLabel = isLine ? this.key : this.series.name;
          return `<strong>${yearLabel}</strong><br/>
                  Valor: <span style="color:var(--primary,#f25d27);font-weight:600;">
                    ${formatSingleIndicatorValue(this.y, this.series.userOptions.isPercentage)}
                  </span>`;
        },
      },
      colors: CHART_COLORS,
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
        },
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            formatter(this: any) {
              return formatSingleIndicatorValue(this.y, this.point.isPercentage);
            },
            style: { textOutline: "none", fontSize: "11px" },
          },
        },
      },
      credits: { enabled: false },
      exporting: {
        enabled: true,
        filename: `Observa_${historicalData.name}_Indicador_${selectedIndicator.id}_Historico`,
      },
      series,
    });

    return () => {
      chartInstance1.current?.destroy();
      chartInstance1.current = null;
    };
  }, [hcLoaded, selectedIndicator, historicalData]);

  // Renderizar o gráfico de subindicadores (horizontal bar)
  useEffect(() => {
    if (
      !hcLoaded ||
      !window.Highcharts ||
      !selectedIndicator ||
      !selectedSubindicator ||
      !subindicatorChartRef.current
    )
      return;

    const H = window.Highcharts;

    // Eixo Y (categorias do xAxis no gráfico de barras horizontal) são os Anos
    const firstItem = selectedSubindicator.data[0];
    if (!firstItem || !firstItem.values) return;

    // Ordena os anos de forma cronológica
    const categories = [...firstItem.values]
      .sort((a, b) => a.year - b.year)
      .map((v) => String(v.year));

    // Cada item da desagregação (ex: Feminino, Masculino) é uma série
    const seriesData = selectedSubindicator.data
      .map((subDataItem) => {
        const sortedSubVals = [...subDataItem.values].sort((a, b) => a.year - b.year);
        const data = sortedSubVals.map((v) => ({
          y: v.value_relative !== null && v.value_relative !== undefined
            ? Number(v.value_relative)
            : Number(v.value_absolute),
          isPercentage: subDataItem.is_percentage,
        }));

        return {
          name: subDataItem.description,
          isPercentage: subDataItem.is_percentage,
          data,
        };
      })
      .filter(Boolean);

    chartInstance2.current?.destroy();
    chartInstance2.current = H.chart(subindicatorChartRef.current, {
      chart: {
        type: "bar", // Gráfico horizontal!
        backgroundColor: "rgba(0,0,0,0)",
        style: { fontFamily: "var(--font-body, sans-serif)" },
      },
      title: {
        text: selectedSubindicator.classification,
        style: { fontSize: "16px", fontWeight: "600", color: "var(--foreground)" },
      },
      subtitle: {
        text: selectedIndicator.description || selectedIndicator.name,
        style: { fontSize: "12px", color: "var(--muted-foreground)" },
      },
      xAxis: {
        categories,
        title: { text: null },
        labels: { style: { color: "var(--muted-foreground)" } },
      },
      yAxis: {
        min: 0,
        title: { text: null },
        labels: {
          formatter(this: any) {
            return formatSingleIndicatorValue(this.value, firstItem.is_percentage);
          },
          style: { color: "var(--muted-foreground)" },
        },
      },
      tooltip: {
        shared: false,
        formatter(this: any) {
          return `<strong>${this.series.name} (${this.key})</strong><br/>
                  Valor: <span style="color:var(--primary,#f25d27);font-weight:600;">
                    ${formatSingleIndicatorValue(this.y, this.series.userOptions.isPercentage)}
                  </span>`;
        },
      },
      colors: CHART_COLORS,
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            formatter(this: any) {
              return formatSingleIndicatorValue(this.y, this.point.isPercentage);
            },
            style: { textOutline: "none", fontSize: "11px" },
          },
        },
      },
      credits: { enabled: false },
      exporting: {
        enabled: true,
        filename: `Observa_${historicalData.name}_Subindicador_${selectedSubindicator.classification}_Historico`,
      },
      series: seriesData,
    });

    return () => {
      chartInstance2.current?.destroy();
      chartInstance2.current = null;
    };
  }, [hcLoaded, selectedIndicator, selectedSubindicator, historicalData]);

  return (
    <div className="space-y-8">
      {/* Script do Highcharts */}
      <Script
        src="https://unpkg.com/highcharts@10.0.0/highmaps.js"
        strategy="afterInteractive"
        onLoad={() => {
          const exportScript = document.createElement("script");
          exportScript.src = "https://unpkg.com/highcharts@10.0.0/modules/exporting.js";
          exportScript.onload = () => setHcLoaded(true);
          document.head.appendChild(exportScript);
        }}
      />

      {/* Seletores de Indicadores */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground block">
          Selecione o Indicador para Ver a Série Histórica:
        </label>
        {indicators.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Nenhum indicador nesta área.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {indicators.map((ind) => (
              <button
                key={ind.id}
                onClick={() => setSelectedIndicatorId(ind.id)}
                className={[
                  "px-4 py-2 rounded-xl text-xs font-semibold border transition-all text-left max-w-sm",
                  selectedIndicatorId === ind.id
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/50",
                ].join(" ")}
              >
                {ind.description || ind.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedIndicator && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="border-b border-border/60 pb-4">
            <h4 className="font-bold text-foreground">Série Histórica</h4>
            <p className="text-xs text-muted-foreground">Fonte: {selectedIndicator.base}</p>
          </div>

          {/* Container do Gráfico Principal */}
          <div className="relative">
            <div ref={indicatorChartRef} style={{ minHeight: "350px" }} />
            {!hcLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/65 rounded-xl">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Subindicadores / Desagregações */}
          {subindicators.length > 0 && (
            <div className="pt-6 border-t border-border/60 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground block">
                  Desagregações / Subindicadores (Histórico):
                </label>
                <div className="flex flex-wrap gap-2">
                  {subindicators.map((sub) => (
                    <button
                      key={sub.classification}
                      onClick={() => setSelectedSubindicatorClass(sub.classification)}
                      className={[
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                        selectedSubindicatorClass === sub.classification
                          ? "bg-foreground text-background border-foreground font-semibold"
                          : "bg-muted text-muted-foreground hover:bg-muted/70 border-transparent",
                      ].join(" ")}
                    >
                      {sub.classification}
                    </button>
                  ))}
                </div>
              </div>

              {/* Container do Gráfico de Subindicadores */}
              <div className="relative border border-border/50 rounded-xl p-4 bg-muted/20">
                <div ref={subindicatorChartRef} style={{ minHeight: "320px" }} />
                {!hcLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/65 rounded-xl">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
