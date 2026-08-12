import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';

/**
 * Mutation para alternar a visibilidade pública de um arquivo.
 *
 * Usa PUT /midiateca-publica/:id com { is_public } no body.
 * Rota customizada necessária porque PUT /upload/files/:id não existe
 * no Strapi v3.3.3 (confirmado via código-fonte do plugin Upload).
 *
 * Invalida as queries ['media-files'] ao completar com sucesso,
 * forçando recarregamento do grid para refletir o novo badge de status.
 */
export function useMediaTogglePublic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_public }: { id: number; is_public: boolean }) => {
      const res = await apiFetch(`/midiateca-publica/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public }),
      });
      if (!res.ok) {
        throw new Error('Erro ao atualizar visibilidade do arquivo.');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
    },
  });
}
