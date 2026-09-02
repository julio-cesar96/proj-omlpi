/**
 * Hero — Server Component (seção Início)
 *
 * Dados:
 *   getBanner()  — banner principal
 *
 * Stats strip: valores placeholder com TODO para conectar ao endpoint real
 * (data/resume/ ou similar — pendência da Fase 2, confirmada para encaixar
 * quando o endpoint for validado).
 *
 * Fase 2 — seção Início.
 */

import Image from "next/image";
import { getBanner, StrapiBanner } from "@/lib/strapi";
import { StatCard } from "./StatCard";

// ─── Stats (placeholder) ─────────────────────────────────────────────────────
// TODO: substituir pelos dados reais do endpoint omlpi-api `data/resume/` quando confirmado.
// Ver pendência em docs/progresso/fase-1-fundacao.md §9 item 3.
const STATS_PLACEHOLDER = [
  {
    value: "5.106",
    label: "Municípios mapeados",
    tooltip: "5.106 municípios responderam ao formulário, o que corresponde a 91% do total de 5.570 municípios brasileiros."
  },
  {
    value: "1.836",
    label: "Planos Municipais",
    tooltip: "Planos Municipais em vigência ou com vigência vencida."
  },
  {
    value: "19",
    label: "Planos Estaduais",
    tooltip: "Dos 26 estados e o Distrito Federal, 22 responderam ao levantamento. 12 informaram possuir PEPI em vigência, 7 estão com plano em elaboração e 3 não possuem PEPI."
  },
  {
    value: "2020–2030",
    label: "Vigência do Plano Nacional",
    tooltip: null
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-6 h-0.5 bg-primary rounded-full" />
      <span className="text-xs font-bold uppercase tracking-widest text-primary">
        {children}
      </span>
    </div>
  );
}

/**
 * Componente visual da área de imagem do Hero.
 *
 * ⚠️ O schema real de `banners` (singleType) não tem campo `image`.
 * A imagem é decorativa (SVG hardcoded). O campo `image` não existe
 * no schema real de `banners` (singleType: apenas `title` e `text`).
 *
 * 📐 PADRÃO DE DESIGN PARA NOVAS IMAGENS ILUSTRATIVAS:
 * Para qualquer nova imagem ilustrativa adicionada no site, use sempre:
 * - aspectRatio: "16/9"
 * - rounded-2xl (cantos mais suaves)
 */
function BannerImage() {
  return (
    <div className="relative">
      <div
        className="relative rounded-2xl overflow-hidden shadow-lg"
        style={{ aspectRatio: "16/9" }}
      >
        {/* Imagem real — bebe-ajoelhado.png (decorativa, sem campo image no schema banners) */}
        <Image
          src="/bebe-ajoelhado.png"
          alt="Ilustração de criança brincando com blocos coloridos"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {/* Floating stat badges */}
      <div className="absolute -bottom-5 -left-5 bg-white backdrop-blur-md rounded-xl shadow-lg px-4 py-3 border border-border">
        <div
          className="text-xl font-black"
          style={{ fontFamily: "var(--font-heading)", color: "#17A649" }}
        >
          {STATS_PLACEHOLDER[2].value}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {STATS_PLACEHOLDER[2].label}
        </div>
      </div>
      <div className="absolute -top-5 -right-3 bg-white backdrop-blur-md rounded-xl shadow-lg px-4 py-3 border border-border">
        <div
          className="text-xl font-black"
          style={{ fontFamily: "var(--font-heading)", color: "#17A649" }}
        >
          {STATS_PLACEHOLDER[1].value}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {STATS_PLACEHOLDER[1].label}
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export async function Hero() {
  let banner: StrapiBanner | null = null;

  try {
    banner = await getBanner();
  } catch {
    // Sem API configurada (dev local sem .env): renderiza com fallback gracioso
  }

  return (
    <>
      {/* ── Hero principal ── */}
      <section
        id="inicio"
        aria-label="Início"
        className="relative overflow-hidden pt-14 pb-20 lg:pt-20 lg:pb-32"
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.07] pointer-events-none rounded-full"
          style={{
            background: "radial-gradient(circle, #17A649 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.06] pointer-events-none rounded-full"
          style={{
            background: "radial-gradient(circle, #F25D27 0%, transparent 70%)",
            transform: "translate(-30%, 30%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Copy */}
            <div>
              <SectionLabel>Plataforma</SectionLabel>
              <h1 className="mb-6">
                <Image
                  src="/logo-observa.png"
                  alt="Observa — Observatório do Marco Legal da Primeira Infância"
                  width={420}
                  height={120}
                  priority
                  className="w-[280px] sm:w-[340px] lg:w-[420px] max-w-full h-auto"
                />
              </h1>
              <p className="text-[17px] text-muted-foreground leading-[1.75] mb-9 max-w-xl">
                {banner?.text ??
                  "Acompanhe o panorama nacional de planos municipais, estaduais e o plano nacional voltados ao desenvolvimento integral de crianças de 0 a 6 anos."}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#consulta-publica"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-[#e04d18] transition-colors shadow-sm text-[15px]"
                >
                  Explore o mapa
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
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="#historico"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-[rgba(164,154,135,0.35)] text-foreground font-semibold rounded-full hover:border-secondary hover:text-secondary transition-colors text-[15px]"
                >
                  Sobre o projeto
                </a>
              </div>
            </div>

            {/* Banner image area — decorative SVG (no image field in banners schema) */}
            <BannerImage />
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div
        className="py-12"
        style={{
          background: "#F5F0E8",
          borderTop: "3px solid var(--primary)",
        }}
        aria-label="Números do levantamento"
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
            {STATS_PLACEHOLDER.map(({ value, label, tooltip }) => (
              <StatCard
                key={label}
                value={value}
                label={label}
                tooltip={tooltip}
              />
            ))}
          </div>

          {/* Fonte e link do relatório */}
          <p className="mt-16 text-[15px] lg:text-base text-muted-foreground">
            Levantamento nacional, junho de 2026.{" "}
            <a
              href="/levantamento-PEPI-PMPI-relatorio-final.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:opacity-100 transition-opacity"
              style={{ color: "var(--primary)" }}
            >
              Acesse o relatório.
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

