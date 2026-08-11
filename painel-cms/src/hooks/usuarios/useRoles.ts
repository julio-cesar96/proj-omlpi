import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { RoleLookup } from '../../lib/strapi';

export function useRoles() {
  return useQuery<RoleLookup[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      // Endpoint customizado que retorna apenas {id, name} dos 3 roles do painel,
      // sem a policy admin::hasPermissions que bloqueia o endpoint nativo.
      const res = await apiFetch('/role-lookup');
      if (!res.ok) {
        throw new Error('Erro ao carregar os perfis de acesso.');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // roles mudam raramente — 5 min de cache
  });
}
