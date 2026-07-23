import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Faq } from '../../lib/strapi';
import { FaqCard } from './FaqCard';

interface FaqListProps {
  faqs: Faq[];
  onDragEnd: (result: DropResult) => void;
  onEdit: (faq: Faq) => void;
  onDelete: (faq: Faq) => void;
}

// Componente de placeholder para quando a lista está vazia
const EmptyState: React.FC<{ hasSearch: boolean }> = ({ hasSearch }) => (
  <div
    style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '40px 24px',
      textAlign: 'center',
      color: 'var(--text-soft)',
    }}
  >
    <div style={{ fontSize: '32px', marginBottom: '12px' }}>❓</div>
    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>
      {hasSearch ? 'Nenhuma FAQ encontrada' : 'Nenhuma FAQ cadastrada'}
    </h3>
    <p style={{ fontSize: '13.5px', margin: 0 }}>
      {hasSearch
        ? 'Tente outros termos de busca.'
        : 'Clique em "Nova FAQ" para criar a primeira.'}
    </p>
  </div>
);

export const FaqList: React.FC<FaqListProps & { hasSearch?: boolean }> = ({
  faqs,
  onDragEnd,
  onEdit,
  onDelete,
  hasSearch = false,
}) => {
  if (faqs.length === 0) {
    return <EmptyState hasSearch={hasSearch} />;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="faqs-list">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {faqs.map((faq, index) => (
              <Draggable
                key={faq.id}
                draggableId={String(faq.id)}
                index={index}
              >
                {(provided, snapshot) => (
                  <FaqCard
                    faq={faq}
                    index={index}
                    provided={provided}
                    snapshot={snapshot}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                )}
              </Draggable>
            ))}
            {/* placeholder mantém o espaço do item sendo arrastado */}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
