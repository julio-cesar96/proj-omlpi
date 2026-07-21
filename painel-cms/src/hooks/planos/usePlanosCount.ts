import { useQueries } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { EditorialState } from '../../lib/strapi';

export interface PlanosCounts {
  all: number;
  rascunho: number;
  revisao: number;
  publicado: number;
  arquivado: number;
}

const states: EditorialState[] = ['rascunho', 'revisao', 'publicado', 'arquivado'];

export function usePlanosCount(querySearch: string = '') {
  const queryResults = useQueries({
    queries: [
      {
        queryKey: ['planos-count', 'all', querySearch],
        queryFn: async () => {
          const qParam = querySearch ? `?_q=${encodeURIComponent(querySearch)}` : '';
          const res = await apiFetch(`/planos/count${qParam}`);
          if (!res.ok) return 0;
          return res.json();
        },
      },
      ...states.map((st) => ({
        queryKey: ['planos-count', st, querySearch],
        queryFn: async () => {
          const params = new URLSearchParams();
          params.append('estado_editorial', st);
          if (querySearch) params.append('_q', querySearch);
          const res = await apiFetch(`/planos/count?${params.toString()}`);
          if (!res.ok) return 0;
          return res.json();
        },
      })),
    ],
  });

  const isLoading = queryResults.some((q) => q.isLoading);

  const counts: PlanosCounts = {
    all: typeof queryResults[0]?.data === 'number' ? queryResults[0].data : 0,
    rascunho: typeof queryResults[1]?.data === 'number' ? queryResults[1].data : 0,
    revisao: typeof queryResults[2]?.data === 'number' ? queryResults[2].data : 0,
    publicado: typeof queryResults[3]?.data === 'number' ? queryResults[3].data : 0,
    arquivado: typeof queryResults[4]?.data === 'number' ? queryResults[4].data : 0,
  };

  return { counts, isLoading };
}
