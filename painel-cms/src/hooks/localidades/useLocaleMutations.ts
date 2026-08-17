import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Locale, LocaleUpdatePayload } from '../../lib/strapi';

export function useLocaleMutations() {
  const queryClient = useQueryClient();

  const updateLocale = useMutation<
    Locale,
    Error,
    { id: number; payload: LocaleUpdatePayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await apiFetch(`/locales/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMsg = 'Erro ao atualizar localidade.';
        try {
          const errData = await res.json();
          errorMsg = errData?.message || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locales'] });
      queryClient.invalidateQueries({ queryKey: ['locales-count'] });
    },
  });

  return { updateLocale };
}
