import type { MediaFileType, MediaSortKey, MediaFilterKey } from './strapi';

export function getMediaType(mime: string): MediaFileType {
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('image/')) return 'img';
  if (mime.startsWith('video/')) return 'video';
  return 'doc'; // xlsx, docx, csv, audio/mpeg, text/html, etc.
}

export const MEDIA_TYPE_CONFIG: Record<MediaFileType, { label: string; bg: string; color: string }> = {
  pdf:   { label: 'PDF', bg: '#FDE7DE', color: '#F25D27' },
  img:   { label: 'IMG', bg: '#E8F5EE', color: '#17A649' },
  video: { label: 'VÍD', bg: '#efe6fb', color: '#8a6bd6' },
  doc:   { label: 'DOC', bg: '#e6eefb', color: '#3b6bd6' },
};

// sizeKB: float em KB (como retornado pelo Strapi)
export function formatFileSize(sizeKB: number): string {
  if (sizeKB >= 1024 * 1024) {
    return `${(sizeKB / (1024 * 1024)).toFixed(1).replace('.', ',')} GB`;
  }
  if (sizeKB >= 1024) {
    return `${(sizeKB / 1024).toFixed(1).replace('.', ',')} MB`;
  }
  return `${Math.round(sizeKB)} KB`;
}

// Parâmetro _sort para o Strapi
export function getSortParam(sortKey: MediaSortKey): string {
  if (sortKey === 'name') return 'name:ASC';
  if (sortKey === 'size') return 'size:DESC';
  return 'created_at:DESC';
}

// Adiciona os parâmetros de filtro de tipo no URLSearchParams
export function appendMimeFilters(params: URLSearchParams, filter: MediaFilterKey): void {
  if (filter === 'pdf') {
    params.append('mime_contains', 'application/pdf');
  } else if (filter === 'img') {
    params.append('mime_contains', 'image/');
  } else if (filter === 'video') {
    params.append('mime_contains', 'video/');
  } else if (filter === 'doc') {
    // DOC representa tudo que NÃO é pdf, imagem ou vídeo
    params.append('mime_ncontains', 'application/pdf');
    params.append('mime_ncontains', 'image/');
    params.append('mime_ncontains', 'video/');
  }
}

