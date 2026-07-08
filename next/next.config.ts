import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Redirects 301 — rotas do site atual → nova estrutura one-page.
   * Referência: docs/PLANO_ONEPAGE.md §"Mapeamento de rotas antigas → nova estrutura"
   *
   * Fase 4: revisar tabela completa, validar todos os destinos e remover TODOs.
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

      // ── /city → Painel Municipal ──────────────────────────────────────────
      // Preserva location_id e area como query params no destino.
      {
        source: "/city",
        destination: "/?tab=municipais#consulta-publica",
        permanent: true,
        // TODO Fase 4: testar se o Next preserva automaticamente os query params
        // do source (?location_id=X&area=Y) quando não há :param no source.
        // Se não preservar, usar has: [{ type: "query", key: "location_id" }]
        // e compor o destination dinamicamente.
      },

      // ── /comparacao → Painel Nacional (modo comparação) ───────────────────
      {
        source: "/comparacao",
        destination: "/?tab=nacional&mode=comparacao#consulta-publica",
        permanent: true,
        // TODO Fase 4: confirmar com design se comparação é aba própria ou
        // modo dentro de outra aba (PLANO_ONEPAGE.md linha 56).
      },

      // ── /historico → Painel Nacional (modo histórico) ─────────────────────
      {
        source: "/historico",
        destination: "/?tab=nacional&mode=historico#consulta-publica",
        permanent: true,
        // TODO Fase 4: mesma pendência de /comparacao acima.
      },

      // ── /indicadores → a confirmar ────────────────────────────────────────
      // TODO Fase 4: confirmar destino de /indicadores no one-page.
      // Possível: /#midiateca ou /#consulta-publica (PLANO_ONEPAGE.md linha 53).
      {
        source: "/indicadores",
        destination: "/#midiateca",
        permanent: true,
      },

      // ── /biblioteca → a confirmar ─────────────────────────────────────────
      // TODO Fase 4: confirmar destino de /biblioteca — depende da decisão sobre
      // Midiateca substituir ou conviver com a biblioteca de artigos.
      {
        source: "/biblioteca",
        destination: "/#midiateca",
        permanent: true,
      },

      // ── /rastreio → modal de política de privacidade no footer ────────────────
      // Confirmado: a política de privacidade vai virar um modal acionado por
      // link no footer, não uma seção própria. O conteúdo vem de `privacy-policy`
      // no Strapi (getPrivacyPolicy()). Implementar o modal na Fase 2 junto com Footer.
      // TODO Fase 4: validar que o redirect para `/` não perde o contexto do usuário.
      {
        source: "/rastreio",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
