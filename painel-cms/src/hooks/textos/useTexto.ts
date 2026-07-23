import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { PaginaInstitucional } from '../../lib/strapi';

export function useTexto(id: number | null) {
  return useQuery<PaginaInstitucional | null>({
    queryKey: ['texto', id],
    queryFn: async () => {
      if (id === null) return null;
      const res = await apiFetch(`/paginas-institucionais/${id}?_publicationState=preview`);
      if (!res.ok) {
        throw new Error('Erro ao carregar a página institucional.');
      }
      return res.json();
    },
    enabled: id !== null,
  });
}
