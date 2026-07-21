import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Plano, PlanosListParams } from '../../lib/strapi';

export function usePlanos(params: PlanosListParams = {}) {
  return useQuery<Plano[]>({
    queryKey: ['planos', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params._start !== undefined) searchParams.append('_start', params._start.toString());
      if (params._limit !== undefined) searchParams.append('_limit', params._limit.toString());
      if (params._sort) searchParams.append('_sort', params._sort);
      if (params._q) searchParams.append('_q', params._q);
      if (params.estado_editorial) searchParams.append('estado_editorial', params.estado_editorial);

      const queryString = searchParams.toString();
      const endpoint = `/planos${queryString ? `?${queryString}` : ''}`;
      
      const res = await apiFetch(endpoint);
      if (!res.ok) {
        throw new Error('Erro ao carregar a lista de planos.');
      }
      return res.json();
    },
  });
}
