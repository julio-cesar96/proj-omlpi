import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { StrapiFile } from '../../lib/strapi';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

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

  const uploadSingleFile = (file: File, id: string): Promise<StrapiFile> => {
    return new Promise((resolve, reject) => {
      // Validacao de tamanho: 200MB
      if (file.size > 200 * 1024 * 1024) {
        const msg = 'O arquivo excede o limite máximo de 200 MB.';
        setUploads((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, error: msg, done: true } : item
          )
        );
        return reject(new Error(msg));
      }

      const formData = new FormData();
      formData.append('files', file);

      const xhr = new XMLHttpRequest();
      const jwt = sessionStorage.getItem('cms_jwt');

      xhr.open('POST', `${STRAPI_URL}/upload`);

      if (jwt) {
        xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploads((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, progress: pct } : item
            )
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const uploadedFile = Array.isArray(data) ? data[0] : data;
            setUploads((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, progress: 100, done: true, result: uploadedFile } : item
              )
            );
            resolve(uploadedFile);
          } catch (e) {
            const msg = 'Erro ao processar resposta do servidor.';
            setUploads((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, error: msg, done: true } : item
              )
            );
            reject(new Error(msg));
          }
        } else if (xhr.status === 401) {
          sessionStorage.removeItem('cms_jwt');
          sessionStorage.removeItem('cms_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          const msg = 'Sessão expirada. Faça login novamente.';
          setUploads((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, error: msg, done: true } : item
            )
          );
          reject(new Error(msg));
        } else {
          let errorMsg = 'Erro no upload do arquivo.';
          try {
            const errData = JSON.parse(xhr.responseText);
            errorMsg = errData?.message || errorMsg;
          } catch (_) {}
          setUploads((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, error: errorMsg, done: true } : item
            )
          );
          reject(new Error(errorMsg));
        }
      };

      xhr.onerror = () => {
        const msg = 'Falha na conexão durante o upload.';
        setUploads((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, error: msg, done: true } : item
          )
        );
        reject(new Error(msg));
      };

      xhr.send(formData);
    });
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
      }
    },
    [queryClient]
  );

  return { uploads, hasActiveUploads, uploadFiles, clearCompleted };
}
