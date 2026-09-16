import React from 'react';
import { ExternalLink, FileText, Trash2, Upload } from 'lucide-react';
import { MediaPickerModal } from '../ui/MediaPickerModal';
import { labelStyle } from './elaborePlanoFormStyles';
import type { StrapiFile } from '../../lib/strapi';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

interface ElaborePlanoArquivoFieldProps {
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

export const ElaborePlanoArquivoField: React.FC<ElaborePlanoArquivoFieldProps> = ({
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
      <label style={labelStyle}>Arquivo do Guia (PDF / Documento)</label>
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
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(242,93,39,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={22} color="var(--primary)" />
          </div>
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
          <a
            href={file.url.startsWith('http') ? file.url : `${STRAPI_URL}${file.url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 12px',
              borderRadius: '9px',
              border: '1px solid var(--border)',
              background: 'var(--muted)',
              color: 'var(--text)',
              fontSize: '12.5px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ExternalLink size={14} />
            Baixar
          </a>
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
            accept=".pdf,.doc,.docx"
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
            <Upload size={18} color="var(--primary)" />
            {uploading ? `Enviando arquivo… ${progress}%` : 'Subir arquivo (PDF)'}
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
            <FileText size={18} color="var(--primary)" />
            Da Midiateca
          </button>
        </div>
      )}
      {uploadError && (
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--danger, #dc3c3c)', fontWeight: 600 }}>
          {uploadError}
        </p>
      )}

      {/* Media Picker — Arquivo do Guia */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={onClosePicker}
        onSelect={onSelectFromPicker}
        filterType="doc"
        title="Selecionar arquivo da Midiateca"
      />
    </div>
  );
};
