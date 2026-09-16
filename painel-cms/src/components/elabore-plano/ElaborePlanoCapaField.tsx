import React from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { MediaPickerModal } from '../ui/MediaPickerModal';
import { labelStyle } from './elaborePlanoFormStyles';
import type { StrapiFile } from '../../lib/strapi';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

interface ElaborePlanoCapaFieldProps {
  file: StrapiFile | null;
  uploading: boolean;
  progress: number;
  uploadError: string | null;
  pickerOpen: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onSelectFromPicker: (file: StrapiFile) => void;
}

export const ElaborePlanoCapaField: React.FC<ElaborePlanoCapaFieldProps> = ({
  file,
  uploading,
  progress,
  uploadError,
  pickerOpen,
  inputRef,
  disabled,
  onFileSelect,
  onRemove,
  onOpenPicker,
  onClosePicker,
  onSelectFromPicker,
}) => {
  return (
    <div>
      <label style={labelStyle}>Imagem de Capa</label>
      {file ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          <img
            src={file.url.startsWith('http') ? file.url : `${STRAPI_URL}${file.url}`}
            alt="Capa"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'cover',
              borderRadius: '8px',
              flexShrink: 0,
              border: '1px solid var(--border)',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {file.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '2px' }}>
              {(file.size / 1024).toFixed(2)} MB
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            style={{
              padding: '8px 12px',
              borderRadius: '9px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--danger, #dc3c3c)',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Trash2 size={14} />
            Remover
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            style={{ display: 'none' }}
          />
          {/* Botão: subir novo arquivo */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || disabled}
            style={{
              padding: '12px 18px',
              borderRadius: '11px',
              border: '1px dashed var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: uploading || disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ImageIcon size={18} color="var(--primary)" />
            {uploading ? `Enviando capa… ${progress}%` : 'Subir imagem de capa'}
          </button>

          {/* Botão: escolher da Midiateca */}
          <button
            type="button"
            onClick={onOpenPicker}
            disabled={uploading || disabled}
            style={{
              padding: '12px 18px',
              borderRadius: '11px',
              border: '1px solid var(--border)',
              background: 'var(--muted)',
              color: 'var(--text)',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: uploading || disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'border-color .15s ease, background .15s ease',
            }}
            onMouseEnter={(e) => {
              if (!uploading && !disabled) {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'var(--card)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--muted)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Da Midiateca
          </button>
        </div>
      )}
      {uploadError && (
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--danger, #dc3c3c)', fontWeight: 600 }}>
          {uploadError}
        </p>
      )}

      {/* Media Picker — Imagem de Capa */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={onClosePicker}
        onSelect={onSelectFromPicker}
        filterType="img"
        title="Selecionar imagem de capa da Midiateca"
      />
    </div>
  );
};
