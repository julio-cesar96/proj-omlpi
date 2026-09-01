/**
 * Contato — Client Component (seção Contato)
 *
 * Formulário de contato com os campos do design-reference:
 *   Nome, Estado (select com 27 UFs), E-mail, Assunto (select), Mensagem
 *
 * Ao submeter: monta a mensagem via buildWhatsAppUrl() e abre no WhatsApp.
 * Número configurado: +55 21 98258-1194 (WHATSAPP_NUMBER em lib/contact.ts).
 *
 * Sem endpoint de backend — decisão confirmada em docs/PLANO_ONEPAGE.md §Contato.
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { submitContactForm, validateContactForm, ContactFormData } from "@/lib/contact";

// ─── Dados estáticos ──────────────────────────────────────────────────────────

const BRAZIL_STATES = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AM", name: "Amazonas" },
  { uf: "AP", name: "Amapá" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "PR", name: "Paraná" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SE", name: "Sergipe" },
  { uf: "SP", name: "São Paulo" },
  { uf: "TO", name: "Tocantins" },
];

const SUBJECT_OPTIONS = [
  "Dúvida sobre planos municipais",
  "Informar novo plano",
  "Atualização de dados",
  "Sugestão de melhoria",
  "Parceria institucional",
  "Outro",
];

// ─── Estilos de campo reutilizáveis ──────────────────────────────────────────

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[rgba(164,154,135,0.25)] bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

const labelClass =
  "block text-[11px] font-bold text-muted-foreground mb-2 uppercase tracking-wider";

// ─── Main ─────────────────────────────────────────────────────────────────────

export function Contato() {
  const [form, setForm] = useState<Partial<ContactFormData>>({
    name: "",
    state: "",
    email: "",
    subject: SUBJECT_OPTIONS[0],
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateContactForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await submitContactForm(form as ContactFormData);
      setSubmitted(true);
      // Reseta o formulário após 3s
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", state: "", email: "", subject: SUBJECT_OPTIONS[0], message: "" });
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inesperado ao enviar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contato" aria-label="Contato" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Texto à esquerda */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-0.5 bg-primary rounded-full" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Contato
              </span>
            </div>
            <h2
              className="text-[30px] lg:text-[40px] font-black text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Fale conosco
            </h2>
            <p className="text-muted-foreground leading-[1.75] mb-8 text-[15px] max-w-md">
              Tem dúvidas, sugestões ou quer contribuir com informações sobre
              planos municipais em seu estado? Entre em contato.
            </p>

            {/* E-mail de referência */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-[#fff3ee] flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f25d27"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">E-mail</div>
                <div className="font-semibold text-foreground text-sm">
                  observa@rnpi.org.br
                </div>
              </div>
            </div>

            {/* Imagem decorativa */}
            <div
              className="relative rounded-[2rem] overflow-hidden shadow-md"
              style={{ aspectRatio: "16/9" }}
            >
              <Image
                src="/images/img2-meninas-vibram.png"
                alt="Crianças vibrando juntas"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Formulário à direita */}
          <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
            <h3
              className="font-black text-xl text-foreground mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Envie sua mensagem
            </h3>

            {submitted ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-[#e8f5ee] flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#17a649"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                  Mensagem enviada!
                </p>
                <p className="text-sm text-muted-foreground">
                  Sua mensagem foi enviada! Retornaremos em breve pelo e-mail informado.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contato-nome" className={labelClass}>
                      Nome <span aria-hidden="true" className="text-primary">*</span>
                    </label>
                    <input
                      id="contato-nome"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      autoComplete="name"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="contato-estado" className={labelClass}>
                      Estado
                    </label>
                    <select
                      id="contato-estado"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Selecione...</option>
                      {BRAZIL_STATES.map((s) => (
                        <option key={s.uf} value={s.uf}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contato-email" className={labelClass}>
                    E-mail <span aria-hidden="true" className="text-primary">*</span>
                  </label>
                  <input
                    id="contato-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com.br"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contato-assunto" className={labelClass}>
                    Assunto
                  </label>
                  <select
                    id="contato-assunto"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="contato-mensagem" className={labelClass}>
                    Mensagem <span aria-hidden="true" className="text-primary">*</span>
                  </label>
                  <textarea
                    id="contato-mensagem"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Escreva sua mensagem aqui..."
                    required
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="text-sm text-[#d4183d] font-medium"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-[#e04d18] transition-colors shadow-sm text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Enviando..." : "Enviar mensagem"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
