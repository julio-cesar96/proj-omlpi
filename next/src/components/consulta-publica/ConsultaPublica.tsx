import { Suspense } from "react";
import { getStrapiLocales, type StrapiLocale } from "@/lib/strapi";
import { TABS, type TabId } from "./tabs-config";
import { TabsNav } from "./TabsNav";

import { MapaBrasil, type StateMapSummary } from "./MapaBrasil";
import { PainelMunicipal } from "./PainelMunicipal";
import { PainelEstadual } from "./PainelEstadual";
import { LocalidadeBusca } from "./LocalidadeBusca";
import { UploadPlano } from "./UploadPlano";

/**
 * ConsultaPublica — Server Component
 *
 * Orquestrador da seção de Consulta Pública.
 * Lê searchParams do servidor, decide qual painel renderizar.
 * Estado da consulta (tab, location_id, area) vive na URL — não em localStorage.
 *
 * Tabs implementadas nesta fase (3a):
 *   mapa       → MapaBrasil (Highcharts Maps)
 *   municipais → PainelMunicipal (GET /data)
 *   estaduais  → PainelEstadual (grid de estados + PainelMunicipal se selecionado)
 *
 * Tabs em placeholder (Fase 3b):
 *   monitoramento → MonitoramentoPlaceholder
 */

interface ConsultaPublicaProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function parseTab(raw: string | string[] | undefined): TabId {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const validIds = TABS.map((t) => t.id) as readonly string[];
  return (validIds.includes(value as string) ? value : "mapa") as TabId;
}

function parseId(raw: string | string[] | undefined): number | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  return value && !isNaN(n) && n > 0 ? n : undefined;
}

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://omlpi-strapi.rnpiobserva.org.br";

function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_BASE}${url}`;
}

function getLocaleStatus(
  locale: StrapiLocale | undefined,
  plansCount: number = 0
): "approved" | "inProgress" | "none" {
  if (locale?.plan && !locale.hide_plan) {
    return locale.is_law ? "inProgress" : "approved";
  }
  if (plansCount > 0) return "inProgress";
  return "none";
}

export async function ConsultaPublica({ searchParams }: ConsultaPublicaProps) {
  const tab = parseTab(searchParams["tab"]);
  const locationId = parseId(searchParams["location_id"]);
  const areaId = parseId(searchParams["area"]);

  // Locales carregados no servidor com cache de 1 hora
  let locales = await getStrapiLocales({ _limit: -1 }).catch((err) => {
    console.error("[ConsultaPublica] Erro ao buscar locales do Strapi:", err);
    return [];
  });

  // Filtra apenas municípios e estados (excluindo regiões e país)
  locales = locales.filter(
    (l) => l.type === "city" || l.type === "state"
  );

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

  // Resume os 27 estados para o mapa inicial (payload RSC leve: ~2KB em vez de 2.48MB)
  const statesSummary: StateMapSummary[] = stateLocales.map((statePlan) => {
    const stateAbbr = statePlan.state || "";
    const cities = cityLocalesByState[stateAbbr] ?? [];
    const plansCount = cities.filter((c) => c.plan && !c.hide_plan).length;
    const status = getLocaleStatus(statePlan, plansCount);
    return {
      id: statePlan.id,
      name: statePlan.name,
      state: stateAbbr,
      status,
      planUrl: toAbsoluteUrl(statePlan.plan?.url),
      totalPlans: plansCount,
      totalCities: cities.length,
      isDF: stateAbbr === "DF",
    };
  });

  const selectedLocale = locationId
    ? locales.find((l) => l.id === locationId)
    : undefined;

  // Quando um estado é selecionado, prepara os municípios com plano daquele estado
  const citiesWithPlan =
    selectedLocale && selectedLocale.type === "state"
      ? (cityLocalesByState[selectedLocale.state || ""] ?? [])
          .filter((c) => c.plan && !c.hide_plan)
          .map((c) => ({
            id: c.id,
            name: c.name,
            isLaw: Boolean(c.is_law),
            planUrl: toAbsoluteUrl(c.plan?.url),
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
      : undefined;

  return (
    <section
      id="consulta-publica"
      aria-label="Consulta Pública"
      className="py-16 lg:py-24 bg-background"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        {/* Cabeçalho da seção */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-0.5 bg-primary rounded-full" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Consulte os planos
            </span>
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Planos pela Primeira Infância
          </h2>
          <p className="text-muted-foreground max-w-2xl">
             Consulte os planos cadastrados a partir de levantamento realizado em parceria Subsecretaria da Política Nacional Integrada pela Primeira Infância (SNPPI/MEC) em 2026, e conheça experiências de diferentes localidades. 
          <br />
          O Observa convida municípios e demais instituições responsáveis pelos Planos pela Primeira Infância a compartilhar seus documentos, ampliando o acervo e fortalecendo a memória das políticas públicas para a primeira infância no Brasil.
          </p>
        </div>

        {/* Tabs — client component envolto em Suspense (usa useSearchParams) */}
        <Suspense
          fallback={
            <div className="h-12 bg-muted/50 rounded animate-pulse mb-6" />
          }
        >
          <TabsNav currentTab={tab} />
        </Suspense>

        {/* Conteúdo da aba ativa */}
        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="mt-8"
        >
          {tab === "mapa" && (
            <div className="grid lg:grid-cols-[1fr_320px] gap-8">
              <div>
                <MapaBrasil statesSummary={statesSummary} />
              </div>

              {/* Painel lateral: busca + upload */}
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Buscar localidade
                  </h3>
                  <Suspense fallback={null}>
                    <LocalidadeBusca
                      placeholder="Município ou estado..."
                    />
                  </Suspense>
                  <p className="text-xs text-muted-foreground">
                    Selecione um município ou estado para ver os dados detalhados.
                  </p>
                </div>

                <div id="upload-plano" className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Enviar plano
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Contribua com a base de dados enviando o plano do seu município.
                    </p>
                  </div>
                  <UploadPlano />
                </div>
              </div>
            </div>
          )}

          {tab === "municipais" && (
            <div>
              {locationId ? (
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      <div className="h-10 bg-muted/50 rounded animate-pulse w-64" />
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-40 bg-muted/50 rounded-xl animate-pulse"
                          />
                        ))}
                      </div>
                    </div>
                  }
                >
                  <PainelMunicipal
                    locationId={locationId}
                    areaId={areaId}
                    selectedLocale={selectedLocale}
                    citiesWithPlan={citiesWithPlan}
                  />
                </Suspense>
              ) : (
                <div className="py-16 text-center space-y-4">
                  <p className="text-muted-foreground">
                    Selecione um município para ver os dados.
                  </p>
                  <Suspense fallback={null}>
                    <div className="flex justify-center">
                      <LocalidadeBusca
                        typeFilter="city"
                        placeholder="Buscar município..."
                      />
                    </div>
                  </Suspense>
                </div>
              )}
            </div>
          )}

          {tab === "estaduais" && (
            <Suspense
              fallback={
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 bg-muted/50 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              }
            >
              <PainelEstadual
                locationId={locationId}
                areaId={areaId}
                stateLocales={stateLocales}
                citiesWithPlan={citiesWithPlan}
              />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  );
}
