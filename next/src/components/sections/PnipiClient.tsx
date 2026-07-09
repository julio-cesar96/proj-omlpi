/**
 * PnipiClient — Client Component (seção PNIPI)
 *
 * 3 abas:
 *   1. Leis e decretos     — dados reais via getGuias() passados como prop
 *   2. Planos de ação      — placeholder estático (collection não confirmada em API_CONTRACTS.md)
 *   3. Dúvidas frequentes  — placeholder estático com accordion (collection não confirmada)
 *
 * PENDÊNCIA: confirmar collections Strapi para "Planos de ação" e "Dúvidas frequentes"
 * do PNIPI antes de substituir os placeholders por dados reais.
 */

"use client";

import { useState } from "react";
import { StrapiGuia } from "@/lib/strapi";

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface FaqItem {
  category: string;
  q: string;
  a: string;
}

// ─── Dados placeholder ────────────────────────────────────────────────────────

// PENDÊNCIA: substituir pelos dados reais quando a collection Strapi for confirmada.
// Ver API_CONTRACTS.md — não há collection de FAQs documentada.
const FAQ_PLACEHOLDER: FaqItem[] = [
  {
    category: "Geral",
    q: "O que é o Plano Nacional pela Primeira Infância (PNPI)?",
    a: "O PNPI é um instrumento de planejamento de longo prazo que estabelece objetivos, metas e estratégias para garantir os direitos das crianças de 0 a 6 anos no Brasil. Abrange o período de 2020 a 2030.",
  },
  {
    category: "Geral",
    q: "O que é o Programa Nacional Integrado pela Primeira Infância (PNIPI)?",
    a: "O PNIPI é um programa do governo federal que visa integrar e fortalecer as ações voltadas à primeira infância, articulando diferentes ministérios e promovendo a cooperação entre União, estados e municípios. Foi instituído pelo Decreto nº 9.579/2018.",
  },
  {
    category: "Planos Municipais",
    q: "Como um município pode elaborar seu Plano Municipal pela Primeira Infância?",
    a: "A elaboração deve envolver participação social ampla, com representantes da sociedade civil, gestores públicos e especialistas. O processo inclui diagnóstico da situação local, definição de objetivos e metas, planejamento de ações intersetoriais e estratégias de financiamento e monitoramento.",
  },
  {
    category: "Legislação",
    q: "Qual é a base legal para os Planos pela Primeira Infância?",
    a: "A principal base legal é o Marco Legal da Primeira Infância (Lei nº 13.257/2016), que estabelece princípios e diretrizes para as políticas públicas para a primeira infância. Complementam o arcabouço legal o ECA (Lei nº 8.069/1990), a LDB e a Constituição Federal de 1988.",
  },
  {
    category: "Monitoramento",
    q: "Como é feito o monitoramento dos planos?",
    a: "O monitoramento ocorre por meio de indicadores previamente definidos, comitês locais de acompanhamento e relatórios periódicos publicados na plataforma. Cada plano deve ter indicadores de processo e resultado claramente estabelecidos.",
  },
];

// PENDÊNCIA: substituir pelos dados reais quando a collection Strapi for confirmada.
const PLANOS_ACAO_PLACEHOLDER = [
  {
    titulo: "Plano de Ação PNIPI 2021–2023",
    vigencia: "2021–2023",
    ministerios: 8,
    metas: 42,
  },
  {
    titulo: "Plano de Ação PNIPI 2024–2026",
    vigencia: "2024–2026",
    ministerios: 10,
    metas: 58,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`text-muted-foreground flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function GuiaCard({ guia }: { guia: StrapiGuia }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border hover:shadow-md transition-shadow flex flex-col">
      <div
        className="text-xs font-bold text-primary mb-1.5"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {guia.category ?? "Documento"}
      </div>
      <div
        className="font-bold text-foreground mb-2 text-[15px] flex-1"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {guia.title}
      </div>
      {guia.description && (
        <div className="text-sm text-muted-foreground leading-[1.6] mb-4">
          {guia.description}
        </div>
      )}
      {guia.file?.url ? (
        <a
          href={guia.file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-secondary font-semibold hover:underline mt-auto"
        >
          <DownloadIcon /> Ver documento
        </a>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
          <DownloadIcon /> Documento em breve
        </span>
      )}
    </div>
  );
}

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-2xl space-y-2.5">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-sm transition-shadow"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-start justify-between px-5 py-4 text-left gap-4"
            aria-expanded={openIndex === i}
          >
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">
                {item.category}
              </div>
              <span className="text-sm font-semibold text-foreground leading-snug">
                {item.q}
              </span>
            </div>
            <ChevronIcon open={openIndex === i} />
          </button>
          {openIndex === i && (
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-[1.75] border-t border-border pt-4">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  guias: StrapiGuia[];
}

type PnipiTab = "leis" | "planos" | "faq";

const TAB_LABELS: Record<PnipiTab, string> = {
  leis: "Leis e decretos",
  planos: "Planos de ação",
  faq: "Dúvidas frequentes",
};

export function PnipiClient({ guias }: Props) {
  const [activeTab, setActiveTab] = useState<PnipiTab>("leis");

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap mb-8 p-1.5 bg-white rounded-2xl border border-border w-fit shadow-sm">
        {(Object.keys(TAB_LABELS) as PnipiTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Leis e decretos */}
      {activeTab === "leis" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl">
          {guias.length > 0 ? (
            guias.map((guia) => <GuiaCard key={guia.id} guia={guia} />)
          ) : (
            <p className="col-span-full text-sm text-muted-foreground">
              Documentos em breve.
            </p>
          )}
        </div>
      )}

      {/* Planos de ação — PLACEHOLDER */}
      {activeTab === "planos" && (
        <div className="max-w-2xl space-y-4">
          {/* PENDÊNCIA: substituir por dados reais quando collection confirmada */}
          <p className="text-xs text-muted-foreground mb-5 italic">
            ⚠️ Dados de demonstração — aguardando confirmação da collection Strapi para &quot;Planos de ação&quot;.
          </p>
          {PLANOS_ACAO_PLACEHOLDER.map(({ titulo, vigencia, ministerios, metas }) => (
            <div
              key={titulo}
              className="bg-white rounded-2xl p-6 border border-border flex items-start gap-5 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#fff3ee] flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f25d27"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
              </div>
              <div className="flex-1">
                <div
                  className="font-bold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {titulo}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span>{vigencia}</span>
                  <span>{ministerios} ministérios</span>
                  <span>{metas} metas</span>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-full hover:bg-[#e04d18] transition-colors">
                  <DownloadIcon /> Baixar plano
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dúvidas frequentes — PLACEHOLDER com accordion */}
      {activeTab === "faq" && (
        <>
          {/* PENDÊNCIA: substituir por dados reais quando collection confirmada */}
          <p className="text-xs text-muted-foreground mb-5 italic">
            ⚠️ Dados de demonstração — aguardando confirmação da collection Strapi para &quot;Dúvidas frequentes&quot;.
          </p>
          <FaqAccordion items={FAQ_PLACEHOLDER} />
        </>
      )}
    </>
  );
}
