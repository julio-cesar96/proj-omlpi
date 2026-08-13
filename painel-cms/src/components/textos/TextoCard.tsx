import React from 'react';
import type { PaginaInstitucional } from '../../lib/strapi';

interface TextoCardProps {
  pagina: PaginaInstitucional;
  onClick: () => void;
}

export const TextoCard: React.FC<TextoCardProps> = ({ pagina, onClick }) => {
  const isPublished = pagina.published_at !== null && pagina.published_at !== undefined;

  const formattedDate = new Date(pagina.updated_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        boxShadow: 'var(--shadow)',
        padding: '16px 18px',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        transition: 'border-color .15s ease, box-shadow .15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.boxShadow = '0 10px 28px rgba(68,69,37,.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '11px',
          background: 'var(--muted)',
          color: 'var(--text-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M14 3v5h5" />
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '15px',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {pagina.titulo}
        </div>
        <div
          style={{
            fontSize: '12.5px',
            color: 'var(--text-soft)',
            fontWeight: 600,
            marginTop: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {(() => {
            const siteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
            const pagePath = `/paginas/${pagina.slug}`;
            if (siteUrl) {
              const fullUrl = `${siteUrl.replace(/\/$/, '')}${pagePath}`;
              return (
                <>
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: 'var(--primary)', textDecoration: 'none' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; }}
                  >
                    {fullUrl}
                  </a>
                  {' '}· Atualizado em {formattedDate}
                </>
              );
            }
            return <>{pagePath} · Atualizado em {formattedDate}</>;
          })()}
        </div>
      </div>

      <span
        style={{
          fontSize: '11.5px',
          fontWeight: 700,
          color: isPublished ? '#17A649' : '#7a7663',
          background: isPublished ? 'var(--accent)' : 'var(--muted)',
          padding: '4px 11px',
          borderRadius: '20px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {isPublished ? 'Publicado' : 'Rascunho'}
      </span>

      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a49a87"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
};
