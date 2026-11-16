import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
  },
  /**
   * Redirects 301 — rotas do site atual → nova estrutura one-page.
   * /city, /comparacao e /historico foram removidos daqui e movidos para o middleware.ts
   * para preservar corretamente os query params.
   */
  async redirects() {
    return [
      // ── /pt/* → /* (redirect permanente — já existia no netlify.toml) ──────
      {
        source: "/pt/:path*",
        destination: "/:path*",
        permanent: true,
      },

      // ── /planos-pela-primeira-infancia → Consulta pública ──────────────────
      {
        source: "/planos-pela-primeira-infancia",
        destination: "/#consulta-publica",
        permanent: true,
      },

      // ── /indicadores → a confirmar ────────────────────────────────────────
      {
        source: "/indicadores",
        destination: "/#referencia",
        permanent: true,
      },

      // ── /biblioteca → a confirmar ─────────────────────────────────────────
      {
        source: "/biblioteca",
        destination: "/#referencia",
        permanent: true,
      },

      // ── /rastreio → modal de política de privacidade no footer ────────────────
      {
        source: "/rastreio",
        destination: "/",
        permanent: true,
      },

      // ── /metodologia → Referência ─────────────────────────────────────────
      {
        source: "/metodologia",
        destination: "/#referencia",
        permanent: true,
      },

      // ── /observa → Início (#inicio) ───────────────────────────────────────
      {
        source: "/observa",
        destination: "/#inicio",
        permanent: true,
      },

      // ── /sobre-nos & /sobre → Sobre (#sobre) ──────────────────────────────
      {
        source: "/sobre-nos",
        destination: "/#sobre",
        permanent: true,
      },
      {
        source: "/sobre",
        destination: "/#sobre",
        permanent: true,
      },

      // ── /materiais, /repositorio, /referencias → Referência (#referencia) ──
      {
        source: "/materiais",
        destination: "/#referencia",
        permanent: true,
      },
      {
        source: "/repositorio",
        destination: "/#referencia",
        permanent: true,
      },
      {
        source: "/referencias",
        destination: "/#referencia",
        permanent: true,
      },
    ];
  },

};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG || "observa-rnpi",
  project: process.env.SENTRY_PROJECT || "observa-nextjs",
  widenClientFileUpload: true,
});
