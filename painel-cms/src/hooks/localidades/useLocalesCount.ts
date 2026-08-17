import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';

interface UseLocalesCountParams {
  state?: string;
  type?: 'country' | 'region' | 'state' | 'city';
  _q?: string;
}

export function useLocalesCount(params: UseLocalesCountParams = {}) {
  return useQuery<number>({
    queryKey: ['locales-count', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.state) searchParams.append('state', params.state);
      if (params.type) searchParams.append('type', params.type);
      if (params._q) searchParams.append('_q', params._q);

      const queryString = searchParams.toString();
      const endpoint = `/locales/count${queryString ? `?${queryString}` : ''}`;

      const res = await apiFetch(endpoint);
      if (!res.ok) {
        throw new Error('Erro ao obter total de localidades.');
      }
      const count = await res.json();
      return typeof count === 'number' ? count : Number(count);
    },
  });
}
