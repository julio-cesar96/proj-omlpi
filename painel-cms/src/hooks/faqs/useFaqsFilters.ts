import { useRef, useState } from 'react';

export type FaqsTabKey = 'all' | 'publicadas' | 'rascunhos';

export const PAGE_LIMIT = 20;

const SEARCH_DEBOUNCE_MS = 400;

// Estado de página, busca (com debounce) e aba ativa da tela de FAQs.
// As três mudanças resetam a paginação para a primeira página.
export function useFaqsFilters() {
  const [page, setPage] = useState(1);

  const [searchRaw, setSearchRaw] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchRaw(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
  };

  const [activeTab, setActiveTab] = useState<FaqsTabKey>('all');

  const handleTabChange = (tab: FaqsTabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  return {
    page,
    setPage,
    searchRaw,
    search,
    handleSearchChange,
    activeTab,
    handleTabChange,
  };
}
