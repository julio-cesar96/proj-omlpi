"use client";

import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TABS, type TabId } from "./tabs-config";
import { TabsNav } from "./TabsNav";
import { LocalidadeBusca } from "./LocalidadeBusca";
import {
  PainelMunicipal,
  type CityPlanItem,
  type SelectedLocaleInfo,
} from "./PainelMunicipal";

/**
 * ConsultaPublicaView — Client Component
 *
 * Lê o estado da consulta (tab, location_id) da URL via useSearchParams.
 * Isso permite que a home seja pré-renderizada como estática/ISR: as partes
 * que não dependem da URL (painel do mapa, grid de estados) chegam prontas
 * do servidor como `mapaPanel` / `estaduaisGrid`; só a localidade
 * selecionada é resolvida no client via /api/locales (rota já cacheada).
 *
 * Deve ser renderizado dentro de <Suspense> (exigência do useSearchParams
 * em rotas estáticas).
 */

/** Estado (UF) — resumo leve enviado pelo servidor (27 itens). */
export interface StateLocaleLite extends SelectedLocaleInfo {
  state: string;
}

interface ConsultaPublicaViewProps {
  mapaPanel: ReactNode;
  estaduaisGrid: ReactNode;
  stateLocales: StateLocaleLite[];
}

// ─── Parse da URL (mesma regra usada antes no servidor) ─────────────────────

function parseTab(value: string | null): TabId {
  const validIds = TABS.map((t) => t.id) as readonly string[];
  return (value && validIds.includes(value) ? value : "mapa") as TabId;
}

function parseId(value: string | null): number | undefined {
  const n = Number(value);
  return value && !isNaN(n) && n > 0 ? n : undefined;
}

// ─── Dados da localidade selecionada ────────────────────────────────────────

interface LocaleData {
  locale?: SelectedLocaleInfo;
  citiesWithPlan?: CityPlanItem[];
}

interface ApiCity {
  id: number;
  name: string;
  hasPlan: boolean;
  isLaw: boolean;
  planUrl: string | null;
}

interface ApiLocale {
  id: number;
  name?: string;
  type?: string;
  is_law?: boolean;
  planUrl: string | null;
}

/** Cache em memória por sessão — evita refetch ao alternar abas/voltar. */
const localeCache = new Map<number, LocaleData>();

async function loadLocaleData(
  id: number,
  stateLocales: StateLocaleLite[]
): Promise<LocaleData> {
  const stateLocale = stateLocales.find((s) => s.id === id);

  // Estado: dados já vieram do servidor; busca só os municípios com plano
  if (stateLocale) {
    if (!stateLocale.state) return { locale: stateLocale, citiesWithPlan: [] };
    const res = await fetch(
      `/api/locales?state=${encodeURIComponent(stateLocale.state)}`
    );
    if (!res.ok) throw new Error(`/api/locales?state falhou: ${res.status}`);
    const cities = (await res.json()) as ApiCity[];
    return {
      locale: stateLocale,
      citiesWithPlan: cities
        .filter((c) => c.hasPlan)
        .map((c) => ({
          id: c.id,
          name: c.name,
          isLaw: Boolean(c.isLaw),
          planUrl: c.planUrl,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    };
  }

  // Município
  const res = await fetch(`/api/locales?id=${id}`);
  if (res.status === 404) return {}; // localidade inexistente → estado vazio
  if (!res.ok) throw new Error(`/api/locales?id falhou: ${res.status}`);
  const data = (await res.json()) as ApiLocale;
  return {
    locale: {
      id: data.id,
      name: data.name,
      type: data.type,
      isLaw: Boolean(data.is_law),
      planUrl: data.planUrl,
    },
  };
}

/** Retorna `null` enquanto carrega. */
function useLocaleData(
  id: number | undefined,
  stateLocales: StateLocaleLite[]
): LocaleData | null {
  const [entry, setEntry] = useState<{ id: number; data: LocaleData } | null>(
    null
  );

  useEffect(() => {
    if (!id) return;
    let active = true;
    const cached = localeCache.get(id);
    const promise = cached
      ? Promise.resolve(cached)
      : loadLocaleData(id, stateLocales).then((data) => {
          localeCache.set(id, data);
          return data;
        });

    promise
      .catch((err) => {
        console.error("[ConsultaPublica] Erro ao carregar localidade:", err);
        return {} as LocaleData;
      })
      .then((data) => {
        if (active) setEntry({ id, data });
      });

    return () => {
      active = false;
    };
  }, [id, stateLocales]);

  if (!id) return null;
  if (entry?.id === id) return entry.data;
  return localeCache.get(id) ?? null;
}

// ─── Skeletons (idênticos aos fallbacks de Suspense anteriores) ─────────────

function MunicipalSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-muted/50 rounded animate-pulse w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function EstadualSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-28 bg-muted/50 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

// ─── View ────────────────────────────────────────────────────────────────────

export function ConsultaPublicaView({
  mapaPanel,
  estaduaisGrid,
  stateLocales,
}: ConsultaPublicaViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const locationId = parseId(searchParams.get("location_id"));

  // Na aba estaduais, só estados são considerados (mesma regra de antes)
  const selectedState =
    tab === "estaduais" && locationId
      ? stateLocales.find((s) => s.id === locationId)
      : undefined;

  const fetchId =
    tab === "municipais" ? locationId : selectedState ? locationId : undefined;
  const localeData = useLocaleData(fetchId, stateLocales);

  const handleTab = useCallback(
    (tabId: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      // Limpa location_id e area ao voltar para o mapa
      if (tabId === "mapa") {
        params.delete("location_id");
        params.delete("area");
      }
      router.replace(`?${params.toString()}#consulta-publica`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <>
      <TabsNav currentTab={tab} onTabChange={handleTab} />

      {/* Conteúdo da aba ativa */}
      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="mt-8"
      >
        {tab === "mapa" && mapaPanel}

        {tab === "municipais" && (
          <div>
            {locationId ? (
              localeData ? (
                <PainelMunicipal
                  locationId={locationId}
                  selectedLocale={localeData.locale}
                  citiesWithPlan={
                    localeData.locale?.type === "state"
                      ? localeData.citiesWithPlan
                      : undefined
                  }
                />
              ) : (
                <MunicipalSkeleton />
              )
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

        {tab === "estaduais" &&
          (locationId ? (
            selectedState && !localeData ? (
              <EstadualSkeleton />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <a
                    href="?tab=estaduais#consulta-publica"
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    ← Todos os estados
                  </a>
                  {selectedState && (
                    <span className="text-muted-foreground text-sm">
                      / {selectedState.name}
                    </span>
                  )}
                </div>
                <PainelMunicipal
                  locationId={locationId}
                  selectedLocale={selectedState}
                  citiesWithPlan={
                    selectedState ? localeData?.citiesWithPlan : undefined
                  }
                />
              </div>
            )
          ) : (
            estaduaisGrid
          ))}
      </div>
    </>
  );
}

