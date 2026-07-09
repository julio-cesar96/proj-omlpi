/**
 * Hero — Server Component (seção Início)
 *
 * Dados:
 *   getBanners({ _sort: "order:asc" })  — banner principal
 *   getEixos({ _sort: "order:asc" })    — blocos de eixo temático
 *
 * Stats strip: valores placeholder com TODO para conectar ao endpoint real
 * (data/resume/ ou similar — pendência da Fase 2, confirmada para encaixar
 * quando o endpoint for validado).
 *
 * Fase 2 — seção Início.
 */

import { getBanners, getEixos, StrapiBanner, StrapiEixo } from "@/lib/strapi";

// ─── Stats (placeholder) ─────────────────────────────────────────────────────
// TODO: substituir pelos dados reais do endpoint omlpi-api `data/resume/` quando confirmado.
// Ver pendência em docs/progresso/fase-1-fundacao.md §9 item 3.
const STATS_PLACEHOLDER = [
  { value: "5.570", label: "Municípios mapeados" },
  { value: "2.022", label: "Com Plano Municipal" },
  { value: "19/27", label: "Estados com plano estadual" },
  { value: "2020–2030", label: "Vigência do Plano Nacional" },
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

function BannerImage({ banner }: { banner: StrapiBanner | null }) {
  const src = banner?.image?.url;
  return (
    <div className="relative">
      <div
        className="rounded-[2rem] overflow-hidden shadow-lg"
        style={{ aspectRatio: "4/3", background: "#e8f5ee" }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={banner?.title ?? "Imagem Observa"}
            className="w-full h-full object-cover"
          />
        ) : (
          // Fallback visual quando não há banner cadastrado
          <div className="w-full h-full flex items-center justify-center">
            <svg
              viewBox="0 0 200 150"
              className="w-40 opacity-30"
              aria-hidden="true"
            >
              <circle cx="60" cy="75" r="40" fill="#17a649" />
              <circle cx="140" cy="75" r="30" fill="#f25d27" />
              <circle cx="100" cy="55" r="20" fill="#444525" />
            </svg>
          </div>
        )}
      </div>
      {/* Floating stat badges */}
      <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-lg px-5 py-4 border border-border">
        <div
          className="text-2xl font-black text-primary"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {STATS_PLACEHOLDER[2].value}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {STATS_PLACEHOLDER[2].label}
        </div>
      </div>
      <div className="absolute -top-5 -right-3 bg-white rounded-2xl shadow-lg px-5 py-4 border border-border">
        <div
          className="text-2xl font-black text-secondary"
          style={{ fontFamily: "var(--font-heading)" }}
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

function EixoCard({ eixo }: { eixo: StrapiEixo }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-border hover:shadow-md transition-shadow">
      {eixo.icon?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={eixo.icon.url}
          alt=""
          aria-hidden="true"
          className="w-10 h-10 object-contain flex-shrink-0"
        />
      )}
      <div>
        {eixo.title && (
          <div
            className="font-bold text-foreground text-sm mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {eixo.title}
          </div>
        )}
        {eixo.description && (
          <div className="text-xs text-muted-foreground leading-relaxed">
            {eixo.description}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export async function Hero() {
  let banners: StrapiBanner[] = [];
  let eixos: StrapiEixo[] = [];

  try {
    [banners, eixos] = await Promise.all([
      getBanners({ _sort: "order:asc" }),
      getEixos({ _sort: "order:asc" }),
    ]);
  } catch {
    // Sem API configurada (dev local sem .env): renderiza com fallback gracioso
  }

  const firstBanner = banners[0] ?? null;

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
              <SectionLabel>Plataforma Observa</SectionLabel>
              <h1
                className="text-[40px] lg:text-[58px] leading-[1.08] font-black text-foreground mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Planos pela{" "}
                <span className="text-primary">Primeira</span>{" "}
                <span className="text-secondary">Infância</span>{" "}
                no Brasil
              </h1>
              <p className="text-[17px] text-muted-foreground leading-[1.75] mb-9 max-w-xl">
                {firstBanner?.subtitle ??
                  "Acompanhe o panorama nacional de planos municipais, estaduais e o plano nacional voltados ao desenvolvimento integral de crianças de 0 a 6 anos."}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#consulta-publica"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-[#e04d18] transition-colors shadow-sm text-[15px]"
                >
                  Explorar o mapa
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
                  href="#sobre"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-[rgba(164,154,135,0.35)] text-foreground font-semibold rounded-full hover:border-secondary hover:text-secondary transition-colors text-[15px]"
                >
                  Sobre o projeto
                </a>
              </div>
            </div>

            {/* Banner image */}
            <BannerImage banner={firstBanner} />
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div
        className="py-12"
        style={{ background: "var(--foreground)" }}
        aria-label="Números do levantamento"
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
            {STATS_PLACEHOLDER.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div
                  className="text-3xl lg:text-[38px] font-black text-primary mb-1.5"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {value}
                </div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Eixos temáticos ── */}
      {eixos.length > 0 && (
        <div className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-5 lg:px-10">
            <h2
              className="text-xl font-black text-foreground mb-8 text-center"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Eixos temáticos
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eixos.map((eixo) => (
                <EixoCard key={eixo.id} eixo={eixo} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
