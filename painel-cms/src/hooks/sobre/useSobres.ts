import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Sobre } from '../../lib/strapi';

/**
 * useSobres — lista todos os registros da collection `sobres`.
 *
 * CRÍTICO: `_publicationState=preview` é necessário para que o Strapi v3
 * retorne TODOS os estados (publicado e rascunho). Sem ele, rascunhos ficam
 * invisíveis no painel.
 *
 * Ordenação por `created_at:ASC` — sem campo `ordem` nesta collection.
 * Limitação conhecida: reordenação exige adicionar campo `ordem` ao schema.
 */
export function useSobres() {
  return useQuery<Sobre[]>({
    queryKey: ['sobres'],
    queryFn: async () => {
      const res = await apiFetch(
        '/sobres?_publicationState=preview&_sort=created_at:ASC'
      );
      if (!res.ok) {
        throw new Error('Erro ao carregar as abas de Quem Somos.');
      }
      return res.json();
    },
  });
}
