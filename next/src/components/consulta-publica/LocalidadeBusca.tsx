"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StrapiLocale } from "@/lib/strapi";

/**
 * LocalidadeBusca — Client Component
 *
 * Combobox/autocomplete para buscar localidades (municípios e estados).
 * Sem dependências externas (sem Awesomplete, fuzzysort ou react-select).
 * Filtragem client-side com normalização de acentos.
 * Ao selecionar: atualiza ?tab=municipais&location_id=ID na URL.
 */

const MAX_RESULTS = 10;
const DEBOUNCE_MS = 150;

// Normaliza string para comparação: remove acentos e converte para minúsculas
function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

interface LocalidadeBuscaProps {
  locales: StrapiLocale[];
  placeholder?: string;
  selectedId?: number;
}

export function LocalidadeBusca({
  locales,
  placeholder = "Buscar município ou estado...",
  selectedId,
}: LocalidadeBuscaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Deriva nome inicial a partir dos props — evita setState síncrono em useEffect
  const initialName = selectedId
    ? (locales.find((l) => l.id === selectedId)?.name ?? "")
    : "";

  const [query, setQuery] = useState(initialName);
  const [results, setResults] = useState<StrapiLocale[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedName, setSelectedName] = useState(initialName);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = "localidade-busca-list";

  const runSearch = useCallback(
    (q: string) => {
      const term = normalize(q.trim());
      if (!term) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      const filtered = locales
        .filter(
          (l) =>
            (l.type === "city" || l.type === "state") &&
            normalize(l.name ?? "").includes(term)
        )
        .slice(0, MAX_RESULTS);
      setResults(filtered);
      setIsOpen(filtered.length > 0);
      setActiveIndex(-1);
    },
    [locales]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedName("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), DEBOUNCE_MS);
  };

  const handleSelect = (locale: StrapiLocale) => {
    setQuery(locale.name ?? "");
    setSelectedName(locale.name ?? "");
    setIsOpen(false);
    setResults([]);
    setActiveIndex(-1);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "municipais");
    params.set("location_id", String(locale.id));
    params.delete("area");
    router.replace(`?${params.toString()}#consulta-publica`, { scroll: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          handleSelect(results[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.closest("[data-localidade-busca]")?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scrolla item ativo para visão
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const isSelected = Boolean(selectedName && query === selectedName);

  return (
    <div data-localidade-busca className="relative w-full max-w-sm">
      <label htmlFor="localidade-input" className="sr-only">
        Buscar localidade
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="localidade-input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={
            activeIndex >= 0 ? `localidade-opt-${activeIndex}` : undefined
          }
          autoComplete="off"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && !isSelected && runSearch(query)}
          placeholder={placeholder}
          className={[
            "w-full px-4 py-2.5 pr-10 rounded-lg border text-sm",
            "bg-input-background placeholder:text-muted-foreground",
            "focus:outline-2 focus:outline-ring transition-colors",
            isSelected
              ? "border-secondary text-foreground"
              : "border-border text-foreground",
          ].join(" ")}
        />
        {/* Ícone de busca */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
      </div>

      {isOpen && results.length > 0 && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Resultados de busca de localidade"
          className={[
            "absolute z-50 w-full mt-1 max-h-64 overflow-y-auto",
            "bg-card border border-border rounded-lg shadow-lg",
          ].join(" ")}
        >
          {results.map((locale, idx) => (
            <li
              key={locale.id}
              id={`localidade-opt-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(locale);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              className={[
                "px-4 py-2.5 cursor-pointer text-sm flex items-center gap-2",
                activeIndex === idx
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block w-1.5 h-1.5 rounded-full flex-shrink-0",
                  locale.type === "state"
                    ? "bg-primary"
                    : "bg-muted-foreground",
                ].join(" ")}
              />
              <span className="truncate">{locale.name}</span>
              {locale.type === "state" && (
                <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                  Estado
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
