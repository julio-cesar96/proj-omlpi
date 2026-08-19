import React, { useEffect, useState, useRef } from 'react';
import type { Guia, GuiaPayload, StrapiFile } from '../../lib/strapi';
import { useUploadSingleFile } from '../../hooks/useUploadSingleFile';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

interface GuiaModalProps {
  open: boolean;
  guia: Guia | null;
  onClose: () => void;
  onSave: (payload: GuiaPayload) => Promise<void>;
  isSaving: boolean;
}

export const GuiaModal: React.FC<GuiaModalProps> = ({
  open,
  guia,
  onClose,
  onSave,
  isSaving,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [fileId, setFileId] = useState<number | null>(null);
  const [fileObject, setFileObject] = useState<StrapiFile | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploading, progress, error: uploadError } = useUploadSingleFile({
    maxMB: 100,
  });

  useEffect(() => {
    if (open) {
      if (guia) {
        setTitle(guia.title || '');
        setCategory(guia.category || '');
        setDescription(guia.description || '');
        setFileObject(guia.file || null);
        setFileId(guia.file?.id || null);
      } else {
        setTitle('');
        setCategory('');
        setDescription('');
        setFileObject(null);
        setFileId(null);
      }
      setSubmitError(null);
    }
  }, [open, guia]);

  if (!open) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    try {
      setSubmitError(null);
      const uploaded = await uploadFile(selected);
      setFileObject(uploaded);
      setFileId(uploaded.id);
    } catch (err: any) {
      console.error('Erro no upload:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) {
      setSubmitError('O título é obrigatório.');
      return;
    }

    if (!fileId) {
      setSubmitError('É necessário selecionar/enviar um arquivo para o documento.');
      return;
    }

    try {
      await onSave({
        title: title.trim(),
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        file: fileId,
      });
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao salvar o documento.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--card)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(74, 93, 35, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--text-h)',
                }}
              >
                {guia ? 'Editar Guia / Documento' : 'Novo Guia / Documento'}
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-soft)' }}>
                {guia ? 'Atualize as informações do documento' : 'Adicione um novo documento de referência'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-soft)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {(submitError || uploadError) && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#dc2626',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{submitError || uploadError}</span>
              </div>
            )}

            {/* Título */}
            <div>
              <label
                htmlFor="guia-title"
                style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}
              >
                Título do documento <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="guia-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Plano Nacional pela Primeira Infância"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Categoria */}
            <div>
              <label
                htmlFor="guia-category"
                style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}
              >
                Categoria <span style={{ fontWeight: 400, color: 'var(--text-soft)' }}>(opcional)</span>
              </label>
              <input
                id="guia-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Lei Federal, Decreto, Cartilha, Guia..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '4px', display: 'block' }}>
                Digite a categoria para agrupar o documento na Midiateca e PNIPI.
              </span>
            </div>

            {/* Descrição */}
            <div>
              <label
                htmlFor="guia-description"
                style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}
              >
                Descrição <span style={{ fontWeight: 400, color: 'var(--text-soft)' }}>(opcional)</span>
              </label>
              <textarea
                id="guia-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve resumo ou contexto do documento..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Upload de Arquivo */}
            <div>
              <label
                style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}
              >
                Arquivo anexado <span style={{ color: '#dc2626' }}>*</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {fileObject ? (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'rgba(74, 93, 35, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <CheckCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-h)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {fileObject.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                        {fileObject.size ? `${(fileObject.size / 1024).toFixed(2)} MB` : 'Arquivo pronto'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      color: 'var(--text)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Substituir
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: uploading ? 'default' : 'pointer',
                    background: 'var(--bg)',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <Upload size={24} style={{ color: 'var(--text-soft)', marginBottom: '8px' }} />
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-h)' }}>
                    {uploading ? `Enviando arquivo... (${progress}%)` : 'Clique para selecionar o arquivo'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '4px' }}>
                    PDF, DOCX, XLSX, imagens ou vídeos (até 100 MB)
                  </div>
                </div>
              )}

              {uploading && (
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: 'var(--border)',
                    borderRadius: '2px',
                    marginTop: '8px',
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
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              background: 'var(--card)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || uploading}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || uploading || !title.trim() || !fileId}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: (isSaving || uploading || !title.trim() || !fileId) ? 'not-allowed' : 'pointer',
                opacity: (isSaving || uploading || !title.trim() || !fileId) ? 0.6 : 1,
                boxShadow: 'var(--shadow-btn)',
              }}
            >
              {isSaving ? 'Salvação em andamento...' : (guia ? 'Atualizar' : 'Salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
