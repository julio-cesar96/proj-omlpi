/**
 * lib/contact.ts — Envio do formulário de contato
 *
 * Usa o Web3Forms diretamente do client (plano gratuito).
 * A chave NEXT_PUBLIC_WEB3FORMS_KEY é pública por design — o Web3Forms foi
 * projetado para isso. Chamadas server-side requerem o plano Pro.
 *
 * Configuração:
 *   - Local: adicionar NEXT_PUBLIC_WEB3FORMS_KEY no .env.local
 *   - Vercel: Settings → Environment Variables → NEXT_PUBLIC_WEB3FORMS_KEY
 */

export interface ContactFormData {
  name: string;
  /** Sigla do estado (ex.: "SP", "RJ") */
  state?: string;
  email: string;
  subject?: string;
  message: string;
}

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

/**
 * Envia os dados do formulário de contato para a API do Web3Forms (client-side).
 * Lança um erro caso a submissão falhe ou a chave de acesso não esteja configurada.
 */
export async function submitContactForm(data: ContactFormData): Promise<void> {
  if (!WEB3FORMS_ACCESS_KEY) {
    throw new Error(
      "Erro de configuração: variável NEXT_PUBLIC_WEB3FORMS_KEY não encontrada."
    );
  }

  // Se o estado estiver presente, incorpora-o à mensagem para preservá-lo,
  // já que a API do Web3Forms não possui um campo nativo para o Estado.
  const formattedMessage = data.state
    ? `Estado: ${data.state}\n\n${data.message}`
    : data.message;

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    name: data.name,
    email: data.email,
    subject: data.subject || "Contato via Observa",
    message: formattedMessage,
  };

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erro de rede ao enviar o formulário.");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Falha ao enviar a mensagem.");
  }
}

/**
 * Valida os campos obrigatórios do formulário.
 * Retorna null se válido, ou uma mensagem de erro localizada.
 */
export function validateContactForm(
  data: Partial<ContactFormData>
): string | null {
  if (!data.name?.trim()) return "Por favor, informe seu nome.";
  if (!data.email?.trim()) return "Por favor, informe seu e-mail.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return "Por favor, informe um e-mail válido.";
  }
  if (!data.message?.trim()) return "Por favor, escreva sua mensagem.";
  return null;
}
