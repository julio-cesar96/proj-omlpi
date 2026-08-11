import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';

export function useMediaDelete() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const res = await apiFetch(`/upload/files/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Você não tem permissão para excluir este arquivo.');
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao excluir o arquivo.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      queryClient.invalidateQueries({ queryKey: ['media-count'] });
    },
  });
}
