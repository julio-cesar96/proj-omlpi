import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { StrapiFile } from '../../lib/strapi';
import { uploadFileRaw } from '../../lib/upload';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  done: boolean;
  error: string | null;
  result: StrapiFile | null;
}

export function useMediaUpload() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const queryClient = useQueryClient();

  const hasActiveUploads = uploads.some((u) => !u.done && !u.error);

  const clearCompleted = useCallback(() => {
    setUploads((prev) => prev.filter((u) => !u.done && u.error === null));
  }, []);

  const uploadSingleFile = async (file: File, id: string): Promise<StrapiFile> => {
    // Validação de tamanho: 200MB
    if (file.size > 200 * 1024 * 1024) {
      const msg = 'O arquivo excede o limite máximo de 200 MB.';
      setUploads((prev) =>
        prev.map((item) => (item.id === id ? { ...item, error: msg, done: true } : item))
      );
      throw new Error(msg);
    }

    try {
      const uploadedFile = await uploadFileRaw(file, (pct) => {
        setUploads((prev) =>
          prev.map((item) => (item.id === id ? { ...item, progress: pct } : item))
        );
      });
      setUploads((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, progress: 100, done: true, result: uploadedFile } : item
        )
      );
      return uploadedFile;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro no upload do arquivo.';
      setUploads((prev) =>
        prev.map((item) => (item.id === id ? { ...item, error: msg, done: true } : item))
      );
      throw err;
    }
  };

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const newItems = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        done: false,
        error: null,
        result: null,
      }));

      setUploads((prev) => [...prev, ...newItems]);

      const uploadPromises = newItems.map((item) =>
        uploadSingleFile(item.file, item.id)
      );

      try {
        await Promise.all(uploadPromises);
      } catch (err) {
        // Pelo menos um falhou, mas outros podem ter dado certo.
      } finally {
        queryClient.invalidateQueries({ queryKey: ['media-files'] });
        queryClient.invalidateQueries({ queryKey: ['media-count'] });
        queryClient.invalidateQueries({ queryKey: ['storage-usage'] });
      }
    },
    [queryClient]
  );

  return { uploads, hasActiveUploads, uploadFiles, clearCompleted };
}
