import React from 'react';
import type { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import type { Faq } from '../../lib/strapi';
import { EditorialBadge } from '../ui/EditorialBadge';

interface FaqCardProps {
  faq: Faq;
  index: number;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onEdit: (faq: Faq) => void;
  onDelete: (faq: Faq) => void;
}

export const FaqCard: React.FC<FaqCardProps> = ({
  faq,
  index,
  provided,
  snapshot,
  onEdit,
  onDelete,
}) => {

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'var(--card)',
        border: `1px solid ${snapshot.isDragging ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: '14px',
        boxShadow: snapshot.isDragging
          ? '0 12px 36px rgba(68,69,37,.18)'
          : 'var(--shadow)',
        padding: '14px 16px',
        transform: snapshot.isDragging ? 'scale(1.015)' : undefined,
        transition: snapshot.isDragging ? undefined : 'border-color .15s ease, box-shadow .15s ease',
        userSelect: 'none',
        // Espalhar draggableProps.style para que @hello-pangea/dnd gerencie a posição durante o drag
        ...provided.draggableProps.style,
      }}
    >
      {/* Handle de arraste — 6 pontos (2×3) */}
      <div
        {...provided.dragHandleProps}
        title="Arrastar para reordenar"
        style={{
          color: 'var(--text-soft)',
          cursor: snapshot.isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          flexShrink: 0,
          padding: '2px',
        }}
      >
        {[0, 1, 2].map((row) => (
          <span key={row} style={{ display: 'flex', gap: '3px' }}>
            {[0, 1].map((col) => (
              <i
                key={col}
                style={{
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  background: 'currentColor',
                  display: 'block',
                }}
              />
            ))}
          </span>
        ))}
      </div>

      {/* Badge de número de ordem */}
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

      {/* Conteúdo: pergunta + categoria */}
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
          {faq.pergunta}
        </div>
        {faq.categoria && (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-soft)',
              fontWeight: 600,
              marginTop: '2px',
            }}
          >
            Categoria: {faq.categoria.nome}
          </div>
        )}
      </div>

      {/* Badge de estado editorial */}
      <EditorialBadge status={faq.estado_editorial} publishedAt={faq.published_at} size="sm" />

      {/* Botão editar */}
      <button
        type="button"
        onClick={() => onEdit(faq)}
        title="Editar FAQ"
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
        onClick={() => onDelete(faq)}
        title="Excluir FAQ"
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
