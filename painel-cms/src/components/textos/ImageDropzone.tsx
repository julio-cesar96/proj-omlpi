import React from 'react';
import { useDropzone } from 'react-dropzone';
import { X, AlertCircle, RefreshCw } from 'lucide-react';
import { useUploadSingleFile } from '../../hooks/useUploadSingleFile';
import type { StrapiFile } from '../../lib/strapi';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

interface ImageDropzoneProps {
  file: StrapiFile | null;
  onUploadSuccess: (file: StrapiFile) => void;
  onRemove: () => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  file,
  onUploadSuccess,
  onRemove,
}) => {
  const { uploadFile, uploading, progress, error } = useUploadSingleFile({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxMB: 10,
    typeErrorMessage: 'Formato inválido. Apenas JPG, PNG ou WebP.',
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    disabled: uploading,
    onDropAccepted: async (files) => {
      if (files.length > 0) {
        try {
          const uploaded = await uploadFile(files[0]);
          onUploadSuccess(uploaded);
        } catch (e) {
          // O hook já gerencia o state de erro
        }
      }
    },
  });

  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Imagem de capa</div>

      {!file && !uploading && (
        <div
          {...getRootProps()}
          style={{
            border: `1.5px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '12px',
            height: '120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--text-soft)',
            background: isDragActive ? '#FDF2ED' : 'var(--card)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isDragActive) e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            if (!isDragActive) e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <input {...getInputProps()} />
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <circle cx="8.5" cy="9.5" r="1.8" />
            <path d="m3 17 5-4 4 3 3-2 6 5" />
          </svg>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Enviar imagem</span>
        </div>
      )}

      {uploading && (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: '12px',
            height: '120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'var(--card)',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700 }}>
            <RefreshCw size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Enviando... {progress}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: 'var(--muted)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--primary)',
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        </div>
      )}

      {error && !uploading && (
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 10px',
            borderRadius: '8px',
            background: '#fbeaee',
            color: 'var(--destructive)',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {file && !uploading && (
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            height: '120px',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            background: 'var(--muted)',
          }}
        >
          <img
            src={`${STRAPI_URL}${file.url}`}
            alt="Capa"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.9)',
              color: 'var(--destructive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
            title="Remover imagem"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
