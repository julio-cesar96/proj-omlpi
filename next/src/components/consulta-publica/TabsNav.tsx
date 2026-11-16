"use client";

import { TABS, type TabId } from "./tabs-config";

/**
 * TabsNav — apresentacional.
 *
 * Não lê a URL: a aba ativa e o handler vêm do ConsultaPublicaView
 * (que usa useSearchParams). Sem `onTabChange`, é renderizado como
 * fallback estático no HTML pré-renderizado da home.
 */
interface TabsNavProps {
  currentTab: TabId;
  onTabChange?: (tabId: TabId) => void;
}

export function TabsNav({ currentTab, onTabChange }: TabsNavProps) {
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
              onClick={() => onTabChange?.(tab.id)}
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
            </button>
          );
        })}
      </nav>
    </div>
  );
}
