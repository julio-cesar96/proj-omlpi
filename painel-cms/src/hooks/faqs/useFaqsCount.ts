import { useQueries } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';

export interface FaqsCounts {
  all: number;
  publicadas: number;
  rascunhos: number;
}

export function useFaqsCount(querySearch: string = '') {
  const queryResults = useQueries({
    queries: [
      {
        // Contagem total (todos os estados)
        queryKey: ['faqs-count', 'all', querySearch],
        queryFn: async () => {
          // CRÍTICO: _publicationState=preview expõe todos os estados ao painel.
          const params = new URLSearchParams({ _publicationState: 'preview' });
          if (querySearch) params.append('_q', querySearch);
          const res = await apiFetch(`/faqs/count?${params.toString()}`);
          if (!res.ok) return 0;
          return res.json() as Promise<number>;
        },
      },
      {
        // Contagem de publicadas (published_at não-nulo)
        queryKey: ['faqs-count', 'publicadas', querySearch],
        queryFn: async () => {
          const params = new URLSearchParams({
            _publicationState: 'preview',
            published_at_null: 'false',
          });
          if (querySearch) params.append('_q', querySearch);
          const res = await apiFetch(`/faqs/count?${params.toString()}`);
          if (!res.ok) return 0;
          return res.json() as Promise<number>;
        },
      },
    ],
  });

  const isLoading = queryResults.some((q) => q.isLoading);

  const all = typeof queryResults[0]?.data === 'number' ? queryResults[0].data : 0;
  const publicadas = typeof queryResults[1]?.data === 'number' ? queryResults[1].data : 0;

  // rascunhos calculado aritmeticamente para evitar dependência do filtro _null do Strapi v3,
  // cujo comportamento com published_at_null=true precisa ser verificado empiricamente.
  const counts: FaqsCounts = {
    all,
    publicadas,
    rascunhos: Math.max(0, all - publicadas),
  };

  return { counts, isLoading };
}
