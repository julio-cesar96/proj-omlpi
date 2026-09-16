import { useState } from 'react';
import type { StrapiFile } from '../../lib/strapi';
import { uploadFileRaw } from '../../lib/upload';

export function useUploadFile() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<StrapiFile> => {
    if (file.type !== 'application/pdf') {
      const msg = 'Apenas arquivos em formato PDF são permitidos.';
      setError(msg);
      throw new Error(msg);
    }

    if (file.size > 200 * 1024 * 1024) {
      const msg = 'O arquivo excede o limite máximo de 200 MB.';
      setError(msg);
      throw new Error(msg);
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      return await uploadFileRaw(file, setProgress);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro no upload do arquivo.';
      setError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, progress, error, setError };
}
