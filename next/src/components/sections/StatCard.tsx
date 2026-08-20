"use client";

import React from "react";

export function StatCard({
  value,
  label,
  tooltip,
}: {
  value: string;
  label: string;
  tooltip?: string | null;
}) {
  const [open, setOpen] = React.useState(false);

  // Fecha ao clicar fora
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative text-center">
      {/* Número */}
      <div
        className="text-3xl lg:text-[38px] font-black text-foreground mb-1.5"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {value}
      </div>
      {/* Rótulo + ícone ⓘ se tiver tooltip */}
      <div className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
        {label}
        {tooltip && (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={`Mais informações sobre ${label}`}
            className="w-4 h-4 rounded-full border border-muted-foreground/40 text-muted-foreground/60 text-[10px] font-bold leading-none flex items-center justify-center flex-shrink-0 hover:border-foreground hover:text-foreground transition-colors"
          >
            i
          </button>
        )}
      </div>

      {/* Popover */}
      {tooltip && open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-20 w-64 bg-white border border-border rounded-xl shadow-lg px-4 py-3 text-left text-xs text-foreground leading-[1.7]">
          {tooltip}
          {/* seta */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white drop-shadow-[0_1px_0_rgba(0,0,0,0.08)]" />
        </div>
      )}
    </div>
  );
}
