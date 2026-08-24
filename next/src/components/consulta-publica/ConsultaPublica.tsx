import { Suspense } from "react";
import { getStrapiLocales } from "@/lib/strapi";
import { TABS, type TabId } from "./tabs-config";
import { TabsNav } from "./TabsNav";

import { MapaBrasil } from "./MapaBrasil";
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
 *   nacional      → PainelNacionalPlaceholder
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

function parseMode(raw: string | string[] | undefined): "comparacao" | "historico" {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "historico" ? "historico" : "comparacao";
}


export async function ConsultaPublica({ searchParams }: ConsultaPublicaProps) {
  const tab = parseTab(searchParams["tab"]);
  const locationId = parseId(searchParams["location_id"]);
  const areaId = parseId(searchParams["area"]);

  // Locales carregados uma vez para todo o componente (mapa + busca + painel) via API Strapi
  let locales = await getStrapiLocales({ _limit: -1 }).catch((err) => {
    console.error("[ConsultaPublica] Erro ao buscar locales do Strapi:", err);
    return [];
  });

  // Filtra apenas municípios e estados (excluindo regiões e país)
  locales = locales.filter(
    (l) => l.type === "city" || l.type === "state"
  );

  return (
    <section
      id="consulta-publica"
      aria-label="Consulta Pública"
      className="py-16 lg:py-24 bg-background"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        {/* Cabeçalho da seção */}
        <div className="mb-8 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Consulte os planos
          </span>
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
                <MapaBrasil locales={locales} />
              </div>

              {/* Painel lateral: busca + upload */}
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Buscar localidade
                  </h3>
                  <Suspense fallback={null}>
                    <LocalidadeBusca
                      locales={locales}
                      placeholder="Município ou estado..."
                    />
                  </Suspense>
                  <p className="text-xs text-muted-foreground">
                    Selecione um município ou estado para ver os dados detalhados.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
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
                    locales={locales}
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
                        locales={locales.filter((l) => l.type === "city")}
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
                allLocales={locales}
              />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  );
}
