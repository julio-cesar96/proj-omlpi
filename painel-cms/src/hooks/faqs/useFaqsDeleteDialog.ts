import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Faq } from '../../lib/strapi';

interface UseFaqsDeleteDialogParams {
  deleteFaq: UseMutationResult<void, Error, { id: number }>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

// Estado do alvo de exclusão e o handler de confirmação do ConfirmDialog.
export function useFaqsDeleteDialog({ deleteFaq, onSuccess, onError }: UseFaqsDeleteDialogParams) {
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFaq.mutateAsync({ id: deleteTarget.id });
      setDeleteTarget(null);
      onSuccess('FAQ excluída.');
    } catch (err) {
      setDeleteTarget(null);
      onError((err as Error).message);
    }
  };

  return { deleteTarget, setDeleteTarget, handleDeleteConfirm };
}
