import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Locale, LocalesListParams } from '../../lib/strapi';

export function useLocales(params: LocalesListParams = {}) {
  return useQuery<Locale[]>({
    queryKey: ['locales', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params._start !== undefined) searchParams.append('_start', params._start.toString());
      if (params._limit !== undefined) searchParams.append('_limit', params._limit.toString());
      if (params._sort) searchParams.append('_sort', params._sort);
      if (params._q) searchParams.append('_q', params._q);
      if (params.state) searchParams.append('state', params.state);
      if (params.type) searchParams.append('type', params.type);

      const queryString = searchParams.toString();
      const endpoint = `/locales${queryString ? `?${queryString}` : ''}`;

      const res = await apiFetch(endpoint);
      if (!res.ok) {
        throw new Error('Erro ao carregar a lista de localidades.');
      }
      return res.json();
    },
  });
}
