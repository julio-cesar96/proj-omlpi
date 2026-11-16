import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getStrapiLocales, type StrapiLocale } from "@/lib/strapi";
import { TabsNav } from "./TabsNav";

import { MapaBrasil, type StateMapSummary } from "./MapaBrasil";
import { PainelEstadual } from "./PainelEstadual";
import { LocalidadeBusca } from "./LocalidadeBusca";
import {
  ConsultaPublicaView,
  type StateLocaleLite,
} from "./ConsultaPublicaView";

const UploadPlano = dynamic(
  () => import("./UploadPlano").then((mod) => mod.UploadPlano)
);

/**
 * ConsultaPublica — Server Component (sem dependência da requisição)
 *
 * Orquestrador da seção de Consulta Pública. NÃO lê searchParams: isso
 * permite que a home seja pré-renderizada como estática/ISR.
 * Estado da consulta (tab, location_id, area) continua na URL — não em
 * localStorage — e é lido no client por ConsultaPublicaView (useSearchParams).
 *
 * O servidor pré-renderiza o que não depende da URL:
 *   mapa       → MapaBrasil (Highcharts Maps) + busca + upload
 *   estaduais  → grid de estados (PainelEstadual)
 * A localidade selecionada (municipais / estado selecionado) é resolvida no
 * client via /api/locales.
 *
 * O fallback do Suspense é a aba "mapa" (padrão), então o HTML estático da
 * home já contém a visão inicial completa.
 */

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

/**
 * Busca locales com novas tentativas. Se todas falharem, LANÇA o erro em vez
 * de devolver []: como a home é estática/ISR, um [] seria congelado por 1h
 * (mapa vazio). Lançando, o Next mantém a última versão boa na revalidação
 * (e falha o build em vez de publicar um mapa vazio).
 * O endpoint é pesado (~2,2 MB, 4–9 s) e já respondeu com ECONNRESET no build.
 */
async function getLocalesWithRetry(attempts = 3): Promise<StrapiLocale[]> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await getStrapiLocales({ _limit: -1 });
    } catch (err) {
      lastError = err;
      console.error(
        `[ConsultaPublica] Erro ao buscar locales do Strapi (tentativa ${i}/${attempts}):`,
        err
      );
    }
  }
  throw lastError;
}

export async function ConsultaPublica() {
  // Locales carregados no servidor com cache de 1 hora
  let locales = await getLocalesWithRetry();

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

  // Resumo leve dos estados para o client resolver ?location_id= de um estado
  // (municípios com plano são buscados sob demanda via /api/locales?state=UF)
  const stateLocalesLite: StateLocaleLite[] = stateLocales.map((l) => ({
    id: l.id,
    name: l.name,
    type: l.type,
    state: l.state || "",
    isLaw: Boolean(l.is_law),
    planUrl: toAbsoluteUrl(l.plan?.url),
  }));

  // Painel da aba "mapa" — não depende da URL, pré-renderizado no servidor
  const mapaPanel = (
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

        {/* Abas + conteúdo — client (useSearchParams). Fallback = aba "mapa",
            renderizada no HTML estático com a mesma marcação. */}
        <Suspense
          fallback={
            <>
              <TabsNav currentTab="mapa" />
              <div
                role="tabpanel"
                id="panel-mapa"
                aria-labelledby="tab-mapa"
                className="mt-8"
              >
                {mapaPanel}
              </div>
            </>
          }
        >
          <ConsultaPublicaView
            mapaPanel={mapaPanel}
            estaduaisGrid={<PainelEstadual stateLocales={stateLocales} />}
            stateLocales={stateLocalesLite}
          />
        </Suspense>
      </div>
    </section>
  );
}
