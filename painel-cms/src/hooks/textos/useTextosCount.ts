import { useQueries } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';

export function useTextosCount(search = '') {
  const queryResults = useQueries({
    queries: [
      {
        queryKey: ['textos-count', 'all', search],
        queryFn: async () => {
          const params = new URLSearchParams({ _publicationState: 'preview' });
          if (search) params.append('_q', search);
          const res = await apiFetch(`/paginas-institucionais/count?${params.toString()}`);
          if (!res.ok) throw new Error('Erro ao buscar contagem total.');
          return res.json() as Promise<number>;
        },
      },
      {
        queryKey: ['textos-count', 'publicados', search],
        queryFn: async () => {
          // CRÍTICO: _publicationState=preview expõe todos os estados ao painel;
          // published_at_null=false filtra só as publicadas. Mesmo padrão de
          // useFaqsCount.ts / usePlanosCount.ts.
          const params = new URLSearchParams({
            _publicationState: 'preview',
            published_at_null: 'false',
          });
          if (search) params.append('_q', search);
          const res = await apiFetch(`/paginas-institucionais/count?${params.toString()}`);
          if (!res.ok) throw new Error('Erro ao buscar contagem de publicadas.');
          return res.json() as Promise<number>;
        },
      },
    ],
  });

  const allCount = queryResults[0].data ?? 0;
  const publicadosCount = queryResults[1].data ?? 0;
  const rascunhosCount = Math.max(0, allCount - publicadosCount);

  const isLoading = queryResults.some((q) => q.isLoading);

  return {
    counts: {
      all: allCount,
      publicados: publicadosCount,
      rascunhos: rascunhosCount,
    },
    isLoading,
  };
}
