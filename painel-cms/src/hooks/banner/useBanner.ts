import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Banner, BannerPayload } from '../../lib/strapi';

export const BANNER_QUERY_KEY = ['banner'] as const;

/**
 * Hook para leitura e salvamento do Banner da página inicial.
 *
 * `banners` é um singleType no Strapi — GET e PUT em `/banners` sem id.
 *
 * ⚠️ CRÍTICO: draftAndPublish está ativo no content-type `banners`.
 * O `published_at` lido do GET deve sempre ser reenviado no PUT.
 * Omiti-lo aciona o bug de auto-publicação do Strapi v3 (registrado em
 * fase-2-planos.md): o Strapi preenche published_at com o timestamp atual
 * se o campo for undefined/ausente no payload — ou, pior, o zera para null.
 *
 * Precedente de padrão: useConfiguracoes.ts (GET + PUT de singleType).
 */
export function useBanner() {
  const queryClient = useQueryClient();

  const query = useQuery<Banner>({
    queryKey: BANNER_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/banners');
      if (!res.ok) throw new Error('Erro ao carregar o Banner da página inicial.');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos — muda raramente
  });

  const mutation = useMutation<Banner, Error, BannerPayload>({
    mutationFn: async (payload) => {
      const res = await apiFetch('/banners', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message || 'Erro ao salvar Banner.'
        );
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Atualiza o cache diretamente para todos os subscribers
      queryClient.setQueryData(BANNER_QUERY_KEY, data);
    },
  });

  return {
    banner: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    saveBanner: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  };
}
