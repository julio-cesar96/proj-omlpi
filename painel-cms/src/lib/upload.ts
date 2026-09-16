import { STRAPI_URL } from './api';
import type { StrapiFile } from './strapi';

/**
 * Upload de um único arquivo via XHR (não usa apiFetch: precisa de FormData
 * e de eventos de progresso, que fetch() não oferece).
 *
 * Centraliza a leitura do JWT e o tratamento de sessão expirada (401),
 * que antes estavam duplicados em cada hook de upload.
 */
export function uploadFileRaw(file: File, onProgress?: (pct: number) => void): Promise<StrapiFile> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('files', file);

    const xhr = new XMLHttpRequest();
    const jwt = sessionStorage.getItem('cms_jwt');

    xhr.open('POST', `${STRAPI_URL}/upload`);

    if (jwt) {
      xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(Array.isArray(data) ? data[0] : data);
        } catch {
          reject(new Error('Erro ao processar resposta do servidor.'));
        }
      } else if (xhr.status === 401) {
        sessionStorage.removeItem('cms_jwt');
        sessionStorage.removeItem('cms_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        reject(new Error('Sessão expirada. Por favor, faça login novamente.'));
      } else {
        let errorMsg = 'Erro no upload do arquivo.';
        try {
          const errData = JSON.parse(xhr.responseText);
          errorMsg = errData?.message || errorMsg;
        } catch {
          // resposta não era JSON — mantém a mensagem genérica
        }
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Falha na conexão durante o upload.'));
    };

    xhr.send(formData);
  });
}
