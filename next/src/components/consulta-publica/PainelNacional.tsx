import React, { Suspense } from "react";
import { getCompareData, getHistoricalData, getAreas } from "@/lib/omlpi-api";
import type { StrapiLocale } from "@/lib/strapi";
import { NacionalControls } from "./NacionalControls";
import { GraficoComparacao } from "./GraficoComparacao";
import { GraficoHistorico } from "./GraficoHistorico";
import { LocalidadeBusca } from "./LocalidadeBusca";

interface PainelNacionalProps {
  locationId: number | undefined;
  areaId: number | undefined;
  mode: "comparacao" | "historico";
  locales: StrapiLocale[];
}

export async function PainelNacional({
  locationId,
  areaId,
  mode,
  locales,
}: PainelNacionalProps) {
  // Busca áreas (eixos temáticos)
  const areas = await getAreas().catch(() => []);
  const activeAreaId = areaId || (areas[0]?.id ?? 3); // Saúde (3) por padrão se não houver

  if (!locationId) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-xl">
          🔍
        </div>
        <h3 className="font-semibold text-foreground">Comparação e Série Histórica</h3>
        <p className="text-sm text-muted-foreground">
          Selecione uma localidade para iniciar a comparação nacional ou visualizar a série histórica de indicadores.
        </p>
        <Suspense fallback={null}>
          <div className="flex justify-center">
            <LocalidadeBusca locales={locales} placeholder="Buscar município ou estado..." />
          </div>
        </Suspense>
      </div>
    );
  }

  // Carrega dados de acordo com o modo
  let compareData = null;
  let historicalData = null;
  let localeName = "";
  let localeType = "";

  try {
    if (mode === "historico") {
      const res = await getHistoricalData(locationId, activeAreaId);
      historicalData = res.historical?.[0] || null;
      if (historicalData) {
        localeName = historicalData.name;
        localeType = historicalData.type;
      }
    } else {
      const res = await getCompareData(locationId);
      compareData = res.comparison || null;
      if (compareData && compareData.length > 0) {
        const mainLoc = compareData[compareData.length - 1];
        localeName = mainLoc.name;
        localeType = mainLoc.type;
      }
    }
  } catch (error) {
    console.error("[PainelNacional] Erro ao carregar dados:", error);
  }

  const hasData = mode === "historico" ? !!historicalData : (!!compareData && compareData.length > 0);

  return (
    <div className="space-y-8">
      {/* Controles unificados (Header + Switcher de modo + Seletor de Eixo) */}
      <NacionalControls
        locationId={locationId}
        localeName={localeName || "Localidade não encontrada"}
        localeType={localeType || "—"}
        currentMode={mode}
        currentAreaId={activeAreaId}
        areas={areas}
        locales={locales}
      />

      {/* Gráficos */}
      {!hasData ? (
        <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
          <p className="font-semibold">Nenhum dado retornado para esta localidade.</p>
          <p className="text-xs mt-1">Verifique se a localidade selecionada possui planos/dados no sistema.</p>
        </div>
      ) : mode === "historico" && historicalData ? (
        <GraficoHistorico historicalData={historicalData} selectedAreaId={activeAreaId} />
      ) : compareData ? (
        <GraficoComparacao comparison={compareData} selectedAreaId={activeAreaId} />
      ) : null}
    </div>
  );
}
