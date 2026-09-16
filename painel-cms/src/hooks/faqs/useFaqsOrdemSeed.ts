import { useEffect, useRef } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Faq } from '../../lib/strapi';

// Detecta se qualquer FAQ tem ordem null ou se há valores duplicados
function needsOrdemSeed(faqs: Faq[]): boolean {
  if (faqs.length === 0) return false;
  const hasNull = faqs.some((f) => f.ordem === null || f.ordem === undefined);
  if (hasNull) return true;
  const ordens = faqs.map((f) => f.ordem as number);
  const unique = new Set(ordens);
  return unique.size !== ordens.length;
}

interface UseFaqsOrdemSeedParams {
  faqs: Faq[];
  isLoading: boolean;
  page: number;
  search: string;
  seedOrdem: UseMutationResult<void, Error, Faq[]>;
}

// Ao carregar a primeira página sem busca, verifica se alguma FAQ tem ordem
// null/duplicado e, se sim, dispara o seed. Só roda uma vez (quando os dados
// chegam do servidor pela primeira vez e o seed ainda não está pendente).
export function useFaqsOrdemSeed({ faqs, isLoading, page, search, seedOrdem }: UseFaqsOrdemSeedParams) {
  const seedRanRef = useRef(false);

  useEffect(() => {
    if (
      !isLoading &&
      faqs.length > 0 &&
      page === 1 &&
      search === '' &&
      !seedRanRef.current &&
      !seedOrdem.isPending &&
      needsOrdemSeed(faqs)
    ) {
      seedRanRef.current = true;
      seedOrdem.mutate(faqs);
    }
  }, [isLoading, faqs, page, search]); // eslint-disable-line react-hooks/exhaustive-deps
}
