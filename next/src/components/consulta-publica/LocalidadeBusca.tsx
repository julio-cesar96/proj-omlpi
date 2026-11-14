"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * LocalidadeBusca — Client Component
 *
 * Combobox/autocomplete para buscar localidades (municípios e estados).
 * Sem dependências externas.
 * Possui cache em memória no cliente: termos já buscados não disparam novas requisições.
 * Quando a prop `locales` é fornecida (ex: estados), filtra client-side.
 * Quando `locales` não é fornecida, busca sob demanda via /api/locales?q=...
 * Ao selecionar: atualiza ?tab=municipais&location_id=ID na URL.
 */

const MAX_RESULTS = 10;
const DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

// Cache em memória no cliente para buscas já realizadas (evita requisições repetidas)
const clientSearchCache = new Map<string, SearchLocaleItem[]>();

// Normaliza string para comparação: remove acentos e converte para minúsculas
function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export interface SearchLocaleItem {
  id: number;
  name: string;
  state?: string;
  type?: string;
}

interface LocalidadeBuscaProps {
  locales?: SearchLocaleItem[];
  placeholder?: string;
  selectedId?: number;
  initialName?: string;
  typeFilter?: "city" | "state";
}

export function LocalidadeBusca({
  locales,
  placeholder = "Buscar município ou estado...",
  selectedId,
  initialName: initialNameProp,
  typeFilter,
}: LocalidadeBuscaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Deriva nome inicial a partir de initialNameProp ou busca em locales locais
  const derivedInitialName =
    initialNameProp ??
    (selectedId && locales
      ? (locales.find((l) => l.id === selectedId)?.name ?? "")
      : "");

  const [query, setQuery] = useState(derivedInitialName);
  const [results, setResults] = useState<SearchLocaleItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedName, setSelectedName] = useState(derivedInitialName);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = "localidade-busca-list";

  const [prevInitialName, setPrevInitialName] = useState(derivedInitialName);
  if (derivedInitialName !== prevInitialName) {
    setPrevInitialName(derivedInitialName);
    setQuery(derivedInitialName);
    setSelectedName(derivedInitialName);
  }

  // Se selectedId foi passado sem initialName e sem locales, busca o nome sob demanda
  useEffect(() => {
    if (!selectedId || derivedInitialName || locales) return;

    let cancelled = false;

    async function loadSelectedName() {
      try {
        const res = await fetch(`/api/locales?id=${selectedId}`);
        if (!res.ok) return;
        const data: SearchLocaleItem = await res.json();
        if (!cancelled && data?.name) {
          setQuery(data.name);
          setSelectedName(data.name);
        }
      } catch (err) {
        console.error("[LocalidadeBusca] Erro ao carregar localidade:", err);
      }
    }

    loadSelectedName();
    return () => {
      cancelled = true;
    };
  }, [selectedId, derivedInitialName, locales]);

  const runSearch = useCallback(
    async (q: string) => {
      const term = normalize(q.trim());
      if (term.length < MIN_SEARCH_LENGTH) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      if (locales && locales.length > 0) {
        const filtered = locales
          .filter(
            (l) =>
              (!typeFilter || l.type === typeFilter) &&
              normalize(l.name ?? "").includes(term)
          )
          .slice(0, MAX_RESULTS);
        setResults(filtered);
        setIsOpen(filtered.length > 0);
        setActiveIndex(-1);
        return;
      }

      // 1. Verifica cache no cliente (0ms, sem request de rede)
      const cacheKey = `${term}_${typeFilter ?? "all"}`;
      if (clientSearchCache.has(cacheKey)) {
        const cachedData = clientSearchCache.get(cacheKey)!;
        setResults(cachedData);
        setIsOpen(cachedData.length > 0);
        setActiveIndex(-1);
        return;
      }

      // 2. Busca on-demand via rota interna
      try {
        const typeParam = typeFilter ? `&type=${typeFilter}` : "";
        const res = await fetch(`/api/locales?q=${encodeURIComponent(term)}${typeParam}`);
        if (!res.ok) throw new Error("Erro na busca");
        const data: SearchLocaleItem[] = await res.json();

        // Guarda no cache do cliente
        clientSearchCache.set(cacheKey, data);

        setResults(data);
        setIsOpen(data.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        console.error("[LocalidadeBusca] Erro ao buscar localidades:", err);
        setResults([]);
        setIsOpen(false);
      }
    },
    [locales, typeFilter]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedName("");

    // Se o usuário apagou tudo no input
    if (val.trim() === "") {
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      // Se havia localidade na URL, remove para não ficar travado
      if (searchParams.has("location_id")) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("location_id");
        params.delete("area");
        router.replace(`?${params.toString()}#consulta-publica`, { scroll: false });
      }
      return;
    }

    // Se o termo já estiver em cache, exibe instantaneamente sem esperar debounce
    const term = normalize(val.trim());
    const cacheKey = `${term}_${typeFilter ?? "all"}`;
    if (clientSearchCache.has(cacheKey)) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const cached = clientSearchCache.get(cacheKey)!;
      setResults(cached);
      setIsOpen(cached.length > 0);
      setActiveIndex(-1);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), DEBOUNCE_MS);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedName("");
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchParams.has("location_id")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("location_id");
      params.delete("area");
      router.replace(`?${params.toString()}#consulta-publica`, { scroll: false });
    }

    inputRef.current?.focus();
  };

  const handleSelect = (locale: SearchLocaleItem) => {
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

        {/* Botão de limpar busca (quando há texto) OU Ícone de lupa */}
        {query.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpar busca de localidade"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
        )}
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
