import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { PaginaInstitucional, TextosListParams } from '../../lib/strapi';

export function useTextos(params: TextosListParams = {}) {
  return useQuery<PaginaInstitucional[]>({
    queryKey: ['textos', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      // CRÍTICO: _publicationState=preview é necessário para retornar rascunhos e publicados
      searchParams.append('_publicationState', 'preview');
      
      searchParams.append('_sort', params._sort ?? 'updated_at:DESC');

      if (params._start !== undefined) searchParams.append('_start', params._start.toString());
      if (params._limit !== undefined) searchParams.append('_limit', params._limit.toString());
      if (params._q) searchParams.append('_q', params._q);

      const res = await apiFetch(`/paginas-institucionais?${searchParams.toString()}`);
      if (!res.ok) {
        throw new Error('Erro ao carregar a lista de páginas institucionais.');
      }
      return res.json();
    },
  });
}
