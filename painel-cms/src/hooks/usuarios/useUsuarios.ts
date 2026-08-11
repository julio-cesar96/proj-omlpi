import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { StrapiUsuario } from '../../lib/strapi';

export function useUsuarios() {
  return useQuery<StrapiUsuario[]>({
    queryKey: ['usuarios'],
    queryFn: async () => {
      // GET /users retorna array com role populado automaticamente no Strapi v3
      const res = await apiFetch('/users?_sort=username:ASC');
      if (!res.ok) {
        throw new Error('Erro ao carregar a lista de usuários.');
      }
      return res.json();
    },
  });
}
