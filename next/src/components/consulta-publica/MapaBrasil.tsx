"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * MapaBrasil — Client Component Wrapper
 *
 * Envolve o mapa do Highcharts em um IntersectionObserver e dynamic import (ssr: false).
 * O bundle pesado do Highcharts só é baixado e executado quando a seção #consulta-publica
 * se aproxima da viewport (300px de antecedência), garantindo TBT baixo e pontuação
 * máxima no Lighthouse para a página inicial.
 */

export interface StateMapSummary {
  id: number;
  name: string;
  state: string;
  status: "approved" | "inProgress" | "none";
  planUrl: string | null;
  totalPlans: number;
  totalCities: number;
  isDF: boolean;
}

export interface MapaBrasilProps {
  statesSummary: StateMapSummary[];
}

export function MapaBrasilSkeleton() {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          Clique em um estado para ver os planos municipais
        </p>
      </div>
      <div
        style={{ height: "520px", width: "100%" }}
        className="rounded-lg overflow-hidden bg-muted/40 flex items-center justify-center relative border border-border/40"
        aria-label="Carregando mapa..."
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando mapa...</p>
        </div>
      </div>
    </div>
  );
}

const DynamicMapaBrasilChart = dynamic(
  () => import("./MapaBrasilChart").then((mod) => mod.MapaBrasilChart),
  {
    ssr: false,
    loading: () => <MapaBrasilSkeleton />,
  }
);

export function MapaBrasil({ statesSummary }: MapaBrasilProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Se a URL já aponta para a seção de consulta pública ou suas abas, carrega em microtask
    if (
      typeof window !== "undefined" &&
      (window.location.hash.includes("consulta-publica") ||
        window.location.search.includes("tab="))
    ) {
      queueMicrotask(() => setIsVisible(true));
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    // Se o navegador não suportar IntersectionObserver, fallback assíncrono para visível
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setIsVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "300px", // Inicia carga 300px antes de entrar na viewport
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[520px]">
      {isVisible ? (
        <DynamicMapaBrasilChart statesSummary={statesSummary} />
      ) : (
        <MapaBrasilSkeleton />
      )}
    </div>
  );
}
