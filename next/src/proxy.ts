import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Mapa de redirecionamento 301 em lote (Google Search Console / URLs legadas do Hugo).
 * Mapeia URLs antigas para as novas seções one-page ou rotas institucionais.
 */
const BULK_REDIRECTS: Record<string, string> = {
  // Seção Referências / Midiateca / Artigos
  "/noticias": "/#referencia",
  "/artigos": "/#referencia",
  "/publicacoes": "/#referencia",
  "/biblioteca": "/#referencia",
  "/materiais": "/#referencia",
  "/repositorio": "/#referencia",
  "/referencias": "/#referencia",
  "/indicadores": "/#referencia",
  "/metodologia": "/#referencia",

  // Seção Consulta Pública / Planos
  "/planos-pela-primeira-infancia": "/#consulta-publica",
  "/planos": "/#consulta-publica",
  "/dados": "/#consulta-publica",
  "/painel": "/#consulta-publica",
  "/estatisticas": "/#consulta-publica",
  "/municipios": "/?tab=municipais#consulta-publica",
  "/estados": "/?tab=estaduais#consulta-publica",

  // Seção Elaboração de Plano
  "/guias": "/#elabore-plano",
  "/elabore": "/#elabore-plano",
  "/como-elaborar": "/#elabore-plano",

  // Seção Sobre / Institucional
  "/sobre-nos": "/#sobre",
  "/sobre": "/#sobre",
  "/quem-somos": "/#sobre",
  "/parceiros": "/#sobre",
  "/observa": "/#inicio",

  // Seção Contato
  "/contato": "/#contato",
  "/contato-rnpi": "/#contato",
  "/fale-conosco": "/#contato",

  // Legal / Políticas
  "/rastreio": "/",
  "/privacidade": "/",
  "/politica-de-privacidade": "/",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPath = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  // 1. Verificação exata no mapa 301
  const directMatch = BULK_REDIRECTS[pathname] || BULK_REDIRECTS[normalizedPath];
  if (directMatch) {
    const url = request.nextUrl.clone();
    if (directMatch.includes("#")) {
      const [newPath, hash] = directMatch.split("#");
      url.pathname = newPath || "/";
      url.hash = hash;
    } else {
      url.pathname = directMatch;
    }
    return NextResponse.redirect(url, { status: 301 });
  }

  // 2. Prefixo de categorias legadas (ex: /noticias/..., /artigos/..., /guias/...)
  if (normalizedPath.startsWith("/noticias/") || normalizedPath.startsWith("/artigos/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.hash = "referencia";
    return NextResponse.redirect(url, { status: 301 });
  }

  if (normalizedPath.startsWith("/guias/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.hash = "elabore-plano";
    return NextResponse.redirect(url, { status: 301 });
  }

  // 3. Rotas com query params preservados
  const buildRedirect = (extraParams: Record<string, string>) => {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    for (const [key, value] of Object.entries(extraParams)) {
      url.searchParams.set(key, value);
    }
    url.hash = "consulta-publica";
    return NextResponse.redirect(url, { status: 301 });
  };

  if (pathname === "/city") {
    return buildRedirect({ tab: "municipais" });
  }

  if (pathname === "/comparacao") {
    return buildRedirect({ tab: "nacional", mode: "comparacao" });
  }

  if (pathname === "/historico") {
    return buildRedirect({ tab: "nacional", mode: "historico" });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|ico|webmanifest)$).*)",
  ],
};
