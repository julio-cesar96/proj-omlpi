"use client";

import React from "react";

interface Props {
  value: string;
  label: string;
  tooltip?: string | null;
}

export function StatCard({ value, label, tooltip }: Props): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const tooltipId = React.useId();
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  // Limpa o timeout ao desmontar
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
            type="button"
            onClick={() => setOpen((v) => !v)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            aria-describedby={open ? tooltipId : undefined}
            aria-label={`Mais informações sobre ${label}`}
            className={`w-4 h-4 rounded-full border-[1.5px] border-primary text-[11px] font-black leading-none flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
              open
                ? "bg-primary text-white"
                : "text-primary hover:bg-primary hover:text-white"
            }`}
          >
            i
          </button>
        )}
      </div>

      {/* Popover */}
      {tooltip && open && (
        <div
          id={tooltipId}
          role="tooltip"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-20 w-64 bg-white border border-border rounded-xl shadow-xl px-4 py-3 text-left text-xs font-semibold text-foreground leading-relaxed select-text"
        >
          {tooltip}
          {/* seta */}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white drop-shadow-[0_1px_0_rgba(0,0,0,0.08)] pointer-events-none"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
