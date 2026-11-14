import { NextRequest, NextResponse } from "next/server";
import { getStrapiLocales, type StrapiLocale } from "@/lib/strapi";

export const revalidate = 3600;

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://omlpi-strapi.rnpiobserva.org.br";

function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_BASE}${url}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state")?.toUpperCase();
  const q = searchParams.get("q");
  const idStr = searchParams.get("id");
  const typeFilter = searchParams.get("type"); // "city" ou "state"

  let locales: StrapiLocale[] = [];
  try {
    locales = await getStrapiLocales({ _limit: -1 });
  } catch (error) {
    console.error("[api/locales] Erro ao carregar locales:", error);
    return NextResponse.json({ error: "Erro ao buscar localidades" }, { status: 500 });
  }

  // 1. Busca por ID específico
  if (idStr) {
    const id = Number(idStr);
    const item = locales.find((l) => l.id === id);
    if (!item) {
      return NextResponse.json({ error: "Localidade não encontrada" }, { status: 404 });
    }
    return NextResponse.json(
      {
        id: item.id,
        name: item.name,
        state: item.state,
        type: item.type,
        cod_ibge: item.cod_ibge,
        is_law: item.is_law,
        hasPlan: Boolean(item.plan && !item.hide_plan),
        planUrl: toAbsoluteUrl(item.plan?.url),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  // 2. Cidades de um estado para drilldown do mapa
  if (state) {
    const cities = locales
      .filter((l) => l.type === "city" && l.state === state)
      .map((c) => ({
        id: c.id,
        cod_ibge: c.cod_ibge,
        name: c.name,
        hasPlan: Boolean(c.plan && !c.hide_plan),
        planUrl: toAbsoluteUrl(c.plan?.url),
        isLaw: Boolean(c.is_law),
      }));

    return NextResponse.json(cities, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  // 3. Busca autocomplete por termo (?q=...)
  if (q) {
    const term = normalize(q.trim());
    if (!term) {
      return NextResponse.json([]);
    }

    const matched = locales
      .filter((l) => {
        if (typeFilter && l.type !== typeFilter) return false;
        if (l.type !== "city" && l.type !== "state") return false;
        return normalize(l.name ?? "").includes(term);
      })
      .slice(0, 10)
      .map((l) => ({
        id: l.id,
        name: l.name,
        state: l.state,
        type: l.type,
      }));

    return NextResponse.json(matched, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  return NextResponse.json(
    { message: "Especifique ?state=UF, ?q=termo ou ?id=ID" },
    { status: 400 }
  );
}

