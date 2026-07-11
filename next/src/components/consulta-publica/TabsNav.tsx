"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { TABS, type TabId } from "./tabs-config";


interface TabsNavProps {
  currentTab: TabId;
}

export function TabsNav({ currentTab }: TabsNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTab = useCallback(
    (tabId: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      // Limpa location_id e area ao voltar para o mapa
      if (tabId === "mapa") {
        params.delete("location_id");
        params.delete("area");
      }
      router.replace(`?${params.toString()}#consulta-publica`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="border-b border-border overflow-x-auto">
      <nav
        className="flex min-w-max"
        role="tablist"
        aria-label="Abas da Consulta Pública"
      >
        {TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => handleTab(tab.id)}
              className={[
                "px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors relative",
                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-0",
                isActive
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {tab.label}
              {tab.id === "monitoramento" && (
                <span className="ml-1.5 text-xs bg-muted text-muted-foreground rounded px-1 py-0.5">
                  em breve
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
