/**
 * lib/contact.ts — Envio do formulário de contato
 *
 * O formulário chama o Route Handler interno /api/contato (server-side), que por
 * sua vez repassa os dados ao Web3Forms usando a chave WEB3FORMS_KEY — variável
 * server-only, nunca exposta no bundle do cliente.
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
 * Envia os dados do formulário de contato para o Route Handler /api/contato.
 * Lança um erro caso a submissão falhe.
 */
export async function submitContactForm(data: ContactFormData): Promise<void> {
  // Se o estado estiver presente, incorpora-o à mensagem para preservá-lo,
  // já que a API do Web3Forms não possui um campo nativo para o Estado.
  const formattedMessage = data.state
    ? `Estado: ${data.state}\n\n${data.message}`
    : data.message;

  const payload = {
    name: data.name,
    email: data.email,
    subject: data.subject || "Contato via Observa",
    message: formattedMessage,
  };

  const response = await fetch("/api/contato", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Falha ao enviar a mensagem.");
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
