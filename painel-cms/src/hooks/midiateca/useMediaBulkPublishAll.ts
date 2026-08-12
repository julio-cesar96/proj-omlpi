import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { MediaFilterKey } from '../../lib/strapi';

/**
 * Mapeia o filtro ativo para o valor de mime_contains enviado ao backend.
 * Retorna undefined quando o filtro for 'all' (sem restrição de tipo).
 *
 * NOTA: 'doc' não tem um mime_contains único — é definido por exclusão
 * (tudo que não é pdf, image/ ou video/). Para o caso doc, usamos uma
 * heurística de mime_ncontains no backend; por ora enviamos mime_contains
 * vazio e o backend retorna tudo. Se precisar de suporte exato para doc,
 * expor mime_ncontains no body do endpoint.
 */
function mimeContainsForFilter(filter: MediaFilterKey): string | undefined {
  if (filter === 'pdf') return 'application/pdf';
  if (filter === 'img') return 'image/';
  if (filter === 'video') return 'video/';
  return undefined; // 'all' e 'doc' — sem mime_contains
}

interface BulkPublishAllPayload {
  filter: MediaFilterKey;
  is_public: boolean;
}

/**
 * Mutation para publicar (ou despublicar) TODOS os arquivos que combinam
 * com o filtro ativo.
 *
 * Usa PUT /midiateca-publica/bulk com { filter: { mime_contains? }, is_public }.
 * Invalida ['media-files'] ao completar e chama onSuccess com o número de
 * arquivos atualizados.
 */
export function useMediaBulkPublishAll(options?: {
  onSuccess?: (count: number) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ filter, is_public }: BulkPublishAllPayload) => {
      const mimeContains = mimeContainsForFilter(filter);

      // Constrói o objeto filter apenas com os campos presentes
      const filterBody = mimeContains ? { mime_contains: mimeContains } : {};

      const res = await apiFetch('/midiateca-publica/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter: filterBody,
          is_public,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Erro ao atualizar visibilidade dos arquivos.');
      }

      return res.json() as Promise<{ updated: number }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      options?.onSuccess?.(data.updated);
    },
  });
}
