"use client";

/**
 * UploadPlanoDrawer — Client Component
 *
 * Drawer acessível que contém o formulário de envio de plano municipal.
 * - Desktop: painel desliza da direita (480 px de largura)
 * - Mobile:  bottom sheet (sobe do rodapé, altura automática)
 *
 * Acessibilidade (mesmo padrão do PrivacyPolicyModal):
 *   - role="dialog", aria-modal="true", aria-labelledby
 *   - Fecha com tecla Escape e clique no backdrop
 *   - Scroll do body bloqueado enquanto aberto
 *   - Foco movido para o botão "fechar" ao abrir; restituído ao trigger ao fechar
 *
 * Uso:
 *   <UploadPlanoDrawer>
 *     <button ...>Abrir</button>   ← trigger customizável via children
 *   </UploadPlanoDrawer>
 */

import { useState, useEffect, useRef } from "react";
import { UploadPlano } from "./UploadPlano";

interface Props {
  /** Elemento que dispara a abertura do drawer */
  children: React.ReactNode;
  /** Nome da localidade — exibido no título do drawer */
  localeName?: string;
}

export function UploadPlanoDrawer({ children, localeName }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* ── Fecha com Escape ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Bloqueia scroll do body ──────────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ── Move foco para o botão fechar ao abrir ───────────────────────── */
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    // Devolve foco ao wrapper do trigger (que contém o botão filho)
    const firstFocusable = triggerRef.current?.querySelector<HTMLElement>(
      "button, a, [tabindex]"
    );
    firstFocusable?.focus();
  }

  return (
    <>
      {/* Trigger — envolve o children para capturar o clique */}
      <div
        ref={triggerRef}
        onClick={() => setOpen(true)}
        style={{ display: "contents" }}
      >
        {children}
      </div>

      {/* Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-stretch sm:justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-drawer-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Painel — bottom sheet em mobile, lateral em desktop */}
          <div
            className={[
              "relative bg-white flex flex-col overflow-hidden shadow-2xl",
              /* Mobile: bottom sheet */
              "w-full max-h-[90dvh] rounded-t-2xl",
              /* Desktop: painel lateral */
              "sm:w-[480px] sm:max-h-full sm:h-full sm:rounded-none sm:rounded-l-2xl",
              /* Animação — gerenciada via .drawer-panel em globals.css */
              "drawer-panel",
            ].join(" ")}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-border flex-shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-0.5">
                  Contribua com o acervo
                </p>
                <h2
                  id="upload-drawer-title"
                  className="font-black text-lg text-foreground leading-snug"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {localeName
                    ? `Enviar plano — ${localeName}`
                    : "Enviar plano municipal"}
                </h2>
              </div>

              {/* Botão fechar */}
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Fechar formulário de envio de plano"
                className="ml-4 flex-shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <svg
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

            {/* Conteúdo rolável */}
            <div className="overflow-y-auto flex-1 px-6 py-6">
              <UploadPlano />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
