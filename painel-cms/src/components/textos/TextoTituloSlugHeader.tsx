import React from 'react';

interface TextoTituloSlugHeaderProps {
  titulo: string;
  slug: string;
  slugEditadoManualmente: boolean;
  isEditingSlugInline: boolean;
  onTituloChange: (val: string) => void;
  onSlugChange: (val: string) => void;
  onResetSlug: () => void;
  onToggleSlugEdit: (val: boolean) => void;
}

export const TextoTituloSlugHeader: React.FC<TextoTituloSlugHeaderProps> = ({
  titulo,
  slug,
  slugEditadoManualmente,
  isEditingSlugInline,
  onTituloChange,
  onSlugChange,
  onResetSlug,
  onToggleSlugEdit,
}) => {
  const siteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
  const prefix = siteUrl ? `${siteUrl.replace(/\/$/, '')}/paginas/` : '/paginas/';

  return (
    <div>
      {/* Título inline grande */}
      <input
        type="text"
        value={titulo}
        onChange={(e) => onTituloChange(e.target.value)}
        style={{
          width: '100%',
          border: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-heading)',
          fontSize: '26px',
          fontWeight: 800,
          letterSpacing: '-.5px',
          outline: 'none',
          padding: '0 0 4px',
          color: 'var(--text)',
        }}
        placeholder="Título da página"
      />

      {/* URL / Slug display */}
      <div
        style={{
          fontSize: '13px',
          color: 'var(--text-soft)',
          fontWeight: 600,
          borderBottom: '1px solid var(--border)',
          paddingBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
        }}
      >
        {siteUrl && slug && !isEditingSlugInline ? (
          <a
            href={`${siteUrl.replace(/\/$/, '')}/paginas/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-soft)', textDecoration: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; }}
          >
            {prefix}
          </a>
        ) : (
          <span>{prefix}</span>
        )}

        {isEditingSlugInline ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="text"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '12px',
                outline: 'none',
                color: 'var(--text)',
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={() => onToggleSlugEdit(false)}
              style={{
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              OK
            </button>
            {slugEditadoManualmente && (
              <button
                type="button"
                onClick={onResetSlug}
                style={{
                  background: 'var(--muted)',
                  color: 'var(--text-soft)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Restaurar slug padrão do título"
              >
                Reset
              </button>
            )}
          </div>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <strong style={{ color: 'var(--text)' }}>{slug || '...'}</strong>
            <button
              type="button"
              onClick={() => onToggleSlugEdit(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Editar slug
            </button>
          </span>
        )}
      </div>
    </div>
  );
};
