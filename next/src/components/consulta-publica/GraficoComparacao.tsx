/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Script from "next/script";
import type { OmlpiCompareLocale } from "@/lib/omlpi-api";

interface GraficoComparacaoProps {
  comparison: OmlpiCompareLocale[];
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

export function GraficoComparacao({ comparison, selectedAreaId }: GraficoComparacaoProps) {
  const [hcLoaded, setHcLoaded] = useState(false);
  
  const mainLocale = useMemo(() => {
    // No compare.js: locale() { return this.locales.comparison[this.locales.comparison.length - 1]; }
    return comparison[comparison.length - 1];
  }, [comparison]);

  // Filtra indicadores pertencentes à área selecionada
  const indicators = useMemo(() => {
    if (!mainLocale) return [];
    return mainLocale.indicators.filter((ind) => ind.area.id === selectedAreaId);
  }, [mainLocale, selectedAreaId]);

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

  // Anos disponíveis para o indicador selecionado
  const availableYears = useMemo(() => {
    if (!selectedIndicator || !selectedIndicator.values) return [];
    return [...new Set(selectedIndicator.values.map((v) => v.year))].sort((a, b) => b - a);
  }, [selectedIndicator]);

  const [selectedYear, setSelectedYear] = useState<number>(0); // 0 = todos

  // Reseta ano selecionado quando o indicador muda
  useEffect(() => {
    if (availableYears.length > 0) {
      // Se o ano anteriormente selecionado não existe no novo indicador, coloca no primeiro ano disponível ou todos
      if (selectedYear !== 0 && !availableYears.includes(selectedYear as any)) {
        setSelectedYear(0);
      }
    } else {
      setSelectedYear(0);
    }
  }, [availableYears, selectedYear]);

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

  // Element refs para os Highcharts
  const indicatorChartRef = useRef<HTMLDivElement>(null);
  const subindicatorChartRef = useRef<HTMLDivElement>(null);

  const chartInstance1 = useRef<any>(null);
  const chartInstance2 = useRef<any>(null);

  // Renderizar o gráfico principal do indicador
  useEffect(() => {
    if (!hcLoaded || !window.Highcharts || !selectedIndicator || !indicatorChartRef.current) return;

    const H = window.Highcharts;

    // Filtra os anos de categorias
    const categories = availableYears
      .filter((y) => (selectedYear ? y === selectedYear : true))
      .sort((a, b) => a - b);

    // Formata séries do indicador
    // Cada localidade comparada é uma série
    const seriesData = comparison
      .filter((locale) =>
        locale.indicators.some((ind) => ind.id === selectedIndicator.id)
      )
      .map((locale) => {
        const ind = locale.indicators.find((i) => i.id === selectedIndicator.id)!;
        const isPercentage = ind.is_percentage;
        
        // Mapeia os valores de cada ano presente na lista de categories
        const data = categories.map((catYear) => {
          const valObj = ind.values.find((v) => v.year === catYear);
          let y = 0;
          if (valObj) {
            y = valObj.value_relative !== null && valObj.value_relative !== undefined
              ? Number(valObj.value_relative)
              : Number(valObj.value_absolute);
          }
          return {
            y,
            isPercentage,
            year: catYear,
          };
        });

        return {
          name: locale.name,
          data,
          isPercentage,
        };
      });

    chartInstance1.current?.destroy();
    chartInstance1.current = H.chart(indicatorChartRef.current, {
      chart: {
        type: categories.length > 2 ? "line" : "column",
        backgroundColor: "rgba(0,0,0,0)",
        style: { fontFamily: "var(--font-body, sans-serif)" },
      },
      title: {
        text: selectedIndicator.description || selectedIndicator.name,
        style: { fontSize: "16px", fontWeight: "600", color: "var(--foreground)" },
      },
      subtitle: { text: null },
      xAxis: {
        categories: categories.map(String),
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
          return `<strong>${this.series.name} (${this.key})</strong><br/>
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
        filename: `Observa_${mainLocale?.name}_Indicador_${selectedIndicator.id}_Comparacao`,
      },
      series: seriesData,
    });

    return () => {
      chartInstance1.current?.destroy();
      chartInstance1.current = null;
    };
  }, [hcLoaded, selectedIndicator, selectedYear, availableYears, comparison, mainLocale]);

  // Renderizar o gráfico de subindicadores
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

    // Categorias são os itens da classificação (ex: Feminino, Masculino)
    const categories = selectedSubindicator.data.map((d) => d.description);

    // O ano a ser filtrado (default para o primeiro disponível do subindicador se não houver selectedYear)
    const subIndicatorYears = [...new Set(selectedSubindicator.data.flatMap((d) => d.values.map((v) => v.year)))]
      .sort((a, b) => b - a);
    const activeYear = selectedYear && subIndicatorYears.includes(selectedYear as any)
      ? selectedYear
      : subIndicatorYears[0] || 2019;

    // Cada localidade comparada é uma série
    const seriesData = comparison
      .map((locale) => {
        const ind = locale.indicators.find((i) => i.id === selectedIndicator.id);
        if (!ind) return null;

        const sub = ind.subindicators.find((s) => s.classification === selectedSubindicator.classification);
        if (!sub) return null;

        let isPercentage = false;

        const data = categories.map((catDesc) => {
          const subDataItem = sub.data.find((d) => d.description === catDesc);
          let y = 0;
          if (subDataItem) {
            isPercentage = !!subDataItem.is_percentage;
            const valObj = subDataItem.values.find((v) => v.year === activeYear);
            if (valObj) {
              y = valObj.value_relative !== null && valObj.value_relative !== undefined
                ? Number(valObj.value_relative)
                : Number(valObj.value_absolute);
            }
          }
          return {
            y,
            isPercentage,
          };
        });

        // Só retorna se tiver dados válidos
        if (data.every((d) => d.y === 0)) return null;

        return {
          name: locale.name,
          data,
          isPercentage,
        };
      })
      .filter(Boolean);

    chartInstance2.current?.destroy();
    chartInstance2.current = H.chart(subindicatorChartRef.current, {
      chart: {
        type: "column",
        backgroundColor: "rgba(0,0,0,0)",
        style: { fontFamily: "var(--font-body, sans-serif)" },
      },
      title: {
        text: selectedSubindicator.classification,
        style: { fontSize: "16px", fontWeight: "600", color: "var(--foreground)" },
      },
      subtitle: {
        text: `Ano de referência: ${activeYear}`,
        style: { fontSize: "12px", color: "var(--muted-foreground)" },
      },
      xAxis: {
        categories,
        labels: { style: { color: "var(--muted-foreground)" } },
      },
      yAxis: {
        min: 0,
        title: { text: null },
        labels: {
          formatter(this: any) {
            // Pega o primeiro item de percentagem do subindicador
            const isPct = selectedSubindicator.data[0]?.is_percentage;
            return formatSingleIndicatorValue(this.value, isPct);
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
        filename: `Observa_${mainLocale?.name}_Subindicador_${selectedSubindicator.classification}_Comparacao`,
      },
      series: seriesData,
    });

    return () => {
      chartInstance2.current?.destroy();
      chartInstance2.current = null;
    };
  }, [hcLoaded, selectedIndicator, selectedSubindicator, selectedYear, comparison, mainLocale]);

  if (!mainLocale) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nenhuma localidade selecionada ou dados de comparação vazios.
      </div>
    );
  }

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
          Selecione o Indicador para Comparar:
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
          {/* Barra de Filtros Internos do Gráfico (Ano) */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/60 pb-4">
            <div>
              <h4 className="font-bold text-foreground">Visualização</h4>
              <p className="text-xs text-muted-foreground">Fonte: {selectedIndicator.base}</p>
            </div>

            {availableYears.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Filtrar Ano:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-background border border-border rounded-lg text-xs font-medium px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                >
                  <option value={0}>Todos os anos</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                  Desagregações / Subindicadores:
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
