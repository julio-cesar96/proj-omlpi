import React from 'react';
import { Plus, Search } from 'lucide-react';
import { TextoCard } from './TextoCard';
import type { PaginaInstitucional } from '../../lib/strapi';

interface TextoListProps {
  paginas: PaginaInstitucional[];
  isLoading: boolean;
  activeTab: 'all' | 'publicados' | 'rascunhos';
  onTabChange: (tab: 'all' | 'publicados' | 'rascunhos') => void;
  counts: { all: number; publicados: number; rascunhos: number };
  countsLoading: boolean;
  searchRaw: string;
  onSearchChange: (value: string) => void;
  onEdit: (pagina: PaginaInstitucional) => void;
  onNewPage: () => void;
}

export const TextoList: React.FC<TextoListProps> = ({
  paginas,
  isLoading,
  activeTab,
  onTabChange,
  counts,
  countsLoading,
  searchRaw,
  onSearchChange,
  onEdit,
  onNewPage,
}) => {
  const tabs = [
    { key: 'all' as const, label: 'Todas', count: counts.all },
    { key: 'publicados' as const, label: 'Publicadas', count: counts.publicados },
    { key: 'rascunhos' as const, label: 'Rascunhos', count: counts.rascunhos },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-.5px', margin: 0 }}>
            Textos Institucionais
          </h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
            Páginas de conteúdo do site com editor rich text e SEO.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewPage}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            height: '40px',
            padding: '0 18px',
            borderRadius: '11px',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '13.5px',
            fontWeight: 700,
            border: 'none',
            boxShadow: '0 4px 12px rgba(242,93,39,.28)',
            cursor: 'pointer',
            transition: 'background .15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e0521f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--primary)';
          }}
        >
          <Plus size={16} strokeWidth={2.4} />
          Nova página
        </button>
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-soft)',
          }}
          size={17}
        />
        <input
          type="text"
          value={searchRaw}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar páginas pelo título…"
          style={{
            width: '100%',
            height: '42px',
            padding: '0 14px 0 40px',
            borderRadius: '11px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            fontSize: '13.5px',
            color: 'var(--text)',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color .15s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        />
      </div>

      {/* Abas */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
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
              {tab.label}
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
                {countsLoading ? '…' : tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista / Skeletons */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: '76px',
                borderRadius: '14px',
                background: 'var(--muted)',
                animation: 'pulse 1.4s ease-in-out infinite',
                opacity: 1 - i * 0.1,
              }}
            />
          ))}
        </div>
      ) : paginas.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            color: 'var(--text-soft)',
          }}
        >
          Nenhuma página encontrada.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          {paginas.map((pagina) => (
            <TextoCard key={pagina.id} pagina={pagina} onClick={() => onEdit(pagina)} />
          ))}
        </div>
      )}
    </div>
  );
};
