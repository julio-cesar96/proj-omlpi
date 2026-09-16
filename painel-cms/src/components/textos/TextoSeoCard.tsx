import React from 'react';

interface TextoSeoCardProps {
  seoTitulo: string;
  seoDescricao: string;
  slug: string;
  onSeoTituloChange: (val: string) => void;
  onSeoDescricaoChange: (val: string) => void;
  onSlugChange: (val: string) => void;
}

export const TextoSeoCard: React.FC<TextoSeoCardProps> = ({
  seoTitulo,
  seoDescricao,
  slug,
  onSeoTituloChange,
  onSeoDescricaoChange,
  onSlugChange,
}) => {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow)',
        padding: '16px 18px',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>SEO</div>

      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '5px' }}>
        Meta título ({seoTitulo.length}/60)
      </label>
      <input
        type="text"
        value={seoTitulo}
        onChange={(e) => onSeoTituloChange(e.target.value.slice(0, 60))}
        style={{
          width: '100%',
          height: '38px',
          padding: '0 11px',
          borderRadius: '9px',
          border: '1px solid var(--border)',
          background: 'var(--bg)',
          fontSize: '12.5px',
          outline: 'none',
          marginBottom: '12px',
          boxSizing: 'border-box',
          color: 'var(--text)',
        }}
        placeholder="Ex: Sobre o Observa RNPI"
      />

      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '5px' }}>
        Meta descrição ({seoDescricao.length}/160)
      </label>
      <textarea
        value={seoDescricao}
        onChange={(e) => onSeoDescricaoChange(e.target.value.slice(0, 160))}
        style={{
          width: '100%',
          height: '64px',
          padding: '9px 11px',
          borderRadius: '9px',
          border: '1px solid var(--border)',
          background: 'var(--bg)',
          fontSize: '12.5px',
          outline: 'none',
          resize: 'none',
          marginBottom: '12px',
          boxSizing: 'border-box',
          color: 'var(--text)',
          fontFamily: 'inherit',
        }}
        placeholder="Ex: Observatório para monitoramento..."
      />

      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '5px' }}>
        Slug / URL
      </label>
      <input
        type="text"
        value={slug}
        onChange={(e) => onSlugChange(e.target.value)}
        style={{
          width: '100%',
          height: '38px',
          padding: '0 11px',
          borderRadius: '9px',
          border: '1px solid var(--border)',
          background: 'var(--bg)',
          fontSize: '12.5px',
          outline: 'none',
          boxSizing: 'border-box',
          color: 'var(--text)',
        }}
        placeholder="sobre-o-observa"
      />
    </div>
  );
};
