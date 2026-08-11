import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Categoria } from '../../lib/strapi';

export function useCategorias() {
  return useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await apiFetch('/categorias?_sort=nome:ASC');
      if (!res.ok) {
        return [];
      }
      return res.json();
    },
  });
}
