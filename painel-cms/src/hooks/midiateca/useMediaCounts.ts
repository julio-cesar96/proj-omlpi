import { useQueries } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { appendMimeFilters } from '../../lib/media';

export interface MediaCounts {
  all: number;
  pdf: number;
  img: number;
  video: number;
  doc: number;
}

export function useMediaCounts(searchQuery: string = '') {
  const queryTypes: ('all' | 'pdf' | 'img' | 'video')[] = ['all', 'pdf', 'img', 'video'];

  const queryResults = useQueries({
    queries: queryTypes.map((type) => ({
      queryKey: ['media-count', type, searchQuery],
      queryFn: async () => {
        const params = new URLSearchParams();
        appendMimeFilters(params, type);
        if (searchQuery) {
          params.append('_q', searchQuery);
        }
        
        const queryString = params.toString();
        const res = await apiFetch(`/upload/files/count${queryString ? `?${queryString}` : ''}`);
        if (!res.ok) return 0;
        return res.json();
      },
      staleTime: 5 * 60 * 1000, // 5 min cache
    })),
  });

  const isLoading = queryResults.some((q) => q.isLoading);

  const all = typeof queryResults[0]?.data === 'number' ? queryResults[0].data : 0;
  const pdf = typeof queryResults[1]?.data === 'number' ? queryResults[1].data : 0;
  const img = typeof queryResults[2]?.data === 'number' ? queryResults[2].data : 0;
  const video = typeof queryResults[3]?.data === 'number' ? queryResults[3].data : 0;
  const doc = Math.max(0, all - pdf - img - video);

  const counts: MediaCounts = {
    all,
    pdf,
    img,
    video,
    doc,
  };

  return { counts, isLoading };
}
