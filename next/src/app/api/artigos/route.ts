/**
 * GET /api/artigos — proxy para o omlpi-cms-search (server-only)
 *
 * Permite que o MidiatecaClient faça buscas/paginação client-side sem expor
 * CMS_SEARCH_API_URL no bundle do browser.
 *
 * Parâmetros aceitos (whitelist):
 *   _q              — busca full-text
 *   _limit          — itens por página
 *   _start          — offset de paginação
 *   _where[tags_in][] — IDs de tags (formato Strapi, enviado pelo MidiatecaClient)
 *
 * Tradução transparente de params:
 *   _where[tags_in][] (Strapi) → _where[tags][] (omlpi-cms-search)
 *   O MidiatecaClient não precisa saber a diferença.
 *
 * Referência: docs/API_CONTRACTS.md §3 — Busca full-text (omlpi-cms-search)
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cmsSearchUrl = process.env.CMS_SEARCH_API_URL?.replace(/\/$/, "");
  if (!cmsSearchUrl) {
    return NextResponse.json(
      { error: "CMS_SEARCH_API_URL não configurada" },
      { status: 500 }
    );
  }

  const incoming = req.nextUrl.searchParams;
  const outgoing = new URLSearchParams();

  // Parâmetros simples (passagem direta)
  for (const key of ["_q", "_limit", "_start"]) {
    const value = incoming.get(key);
    if (value !== null && value !== "") outgoing.set(key, value);
  }

  // Tradução de filtro de tags:
  //   MidiatecaClient envia: _where[tags_in][]=id  (padrão Strapi)
  //   omlpi-cms-search espera: _where[tags][]=id
  const tagValues = incoming.getAll("_where[tags_in][]");
  tagValues.forEach((id) => outgoing.append("_where[tags][]", id));

  const upstream = `${cmsSearchUrl}/artigos${outgoing.size ? `?${outgoing}` : ""}`;

  try {
    const res = await fetch(upstream, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `omlpi-cms-search respondeu ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/artigos] erro ao chamar omlpi-cms-search:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
