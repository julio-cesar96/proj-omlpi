import React, { useEffect, useRef, useState } from 'react';
import type { Sobre, SobrePayload } from '../../lib/strapi';
import type { StrapiFile } from '../../lib/strapi';
import { useUploadSingleFile } from '../../hooks/useUploadSingleFile';

const STRAPI_URL =
  import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

interface SobreModalProps {
  open: boolean;
  sobre: Sobre | null; // null = modo criação
  onClose: () => void;
  onSaveDraft: (payload: SobrePayload) => void;
  onPublish: (payload: SobrePayload) => void;
  isSaving: boolean;
}

interface FormState {
  title: string;
  text: string;
  link: string;
  link_title: string;
  link2: string;
  link2_title: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  text: '',
  link: '',
  link_title: '',
  link2: '',
  link2_title: '',
};

// Texto de ajuda de sintaxe Markdown (decisão B2)
const MARKDOWN_HELP = `Formatação disponível:
  **negrito**   → texto em negrito
  *itálico*     → texto em itálico
  ## Título     → subtítulo
  - item        → lista com marcadores
  [texto](https://url.com "Dica ao passar o mouse") → link com tooltip`;

export const SobreModal: React.FC<SobreModalProps> = ({
  open,
  sobre,
  onClose,
  onSaveDraft,
  onPublish,
  isSaving,
}) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [image, setImage] = useState<StrapiFile | null>(null);
  const [linksExpanded, setLinksExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploading, progress, error: uploadError, setError: setUploadError } =
    useUploadSingleFile({
      allowedTypes: ['image/*'],
      maxMB: 10,
      typeErrorMessage: 'Apenas imagens são permitidas (PNG, JPG, WebP…).',
    });

  // Sincronizar dados ao abrir
  useEffect(() => {
    if (open) {
      if (sobre) {
        setForm({
          title: sobre.title ?? '',
          text: sobre.text ?? '',
          link: sobre.link ?? '',
          link_title: sobre.link_title ?? '',
          link2: sobre.link2 ?? '',
          link2_title: sobre.link2_title ?? '',
        });
        setImage(sobre.image ?? null);
        // Expandir links se algum já tiver conteúdo
        setLinksExpanded(
          Boolean(sobre.link || sobre.link_title || sobre.link2 || sobre.link2_title)
        );
      } else {
        setForm(EMPTY_FORM);
        setImage(null);
        setLinksExpanded(false);
      }
      setUploadError(null);
    }
  }, [open, sobre, setUploadError]);

  if (!open) return null;

  const buildPayload = (publishedAt: string | null): SobrePayload => ({
    title: form.title.trim(),
    text: form.text.trim() || null,
    image: image ? image.id : null,
    link: form.link.trim() || null,
    link_title: form.link_title.trim() || null,
    link2: form.link2.trim() || null,
    link2_title: form.link2_title.trim() || null,
    published_at: publishedAt,
  });

  const isValid = form.title.trim().length > 0;

  const handleSaveDraft = () => {
    if (!isValid) return;
    onSaveDraft(buildPayload(null));
  };

  const handlePublish = () => {
    if (!isValid) return;
    const publishedAt =
      sobre?.published_at ? sobre.published_at : new Date().toISOString();
    onPublish(buildPayload(publishedAt));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadFile(file);
      setImage(uploaded);
    } catch {
      // Erro já setado em uploadError via hook
    }
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const isEditingPublished = sobre !== null && sobre.published_at !== null;

  // Shared input style factory
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '42px',
    padding: '0 14px',
    borderRadius: '11px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    fontSize: '13.5px',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    boxSizing: 'border-box',
    transition: 'border-color .15s ease',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--text)',
    fontFamily: 'var(--font-body)',
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(44,44,20,.32)',
          zIndex: 200,
          animation: 'fadeIn .2s ease',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '620px',
          maxWidth: '94vw',
          background: 'var(--card)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'slideIn .25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 0',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-h)',
                margin: 0,
                letterSpacing: '-.3px',
              }}
            >
              {sobre ? 'Editar aba' : 'Nova aba'}
            </h2>
            {sobre && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: sobre.published_at ? '#e6f4ea' : 'var(--muted)',
                  color: sobre.published_at ? '#1a7f37' : 'var(--text-soft)',
                }}
              >
                {sobre.published_at ? 'Publicado' : 'Rascunho'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-soft)',
              cursor: 'pointer',
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            overflowY: 'auto',
          }}
        >
          {/* Título */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>
              Título da aba <span style={{ color: 'var(--destructive)' }}>*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Quem somos, Histórico, Equipe…"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Texto (Markdown) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Texto</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              placeholder="Digite o conteúdo da aba…"
              rows={8}
              style={{
                padding: '12px 14px',
                borderRadius: '11px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                fontSize: '13.5px',
                color: 'var(--text)',
                outline: 'none',
                resize: 'vertical',
                minHeight: '140px',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.55,
                transition: 'border-color .15s ease',
                boxSizing: 'border-box',
                width: '100%',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            {/* Ajuda de sintaxe Markdown (decisão B2) */}
            <pre
              style={{
                margin: 0,
                padding: '10px 14px',
                borderRadius: '9px',
                background: 'var(--muted)',
                fontSize: '11.5px',
                color: 'var(--text-soft)',
                fontFamily: 'monospace',
                lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {MARKDOWN_HELP}
            </pre>
          </div>

          {/* Upload de imagem */}
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
                  onClick={handleRemoveImage}
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
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    height: '42px',
                    padding: '0 18px',
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
                    gap: '8px',
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {uploading ? `Enviando… ${progress}%` : 'Selecionar imagem'}
                </button>
              </div>
            )}

            {uploadError && (
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--destructive)', fontWeight: 600 }}>
                {uploadError}
              </p>
            )}
          </div>

          {/* Card colapsável — Links opcionais (decisão A) */}
          <div
            style={{
              borderRadius: '11px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => setLinksExpanded((v) => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--muted)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span>Links opcionais</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-soft)',
                    fontStyle: 'italic',
                  }}
                >
                  não exibidos no site atualmente
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{
                    transform: linksExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform .2s ease',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>

            {linksExpanded && (
              <div
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  background: 'var(--card)',
                }}
              >
                {/* Link 1 */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>URL do link 1</label>
                    <input
                      type="url"
                      value={form.link}
                      onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                      placeholder="https://…"
                      style={{ ...inputStyle, height: '38px', fontSize: '13px' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Rótulo do link 1</label>
                    <input
                      type="text"
                      value={form.link_title}
                      onChange={(e) => setForm((f) => ({ ...f, link_title: e.target.value }))}
                      placeholder="Ex: Conheça mais a RNPI"
                      style={{ ...inputStyle, height: '38px', fontSize: '13px' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                  </div>
                </div>

                {/* Link 2 */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>URL do link 2</label>
                    <input
                      type="url"
                      value={form.link2}
                      onChange={(e) => setForm((f) => ({ ...f, link2: e.target.value }))}
                      placeholder="https://…"
                      style={{ ...inputStyle, height: '38px', fontSize: '13px' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Rótulo do link 2</label>
                    <input
                      type="text"
                      value={form.link2_title}
                      onChange={(e) => setForm((f) => ({ ...f, link2_title: e.target.value }))}
                      placeholder="Ex: Conheça mais a ANDI"
                      style={{ ...inputStyle, height: '38px', fontSize: '13px' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '16px 24px 20px',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              height: '42px',
              padding: '0 18px',
              borderRadius: '11px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!isValid || isSaving || uploading}
            style={{
              height: '42px',
              padding: '0 18px',
              borderRadius: '11px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: !isValid || isSaving || uploading ? 'not-allowed' : 'pointer',
              opacity: !isValid || isSaving || uploading ? 0.5 : 1,
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => {
              if (isValid && !isSaving && !uploading)
                e.currentTarget.style.background = 'var(--muted)';
            }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}
          >
            Salvar rascunho
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={!isValid || isSaving || uploading}
            style={{
              height: '42px',
              padding: '0 20px',
              borderRadius: '11px',
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '13.5px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(242,93,39,.28)',
              cursor: !isValid || isSaving || uploading ? 'not-allowed' : 'pointer',
              opacity: !isValid || isSaving || uploading ? 0.5 : 1,
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => {
              if (isValid && !isSaving && !uploading)
                e.currentTarget.style.background = '#e0521f';
            }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
          >
            {isSaving ? 'Salvando…' : isEditingPublished ? 'Atualizar' : 'Publicar'}
          </button>
        </div>
      </div>
    </>
  );
};
