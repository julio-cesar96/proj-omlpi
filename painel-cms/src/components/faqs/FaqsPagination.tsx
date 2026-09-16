import React from 'react';
import type { FaqsTabKey } from '../../hooks/faqs/useFaqsFilters';
import { PAGE_LIMIT } from '../../hooks/faqs/useFaqsFilters';
import type { FaqsCounts } from '../../hooks/faqs/useFaqsCount';

interface FaqsPaginationProps {
  page: number;
  activeTab: FaqsTabKey;
  counts: FaqsCounts;
  onPrev: () => void;
  onNext: () => void;
}

export const FaqsPagination: React.FC<FaqsPaginationProps> = ({ page, activeTab, counts, onPrev, onNext }) => {
  const currentTotal = counts[activeTab];
  const totalPages = Math.max(1, Math.ceil(currentTotal / PAGE_LIMIT));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '20px',
        padding: '12px 0',
        borderTop: '1px solid var(--border)',
      }}
    >
      <span style={{ fontSize: '13px', color: 'var(--text-soft)' }}>
        Página {page} de {totalPages} · {currentTotal} FAQs
      </span>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          style={{
            height: '36px',
            padding: '0 16px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: hasPrev ? 'var(--text)' : 'var(--text-soft)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: hasPrev ? 'pointer' : 'not-allowed',
            opacity: hasPrev ? 1 : 0.45,
            transition: 'background .15s ease',
          }}
          onMouseEnter={(e) => { if (hasPrev) e.currentTarget.style.background = 'var(--muted)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}
        >
          ← Anterior
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          style={{
            height: '36px',
            padding: '0 16px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: hasNext ? 'var(--text)' : 'var(--text-soft)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: hasNext ? 'pointer' : 'not-allowed',
            opacity: hasNext ? 1 : 0.45,
            transition: 'background .15s ease',
          }}
          onMouseEnter={(e) => { if (hasNext) e.currentTarget.style.background = 'var(--muted)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
};
