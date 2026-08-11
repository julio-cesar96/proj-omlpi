import React from 'react';
import { Search, Paperclip, Edit3, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import type { Plano } from '../../lib/strapi';

interface PlanoTableProps {
  planos: Plano[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onEdit: (plano: Plano) => void;
  onDuplicate: (plano: Plano) => void;
  page: number;
  limit: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const PlanoTable: React.FC<PlanoTableProps> = ({
  planos,
  isLoading,
  searchQuery,
  onSearchChange,
  onEdit,
  onDuplicate,
  page,
  limit,
  totalCount,
  onPageChange,
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (_) {
      return dateStr;
    }
  };

  const startRecord = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalCount);
  const totalPages = Math.ceil(totalCount / limit) || 1;

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
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={17}
            color="var(--text-soft)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar por título ou categoria..."
            style={{
              width: '100%',
              height: '40px',
              padding: '0 14px 0 40px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              fontSize: '13.5px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            disabled
            title="Exportação de base em lote (Fase 4)"
            style={{
              height: '40px',
              padding: '0 16px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-soft)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'not-allowed',
              opacity: 0.6,
            }}
          >
            Exportar
          </button>
        </div>
      </div>

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
              <th style={{ width: '40px', padding: '12px 16px' }}>
                <input type="checkbox" disabled style={{ width: '16px', height: '16px' }} />
              </th>
              <th style={{ padding: '12px 16px' }}>Título</th>
              <th style={{ padding: '12px 16px', width: '180px' }}>Categoria</th>
              <th style={{ padding: '12px 16px', width: '140px' }}>Status</th>
              <th style={{ padding: '12px 16px', width: '130px' }}>Atualizado</th>
              <th style={{ padding: '12px 16px', width: '90px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-soft)', fontSize: '14px' }}>
                  Carregando planos...
                </td>
              </tr>
            ) : planos.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-soft)', fontSize: '14px' }}>
                  Nenhum plano encontrado.
                </td>
              </tr>
            ) : (
              planos.map((plano) => (
                <tr
                  key={plano.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <input type="checkbox" disabled style={{ width: '16px', height: '16px' }} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                      {plano.titulo}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {plano.documento && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            background: '#FDE7DE',
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          <Paperclip size={12} />
                          1 PDF
                        </span>
                      )}
                      {plano.tags && plano.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {plano.tags.slice(0, 2).map((t) => (
                            <span
                              key={t.id}
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--text-soft)',
                                background: 'var(--muted)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                              }}
                            >
                              {t.name}
                            </span>
                          ))}
                          {plano.tags.length > 2 && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--text-soft)',
                                background: 'var(--muted)',
                                padding: '2px 6px',
                                borderRadius: '6px',
                              }}
                            >
                              +{plano.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-soft)' }}>
                    {plano.categoria?.nome || '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusBadge status={plano.estado_editorial} />
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-soft)' }}>
                    {formatDate(plano.updated_at)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => onEdit(plano)}
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
                        title="Editar plano"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(plano)}
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
                        title="Duplicar plano"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
          Mostrando {startRecord}–{endRecord} de {totalCount} planos
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
