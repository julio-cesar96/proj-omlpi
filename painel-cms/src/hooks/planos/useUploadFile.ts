import { useState } from 'react';
import type { StrapiFile } from '../../lib/strapi';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

export function useUploadFile() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = (file: File): Promise<StrapiFile> => {
    return new Promise((resolve, reject) => {
      // Validations
      if (file.type !== 'application/pdf') {
        const msg = 'Apenas arquivos em formato PDF são permitidos.';
        setError(msg);
        return reject(new Error(msg));
      }

      if (file.size > 200 * 1024 * 1024) {
        const msg = 'O arquivo excede o limite máximo de 200 MB.';
        setError(msg);
        return reject(new Error(msg));
      }

      setUploading(true);
      setProgress(0);
      setError(null);

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
          setProgress(pct);
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const uploadedFile = Array.isArray(data) ? data[0] : data;
            resolve(uploadedFile);
          } catch (e) {
            const msg = 'Erro ao processar resposta do servidor.';
            setError(msg);
            reject(new Error(msg));
          }
        } else if (xhr.status === 401) {
          sessionStorage.removeItem('cms_jwt');
          sessionStorage.removeItem('cms_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          const msg = 'Sessão expirada. Por favor, faça login novamente.';
          setError(msg);
          reject(new Error(msg));
        } else {
          let errorMsg = 'Erro no upload do arquivo.';
          try {
            const errData = JSON.parse(xhr.responseText);
            errorMsg = errData?.message || errorMsg;
          } catch (_) {}
          setError(errorMsg);
          reject(new Error(errorMsg));
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        const msg = 'Falha na conexão durante o upload.';
        setError(msg);
        reject(new Error(msg));
      };

      xhr.send(formData);
    });
  };

  return { uploadFile, uploading, progress, error, setError };
}
