import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { ElaborePlano, ElaborePlanoPayload } from '../../lib/strapi';

export const ELABORE_PLANO_QUERY_KEY = ['elabore-plano'] as const;

/**
 * Hook para leitura e salvamento das informações de "Elabore o Plano".
 *
 * `elabore-planos` é um singleType no Strapi — GET e PUT em `/elabore-planos`.
 */
export function useElaborePlano() {
  const queryClient = useQueryClient();

  const query = useQuery<ElaborePlano>({
    queryKey: ELABORE_PLANO_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/elabore-planos?_publicationState=preview');
      if (!res.ok) throw new Error('Erro ao carregar os dados de Elabore o Plano.');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation<ElaborePlano, Error, ElaborePlanoPayload>({
    mutationFn: async (payload) => {
      const res = await apiFetch('/elabore-planos', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message || 'Erro ao salvar Elabore o Plano.'
        );
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(ELABORE_PLANO_QUERY_KEY, data);
    },
  });



  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    saveElaborePlano: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  };
}
