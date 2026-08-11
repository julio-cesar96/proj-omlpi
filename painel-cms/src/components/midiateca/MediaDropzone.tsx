import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface MediaDropzoneProps {
  onDrop: (files: File[]) => void;
}

export const MediaDropzone: React.FC<MediaDropzoneProps> = ({ onDrop }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius, 16px)',
        background: isDragActive ? '#FDF2ED' : 'var(--card)',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: '20px',
      }}
    >
      <input {...getInputProps()} />
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: 'var(--primary)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(242,93,39,.3)',
        }}
      >
        <UploadCloud size={26} />
      </div>
      <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: "'Nunito', sans-serif" }}>
        Arraste arquivos aqui ou <span style={{ color: 'var(--primary)' }}>selecione do computador</span>
      </div>
      <div style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>
        Suporta PDF, PNG, JPG, MP4, DOCX, XLSX · até 200 MB por arquivo · upload múltiplo
      </div>
    </div>
  );
};
