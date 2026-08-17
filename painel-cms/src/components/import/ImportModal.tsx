import React, { useRef } from 'react';
import { Download, FileSpreadsheet, Upload, X, Loader2 } from 'lucide-react';
import { useSpreadsheetImport } from '../../hooks/useSpreadsheetImport';
import type { ImportModuleConfig } from '../../types/import';
import { ImportPreviewTable } from './ImportPreviewTable';
import { ImportReport } from './ImportReport';

interface ImportModalProps<TRow = any, TPayload = any, TContext = any> {
  isOpen: boolean;
  onClose: () => void;
  config: ImportModuleConfig<TRow, TPayload, TContext>;
  onImportSuccess?: () => void;
}

export const ImportModal = <TRow = any, TPayload = any, TContext = any>({
  isOpen,
  onClose,
  config,
  onImportSuccess,
}: ImportModalProps<TRow, TPayload, TContext>) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    status,
    file,
    rows,
    autoCreateCategoriesTags,
    isContextLoading,
    contextError,
    progress,
    summary,
    handleFileSelect,
    handleToggleAutoCreate,
    handleDownloadTemplate,
    startImport,
    reset,
  } = useSpreadsheetImport(config);

  if (!isOpen) return null;

  const handleModalClose = () => {
    if (status === 'completed' && onImportSuccess) {
      onImportSuccess();
    }
    reset();
    onClose();
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileSelect(files[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const validRowsCount = rows.filter((r) => r.status !== 'invalid').length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: status === 'preview' ? '820px' : '620px',
          background: 'var(--card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Header do Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={22} style={{ color: 'var(--primary)' }} />
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
                Importar Planilha — {config.moduleName}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-soft)', margin: '2px 0 0' }}>
                Importação de metadados em lote via arquivo .xlsx ou .csv
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-soft)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {contextError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              ⚠️ {contextError}
            </div>
          )}

          {/* ETAPA 1: Seleção de Arquivo (idle / parsing) */}
          {(status === 'idle' || status === 'parsing') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: '14px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg)',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                />

                {status === 'parsing' ? (
                  <>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>Lendo e analisando arquivo...</div>
                  </>
                ) : (
                  <>
                    <Upload size={32} style={{ color: 'var(--primary)' }} />
                    <div style={{ fontWeight: 700, fontSize: '14.5px' }}>
                      Clique para selecionar ou arraste o arquivo aqui
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                      Suporta arquivos .xlsx, .xls ou .csv (até 10 MB)
                    </div>
                  </>
                )}
              </div>

              {/* Opções e Download de Modelo */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '12px 16px',
                  background: 'var(--bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  flexWrap: 'wrap',
                }}
              >
                {/* Checkbox Decisão A3 */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={autoCreateCategoriesTags}
                    onChange={(e) => handleToggleAutoCreate(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  Criar categorias e tags inexistentes automaticamente
                </label>

                {/* Botão Modelo */}
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={15} />
                  Baixar modelo (.xlsx)
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 2: Preview das Linhas Parseadas */}
          {status === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-soft)' }}>
                Arquivo: <strong>{file?.name}</strong>. Revise os dados extraídos antes de confirmar a importação:
              </div>

              <ImportPreviewTable rows={rows} />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    borderRadius: '9px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Trocar arquivo
                </button>

                <button
                  type="button"
                  disabled={validRowsCount === 0 || isContextLoading}
                  onClick={startImport}
                  style={{
                    height: '38px',
                    padding: '0 20px',
                    borderRadius: '9px',
                    background: 'var(--primary)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: validRowsCount === 0 ? 'not-allowed' : 'pointer',
                    opacity: validRowsCount === 0 ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isContextLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    `Confirmar e Importar ${validRowsCount} ${validRowsCount === 1 ? 'linha' : 'linhas'}`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 3: Processamento com Barra de Progresso */}
          {status === 'importing' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                gap: '20px',
                textAlign: 'center',
              }}
            >
              <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />

              <div style={{ width: '100%', maxWidth: '400px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  <span>Importando registros...</span>
                  <span>
                    {progress.current} de {progress.total} (
                    {Math.round((progress.current / (progress.total || 1)) * 100)}%)
                  </span>
                </div>

                {/* Barra de Progresso */}
                <div
                  style={{
                    height: '10px',
                    width: '100%',
                    background: 'var(--bg)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(progress.current / (progress.total || 1)) * 100}%`,
                      background: 'var(--primary)',
                      borderRadius: '999px',
                      transition: 'width 0.25s ease',
                    }}
                  />
                </div>
              </div>

              {progress.currentTitle && (
                <div style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>
                  Processando: <strong>{progress.currentTitle}</strong>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 4: Relatório Final */}
          {status === 'completed' && summary && (
            <ImportReport summary={summary} onClose={handleModalClose} />
          )}
        </div>
      </div>
    </div>
  );
};
