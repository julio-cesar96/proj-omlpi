import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/upload-plan
 *
 * Proxy multipart para OMLPI_API_URL/upload_plan.
 * Necessário porque OMLPI_API_URL é server-only e não pode ser exposta no client.
 *
 * Campos obrigatórios (multipart/form-data): file (PDF), name, message, email.
 * Confirmado em omlpi-api/public/openapi.yaml §/upload_plan.
 */
export async function POST(request: NextRequest) {
  const omlpiUrl = process.env.OMLPI_API_URL;
  if (!omlpiUrl) {
    return NextResponse.json(
      { error: "Configuração de servidor incompleta" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Payload inválido — esperado multipart/form-data" },
      { status: 400 }
    );
  }

  // Valida campos obrigatórios antes de encaminhar
  const file = formData.get("file");
  const name = formData.get("name");
  const message = formData.get("message");
  const email = formData.get("email");

  if (!file || !name || !message || !email) {
    return NextResponse.json(
      { error: "Campos obrigatórios ausentes: file, name, message, email" },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(
      `${omlpiUrl.replace(/\/$/, "")}/upload_plan`,
      {
        method: "POST",
        body: formData,
        // Não definir Content-Type — o fetch monta o boundary corretamente
      }
    );

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: `Erro no backend: ${upstream.status}`, detail: text },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Falha ao conectar com o servidor", detail: message },
      { status: 502 }
    );
  }
}
