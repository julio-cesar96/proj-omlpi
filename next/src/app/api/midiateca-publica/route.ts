/**
 * Route Handler — /api/midiateca-publica
 *
 * Proxy que encaminha requests do client para GET /midiateca-publica no Strapi,
 * sem expor STRAPI_API_URL no bundle do browser.
 *
 * Parâmetros aceitos do client:
 *   _start        — offset de paginação
 *   _limit        — itens por página
 *   _sort         — ordenação
 *   name_contains — busca por nome de arquivo
 *   mime_contains — filtro por tipo MIME
 *
 * Retorna o shape { results: StrapiMidiaPublica[], count: number } diretamente
 * do endpoint customizado do Strapi.
 */

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_PARAMS = ['_start', '_limit', '_sort', 'name_contains', 'mime_contains'];

export async function GET(req: NextRequest) {
  const strapiUrl = process.env.STRAPI_API_URL;
  if (!strapiUrl) {
    return NextResponse.json(
      { error: 'STRAPI_API_URL não configurada' },
      { status: 500 }
    );
  }

  const incoming = req.nextUrl.searchParams;
  const outgoing = new URLSearchParams();

  ALLOWED_PARAMS.forEach((key) => {
    const val = incoming.get(key);
    if (val !== null && val !== '') {
      outgoing.set(key, val);
    }
  });

  const upstream = `${strapiUrl.replace(/\/$/, '')}/midiateca-publica${outgoing.toString() ? `?${outgoing}` : ''}`;

  try {
    const res = await fetch(upstream, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Strapi retornou ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[/api/midiateca-publica] Erro ao contactar Strapi:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
