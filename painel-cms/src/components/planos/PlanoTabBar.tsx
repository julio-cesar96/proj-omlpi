import React from 'react';
import type { EditorialState } from '../../lib/strapi';
import type { PlanosCounts } from '../../hooks/planos/usePlanosCount';

interface PlanoTabBarProps {
  currentTab: 'all' | EditorialState;
  counts: PlanosCounts;
  onTabChange: (tab: 'all' | EditorialState) => void;
}

export const PlanoTabBar: React.FC<PlanoTabBarProps> = ({ currentTab, counts, onTabChange }) => {
  const tabs: { key: 'all' | EditorialState; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'rascunho', label: 'Rascunhos', count: counts.rascunho },
    { key: 'revisao', label: 'Em revisão', count: counts.revisao },
    { key: 'publicado', label: 'Publicados', count: counts.publicado },
    { key: 'arquivado', label: 'Arquivados', count: counts.arquivado },
  ];

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '38px',
              padding: '0 16px',
              borderRadius: '11px',
              fontSize: '13px',
              fontWeight: 700,
              border: '1px solid var(--border)',
              background: isActive ? 'var(--text)' : 'var(--card)',
              color: isActive ? '#FFFFFF' : 'var(--text)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '12px',
                background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--muted)',
                color: isActive ? '#FFFFFF' : 'var(--text-soft)',
              }}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
