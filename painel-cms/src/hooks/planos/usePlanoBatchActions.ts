import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { EditorialState } from '../../lib/strapi';

export interface BatchActionResult {
  succeeded: number;
  failed: number;
  total: number;
  targetState: EditorialState;
}

export function usePlanoBatchActions() {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const executeBatchStatusChange = async (
    ids: number[],
    targetState: EditorialState
  ): Promise<BatchActionResult> => {
    if (ids.length === 0) {
      return { succeeded: 0, failed: 0, total: 0, targetState };
    }

    setIsProcessing(true);

    try {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const payload = {
            estado_editorial: targetState,
            published_at: targetState === 'publicado' ? new Date().toISOString() : null,
          };

          const res = await apiFetch(`/planos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Erro ao atualizar o plano ID ${id}`);
          }

          return res.json();
        })
      );

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      queryClient.invalidateQueries({ queryKey: ['planos'] });
      queryClient.invalidateQueries({ queryKey: ['planos-count'] });

      return {
        succeeded,
        failed,
        total: ids.length,
        targetState,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    executeBatchStatusChange,
    isProcessing,
  };
}
