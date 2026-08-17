import React from 'react';
import { Search, X } from 'lucide-react';

export const BRAZIL_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

interface LocaleFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  totalCount?: number;
}

export const LocaleFilterBar: React.FC<LocaleFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedState,
  onStateChange,
  selectedType,
  onTypeChange,
  totalCount,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}
    >
      {/* Busca */}
      <div
        style={{
          position: 'relative',
          flex: '1 1 240px',
          minWidth: '220px',
        }}
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-soft)',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome ou código IBGE..."
          style={{
            width: '100%',
            height: '38px',
            paddingLeft: '36px',
            paddingRight: searchQuery ? '32px' : '12px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            fontSize: '13px',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--text-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Select Estado (UF) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-soft)' }}>
          UF:
        </span>
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          style={{
            height: '38px',
            padding: '0 12px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">Todas as UFs</option>
          {BRAZIL_STATES.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
      </div>

      {/* Select Tipo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-soft)' }}>
          Tipo:
        </span>
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          style={{
            height: '38px',
            padding: '0 12px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">Todos os tipos</option>
          <option value="city">Municípios (city)</option>
          <option value="state">Estados (state)</option>
        </select>
      </div>

      {/* Totalizador */}
      {totalCount !== undefined && (
        <div
          style={{
            marginLeft: 'auto',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-soft)',
          }}
        >
          {totalCount.toLocaleString('pt-BR')} registro{totalCount === 1 ? '' : 's'} encontrado{totalCount === 1 ? '' : 's'}
        </div>
      )}
    </div>
  );
};
