import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/contato
 *
 * Proxy server-side para o Web3Forms, mantendo a chave de acesso fora do bundle
 * do cliente. Lê WEB3FORMS_KEY como variável de ambiente server-only (sem
 * o prefixo NEXT_PUBLIC_).
 */
export async function POST(request: NextRequest) {
  const accessKey = process.env.WEB3FORMS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      { error: "Erro de configuração: chave do formulário ausente no servidor." },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const { name, email, subject, message } = body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Campos obrigatórios ausentes: name, email, message." },
      { status: 400 }
    );
  }

  const payload = {
    access_key: accessKey,
    name,
    email,
    subject: subject || "Contato via Observa",
    message,
  };

  try {
    const w3fResponse = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await w3fResponse.json();

    if (!w3fResponse.ok || !result.success) {
      return NextResponse.json(
        { error: result.message || "Falha ao enviar a mensagem." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao contactar o serviço de envio de e-mail." },
      { status: 502 }
    );
  }
}
