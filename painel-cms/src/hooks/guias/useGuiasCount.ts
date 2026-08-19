import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';

export function useGuiasCount(querySearch: string = '') {
  const query = useQuery<number>({
    queryKey: ['guias-count', querySearch],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (querySearch) searchParams.append('_q', querySearch);

      const endpoint = querySearch ? `/guias/count?${searchParams.toString()}` : '/guias/count';
      const res = await apiFetch(endpoint);
      if (!res.ok) return 0;
      return res.json();
    },
  });

  return {
    count: query.data ?? 0,
    isLoading: query.isLoading,
  };
}
