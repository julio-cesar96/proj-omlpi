import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Tag } from '../../lib/strapi';

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await apiFetch('/tags?_sort=name:ASC');
      if (!res.ok) {
        return [];
      }
      return res.json();
    },
  });
}
