import React from 'react';
import { FileText, Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { Guia } from '../../lib/strapi';
import { STRAPI_URL } from '../../lib/api';

interface GuiaTableProps {
  guias: Guia[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  debouncedSearch: string;
  onEdit: (guia: Guia) => void;
  onDelete: (guia: Guia) => void;
}

function getFileUrl(fileUrl?: string): string {
  if (!fileUrl) return '#';
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  return `${STRAPI_URL}${fileUrl}`;
}

function getFileExtBadge(mimeOrExt?: string): string {
  if (!mimeOrExt) return 'DOC';
  const clean = mimeOrExt.replace('.', '').toUpperCase();
  if (clean.includes('PDF')) return 'PDF';
  if (clean.includes('XLS') || clean.includes('SPREADSHEET')) return 'XLSX';
  if (clean.includes('DOC') || clean.includes('WORD')) return 'DOCX';
  if (clean.includes('PNG') || clean.includes('JPG') || clean.includes('JPEG')) return 'IMG';
  return clean.slice(0, 4);
}

export const GuiaTable: React.FC<GuiaTableProps> = ({
  guias,
  isLoading,
  isError,
  error,
  debouncedSearch,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      style={{
        background: 'var(--card)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-soft)' }}>
          Carregando guias e documentos...
        </div>
      ) : isError ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
          Erro ao carregar documentos: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </div>
      ) : guias.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-soft)' }}>
          <FileText size={36} style={{ color: 'var(--border)', marginBottom: '12px' }} />
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)' }}>
            Nenhum documento encontrado
          </div>
          <p style={{ fontSize: '13.5px', margin: '4px 0 0' }}>
            {debouncedSearch ? 'Tente buscar com outros termos.' : 'Clique em "Novo Documento" para cadastrar o primeiro.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--bg)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: 'var(--text-soft)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <th style={{ padding: '14px 20px', width: '60px' }}>ID</th>
                <th style={{ padding: '14px 20px' }}>Documento / Título</th>
                <th style={{ padding: '14px 20px', width: '160px' }}>Categoria</th>
                <th style={{ padding: '14px 20px', width: '140px' }}>Criado em</th>
                <th style={{ padding: '14px 20px', width: '120px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {guias.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '16px 20px', fontSize: '13.5px', color: 'var(--text-soft)', fontWeight: 600 }}>
                    #{item.id}
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(74, 93, 35, 0.1)',
                          color: 'var(--primary)',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.5px',
                          marginTop: '2px',
                          flexShrink: 0,
                        }}
                      >
                        {getFileExtBadge(item.file?.ext || item.file?.mime)}
                      </span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-h)' }}>
                          {item.title}
                        </div>
                        {item.description && (
                          <div
                            style={{
                              fontSize: '13px',
                              color: 'var(--text-soft)',
                              marginTop: '2px',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {item.description}
                          </div>
                        )}
                        {item.file && (
                          <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '4px' }}>
                            Arquivo: <strong>{item.file.name}</strong>
                            {item.file.size ? ` (${(item.file.size / 1024).toFixed(2)} MB)` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    {item.category ? (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          fontSize: '12.5px',
                          fontWeight: 600,
                        }}
                      >
                        {item.category}
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-soft)' }}>—</span>
                    )}
                  </td>

                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-soft)' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '—'}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      {item.file?.url && (
                        <a
                          href={getFileUrl(item.file.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Visualizar / Download"
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text-soft)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                          }}
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        title="Editar"
                        style={{
                          padding: '6px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: 'var(--text-soft)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        title="Excluir"
                        style={{
                          padding: '6px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
