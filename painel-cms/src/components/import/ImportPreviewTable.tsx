import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ImportRowValidation } from '../../types/import';

interface ImportPreviewTableProps {
  rows: ImportRowValidation[];
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({ rows }) => {
  const validCount = rows.filter((r) => r.status === 'valid').length;
  const warningCount = rows.filter((r) => r.status === 'warning').length;
  const invalidCount = rows.filter((r) => r.status === 'invalid').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Resumo visual */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg)',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          fontSize: '13px',
          fontWeight: 600,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: 'var(--text-soft)' }}>
          {rows.length} {rows.length === 1 ? 'linha encontrada' : 'linhas encontradas'}:
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a' }}>
          <CheckCircle2 size={15} />
          {validCount} válidas
        </div>

        {warningCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d97706' }}>
            <AlertTriangle size={15} />
            {warningCount} com avisos
          </div>
        )}

        {invalidCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#dc2626' }}>
            <AlertCircle size={15} />
            {invalidCount} com erros
          </div>
        )}
      </div>

      {/* Tabela de Preview */}
      <div
        style={{
          maxHeight: '340px',
          overflowY: 'auto',
          border: '1px solid var(--border)',
          borderRadius: '10px',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                background: 'var(--bg)',
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                zIndex: 2,
              }}
            >
              <th style={{ padding: '10px 12px', width: '45px' }}>Linha</th>
              <th style={{ padding: '10px 12px', width: '100px' }}>Status</th>
              <th style={{ padding: '10px 12px' }}>Título</th>
              <th style={{ padding: '10px 12px' }}>Categoria</th>
              <th style={{ padding: '10px 12px' }}>Tags</th>
              <th style={{ padding: '10px 12px' }}>Estado</th>
              <th style={{ padding: '10px 12px' }}>Observações / Erros</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              let statusBg = '#f0fdf4';
              let statusColor = '#16a34a';
              let statusText = 'Válida';
              let StatusIcon = CheckCircle2;

              if (row.status === 'invalid') {
                statusBg = '#fef2f2';
                statusColor = '#dc2626';
                statusText = 'Erro';
                StatusIcon = AlertCircle;
              } else if (row.status === 'warning') {
                statusBg = '#fffbeb';
                statusColor = '#d97706';
                statusText = 'Aviso';
                StatusIcon = AlertTriangle;
              }

              return (
                <tr
                  key={row.rowIndex}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: row.status === 'invalid' ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-soft)' }}>
                    #{row.rowIndex}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: statusBg,
                        color: statusColor,
                      }}
                    >
                      <StatusIcon size={13} />
                      {statusText}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: '200px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.rawRow.titulo || <em style={{ color: 'var(--text-soft)' }}>(vazio)</em>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-soft)' }}>
                    {row.rawRow.categoria || '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-soft)' }}>
                    {row.rawRow.tags || '-'}
                  </td>
                  <td style={{ padding: '10px 12px', textTransform: 'capitalize', color: 'var(--text-soft)' }}>
                    {row.rawRow.estado_editorial || 'rascunho'}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '11.5px' }}>
                    {row.errors.length > 0 && (
                      <div style={{ color: '#dc2626', fontWeight: 600 }}>
                        {row.errors.join(' | ')}
                      </div>
                    )}
                    {row.warnings.length > 0 && (
                      <div style={{ color: '#d97706' }}>
                        {row.warnings.join(' | ')}
                      </div>
                    )}
                    {row.errors.length === 0 && row.warnings.length === 0 && (
                      <span style={{ color: '#16a34a' }}>Pronto para importar</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
