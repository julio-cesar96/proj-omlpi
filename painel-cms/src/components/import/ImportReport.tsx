import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { ImportSummary } from '../../types/import';

interface ImportReportProps {
  summary: ImportSummary;
  onClose: () => void;
}

export const ImportReport: React.FC<ImportReportProps> = ({ summary, onClose }) => {
  const failedResults = summary.results.filter((r) => !r.success);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Resumo de Sucesso / Erros */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-soft)', fontWeight: 600 }}>Total Processado</div>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '2px' }}>{summary.total}</div>
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>Sucesso</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
            {summary.successCount}
          </div>
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: summary.errorCount > 0 ? '#fef2f2' : 'var(--bg)',
            border: summary.errorCount > 0 ? '1px solid #fecaca' : '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: summary.errorCount > 0 ? '#b91c1c' : 'var(--text-soft)', fontWeight: 600 }}>
            Falhas
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: summary.errorCount > 0 ? '#dc2626' : 'var(--text-soft)',
              marginTop: '2px',
            }}
          >
            {summary.errorCount}
          </div>
        </div>
      </div>

      {/* Lista de Falhas (se houver) */}
      {failedResults.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} />
            Linhas que falharam durante a criação ({failedResults.length}):
          </h4>

          <div
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              background: '#fffefb',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                  <th style={{ padding: '8px 12px', width: '50px' }}>Linha</th>
                  <th style={{ padding: '8px 12px' }}>Título</th>
                  <th style={{ padding: '8px 12px' }}>Motivo do Erro</th>
                </tr>
              </thead>
              <tbody>
                {failedResults.map((res) => (
                  <tr key={res.rowIndex} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#dc2626' }}>#{res.rowIndex}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{res.title}</td>
                    <td style={{ padding: '8px 12px', color: '#b91c1c' }}>{res.error || 'Erro na requisição.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '24px',
            background: '#f0fdf4',
            borderRadius: '10px',
            color: '#15803d',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          <CheckCircle2 size={20} />
          Todas as {summary.successCount} linhas foram importadas com sucesso!
        </div>
      )}

      {/* Botão de Fechar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            height: '38px',
            padding: '0 20px',
            borderRadius: '9px',
            background: 'var(--primary)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Concluir e Atualizar Tabela
        </button>
      </div>
    </div>
  );
};
