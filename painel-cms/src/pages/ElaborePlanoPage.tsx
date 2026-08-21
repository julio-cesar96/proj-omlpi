import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, AlertCircle, RefreshCw, FileText, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { useElaborePlano } from '../hooks/elabore-plano/useElaborePlano';
import { useUploadSingleFile } from '../hooks/useUploadSingleFile';
import { Toast } from '../components/ui/Toast';
import type { ElaborePlanoPayload, StrapiFile } from '../lib/strapi';

const SITE_URL = import.meta.env.VITE_SITE_URL as string | undefined;
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

const MARKDOWN_HELP = `Formatação disponível em Descrição:
  **negrito**   → texto em negrito
  *itálico*     → texto em itálico
  ## Título     → subtítulo
  - item        → lista com marcadores
  [texto](https://url.com "Dica ao passar o mouse") → link com tooltip`;

export const ElaborePlanoPage: React.FC = () => {
  const { data, isLoading, isError, refetch, saveElaborePlano, isSaving, saveError } =
    useElaborePlano();

  const [tituloSecao, setTituloSecao] = useState('');
  const [tituloGuia, setTituloGuia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [capaFile, setCapaFile] = useState<StrapiFile | null>(null);
  const [arquivoFile, setArquivoFile] = useState<StrapiFile | null>(null);

  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const capaInputRef = useRef<HTMLInputElement>(null);
  const arquivoInputRef = useRef<HTMLInputElement>(null);

  const imageUploader = useUploadSingleFile({
    allowedTypes: ['image/*'],
    maxMB: 10,
    typeErrorMessage: 'Apenas imagens são permitidas (PNG, JPG, WebP…).',
  });

  const fileUploader = useUploadSingleFile({
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxMB: 50,
    typeErrorMessage: 'Apenas arquivos PDF ou Word são permitidos.',
  });

  // Preencher formulário ao carregar dados do Strapi
  useEffect(() => {
    if (data) {
      setTituloSecao(data.titulo_secao ?? '');
      setTituloGuia(data.titulo_guia ?? '');
      setDescricao(data.descricao ?? '');
      setCapaFile(data.capa ?? null);
      setArquivoFile(data.arquivo ?? null);
    }
  }, [data]);

  // Exibir erros de salvamento em toast
  useEffect(() => {
    if (saveError) {
      setToast({ visible: true, message: saveError.message });
    }
  }, [saveError]);

  const handleCapaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await imageUploader.uploadFile(file);
      setCapaFile(uploaded);
    } catch {
      // erro mantido no hook
    }
    if (capaInputRef.current) capaInputRef.current.value = '';
  };

  const handleArquivoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await fileUploader.uploadFile(file);
      setArquivoFile(uploaded);
    } catch {
      // erro mantido no hook
    }
    if (arquivoInputRef.current) arquivoInputRef.current.value = '';
  };

  const handleSave = async () => {
    const payload: ElaborePlanoPayload = {
      titulo_secao: tituloSecao.trim() || null,
      titulo_guia: tituloGuia.trim() || null,
      descricao: descricao.trim() || null,
      capa: capaFile ? capaFile.id : null,
      arquivo: arquivoFile ? arquivoFile.id : null,
      published_at: data?.published_at || new Date().toISOString(),
    };


    try {
      await saveElaborePlano(payload);
      setToast({ visible: true, message: 'Elabore o Plano atualizado com sucesso!' });
    } catch {
      // Trado via useEffect (saveError)
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px 48px', maxWidth: '700px' }}>
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
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ marginBottom: '24px' }}>
            <div
              style={{
                height: '13px',
                width: '120px',
                background: 'var(--muted)',
                borderRadius: '6px',
                marginBottom: '8px',
              }}
            />
            <div
              style={{
                height: i === 3 ? '120px' : '42px',
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
              Erro ao carregar dados do Elabore o Plano
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-soft)', marginTop: '2px' }}>
              Verifique a conexão ou tente recarregar a página.
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
      <div style={{ padding: '40px 48px', maxWidth: '720px' }}>
        {/* Cabeçalho */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '32px',
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
              Elabore o Plano
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-soft)', fontWeight: 500 }}>
              Edite as informações da seção "Elabore o plano do seu município" exibida na página inicial.
            </p>
          </div>

          {SITE_URL && (
            <a
              href={`${SITE_URL}#elabore-plano`}
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

        {/* Form Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Título da Seção */}
          <div>
            <label htmlFor="titulo-secao" style={labelStyle}>
              Título da Seção
            </label>
            <input
              id="titulo-secao"
              type="text"
              value={tituloSecao}
              onChange={(e) => setTituloSecao(e.target.value)}
              disabled={isSaving}
              style={inputStyle}
              placeholder="Ex: Elabore o plano do seu município"
            />
            <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--text-soft)' }}>
              Título exibido no cabeçalho da seção na home.
            </p>
          </div>

          {/* Título do Guia */}
          <div>
            <label htmlFor="titulo-guia" style={labelStyle}>
              Título do Guia
            </label>
            <input
              id="titulo-guia"
              type="text"
              value={tituloGuia}
              onChange={(e) => setTituloGuia(e.target.value)}
              disabled={isSaving}
              style={inputStyle}
              placeholder="Ex: Guia para elaboração de Planos Intersetoriais para a Primeira Infância"
            />
            <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--text-soft)' }}>
              Título em negrito exibido acima da descrição do guia.
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" style={labelStyle}>
              Descrição (Richtext / Markdown)
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={isSaving}
              rows={7}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              placeholder="Texto descritivo do guia..."
            />
            <pre
              style={{
                marginTop: '8px',
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

          {/* Imagem de Capa */}
          <div>
            <label style={labelStyle}>Imagem de Capa</label>
            {capaFile ? (
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
                  src={capaFile.url.startsWith('http') ? capaFile.url : `${STRAPI_URL}${capaFile.url}`}
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
                    {capaFile.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '2px' }}>
                    {(capaFile.size / 1024).toFixed(2)} MB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCapaFile(null)}
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
              <div>
                <input
                  ref={capaInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCapaSelect}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => capaInputRef.current?.click()}
                  disabled={imageUploader.uploading || isSaving}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '11px',
                    border: '1px dashed var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: imageUploader.uploading || isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <ImageIcon size={18} color="var(--primary)" />
                  {imageUploader.uploading
                    ? `Enviando capa… ${imageUploader.progress}%`
                    : 'Selecionar imagem de capa'}
                </button>
              </div>
            )}
            {imageUploader.error && (
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--danger, #dc3c3c)', fontWeight: 600 }}>
                {imageUploader.error}
              </p>
            )}
          </div>

          {/* Arquivo do Guia (PDF/Doc) */}
          <div>
            <label style={labelStyle}>Arquivo do Guia (PDF / Documento)</label>
            {arquivoFile ? (
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
                    {arquivoFile.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '2px' }}>
                    {(arquivoFile.size / 1024).toFixed(2)} MB
                  </div>
                </div>
                <a
                  href={
                    arquivoFile.url.startsWith('http')
                      ? arquivoFile.url
                      : `${STRAPI_URL}${arquivoFile.url}`
                  }
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
                  onClick={() => setArquivoFile(null)}
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
              <div>
                <input
                  ref={arquivoInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleArquivoSelect}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => arquivoInputRef.current?.click()}
                  disabled={fileUploader.uploading || isSaving}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '11px',
                    border: '1px dashed var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: fileUploader.uploading || isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Upload size={18} color="var(--primary)" />
                  {fileUploader.uploading
                    ? `Enviando arquivo… ${fileUploader.progress}%`
                    : 'Selecionar arquivo (PDF)'}
                </button>
              </div>
            )}
            {fileUploader.error && (
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--danger, #dc3c3c)', fontWeight: 600 }}>
                {fileUploader.error}
              </p>
            )}
          </div>

          {/* Botão de Salvar */}
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              id="elabore-plano-save-btn"
              onClick={handleSave}
              disabled={isSaving || imageUploader.uploading || fileUploader.uploading}
              style={{
                padding: '12px 26px',
                borderRadius: '11px',
                border: 'none',
                background:
                  isSaving || imageUploader.uploading || fileUploader.uploading
                    ? 'var(--muted)'
                    : 'var(--primary)',
                color: isSaving || imageUploader.uploading || fileUploader.uploading ? 'var(--text-soft)' : '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                cursor: isSaving || imageUploader.uploading || fileUploader.uploading ? 'not-allowed' : 'pointer',
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
              {isSaving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  );
};
