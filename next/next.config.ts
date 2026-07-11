import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig & { sentry?: Record<string, unknown> } = {
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
        destination: "/#midiateca",
        permanent: true,
      },

      // ── /biblioteca → a confirmar ─────────────────────────────────────────
      {
        source: "/biblioteca",
        destination: "/#midiateca",
        permanent: true,
      },

      // ── /rastreio → modal de política de privacidade no footer ────────────────
      {
        source: "/rastreio",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Sentry SDK options
  sentry: {
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  silent: true,
  org: process.env.SENTRY_ORG || "observa-rnpi",
  project: process.env.SENTRY_PROJECT || "observa-nextjs",
});
