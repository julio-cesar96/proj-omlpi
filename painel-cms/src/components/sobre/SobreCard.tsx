import React from 'react';
import type { Sobre } from '../../lib/strapi';

interface SobreCardProps {
  sobre: Sobre;
  index: number;
  onEdit: (sobre: Sobre) => void;
  onDelete: (sobre: Sobre) => void;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const SobreCard: React.FC<SobreCardProps> = ({
  sobre,
  index,
  onEdit,
  onDelete,
}) => {
  const isPublished = Boolean(sobre.published_at);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        boxShadow: 'var(--shadow)',
        padding: '14px 16px',
        transition: 'border-color .15s ease, box-shadow .15s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
      }}
    >
      {/* Número de posição */}
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '8px',
          background: 'var(--muted)',
          color: 'var(--text-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>

      {/* Miniatura de imagem (se houver) */}
      {sobre.image?.url && (
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid var(--border)',
          }}
        >
          <img
            src={sobre.image.url}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Conteúdo principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {sobre.title || <em style={{ color: 'var(--text-soft)' }}>Aba sem título</em>}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-soft)',
            fontWeight: 500,
            marginTop: '2px',
          }}
        >
          Atualizado em {formatDate(sobre.updated_at)}
        </div>
      </div>

      {/* Badge de status */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: '20px',
          flexShrink: 0,
          background: isPublished ? '#e6f4ea' : 'var(--muted)',
          color: isPublished ? '#1a7f37' : 'var(--text-soft)',
        }}
      >
        {isPublished ? 'Publicado' : 'Rascunho'}
      </span>

      {/* Botão editar */}
      <button
        type="button"
        onClick={() => onEdit(sobre)}
        title="Editar aba"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '9px',
          border: 'none',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-soft)',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background .15s ease, color .15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--muted)';
          e.currentTarget.style.color = 'var(--text)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-soft)';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
      </button>

      {/* Botão excluir */}
      <button
        type="button"
        onClick={() => onDelete(sobre)}
        title="Excluir aba"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '9px',
          border: 'none',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-soft)',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background .15s ease, color .15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#fde8ec';
          e.currentTarget.style.color = 'var(--destructive)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-soft)';
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  );
};
