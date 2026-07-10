import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/**
 * GET /api/maps/[state]
 *
 * Serve os arquivos br-XX.json de omlpi-www/src/static/maps/ para o cliente.
 * Necessário porque o Next.js não expõe arquivos fora de public/ via URL.
 *
 * Os arquivos são lidos em runtime com fs.readFile — nenhum arquivo de
 * omlpi-www/ é modificado ou importado em bundle (somente leitura, conforme AGENTS.md).
 */

// Whitelist dos 27 estados brasileiros
const VALID_STATES = new Set([
  "br-ac", "br-al", "br-am", "br-ap", "br-ba", "br-ce", "br-df",
  "br-es", "br-go", "br-ma", "br-mg", "br-ms", "br-mt", "br-pa",
  "br-pb", "br-pe", "br-pi", "br-pr", "br-rj", "br-rn", "br-ro",
  "br-rr", "br-rs", "br-sc", "br-se", "br-sp", "br-to",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ state: string }> }
) {
  const { state } = await params;
  const stateKey = state.toLowerCase();

  if (!VALID_STATES.has(stateKey)) {
    return NextResponse.json(
      { error: "Estado não encontrado" },
      { status: 404 }
    );
  }

  try {
    // Caminho absoluto para omlpi-www/src/static/maps/ (somente leitura)
    const filePath = path.join(
      process.cwd(),
      "..",
      "omlpi-www",
      "src",
      "static",
      "maps",
      `${stateKey}.json`
    );

    const content = await readFile(filePath, "utf-8");

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache por 1 hora — geometria estática, não muda
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Arquivo de mapa não encontrado" },
      { status: 404 }
    );
  }
}
