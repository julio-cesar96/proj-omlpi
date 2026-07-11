import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const buildRedirect = (extraParams: Record<string, string>) => {
    // Clone NextURL to preserve all original query params
    const url = request.nextUrl.clone();
    url.pathname = "/";
    
    // Add or overwrite control query params
    for (const [key, value] of Object.entries(extraParams)) {
      url.searchParams.set(key, value);
    }
    
    // Set anchor hash
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
  matcher: ["/city", "/comparacao", "/historico"],
};
