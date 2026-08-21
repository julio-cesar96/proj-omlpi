/**
 * PnipiClient — Client Component (seção PNIPI)
 *
 * 3 abas:
 *   1. Leis e decretos     — dados reais via getGuias() passados como prop
 *   2. Planos de ação      — dados reais via getPlanos() passados como prop
 *   3. Dúvidas frequentes  — dados reais via getFaqs() passados como prop
 */

"use client";

import { useState } from "react";
import { StrapiGuia, StrapiFaq, StrapiPlano } from "@/lib/strapi";

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

function FaqAccordion({ items }: { items: StrapiFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-2xl space-y-2.5">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-sm transition-shadow"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === item.id ? null : item.id)}
            className="w-full flex items-start justify-between px-5 py-4 text-left gap-4"
            aria-expanded={openIndex === item.id}
          >
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">
                {item.categoria?.nome ?? "Geral"}
              </div>
              <span className="text-sm font-semibold text-foreground leading-snug">
                {item.pergunta}
              </span>
            </div>
            <ChevronIcon open={openIndex === item.id} />
          </button>
          {openIndex === item.id && (
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-[1.75] border-t border-border pt-4 whitespace-pre-wrap">
              {item.resposta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  guiasIniciais?: StrapiGuia[];
  guias?: StrapiGuia[];
  totalGuias: number;
  planos: StrapiPlano[];
  faqs: StrapiFaq[];
}

type PnipiTab = "leis" | "planos" | "faq";

const TAB_LABELS: Record<PnipiTab, string> = {
  leis: "Leis e decretos",
  planos: "Planos de ação",
  faq: "Dúvidas frequentes",
};

export function PnipiClient({ guiasIniciais, guias: guiasProp, totalGuias, planos, faqs }: Props) {
  const initialGuias = guiasIniciais ?? guiasProp ?? [];
  const [activeTab, setActiveTab] = useState<PnipiTab>("leis");
  const [guias, setGuias] = useState<StrapiGuia[]>(initialGuias);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = guias.length < totalGuias;

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://omlpi-strapi.rnpiobserva.org.br";
      const start = page * 6;
      const res = await fetch(`${STRAPI_URL}/guias?_limit=6&_start=${start}&_sort=created_at:desc`);
      if (!res.ok) throw new Error("Erro ao carregar mais guias");
      const data: StrapiGuia[] = await res.json();
      if (Array.isArray(data)) {
        setGuias((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("[PnipiClient] erro ao carregar guias:", err);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="max-w-4xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {guias.length > 0 ? (
              guias.map((guia) => <GuiaCard key={guia.id} guia={guia} />)
            ) : (
              <p className="col-span-full text-sm text-muted-foreground">
                Documentos em breve.
              </p>
            )}
          </div>
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 border-2 border-border text-foreground text-sm font-semibold rounded-full hover:border-primary hover:text-primary transition-colors disabled:opacity-60 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Carregando...</span>
                  </>
                ) : (
                  "Carregar mais"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Planos de ação */}
      {activeTab === "planos" && (
        <div className="max-w-2xl space-y-4">
          {planos.length > 0 ? (
            planos.map((plano) => (
              <div
                key={plano.id}
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
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                    {plano.categoria?.nome ?? "Plano de Ação"}
                  </div>
                  <div
                    className="font-bold text-foreground mb-4 text-[16px]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {plano.titulo}
                  </div>
                  {plano.documento?.url ? (
                    <a
                      href={plano.documento.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-full hover:bg-[#e04d18] transition-colors"
                    >
                      <DownloadIcon /> Baixar plano
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground text-xs font-semibold rounded-full cursor-not-allowed">
                      <DownloadIcon /> Documento indisponível
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum plano de ação disponível no momento.
            </p>
          )}
        </div>
      )}

      {/* Dúvidas frequentes */}
      {activeTab === "faq" && (
        <div className="max-w-2xl">
          {faqs.length > 0 ? (
            <FaqAccordion items={faqs} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma dúvida frequente cadastrada.
            </p>
          )}
        </div>
      )}
    </>
  );
}
