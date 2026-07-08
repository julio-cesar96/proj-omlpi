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
  email: string;
  subject?: string;
  message: string;
}

/**
 * Número do WhatsApp de destino (provisório).
 *
 * TODO: substituir pelo número real quando confirmado.
 * Formato: código do país + DDD + número, sem símbolos (ex.: "5511999999999").
 */
const WHATSAPP_NUMBER = ""; // TODO: preencher antes da Fase 2

/**
 * Gera a URL de abertura do WhatsApp com a mensagem pré-preenchida.
 *
 * Uso no componente de formulário (client component, Fase 2):
 *   import { buildWhatsAppUrl } from "@/lib/contact";
 *   window.open(buildWhatsAppUrl(formData), "_blank", "noopener,noreferrer");
 */
export function buildWhatsAppUrl(data: ContactFormData): string {
  const text = [
    `*Contato via Observa*`,
    ``,
    `*Nome:* ${data.name}`,
    `*E-mail:* ${data.email}`,
    data.subject ? `*Assunto:* ${data.subject}` : null,
    ``,
    `*Mensagem:*`,
    data.message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const encoded = encodeURIComponent(text);
  const number = WHATSAPP_NUMBER.replace(/\D/g, ""); // sanitiza o número
  return `https://wa.me/${number}?text=${encoded}`;
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
