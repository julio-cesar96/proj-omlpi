import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { CmsConfig, CmsConfigPayload } from '../../lib/strapi';

export const CMS_CONFIG_QUERY_KEY = ['cms-config'] as const;

/**
 * Hook para leitura e salvamento da configuração geral do painel.
 *
 * staleTime de 5 min: a config muda raramente; evita requests desnecessárias
 * quando múltiplos editores chamam useConfiguracoes() simultaneamente —
 * o React Query deduplica automaticamente com a mesma queryKey.
 */
export function useConfiguracoes() {
  const queryClient = useQueryClient();

  const query = useQuery<CmsConfig>({
    queryKey: CMS_CONFIG_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/cms-config');
      if (!res.ok) throw new Error('Erro ao carregar configurações.');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const mutation = useMutation<CmsConfig, Error, CmsConfigPayload>({
    mutationFn: async (payload) => {
      const res = await apiFetch('/cms-config', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || 'Erro ao salvar configurações.');
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Atualiza o cache diretamente para todos os subscribers (editores com autosave)
      queryClient.setQueryData(CMS_CONFIG_QUERY_KEY, data);
    },
  });

  return {
    config: query.data,
    isLoading: query.isLoading,
    saveConfig: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  };
}
