/**
 * lib/contact.ts — Envio do formulário de contato
 *
 * Status atual: PROVISÓRIO — ao submeter o formulário, abre uma conversa
 * no WhatsApp com a mensagem pré-preenchida.
 *
 * Substituir quando o backend confirmar um endpoint:
 *   - Se existir endpoint Perl/Strapi: criar Route Handler em
 *     app/api/contato/route.ts como proxy (mantém a chave/URL fora do client).
 *   - Se não existir: seguir Resend + Route Handler (PLANO_ONEPAGE.md §Contato).
 *
 * TODO (Fase 2 — seção Contato): confirmar número de WhatsApp definitivo e
 * substituir WHATSAPP_NUMBER abaixo, ou remover este arquivo quando o
 * endpoint de backend estiver disponível.
 */

export interface ContactFormData {
  name: string;
  /** Sigla do estado (ex.: "SP", "RJ") */
  state?: string;
  email: string;
  subject?: string;
  message: string;
}

/**
 * Chave de acesso pública do Web3Forms.
 */
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

/**
 * Envia os dados do formulário de contato para a API do Web3Forms.
 * Lança um erro caso a submissão falhe ou a chave de acesso não esteja configurada.
 */
export async function submitContactForm(data: ContactFormData): Promise<void> {
  if (!WEB3FORMS_ACCESS_KEY) {
    throw new Error("Erro de configuração: Chave de acesso do formulário não encontrada.");
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

  try {
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
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Ocorreu um erro inesperado ao enviar a mensagem. Tente novamente.");
  }
}

/**
 * Valida os campos obrigatórios do formulário.
 * Retorna null se válido, ou uma mensagem de erro localizada.
 */
export function validateContactForm(data: Partial<ContactFormData>): string | null {
  if (!data.name?.trim()) return "Por favor, informe seu nome.";
  if (!data.email?.trim()) return "Por favor, informe seu e-mail.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return "Por favor, informe um e-mail válido.";
  }
  if (!data.message?.trim()) return "Por favor, escreva sua mensagem.";
  return null;
}
