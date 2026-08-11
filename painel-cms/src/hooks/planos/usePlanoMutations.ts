import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Plano, PlanoPayload } from '../../lib/strapi';

export function usePlanoMutations() {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['planos'] });
    queryClient.invalidateQueries({ queryKey: ['planos-count'] });
  };

  const createPlano = useMutation<Plano, Error, PlanoPayload>({
    mutationFn: async (payload) => {
      const fullPayload: PlanoPayload = {
        ...payload,
        published_at: payload.estado_editorial === 'publicado'
          ? (payload.published_at || new Date().toISOString())
          : null,
      };
      const res = await apiFetch('/planos', {
        method: 'POST',
        body: JSON.stringify(fullPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao criar plano.');
      }
      return res.json();
    },
    onSuccess: invalidateQueries,
  });

  const updatePlano = useMutation<Plano, Error, { id: number; payload: Partial<PlanoPayload> }>({
    mutationFn: async ({ id, payload }) => {
      const fullPayload: Partial<PlanoPayload> = {
        ...payload,
        published_at: payload.estado_editorial === 'publicado'
          ? (payload.published_at || new Date().toISOString())
          : null,
      };
      const res = await apiFetch(`/planos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(fullPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao atualizar plano.');
      }
      return res.json();
    },
    onSuccess: invalidateQueries,
  });

  const publishPlano = useMutation<Plano, Error, { id: number; payload: Partial<PlanoPayload> }>({
    mutationFn: async ({ id, payload }) => {
      const fullPayload: Partial<PlanoPayload> = {
        ...payload,
        estado_editorial: 'publicado',
        published_at: new Date().toISOString(),
      };
      const res = await apiFetch(`/planos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(fullPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao publicar plano.');
      }
      return res.json();
    },
    onSuccess: invalidateQueries,
  });

  const archivePlano = useMutation<Plano, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      const res = await apiFetch(`/planos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          estado_editorial: 'arquivado',
          published_at: null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao arquivar plano.');
      }
      return res.json();
    },
    onSuccess: invalidateQueries,
  });

  const duplicatePlano = useMutation<Plano, Error, Plano>({
    mutationFn: async (original) => {
      const payload: PlanoPayload = {
        titulo: `${original.titulo} (Cópia)`,
        descricao: original.descricao || undefined,
        categoria: original.categoria?.id || null,
        tags: original.tags?.map((t) => t.id) || [],
        documento: null, // do not copy PDF
        estado_editorial: 'rascunho',
        published_at: null, // explicitly null
      };
      const res = await apiFetch('/planos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao duplicar plano.');
      }
      return res.json();
    },
    onSuccess: invalidateQueries,
  });

  return {
    createPlano,
    updatePlano,
    publishPlano,
    archivePlano,
    duplicatePlano,
  };
}
