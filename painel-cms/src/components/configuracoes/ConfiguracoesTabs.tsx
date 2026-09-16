import React from 'react';

export type ConfiguracoesTabKey = 'geral' | 'marca' | 'notificacoes' | 'integracoes';

const TABS: { key: ConfiguracoesTabKey; label: string; disabled: boolean }[] = [
  { key: 'geral', label: 'Geral', disabled: false },
  { key: 'marca', label: 'Marca', disabled: true },
  { key: 'notificacoes', label: 'Notificações', disabled: true },
  { key: 'integracoes', label: 'Integrações', disabled: true },
];

interface ConfiguracoesTabsProps {
  activeTab: ConfiguracoesTabKey;
  onChange: (tab: ConfiguracoesTabKey) => void;
}

export const ConfiguracoesTabs: React.FC<ConfiguracoesTabsProps> = ({ activeTab, onChange }) => (
  <div style={{
    display: 'flex',
    gap: '2px',
    borderBottom: '1px solid var(--border)',
    marginBottom: '22px',
  }}>
    {TABS.map((tab) => (
      <button
        key={tab.key}
        id={`tab-${tab.key}`}
        onClick={() => !tab.disabled && onChange(tab.key)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13.5px',
          fontWeight: activeTab === tab.key ? 700 : 600,
          padding: '10px 14px',
          border: 'none',
          background: 'none',
          borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
          color: tab.disabled
            ? 'rgba(122,118,99,0.4)'
            : activeTab === tab.key
              ? 'var(--text)'
              : 'var(--text-soft)',
          cursor: tab.disabled ? 'not-allowed' : 'pointer',
          marginBottom: '-1px',
          transition: 'color 0.15s',
        }}
      >
        {tab.label}
        {tab.disabled && (
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '.3px',
            background: 'var(--muted)',
            color: 'var(--text-soft)',
            padding: '2px 6px',
            borderRadius: '6px',
            textTransform: 'uppercase',
          }}>
            Em breve
          </span>
        )}
      </button>
    ))}
  </div>
);
