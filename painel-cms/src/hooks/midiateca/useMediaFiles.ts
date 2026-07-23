import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { StrapiFile, MediaSortKey, MediaFilterKey } from '../../lib/strapi';
import { getSortParam, appendMimeFilters } from '../../lib/media';

interface UseMediaFilesParams {
  start: number;
  limit: number;
  sortKey: MediaSortKey;
  filterType: MediaFilterKey;
  searchQuery?: string;
}

export function useMediaFiles({ start, limit, sortKey, filterType, searchQuery = '' }: UseMediaFilesParams) {
  return useQuery<StrapiFile[]>({
    queryKey: ['media-files', start, limit, sortKey, filterType, searchQuery],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('_start', start.toString());
      searchParams.append('_limit', limit.toString());
      searchParams.append('_sort', getSortParam(sortKey));
      
      appendMimeFilters(searchParams, filterType);

      if (searchQuery) {
        searchParams.append('_q', searchQuery);
      }

      const queryString = searchParams.toString();
      const endpoint = `/upload/files${queryString ? `?${queryString}` : ''}`;

      const res = await apiFetch(endpoint);
      if (!res.ok) {
        throw new Error('Erro ao carregar a lista de arquivos.');
      }
      return res.json();
    },
  });
}
