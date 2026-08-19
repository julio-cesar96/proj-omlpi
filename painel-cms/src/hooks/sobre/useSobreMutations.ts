import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Sobre, SobrePayload } from '../../lib/strapi';

export function useSobreMutations() {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['sobres'] });
  };

  // ─── Criar aba ────────────────────────────────────────────────────────────
  const createSobre = useMutation<Sobre, Error, { payload: SobrePayload }>({
    mutationFn: async ({ payload }) => {
      const res = await apiFetch('/sobres', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message || 'Erro ao criar aba.'
        );
      }
      return res.json();
    },
    onSuccess: invalidateQueries,
  });

  // ─── Atualizar aba ────────────────────────────────────────────────────────
  const updateSobre = useMutation<
    Sobre,
    Error,
    { id: number; payload: Partial<SobrePayload> }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await apiFetch(`/sobres/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message || 'Erro ao atualizar aba.'
        );
      }
      return res.json();
    },
    onSuccess: invalidateQueries,
  });

  // ─── Excluir aba ──────────────────────────────────────────────────────────
  // Se retornar 403: habilitar permissão `delete` para a role `Authenticated`
  // em Settings → Roles → Authenticated → Sobre no Strapi Admin.
  const deleteSobre = useMutation<void, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      const res = await apiFetch(`/sobres/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(
            'Sem permissão para excluir. Habilite "delete" para Authenticated em Settings → Roles no Strapi Admin.'
          );
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message || 'Erro ao excluir aba.'
        );
      }
    },
    onSuccess: invalidateQueries,
  });

  return { createSobre, updateSobre, deleteSobre };
}
