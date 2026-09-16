import React from 'react';
import type { StrapiFile } from '../../lib/strapi';
import { MediaPickerModal } from '../ui/MediaPickerModal';
import { labelStyle } from './sobreFormStyles';

const STRAPI_URL =
  import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

interface SobreImageFieldProps {
  image: StrapiFile | null;
  uploading: boolean;
  progress: number;
  uploadError: string | null;
  pickerOpen: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onSelectFromPicker: (file: StrapiFile) => void;
}

export const SobreImageField: React.FC<SobreImageFieldProps> = ({
  image,
  uploading,
  progress,
  uploadError,
  pickerOpen,
  fileInputRef,
  onFileSelect,
  onRemoveImage,
  onOpenPicker,
  onClosePicker,
  onSelectFromPicker,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={labelStyle}>Imagem (opcional)</label>

      {image ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '11px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
          }}
        >
          <img
            src={image.url.startsWith('http') ? image.url : `${STRAPI_URL}${image.url}`}
            alt=""
            style={{
              width: '56px',
              height: '56px',
              objectFit: 'cover',
              borderRadius: '8px',
              flexShrink: 0,
              border: '1px solid var(--border)',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {image.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '2px' }}>
              {(image.size / 1024).toFixed(1)} MB
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveImage}
            style={{
              padding: '6px 12px',
              borderRadius: '9px',
              border: '1px solid var(--border)',
              background: 'transparent',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--destructive)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fde8ec'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Remover
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFileSelect}
          />
          {/* Botão: subir novo arquivo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '11px',
              border: '1px dashed var(--border)',
              background: 'var(--bg)',
              fontSize: '13px',
              fontWeight: 600,
              color: uploading ? 'var(--text-soft)' : 'var(--text)',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'border-color .15s ease, background .15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
            onMouseEnter={(e) => {
              if (!uploading) {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'var(--muted)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--bg)';
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploading ? `Enviando… ${progress}%` : 'Subir imagem'}
          </button>

          {/* Botão: escolher da Midiateca */}
          <button
            type="button"
            onClick={onOpenPicker}
            disabled={uploading}
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '11px',
              border: '1px solid var(--border)',
              background: 'var(--muted)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'border-color .15s ease, background .15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
            onMouseEnter={(e) => {
              if (!uploading) {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'var(--card)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--muted)';
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Da Midiateca
          </button>
        </div>
      )}

      {uploadError && (
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--destructive)', fontWeight: 600 }}>
          {uploadError}
        </p>
      )}

      {/* Media Picker — Midiateca */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={onClosePicker}
        onSelect={onSelectFromPicker}
        filterType="img"
        title="Selecionar imagem da Midiateca"
      />
    </div>
  );
};
