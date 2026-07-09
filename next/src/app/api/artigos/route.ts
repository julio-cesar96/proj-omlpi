/**
 * GET /api/artigos — proxy para o Strapi (server-only)
 *
 * Permite que o MidiatecaClient faça buscas/paginação client-side sem expor
 * STRAPI_API_URL no bundle do browser. Aceita os mesmos parâmetros que o Strapi:
 *   _q, _where, _limit, _start
 *
 * Referência: docs/API_CONTRACTS.md §1 — collection `artigos`
 */

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_PARAMS = new Set(["_q", "_where", "_limit", "_start", "_sort"]);

export async function GET(req: NextRequest) {
  const strapiUrl = process.env.STRAPI_API_URL?.replace(/\/$/, "");
  if (!strapiUrl) {
    return NextResponse.json(
      { error: "STRAPI_API_URL não configurada" },
      { status: 500 }
    );
  }

  // Repassa apenas os parâmetros autorizados (whitelist)
  const incoming = req.nextUrl.searchParams;
  const outgoing = new URLSearchParams();

  for (const [key, value] of incoming.entries()) {
    if (ALLOWED_PARAMS.has(key)) {
      outgoing.set(key, value);
    }
  }

  const upstream = `${strapiUrl}/artigos${outgoing.size ? `?${outgoing}` : ""}`;

  try {
    const res = await fetch(upstream, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Strapi respondeu ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/artigos] erro ao chamar Strapi:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
