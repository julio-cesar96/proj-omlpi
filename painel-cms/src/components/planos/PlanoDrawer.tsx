import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PlanoStepper } from './PlanoStepper';
import { PlanoPdfDropzone } from './PlanoPdfDropzone';
import { useUploadFile } from '../../hooks/planos/useUploadFile';
import { useCategorias } from '../../hooks/planos/useCategorias';
import { useTags } from '../../hooks/planos/useTags';
import type { Plano, PlanoPayload, StrapiFile, EditorialState } from '../../lib/strapi';

interface PlanoDrawerProps {
  isOpen: boolean;
  plano: Plano | null;
  onClose: () => void;
  onSaveDraft: (payload: PlanoPayload) => Promise<void>;
  onSubmitReview: (payload: PlanoPayload) => Promise<void>;
  onPublish: (payload: PlanoPayload) => Promise<void>;
  onArchive: (id: number) => Promise<void>;
  onDuplicate: (plano: Plano) => Promise<void>;
}

export const PlanoDrawer: React.FC<PlanoDrawerProps> = ({
  isOpen,
  plano,
  onClose,
  onSaveDraft,
  onSubmitReview,
  onPublish,
  onArchive,
  onDuplicate,
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [file, setFile] = useState<StrapiFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categorias = [] } = useCategorias();
  const { data: tagsList = [] } = useTags();
  const { uploadFile, uploading, progress, error, setError } = useUploadFile();

  useEffect(() => {
    if (plano) {
      setTitulo(plano.titulo || '');
      setDescricao(plano.descricao || '');
      setCategoriaId(plano.categoria?.id || null);
      setSelectedTagIds(plano.tags?.map((t) => t.id) || []);
      setFile(plano.documento || null);
    } else {
      setTitulo('');
      setDescricao('');
      setCategoriaId(null);
      setSelectedTagIds([]);
      setFile(null);
    }
    setError(null);
  }, [plano, isOpen, setError]);

  if (!isOpen) return null;

  const currentStatus: EditorialState = plano?.estado_editorial || 'rascunho';
  const isNew = !plano || !plano.id;

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const uploaded = await uploadFile(selectedFile);
      setFile(uploaded);
    } catch (e) {
      // error set in hook
    }
  };

  const handleFileRemove = () => {
    setFile(null);
    setError(null);
  };

  const getPayload = (targetState: EditorialState): PlanoPayload => {
    return {
      titulo: titulo.trim() || 'Sem título',
      descricao: descricao.trim() || undefined,
      categoria: categoriaId || null,
      tags: selectedTagIds,
      documento: file?.id || null,
      estado_editorial: targetState,
      published_at: targetState === 'publicado' ? new Date().toISOString() : null,
    };
  };

  const handleDraft = async () => {
    setIsSubmitting(true);
    try {
      await onSaveDraft(getPayload('rascunho'));
      onClose();
    } catch (_) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitReview(getPayload('revisao'));
      onClose();
    } catch (_) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await onPublish(getPayload('publicado'));
      onClose();
    } catch (_) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!plano?.id) return;
    setIsSubmitting(true);
    try {
      await onArchive(plano.id);
      onClose();
    } catch (_) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!plano) return;
    setIsSubmitting(true);
    try {
      await onDuplicate(plano);
      onClose();
    } catch (_) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(44,44,20,.32)',
          zIndex: 150,
          animation: 'fadeIn .2s ease',
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '640px',
          maxWidth: '92vw',
          background: 'var(--bg)',
          zIndex: 151,
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'drawerIn .28s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--text-soft)',
                letterSpacing: '.4px',
                textTransform: 'uppercase',
              }}
            >
              {isNew ? 'Novo conteúdo' : 'Editando'}
            </div>
            <h2 style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-.3px' }}>
              Editor de plano
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-soft)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <PlanoStepper status={currentStatus} />

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* PDF Dropzone */}
            <PlanoPdfDropzone
              file={file}
              uploading={uploading}
              progress={progress}
              error={error}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
            />

            <div style={{ height: '1px', background: 'var(--border)' }} />

            {/* Título */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}>
                Título do plano
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Plano Municipal pela Primeira Infância"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px',
                  borderRadius: '11px',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Descrição */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}>
                Breve descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição curta exibida na listagem e na busca..."
                style={{
                  width: '100%',
                  height: '88px',
                  padding: '12px 14px',
                  borderRadius: '11px',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
              <div style={{ fontSize: '11.5px', color: 'var(--text-soft)', marginTop: '6px' }}>
                Recomendado até 160 caracteres. ({descricao.length} caracteres)
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}>
                Categoria <span style={{ fontWeight: 600, color: 'var(--text-soft)' }}>(opcional)</span>
              </label>
              <select
                value={categoriaId || ''}
                onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : null)}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 12px',
                  borderRadius: '11px',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                <option value="">Selecione uma categoria...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags (Decision D2: Optional Select) */}
            {tagsList.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}>
                  Tags <span style={{ fontWeight: 600, color: 'var(--text-soft)' }}>(opcional)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {tagsList.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                          background: isSelected ? '#FDE7DE' : 'var(--card)',
                          color: isSelected ? 'var(--primary)' : 'var(--text)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--card)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {!isNew && (
            <>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDuplicate}
                style={{
                  height: '42px',
                  padding: '0 14px',
                  borderRadius: '11px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-soft)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                Duplicar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleArchive}
                style={{
                  height: '42px',
                  padding: '0 14px',
                  borderRadius: '11px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--destructive)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                Arquivar
              </button>
            </>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDraft}
              style={{
                height: '42px',
                padding: '0 16px',
                borderRadius: '11px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Salvar rascunho
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleReview}
              style={{
                height: '42px',
                padding: '0 16px',
                borderRadius: '11px',
                background: 'var(--muted)',
                color: 'var(--text)',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Enviar p/ revisão
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePublish}
              style={{
                height: '42px',
                padding: '0 20px',
                borderRadius: '11px',
                background: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(242,93,39,.28)',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Publicar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
