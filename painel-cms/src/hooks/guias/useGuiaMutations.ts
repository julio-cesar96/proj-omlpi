import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { GuiaPayload } from '../../lib/strapi';

export function useGuiaMutations() {
  const queryClient = useQueryClient();

  const invalidateGuias = () => {
    queryClient.invalidateQueries({ queryKey: ['guias'] });
    queryClient.invalidateQueries({ queryKey: ['guias-count'] });
  };

  const createGuiaMutation = useMutation({
    mutationFn: async (payload: GuiaPayload) => {
      const res = await apiFetch('/guias', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Erro ao criar guia/documento.');
      }
      return res.json();
    },
    onSuccess: invalidateGuias,
  });

  const updateGuiaMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<GuiaPayload> }) => {
      const res = await apiFetch(`/guias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Erro ao atualizar guia/documento.');
      }
      return res.json();
    },
    onSuccess: invalidateGuias,
  });

  const deleteGuiaMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiFetch(`/guias/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Erro ao excluir guia/documento.');
      }
      return res.json();
    },
    onSuccess: invalidateGuias,
  });

  return {
    createGuia: createGuiaMutation.mutateAsync,
    isCreating: createGuiaMutation.isPending,
    updateGuia: updateGuiaMutation.mutateAsync,
    isUpdating: updateGuiaMutation.isPending,
    deleteGuia: deleteGuiaMutation.mutateAsync,
    isDeleting: deleteGuiaMutation.isPending,
  };
}
