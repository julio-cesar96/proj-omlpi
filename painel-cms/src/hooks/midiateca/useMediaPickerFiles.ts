import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { appendMimeFilters } from '../../lib/media';
import type { StrapiFile, MediaFilterKey } from '../../lib/strapi';

interface UseMediaPickerFilesParams {
  searchQuery?: string;
  page: number;
  limit?: number;
  filterType?: MediaFilterKey;
}

export function useMediaPickerFiles({
  searchQuery = '',
  page,
  limit = 20,
  filterType = 'all',
}: UseMediaPickerFilesParams) {
  return useQuery<StrapiFile[]>({
    queryKey: ['media-picker-files', filterType, searchQuery, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('_start', ((page - 1) * limit).toString());
      params.append('_limit', limit.toString());
      params.append('_sort', 'created_at:DESC');

      appendMimeFilters(params, filterType);

      if (searchQuery.trim()) {
        params.append('_q', searchQuery.trim());
      }

      const res = await apiFetch(`/upload/files?${params.toString()}`);
      if (!res.ok) throw new Error('Erro ao carregar arquivos da Midiateca.');
      return res.json();
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}
