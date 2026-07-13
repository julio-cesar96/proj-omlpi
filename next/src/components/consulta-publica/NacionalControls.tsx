"use client";

import React, { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocalidadeBusca } from "./LocalidadeBusca";
import type { OmlpiArea } from "@/lib/omlpi-api";
import type { StrapiLocale } from "@/lib/strapi";

interface NacionalControlsProps {
  locationId: number;
  localeName: string;
  localeType: string;
  currentMode: "comparacao" | "historico";
  currentAreaId: number;
  areas: OmlpiArea[];
  locales: StrapiLocale[];
}

export function NacionalControls({
  locationId,
  localeName,
  localeType,
  currentMode,
  currentAreaId,
  areas,
  locales,
}: NacionalControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleUpdate = useCallback(
    (newParams: { mode?: string; area?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newParams.mode !== undefined) params.set("mode", newParams.mode);
      if (newParams.area !== undefined) params.set("area", newParams.area);
      
      router.replace(`?${params.toString()}#consulta-publica`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Localidade e Busca */}
      <div className="flex items-start justify-between flex-wrap gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">{localeName}</h3>
            <span className="text-xs bg-muted text-muted-foreground capitalize px-2 py-0.5 rounded-md font-medium">
              {localeType}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Visualizando dados consolidados de comparação e série histórica.
          </p>
        </div>
        <LocalidadeBusca locales={locales} selectedId={locationId} />
      </div>

      {/* Switcher de Modo: Comparação ou Histórico */}
      <div className="flex items-center gap-4">
        <div className="flex bg-muted p-1 rounded-xl">
          <button
            onClick={() => handleUpdate({ mode: "comparacao" })}
            className={[
              "px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              currentMode === "comparacao"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Comparação
          </button>
          <button
            onClick={() => handleUpdate({ mode: "historico" })}
            className={[
              "px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              currentMode === "historico"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Histórico
          </button>
        </div>
      </div>

      {/* Seletor de Eixo Temático (Área) */}
      {areas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => handleUpdate({ area: String(area.id) })}
              className={[
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                currentAreaId === area.id
                  ? "bg-primary border-primary text-primary-foreground font-semibold"
                  : "bg-card border-border text-muted-foreground hover:bg-muted/70",
              ].join(" ")}
            >
              {area.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
