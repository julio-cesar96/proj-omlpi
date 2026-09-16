import { useState } from 'react';
import type { StrapiFile } from '../lib/strapi';
import { uploadFileRaw } from '../lib/upload';

interface UploadOptions {
  allowedTypes?: string[]; // E.g. ['image/png', 'image/jpeg', 'image/webp']
  maxMB?: number; // E.g. 10 or 200
  typeErrorMessage?: string;
}

export function useUploadSingleFile(options: UploadOptions = {}) {
  const {
    allowedTypes,
    maxMB = 10,
    typeErrorMessage = 'Tipo de arquivo não permitido.',
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<StrapiFile> => {
    // Validate type
    if (allowedTypes && allowedTypes.length > 0) {
      const isValid = allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const prefix = type.replace('/*', '');
          return file.type.startsWith(prefix);
        }
        return file.type === type;
      });

      if (!isValid) {
        setError(typeErrorMessage);
        throw new Error(typeErrorMessage);
      }
    }

    // Validate size
    if (file.size > maxMB * 1024 * 1024) {
      const msg = `O arquivo excede o limite máximo de ${maxMB} MB.`;
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
