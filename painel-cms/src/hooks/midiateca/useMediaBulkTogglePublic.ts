import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';

/**
 * Mutation para alternar a visibilidade pública de múltiplos arquivos de uma vez.
 *
 * Usa PUT /midiateca-publica/bulk com { ids, is_public } no body.
 * Invalida as queries ['media-files'] ao completar com sucesso e
 * exibe um toast de confirmação com o número de arquivos atualizados.
 */
export function useMediaBulkTogglePublic(options?: {
  onSuccess?: (count: number) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, is_public }: { ids: number[]; is_public: boolean }) => {
      const res = await apiFetch('/midiateca-publica/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, is_public }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Erro ao atualizar visibilidade dos arquivos.');
      }
      return res.json() as Promise<{ updated: number }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      options?.onSuccess?.(data.updated);
    },
  });
}
