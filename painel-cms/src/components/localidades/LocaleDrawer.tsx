import React, { useState, useEffect } from 'react';
import { X, FileText, Upload, Trash2, ExternalLink, Loader2, AlertCircle, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { useUploadFile } from '../../hooks/planos/useUploadFile';
import { PlanoSelectorModal } from './PlanoSelectorModal';
import type { Locale, LocaleUpdatePayload, StrapiFile, Plano } from '../../lib/strapi';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

interface LocaleDrawerProps {
  isOpen: boolean;
  locale: Locale | null;
  onClose: () => void;
  onSave: (id: number, payload: LocaleUpdatePayload) => Promise<void>;
}

export const LocaleDrawer: React.FC<LocaleDrawerProps> = ({
  isOpen,
  locale,
  onClose,
  onSave,
}) => {
  const [file, setFile] = useState<StrapiFile | null>(null);
  const [planoOrigem, setPlanoOrigem] = useState<Plano | null>(null);
  const [isLaw, setIsLaw] = useState<boolean>(false);
  const [hidePlan, setHidePlan] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const { uploadFile, uploading, progress, error, setError } = useUploadFile();

  useEffect(() => {
    if (locale) {
      setFile(locale.plan || null);
      setPlanoOrigem(typeof locale.plano_origem === 'object' ? locale.plano_origem : null);
      setIsLaw(Boolean(locale.is_law));
      setHidePlan(Boolean(locale.hide_plan));
    } else {
      setFile(null);
      setPlanoOrigem(null);
      setIsLaw(false);
      setHidePlan(false);
    }
    setError(null);
  }, [locale, isOpen, setError]);

  if (!isOpen || !locale) return null;

  const hasPlan = Boolean(file);

  // Lógica de desatualização: se o plano_origem tiver sido atualizado DEPOIS do locale
  const isOutdated = Boolean(
    planoOrigem &&
    planoOrigem.updated_at &&
    locale.updated_at &&
    new Date(planoOrigem.updated_at).getTime() > new Date(locale.updated_at).getTime()
  );

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      try {
        const uploaded = await uploadFile(droppedFile);
        setFile(uploaded);
        setPlanoOrigem(null); // Upload manual reseta plano_origem
      } catch (_) {}
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      try {
        const uploaded = await uploadFile(selected);
        setFile(uploaded);
        setPlanoOrigem(null); // Upload manual reseta plano_origem
      } catch (_) {}
    }
  };

  const handleSelectPlano = (plano: Plano) => {
    if (plano.documento) {
      setFile(plano.documento);
      setPlanoOrigem(plano);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPlanoOrigem(null);
    setIsLaw(false);
    setHidePlan(false);
  };

  const handleSyncPlano = () => {
    if (planoOrigem?.documento) {
      setFile(planoOrigem.documento);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(locale.id, {
        plan: file ? file.id : null,
        plano_origem: planoOrigem ? planoOrigem.id : null,
        is_law: hasPlan ? isLaw : false,
        hide_plan: hasPlan ? hidePlan : false,
      });
      onClose();
    } catch (_) {
    } finally {
      setIsSaving(false);
    }
  };

  const pdfUrl = file?.url
    ? (file.url.startsWith('http') ? file.url : `${STRAPI_URL}${file.url}`)
    : null;

  const formatSize = (kb?: number) => {
    if (!kb) return '';
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${Math.round(kb)} KB`;
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--card)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            animation: 'slideLeft 0.25s ease',
          }}
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
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                {locale.name} {locale.state ? `(${locale.state})` : ''}
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-soft)', margin: '2px 0 0' }}>
                Gestão do Plano / Lei de Primeira Infância
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-soft)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Body */}
          <form
            onSubmit={handleSubmit}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Informações da Localidade */}
            <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                Dados Cadastrais
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-soft)', display: 'block', fontSize: '11.5px' }}>Tipo</span>
                  <strong style={{ textTransform: 'capitalize' }}>{locale.type === 'city' ? 'Município' : locale.type === 'state' ? 'Estado' : locale.type}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-soft)', display: 'block', fontSize: '11.5px' }}>Estado / Região</span>
                  <strong>{locale.state || '—'} {locale.region ? `(${locale.region})` : ''}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-soft)', display: 'block', fontSize: '11.5px' }}>Código IBGE</span>
                  <strong style={{ fontFamily: 'monospace' }}>{locale.cod_ibge ?? '—'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-soft)', display: 'block', fontSize: '11.5px' }}>Capital</span>
                  <strong>{locale.is_capital ? 'Sim' : 'Não'}</strong>
                </div>
              </div>
            </div>

            {/* Banner de Aviso: Desatualizado */}
            {isOutdated && planoOrigem && (
              <div
                style={{
                  background: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertCircle size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#92400E' }}>
                      Plano de Origem Desatualizado
                    </div>
                    <div style={{ fontSize: '12px', color: '#B45309', marginTop: '2px' }}>
                      O plano <strong>"{planoOrigem.titulo}"</strong> foi editado em {formatDate(planoOrigem.updated_at)}.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleSyncPlano}
                    style={{
                      height: '32px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      background: '#D97706',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <RefreshCw size={14} />
                    Sincronizar Dados do Plano
                  </button>
                </div>
              </div>
            )}

            {/* Seção Upload / Vinculação do PDF */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13.5px', fontWeight: 700 }}>
                  Documento do Plano (PDF)
                </label>
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(true)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--primary)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                  }}
                >
                  <LinkIcon size={14} />
                  Anexar de Planos existentes
                </button>
              </div>

              {file ? (
                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    background: 'var(--card)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#FDE7DE',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={22} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={file.name}
                    >
                      {file.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '2px' }}>
                      {formatSize(file.size)}
                      {planoOrigem && (
                        <span style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '6px' }}>
                          • Vinculado ao Plano #{planoOrigem.id}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {pdfUrl && (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Abrir em nova aba"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        color: '#EF4444',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remover anexo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: '12px',
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: 'var(--bg)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  {uploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Fazendo upload... ({progress}%)</span>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'block' }}>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <Upload size={28} style={{ color: 'var(--text-soft)', marginBottom: '8px' }} />
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
                        Arraste ou clique para enviar o PDF
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '4px' }}>
                        Apenas arquivos .pdf até 200 MB
                      </div>
                    </label>
                  )}
                </div>
              )}

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '12px', marginTop: '8px' }}>
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>

            {/* Configurações do Documento */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                Parâmetros de Exibição
              </h3>

              {/* Switch É Lei */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: hasPlan ? 'var(--card)' : 'var(--bg)',
                  opacity: hasPlan ? 1 : 0.6,
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700 }}>É Lei Municipal/Estadual?</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '2px' }}>
                    {hasPlan
                      ? 'Define se o documento é uma Lei ou um Plano no site público'
                      : 'Anexe um PDF primeiro para habilitar'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isLaw}
                  disabled={!hasPlan}
                  onChange={(e) => setIsLaw(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: hasPlan ? 'pointer' : 'not-allowed' }}
                />
              </div>

              {/* Switch Ocultar Plano */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: hasPlan ? 'var(--card)' : 'var(--bg)',
                  opacity: hasPlan ? 1 : 0.6,
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700 }}>Ocultar Plano no Site Público</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '2px' }}>
                    {hasPlan
                      ? 'Esconde o plano das consultas públicas no site'
                      : 'Anexe um PDF primeiro para habilitar'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hidePlan}
                  disabled={!hasPlan}
                  onChange={(e) => setHidePlan(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: hasPlan ? 'pointer' : 'not-allowed' }}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '20px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  height: '42px',
                  padding: '0 18px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving || uploading}
                style={{
                  height: '42px',
                  padding: '0 22px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: isSaving ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isSaving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Seletor de Planos */}
      <PlanoSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleSelectPlano}
        selectedPlanoId={planoOrigem?.id}
      />
    </>
  );
};

