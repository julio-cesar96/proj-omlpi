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

/**
 * Valida se um locationId existe na lista de locales do Strapi.
 *
 * Regra de segurança: se a lista estiver vazia (falha de rede em /locales),
 * retorna `true` para não bloquear todas as chamadas — a Opção A (try/catch
 * com mensagem amigável) atua como rede de segurança nesse cenário.
 */
function isLocaleValid(
  locationId: number,
  locales: StrapiLocale[]
): boolean {
  if (locales.length === 0) {
    // Lista vazia = /locales falhou → não temos como validar → deixar passar
    return true;
  }
  return locales.some((l) => l.id === locationId);
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
  // Opção A: flag para exibir mensagem amigável ao usuário em caso de erro
  let dataFetchError = false;

  // Opção B: valida locale_id antes de chamar /data/compare ou /data/historical.
  // Se a lista de locales estiver vazia (falha de rede), isLocaleValid retorna true
  // e a Opção A (try/catch) age como rede de segurança.
  const localeIsKnown = isLocaleValid(locationId, locales);

  if (!localeIsKnown) {
    // locale_id não existe na lista → não disparar chamada, já sinalizar ausência de dados
    console.warn(
      `[PainelNacional] locale_id=${locationId} não encontrado na lista de locales. ` +
        "Chamada a /data/compare ou /data/historical suprimida para evitar 500 do backend."
    );
  } else {
    try {
      if (mode === "historico") {
        const res = await getHistoricalData(locationId, activeAreaId);
        historicalData = res?.historical?.[0] || null;
        if (historicalData) {
          localeName = historicalData.name;
          localeType = historicalData.type;
        }
      } else {
        const res = await getCompareData(locationId);
        compareData = res?.comparison || null;
        if (compareData && compareData.length > 0) {
          const mainLoc = compareData[compareData.length - 1];
          localeName = mainLoc.name;
          localeType = mainLoc.type;
        }
      }
    } catch (error) {
      // Opção A: captura erros residuais (ex: 500 do backend para locale válido no Strapi
      // mas sem dados no omlpi-api). Sinaliza para exibir mensagem amigável ao usuário.
      console.error("[PainelNacional] Erro ao carregar dados:", error);
      dataFetchError = true;
    }
  }

  const hasData = mode === "historico" ? !!historicalData : (!!compareData && compareData.length > 0);
  // Mostra mensagem amigável se: locale inválido OU erro de fetch (Opção A + B unificados)
  const showUnavailableMessage = !localeIsKnown || dataFetchError;

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
      {showUnavailableMessage ? (
        // Opção A: mensagem amigável para erro de fetch residual (500 do backend)
        // Opção B: mesma mensagem para locale_id inválido (suprimido antes da chamada)
        <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
          <p className="font-semibold">Dados não disponíveis para esta localidade.</p>
          <p className="text-xs mt-1">
            Esta localidade pode não possuir dados de comparação ou série histórica no sistema.
          </p>
        </div>
      ) : !hasData ? (
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
