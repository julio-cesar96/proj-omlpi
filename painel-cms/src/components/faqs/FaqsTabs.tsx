import React from 'react';
import type { FaqsTabKey } from '../../hooks/faqs/useFaqsFilters';
import type { FaqsCounts } from '../../hooks/faqs/useFaqsCount';

interface FaqsTabsProps {
  activeTab: FaqsTabKey;
  counts: FaqsCounts;
  countsLoading: boolean;
  onTabChange: (tab: FaqsTabKey) => void;
}

const TAB_LABELS: { key: FaqsTabKey; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'publicadas', label: 'Publicadas' },
  { key: 'rascunhos', label: 'Rascunhos' },
];

export const FaqsTabs: React.FC<FaqsTabsProps> = ({ activeTab, counts, countsLoading, onTabChange }) => (
  <div
    style={{
      display: 'flex',
      gap: '4px',
      marginBottom: '16px',
      borderBottom: '1px solid var(--border)',
    }}
  >
    {TAB_LABELS.map(({ key, label }) => {
      const isActive = activeTab === key;
      return (
        <button
          key={key}
          type="button"
          onClick={() => onTabChange(key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '38px',
            padding: '0 14px',
            borderRadius: '9px 9px 0 0',
            border: 'none',
            borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
            background: 'transparent',
            color: isActive ? 'var(--primary)' : 'var(--text-soft)',
            fontSize: '13px',
            fontWeight: isActive ? 800 : 600,
            cursor: 'pointer',
            transition: 'color .15s ease',
            fontFamily: 'var(--font-body)',
          }}
        >
          {label}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '20px',
              background: isActive ? 'var(--primary)' : 'var(--muted)',
              color: isActive ? '#fff' : 'var(--text-soft)',
              transition: 'background .15s ease, color .15s ease',
              minWidth: '22px',
              textAlign: 'center',
            }}
          >
            {countsLoading ? '…' : counts[key]}
          </span>
        </button>
      );
    })}
  </div>
);
