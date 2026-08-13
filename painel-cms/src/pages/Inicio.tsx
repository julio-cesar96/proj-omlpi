import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { useBanner } from '../hooks/banner/useBanner';
import { Toast } from '../components/ui/Toast';
import type { BannerPayload } from '../lib/strapi';

// URL do site público — configurada via variável de ambiente (VITE_SITE_URL)
const SITE_URL = import.meta.env.VITE_SITE_URL as string | undefined;

// ─── Tela principal ──────────────────────────────────────────────────────────

export const Inicio: React.FC = () => {
  const { banner, isLoading, isError, refetch, saveBanner, isSaving, saveError } =
    useBanner();

  // Draft local — inicializado com os dados do GET quando chegam
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  // Quando os dados do banner chegam, inicializar o formulário
  useEffect(() => {
    if (banner) {
      setTitle(banner.title ?? '');
      setText(banner.text ?? '');
    }
  }, [banner]);

  // Exibir erro de PUT via toast
  useEffect(() => {
    if (saveError) {
      setToast({ visible: true, message: saveError.message });
    }
  }, [saveError]);

  const handleSave = async () => {
    if (!banner) return;

    // CRÍTICO: repassar o published_at lido do GET — nunca omitir
    const payload: BannerPayload = {
      title: title.trim(),
      text: text.trim(),
      published_at: banner.published_at ?? null,
    };

    try {
      await saveBanner(payload);
      setToast({ visible: true, message: 'Alterações salvas com sucesso!' });
    } catch {
      // O erro já é tratado via useEffect + saveError acima
    }
  };

  // ─── Estados de carregamento / erro ────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ padding: '40px 48px' }}>
        <div
          style={{
            height: '28px',
            width: '240px',
            background: 'var(--muted)',
            borderRadius: '8px',
            marginBottom: '32px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        {[1, 2].map((i) => (
          <div key={i} style={{ marginBottom: '24px' }}>
            <div
              style={{
                height: '13px',
                width: '100px',
                background: 'var(--muted)',
                borderRadius: '6px',
                marginBottom: '8px',
              }}
            />
            <div
              style={{
                height: i === 1 ? '42px' : '90px',
                background: 'var(--muted)',
                borderRadius: '10px',
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '40px 48px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(220,60,60,0.08)',
            border: '1px solid rgba(220,60,60,0.22)',
            borderRadius: '12px',
            padding: '18px 20px',
            maxWidth: '480px',
          }}
        >
          <AlertCircle size={20} color="var(--danger, #dc3c3c)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--danger, #dc3c3c)' }}>
              Erro ao carregar o Banner
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-soft)', marginTop: '2px' }}>
              Verifique sua conexão ou as permissões do painel.
            </div>
          </div>
          <button
            onClick={() => refetch()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'var(--muted)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text)',
            }}
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // ─── Formulário principal ───────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: '6px',
  };

  return (
    <>
      <div style={{ padding: '40px 48px', maxWidth: '700px' }}>
        {/* Cabeçalho da tela */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '36px',
            gap: '16px',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '24px',
                fontWeight: 900,
                letterSpacing: '-.4px',
                color: 'var(--text)',
                margin: '0 0 6px',
              }}
            >
              Banner da Página Inicial
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-soft)', fontWeight: 500 }}>
              Edite o título e o texto exibidos na seção Hero do site.
            </p>
          </div>

          {/* Link "Ver no site" */}
          {SITE_URL && (
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '9px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text-soft)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                flexShrink: 0,
                transition: 'border-color 0.15s ease, color 0.15s ease',
              }}
            >
              Ver no site
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* Badge de status */}
        <div style={{ marginBottom: '28px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1a7f4b',
              background: 'rgba(26,127,75,0.1)',
              padding: '4px 10px',
              borderRadius: '20px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#1a7f4b',
                display: 'inline-block',
              }}
            />
            Publicado
          </span>
        </div>

        {/* Campo: Título */}
        <div style={{ marginBottom: '22px' }}>
          <label htmlFor="banner-title" style={labelStyle}>
            Título
          </label>
          <input
            id="banner-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
            style={inputStyle}
            placeholder="Título exibido no Hero"
          />
          <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--text-soft)' }}>
            Aparece como heading principal na seção inicial do site.
          </p>
        </div>

        {/* Campo: Texto descritivo */}
        <div style={{ marginBottom: '32px' }}>
          <label htmlFor="banner-text" style={labelStyle}>
            Texto descritivo
          </label>
          <textarea
            id="banner-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSaving}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            placeholder="Texto introdutório exibido abaixo do título"
          />
          <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--text-soft)' }}>
            Parágrafo descritivo exibido abaixo do título no Hero. Texto puro, sem formatação.
          </p>
        </div>

        {/* Botão de salvar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            id="banner-save-btn"
            onClick={handleSave}
            disabled={isSaving || !banner}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              border: 'none',
              background: isSaving ? 'var(--muted)' : 'var(--primary)',
              color: isSaving ? 'var(--text-soft)' : '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              cursor: isSaving || !banner ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.15s ease',
              boxShadow: isSaving ? 'none' : 'var(--shadow-btn)',
            }}
          >
            {isSaving && (
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }}
              />
            )}
            {isSaving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </div>

      {/* Toast de feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  );
};
