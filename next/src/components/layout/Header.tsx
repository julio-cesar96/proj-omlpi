"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * Header — componente
 *
 * Fase 1: estrutura semântica com links de âncora para cada seção.
 * Fase 2: adicionar highlight de seção ativa (IntersectionObserver
 *         no client) e comportamento de scroll.
 */

const NAV_LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#sobre", label: "Sobre" },
  { href: "#pnipi", label: "PNIPI" },
  { href: "#midiateca", label: "Midiateca" },
  { href: "#consulta-publica", label: "Consulta pública" },
  { href: "#contato", label: "Contato" },
] as const;

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo (Esquerda) */}
        <div className="flex-1 flex justify-start">
          <a
            href="#inicio"
            aria-label="Observa — ir para o início"
            className="flex items-center gap-2 font-heading tracking-tight"
          >
            <div className="bg-[#F25D27] rounded-full w-9 h-9 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Ob</span>
            </div>
            <span className="font-black text-foreground text-xl">
              Observa<span className="text-[#F25D27]">.</span>
            </span>
          </a>
        </div>

        {/* Navegação principal (Centro) */}
        <nav aria-label="Navegação principal" className="hidden md:flex flex-1 justify-center">
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="block whitespace-nowrap px-3 py-1.5 text-[13px] font-medium text-foreground/70 rounded-full transition-colors hover:text-[#F25D27] hover:bg-muted/50"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA e Botão Mobile (Direita) */}
        <div className="flex-1 flex justify-end items-center gap-4">
          <a
            href="#contato"
            className="hidden md:flex bg-[#F25D27] text-white rounded-full px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Fale conosco
          </a>

          {/* Botão Mobile */}
          <button
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            className={`flex md:hidden items-center justify-center rounded-md p-2 text-foreground/80 hover:bg-muted ${
              isMobileMenuOpen ? "border border-[#F25D27]" : ""
            }`}
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Painel de Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-muted border-t border-border">
          <ul className="flex flex-col px-4 py-4 gap-2 list-none m-0">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="block px-4 py-3 text-sm font-medium text-foreground/70 rounded-md transition-colors hover:text-[#F25D27] hover:bg-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
