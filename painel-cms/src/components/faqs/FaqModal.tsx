import React, { useEffect, useState } from 'react';
import type { Faq, FaqPayload } from '../../lib/strapi';
import { useCategorias } from '../../hooks/planos/useCategorias';

interface FaqModalProps {
  open: boolean;
  faq: Faq | null; // null = modo criação; Faq = modo edição
  onClose: () => void;
  onSaveDraft: (payload: FaqPayload) => void;
  onPublish: (payload: FaqPayload) => void;
  isSaving: boolean;
}

interface FormState {
  pergunta: string;
  resposta: string;
  categoriaId: string; // string para o select; convertido para number no payload
}

const EMPTY_FORM: FormState = { pergunta: '', resposta: '', categoriaId: '' };

export const FaqModal: React.FC<FaqModalProps> = ({
  open,
  faq,
  onClose,
  onSaveDraft,
  onPublish,
  isSaving,
}) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const { data: categorias = [] } = useCategorias();

  // Popular form ao abrir em modo edição, limpar ao abrir em modo criação
  useEffect(() => {
    if (open) {
      if (faq) {
        setForm({
          pergunta: faq.pergunta,
          resposta: faq.resposta,
          categoriaId: faq.categoria ? String(faq.categoria.id) : '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, faq]);

  if (!open) return null;

  const buildPayload = (publishedAt: string | null): FaqPayload => ({
    pergunta: form.pergunta.trim(),
    resposta: form.resposta.trim(),
    categoria: form.categoriaId ? Number(form.categoriaId) : null,
    // published_at nunca omitido — evita o bug de auto-publicação do Strapi v3
    published_at: publishedAt,
  });

  const isValid = form.pergunta.trim().length > 0 && form.resposta.trim().length > 0;

  const handleSaveDraft = () => {
    if (!isValid) return;
    onSaveDraft(buildPayload(null));
  };

  const handlePublish = () => {
    if (!isValid) return;
    // Em modo edição de FAQ já publicada, preserva o published_at original;
    // caso contrário, define agora.
    const publishedAt =
      faq?.published_at && faq.published_at !== null
        ? faq.published_at
        : new Date().toISOString();
    onPublish(buildPayload(publishedAt));
  };

  const isEditingPublished = faq !== null && faq.published_at !== null;

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
          width: '560px',
          maxWidth: '92vw',
          background: 'var(--card)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
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
          }}
        >
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
            {faq ? 'Editar FAQ' : 'Nova FAQ'}
          </h2>
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
            gap: '16px',
            overflowY: 'auto',
          }}
        >
          {/* Campo: Pergunta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Pergunta <span style={{ color: 'var(--destructive)' }}>*</span>
            </label>
            <input
              type="text"
              value={form.pergunta}
              onChange={(e) => setForm((f) => ({ ...f, pergunta: e.target.value }))}
              placeholder="Digite a pergunta frequente…"
              style={{
                height: '42px',
                padding: '0 14px',
                borderRadius: '11px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                fontSize: '13.5px',
                color: 'var(--text)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                transition: 'border-color .15s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Campo: Resposta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Resposta <span style={{ color: 'var(--destructive)' }}>*</span>
            </label>
            <textarea
              value={form.resposta}
              onChange={(e) => setForm((f) => ({ ...f, resposta: e.target.value }))}
              placeholder="Digite a resposta completa…"
              rows={6}
              style={{
                padding: '12px 14px',
                borderRadius: '11px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                fontSize: '13.5px',
                color: 'var(--text)',
                outline: 'none',
                resize: 'vertical',
                minHeight: '120px',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.5,
                transition: 'border-color .15s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Campo: Categoria */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Categoria
            </label>
            <select
              value={form.categoriaId}
              onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
              style={{
                height: '42px',
                padding: '0 14px',
                borderRadius: '11px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                fontSize: '13.5px',
                color: form.categoriaId ? 'var(--text)' : 'var(--text-soft)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'border-color .15s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <option value="">Sem categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer — D1: dois botões */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '0 24px 20px',
            borderTop: '1px solid var(--border)',
            paddingTop: '16px',
          }}
        >
          {/* Cancelar */}
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

          {/* Salvar rascunho */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!isValid || isSaving}
            style={{
              height: '42px',
              padding: '0 18px',
              borderRadius: '11px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: !isValid || isSaving ? 'not-allowed' : 'pointer',
              opacity: !isValid || isSaving ? 0.5 : 1,
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => {
              if (isValid && !isSaving) e.currentTarget.style.background = 'var(--muted)';
            }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}
          >
            Salvar rascunho
          </button>

          {/* Publicar */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={!isValid || isSaving}
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
              cursor: !isValid || isSaving ? 'not-allowed' : 'pointer',
              opacity: !isValid || isSaving ? 0.5 : 1,
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => {
              if (isValid && !isSaving) e.currentTarget.style.background = '#e0521f';
            }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
          >
            {isSaving
              ? 'Salvando…'
              : isEditingPublished
              ? 'Atualizar'
              : 'Publicar'}
          </button>
        </div>
      </div>
    </>
  );
};
