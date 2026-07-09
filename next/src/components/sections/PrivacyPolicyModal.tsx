/**
 * PrivacyPolicyModal — Client Component
 *
 * Modal acessível que exibe o conteúdo da política de privacidade.
 * Recebe `content` (markdown) como prop do Footer (Server Component).
 *
 * Acessibilidade:
 *   - role="dialog", aria-modal="true", aria-labelledby
 *   - Fecha com tecla Escape e clique no backdrop
 *   - Foco restituído ao botão que abriu o modal ao fechar
 *
 * Confirmado na Fase 1: /rastreio não vira seção — conteúdo migra para este modal.
 */

"use client";

import { useState, useEffect, useRef } from "react";

// Renderização simples de markdown para HTML (sem dependência extra)
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|u|o|l])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

interface Props {
  content: string;
}

export function PrivacyPolicyModal({ content }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Fecha com Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Impede scroll do body quando aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Move foco para o botão fechar ao abrir
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-muted-foreground hover:text-white transition-colors"
        aria-haspopup="dialog"
      >
        Política de privacidade
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border flex-shrink-0">
              <h2
                id="privacy-modal-title"
                className="font-black text-xl text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Política de Privacidade
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Fechar política de privacidade"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-8 py-6 flex-1">
              {content ? (
                <div
                  className="prose prose-sm max-w-none text-muted-foreground leading-[1.8] [&_h1]:text-foreground [&_h1]:font-black [&_h1]:text-xl [&_h1]:mb-4 [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Conteúdo da política de privacidade em breve.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-border flex-shrink-0 text-right">
              <button
                type="button"
                onClick={close}
                className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-[#e04d18] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
