"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Botão flutuante "voltar ao topo".
 *
 * - Oculto enquanto scrollY < THRESHOLD
 * - Aparece com fade + slide suave (CSS transition)
 * - Usa requestAnimationFrame para throttle do listener de scroll
 * - z-index: 40 (abaixo do CookieBanner z-50 e do Modal z-[200])
 */

const THRESHOLD = 400; // px de scroll para exibir o botão

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Throttle via requestAnimationFrame
      if (rafIdRef.current !== null) return;

      rafIdRef.current = requestAnimationFrame(() => {
        setVisible(window.scrollY >= THRESHOLD);
        rafIdRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      type="button"
      aria-label="Voltar ao topo da página"
      style={{
        // Posicionamento fixo — canto inferior direito
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        // Empilhamento: acima do conteúdo, abaixo do CookieBanner (z-50)
        zIndex: 40,
        // Dimensões
        width: "2.75rem",
        height: "2.75rem",
        // Visual
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background: "var(--color-primary, #0ea5e9)",
        color: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        // Transição de visibilidade
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(0.75rem)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        // Evitar interação quando invisível
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Seta para cima */}
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
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
