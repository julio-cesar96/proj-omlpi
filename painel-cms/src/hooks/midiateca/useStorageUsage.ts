import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { StrapiFile } from '../../lib/strapi';

export function useStorageUsage() {
  return useQuery<{ totalKb: number; totalGb: number; formattedGb: string }>({
    queryKey: ['storage-usage'],
    queryFn: async () => {
      const res = await apiFetch('/upload/files?_limit=-1');
      if (!res.ok) {
        throw new Error('Erro ao carregar dados de uso de armazenamento.');
      }
      const files: StrapiFile[] = await res.json();
      const totalKb = files.reduce((acc, file) => acc + (file.size || 0), 0);
      const totalGb = totalKb / (1024 * 1024);
      const formattedGb = totalGb < 0.1
        ? totalGb.toFixed(2).replace('.', ',')
        : totalGb.toFixed(1).replace('.', ',');
      return { totalKb, totalGb, formattedGb };
    },
  });
}
