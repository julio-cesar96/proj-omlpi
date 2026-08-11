import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { PaginaInstitucional, PaginaInstitucionalPayload } from '../../lib/strapi';

export function useTextoMutations() {
  const queryClient = useQueryClient();

  const invalidateQueries = (id?: number) => {
    queryClient.invalidateQueries({ queryKey: ['textos'] });
    if (id !== undefined) {
      queryClient.invalidateQueries({ queryKey: ['texto', id] });
    }
  };

  // ─── Criar Página ────────────────────────────────────────────────────────
  const createTexto = useMutation<PaginaInstitucional, Error, PaginaInstitucionalPayload>({
    mutationFn: async (payload) => {
      const res = await apiFetch('/paginas-institucionais', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || 'Erro ao criar página institucional.');
      }
      return res.json();
    },
    onSuccess: (data) => invalidateQueries(data.id),
  });

  // ─── Atualizar Página ────────────────────────────────────────────────────
  const updateTexto = useMutation<PaginaInstitucional, Error, { id: number; payload: Partial<PaginaInstitucionalPayload> }>({
    mutationFn: async ({ id, payload }) => {
      const res = await apiFetch(`/paginas-institucionais/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || 'Erro ao atualizar página institucional.');
      }
      return res.json();
    },
    onSuccess: (data) => invalidateQueries(data.id),
  });

  // ─── Excluir Página ──────────────────────────────────────────────────────
  const deleteTexto = useMutation<void, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      const res = await apiFetch(`/paginas-institucionais/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(
            'Sem permissão para excluir. Habilite "delete" para Authenticated em Settings → Roles no Strapi Admin.'
          );
        }
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || 'Erro ao excluir página institucional.');
      }
    },
    onSuccess: () => invalidateQueries(),
  });

  return {
    createTexto,
    updateTexto,
    deleteTexto,
  };
}
