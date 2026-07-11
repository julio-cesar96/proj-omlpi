"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "omlpi:cookies-consent";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only check on client-side mount
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      queueMicrotask(() => {
        setShowBanner(true);
      });
    } else if (consent === "accepted") {
      // Dispatch immediately if already accepted
      window.dispatchEvent(new Event("omlpi:analytics-consent"));
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    window.dispatchEvent(new Event("omlpi:analytics-consent"));
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl animate-fade-in-up rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md md:bottom-6 md:p-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-8">
        <p className="text-sm text-foreground/90 text-center md:text-left leading-relaxed">
          A visitação a esse site implica no aceite do rastreio usando cookies do Google Analytics e do Facebook para propósitos estatísticos.{" "}
          <a
            href="/rastreio"
            className="font-medium text-primary hover:underline transition-colors focus-visible:outline-none"
          >
            Saiba mais na Política de Privacidade
          </a>
          .
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleReject}
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer focus-visible:outline-none"
          >
            Rejeitar
          </button>
          <button
            onClick={handleAccept}
            type="button"
            className="px-5 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 active:scale-95 shadow-md shadow-primary/20 transition-all cursor-pointer focus-visible:outline-none"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
