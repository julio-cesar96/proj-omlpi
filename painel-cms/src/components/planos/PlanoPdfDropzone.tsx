import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import type { StrapiFile } from '../../lib/strapi';

interface PlanoPdfDropzoneProps {
  file: StrapiFile | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

export const PlanoPdfDropzone: React.FC<PlanoPdfDropzoneProps> = ({
  file,
  uploading,
  progress,
  error,
  onFileSelect,
  onFileRemove,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
    onDropAccepted: (files) => {
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
  });

  const formatFileSize = (bytesOrKb: number) => {
    if (!bytesOrKb) return '0 KB';
    // Strapi usually returns file size in KB or Bytes. If > 1024 KB show MB.
    if (bytesOrKb > 1024) {
      return `${(bytesOrKb / 1024).toFixed(1)} MB`;
    }
    return `${Math.round(bytesOrKb)} KB`;
  };

  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '12.5px',
          fontWeight: 700,
          marginBottom: '8px',
          color: 'var(--text)',
        }}
      >
        Documento do plano (PDF)
      </label>

      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '14px',
          background: isDragActive ? '#FDF2ED' : 'var(--card)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <input {...getInputProps()} />
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '13px',
            background: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(242,93,39,.3)',
          }}
        >
          <UploadCloud size={24} />
        </div>
        <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: "'Nunito', sans-serif" }}>
          Arraste o PDF aqui ou <span style={{ color: 'var(--primary)' }}>selecione o arquivo</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
          Um arquivo PDF · até 200 MB
        </div>
      </div>

      {/* Uploading Progress */}
      {uploading && (
        <div
          style={{
            marginTop: '10px',
            padding: '12px 14px',
            borderRadius: '11px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12.5px',
              fontWeight: 700,
              marginBottom: '6px',
            }}
          >
            <span>Enviando arquivo PDF...</span>
            <span style={{ color: 'var(--primary)' }}>{progress}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '10px',
              background: 'var(--muted)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--primary)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Validation / Error Banner */}
      {error && !uploading && (
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: '#fbeaee',
            color: 'var(--destructive)',
            fontSize: '12.5px',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded File Card */}
      {file && !uploading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            padding: '11px 13px',
            border: '1px solid var(--border)',
            borderRadius: '11px',
            background: 'var(--card)',
            marginTop: '10px',
          }}
        >
          <span
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: '#FDE7DE',
              color: '#F25D27',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: "'Nunito', sans-serif",
              flexShrink: 0,
            }}
          >
            PDF
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {file.name}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-soft)' }}>
              {formatFileSize(file.size)}
            </div>
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#17A649',
              background: 'var(--accent)',
              padding: '3px 10px',
              borderRadius: '20px',
            }}
          >
            Enviado
          </span>
          <button
            type="button"
            onClick={onFileRemove}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-soft)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Remover documento"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
