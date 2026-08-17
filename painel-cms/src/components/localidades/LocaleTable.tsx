import React, { useRef, useState } from 'react';
import { Paperclip, Edit3, ChevronLeft, ChevronRight, Upload, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import type { Locale } from '../../lib/strapi';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

interface LocaleTableProps {
  locales: Locale[];
  isLoading: boolean;
  onEdit: (locale: Locale) => void;
  onToggleLaw: (locale: Locale, isLaw: boolean) => Promise<void>;
  onToggleHidePlan: (locale: Locale, hidePlan: boolean) => Promise<void>;
  onUploadPdf: (locale: Locale, file: File) => Promise<void>;
  page: number;
  limit: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const LocaleTable: React.FC<LocaleTableProps> = ({
  locales,
  isLoading,
  onEdit,
  onToggleLaw,
  onToggleHidePlan,
  onUploadPdf,
  page,
  limit,
  totalCount,
  onPageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetLocaleForUpload, setTargetLocaleForUpload] = useState<Locale | null>(null);
  const [uploadingLocaleId, setUploadingLocaleId] = useState<number | null>(null);
  const [updatingLocaleId, setUpdatingLocaleId] = useState<number | null>(null);

  const startRecord = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalCount);
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetLocaleForUpload) {
      setUploadingLocaleId(targetLocaleForUpload.id);
      try {
        await onUploadPdf(targetLocaleForUpload, file);
      } finally {
        setUploadingLocaleId(null);
        setTargetLocaleForUpload(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const triggerUpload = (locale: Locale) => {
    setTargetLocaleForUpload(locale);
    fileInputRef.current?.click();
  };

  const handleLawChange = async (locale: Locale, checked: boolean) => {
    setUpdatingLocaleId(locale.id);
    try {
      await onToggleLaw(locale, checked);
    } finally {
      setUpdatingLocaleId(null);
    }
  };

  const handleHidePlanChange = async (locale: Locale, checked: boolean) => {
    setUpdatingLocaleId(locale.id);
    try {
      await onToggleHidePlan(locale, checked);
    } finally {
      setUpdatingLocaleId(null);
    }
  };

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}
    >
      {/* Hidden file input for inline quick upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg)',
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--text-soft)',
                textTransform: 'uppercase',
                letterSpacing: '.4px',
              }}
            >
              <th style={{ padding: '12px 16px' }}>Localidade</th>
              <th style={{ padding: '12px 16px', width: '90px' }}>UF</th>
              <th style={{ padding: '12px 16px', width: '120px' }}>Cód. IBGE</th>
              <th style={{ padding: '12px 16px', width: '220px' }}>Status do Plano</th>
              <th style={{ padding: '12px 16px', width: '110px', textAlign: 'center' }}>É Lei?</th>
              <th style={{ padding: '12px 16px', width: '120px', textAlign: 'center' }}>Ocultar Plano</th>
              <th style={{ padding: '12px 16px', width: '110px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-soft)', fontSize: '14px' }}>
                  Carregando localidades...
                </td>
              </tr>
            ) : locales.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-soft)', fontSize: '14px' }}>
                  Nenhuma localidade encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              locales.map((loc) => {
                const hasPlan = Boolean(loc.plan);
                const isUploading = uploadingLocaleId === loc.id;
                const isUpdating = updatingLocaleId === loc.id;

                const pdfUrl = loc.plan?.url
                  ? (loc.plan.url.startsWith('http') ? loc.plan.url : `${STRAPI_URL}${loc.plan.url}`)
                  : null;

                return (
                  <tr
                    key={loc.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Nome + Badges */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                          {loc.name}
                        </span>
                        {loc.type === 'state' && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              background: 'var(--primary)',
                              color: '#FFFFFF',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            Estado
                          </span>
                        )}
                        {loc.is_capital && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              background: '#E2E8F0',
                              color: '#334155',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            Capital
                          </span>
                        )}
                      </div>
                    </td>

                    {/* UF */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                      {loc.state || '—'}
                    </td>

                    {/* Cod IBGE */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-soft)' }}>
                      {loc.cod_ibge ?? '—'}
                    </td>

                    {/* Status do Plano */}
                    <td style={{ padding: '14px 16px' }}>
                      {isUploading ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'var(--primary)',
                          }}
                        >
                          <Loader2 size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                          Enviando PDF...
                        </span>
                      ) : hasPlan ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#166534',
                                background: '#DCFCE7',
                                padding: '3px 9px',
                                borderRadius: '6px',
                                width: 'fit-content',
                              }}
                            >
                              <Paperclip size={12} />
                              Com Plano
                            </span>

                            {(() => {
                              const planoOrigem = typeof loc.plano_origem === 'object' ? loc.plano_origem : null;
                              const isOutdated = Boolean(
                                planoOrigem &&
                                planoOrigem.updated_at &&
                                loc.updated_at &&
                                new Date(planoOrigem.updated_at).getTime() > new Date(loc.updated_at).getTime()
                              );

                              if (!isOutdated) return null;

                              return (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    color: '#B45309',
                                    background: '#FEF3C7',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                  title={`O plano "${planoOrigem?.titulo}" foi editado em ${new Date(planoOrigem!.updated_at).toLocaleDateString('pt-BR')}`}
                                >
                                  <AlertCircle size={10} />
                                  Desatualizado
                                </span>
                              );
                            })()}
                          </div>
                          {pdfUrl && (
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '11px',
                                color: 'var(--text-soft)',
                                textDecoration: 'underline',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                marginTop: '2px',
                              }}
                              title={loc.plan?.name || 'Ver PDF'}
                            >
                              {loc.plan?.name ? (loc.plan.name.length > 25 ? `${loc.plan.name.slice(0, 22)}...` : loc.plan.name) : 'Abrir PDF'}
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-soft)',
                            background: 'var(--muted)',
                            padding: '3px 9px',
                            borderRadius: '6px',
                          }}
                        >
                          Sem Plano
                        </span>
                      )}
                    </td>

                    {/* É Lei? (desabilitado se !hasPlan) */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <label
                        title={hasPlan ? 'Marcar se o documento é uma Lei' : 'Anexe um PDF primeiro para configurar se é Lei.'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: hasPlan && !isUpdating ? 'pointer' : 'not-allowed',
                          opacity: hasPlan ? 1 : 0.4,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(loc.is_law)}
                          disabled={!hasPlan || isUpdating}
                          onChange={(e) => handleLawChange(loc, e.target.checked)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: hasPlan && !isUpdating ? 'pointer' : 'not-allowed',
                          }}
                        />
                      </label>
                    </td>

                    {/* Ocultar Plano (desabilitado se !hasPlan) */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <label
                        title={hasPlan ? 'Ocultar plano no site público' : 'Anexe um PDF primeiro para configurar a visibilidade.'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: hasPlan && !isUpdating ? 'pointer' : 'not-allowed',
                          opacity: hasPlan ? 1 : 0.4,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(loc.hide_plan)}
                          disabled={!hasPlan || isUpdating}
                          onChange={(e) => handleHidePlanChange(loc, e.target.checked)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: hasPlan && !isUpdating ? 'pointer' : 'not-allowed',
                          }}
                        />
                      </label>
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => triggerUpload(loc)}
                          disabled={isUploading}
                          title={hasPlan ? 'Substituir arquivo PDF' : 'Anexar arquivo PDF'}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: hasPlan ? 'var(--card)' : 'var(--primary)',
                            color: hasPlan ? 'var(--text)' : '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isUploading ? 'wait' : 'pointer',
                          }}
                        >
                          <Upload size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(loc)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-soft)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Detalhes da localidade"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderTop: '1px solid var(--border)',
          background: 'var(--card)',
          fontSize: '13px',
          color: 'var(--text-soft)',
          fontWeight: 600,
        }}
      >
        <div>
          Mostrando {startRecord}–{endRecord} de {totalCount} localidades
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              opacity: page >= totalPages ? 0.5 : 1,
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
