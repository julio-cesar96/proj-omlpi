import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Faq, FaqsListParams } from '../../lib/strapi';

export function useFaqs(params: FaqsListParams = {}) {
  return useQuery<Faq[]>({
    queryKey: ['faqs', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      // CRÍTICO: _publicationState=preview é necessário para que o Strapi v3 retorne
      // TODOS os estados (publicada e rascunho). Sem ele, apenas FAQs com published_at
      // não-nulo são retornadas — rascunhos ficam invisíveis no painel.
      // Este parâmetro é EXCLUSIVO do painel-cms. O site público (Next.js) NÃO deve
      // usá-lo, para continuar exibindo somente conteúdo publicado.
      searchParams.append('_publicationState', 'preview');

      // Ordenar por campo `ordem` por padrão para respeitar a sequência definida via DnD.
      searchParams.append('_sort', params._sort ?? 'ordem:ASC');

      if (params._start !== undefined) searchParams.append('_start', params._start.toString());
      if (params._limit !== undefined) searchParams.append('_limit', params._limit.toString());
      if (params._q) searchParams.append('_q', params._q);

      const endpoint = `/faqs?${searchParams.toString()}`;
      const res = await apiFetch(endpoint);
      if (!res.ok) {
        throw new Error('Erro ao carregar a lista de FAQs.');
      }
      return res.json();
    },
  });
}
