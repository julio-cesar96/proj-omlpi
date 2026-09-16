import { useEffect, useState } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Faq } from '../../lib/strapi';
import type { FaqsTabKey } from './useFaqsFilters';

// Helper: reordenar array movendo item de sourceIndex para destinationIndex
function reorder<T>(list: T[], sourceIndex: number, destinationIndex: number): T[] {
  const result = [...list];
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, removed);
  return result;
}

interface UseFaqsLocalOrderParams {
  faqs: Faq[];
  activeTab: FaqsTabKey;
  reorderFaqs: UseMutationResult<void, Error, Faq[]>;
  onError: (message: string) => void;
}

// Estado local otimista da lista de FAQs (para o drag & drop) e sua
// filtragem por aba ativa.
export function useFaqsLocalOrder({ faqs, activeTab, reorderFaqs, onError }: UseFaqsLocalOrderParams) {
  const [localFaqs, setLocalFaqs] = useState<Faq[]>([]);

  // Sincronizar localFaqs com dados do servidor
  useEffect(() => {
    setLocalFaqs(faqs);
  }, [faqs]);

  const filteredFaqs = (() => {
    switch (activeTab) {
      case 'publicadas':
        return localFaqs.filter((f) => f.published_at !== null && f.published_at !== undefined);
      case 'rascunhos':
        return localFaqs.filter((f) => f.published_at === null || f.published_at === undefined);
      default:
        return localFaqs;
    }
  })();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const reorderedVisible = reorder(filteredFaqs, source.index, destination.index);

    if (activeTab === 'all') {
      setLocalFaqs(reorderedVisible);
      reorderFaqs.mutate(reorderedVisible, {
        onError: (err) => {
          setLocalFaqs(faqs);
          onError(err.message);
        },
      });
    } else {
      const visibleIds = new Set(filteredFaqs.map((f) => f.id));
      const nonVisible = localFaqs.filter((f) => !visibleIds.has(f.id));
      const merged = [...reorderedVisible, ...nonVisible];
      setLocalFaqs(merged);
      reorderFaqs.mutate(merged, {
        onError: (err) => {
          setLocalFaqs(faqs);
          onError(err.message);
        },
      });
    }
  };

  return { localFaqs, filteredFaqs, handleDragEnd };
}
