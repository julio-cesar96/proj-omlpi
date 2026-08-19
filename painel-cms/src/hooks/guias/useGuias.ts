import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Guia, GuiasListParams } from '../../lib/strapi';

export function useGuias(params: GuiasListParams = {}) {
  return useQuery<Guia[]>({
    queryKey: ['guias', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      searchParams.append('_sort', params._sort ?? 'created_at:desc');

      if (params._start !== undefined) searchParams.append('_start', params._start.toString());
      if (params._limit !== undefined) searchParams.append('_limit', params._limit.toString());
      if (params._q) searchParams.append('_q', params._q);

      const endpoint = `/guias?${searchParams.toString()}`;
      const res = await apiFetch(endpoint);
      if (!res.ok) {
        throw new Error('Erro ao carregar a lista de guias / documentos.');
      }
      return res.json();
    },
  });
}
