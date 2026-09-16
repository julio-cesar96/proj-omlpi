import React, { useState } from 'react';
import { useFaqs } from '../hooks/faqs/useFaqs';
import { useFaqsCount } from '../hooks/faqs/useFaqsCount';
import { useFaqMutations } from '../hooks/faqs/useFaqMutations';
import { useFaqsFilters, PAGE_LIMIT } from '../hooks/faqs/useFaqsFilters';
import { useFaqsOrdemSeed } from '../hooks/faqs/useFaqsOrdemSeed';
import { useFaqsLocalOrder } from '../hooks/faqs/useFaqsLocalOrder';
import { useFaqsModal } from '../hooks/faqs/useFaqsModal';
import { useFaqsDeleteDialog } from '../hooks/faqs/useFaqsDeleteDialog';
import { FaqsHeader } from '../components/faqs/FaqsHeader';
import { FaqsSeedBanner } from '../components/faqs/FaqsSeedBanner';
import { FaqsSearchBar } from '../components/faqs/FaqsSearchBar';
import { FaqsTabs } from '../components/faqs/FaqsTabs';
import { FaqsListSkeleton } from '../components/faqs/FaqsListSkeleton';
import { FaqsPagination } from '../components/faqs/FaqsPagination';
import { FaqList } from '../components/faqs/FaqList';
import { FaqModal } from '../components/faqs/FaqModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';

export const Faqs: React.FC = () => {
  const { page, setPage, searchRaw, search, handleSearchChange, activeTab, handleTabChange } =
    useFaqsFilters();

  const { data: faqs = [], isLoading } = useFaqs({
    _q: search,
    _start: (page - 1) * PAGE_LIMIT,
    _limit: PAGE_LIMIT,
  });
  const { counts, isLoading: countsLoading } = useFaqsCount(search);
  const { createFaq, updateFaq, deleteFaq, reorderFaqs, seedOrdem } = useFaqMutations();

  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const showToast = (message: string) => setToast({ visible: true, message });

  useFaqsOrdemSeed({ faqs, isLoading, page, search, seedOrdem });

  const { localFaqs, filteredFaqs, handleDragEnd } = useFaqsLocalOrder({
    faqs,
    activeTab,
    reorderFaqs,
    onError: showToast,
  });

  const {
    modalState,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveDraft,
    handlePublish,
    handleSubmitReview,
    isSaving,
  } = useFaqsModal({
    localFaqs,
    createFaq,
    updateFaq,
    onSuccess: showToast,
    onError: showToast,
  });

  const { deleteTarget, setDeleteTarget, handleDeleteConfirm } = useFaqsDeleteDialog({
    deleteFaq,
    onSuccess: showToast,
    onError: showToast,
  });

  return (
    <div style={{ animation: 'fadeIn .3s ease', maxWidth: '860px' }}>
      <FaqsHeader onCreateNew={openCreateModal} />

      {seedOrdem.isPending && <FaqsSeedBanner />}

      <FaqsSearchBar value={searchRaw} onChange={handleSearchChange} />

      <FaqsTabs
        activeTab={activeTab}
        counts={counts}
        countsLoading={countsLoading}
        onTabChange={handleTabChange}
      />

      {isLoading || seedOrdem.isPending ? (
        <FaqsListSkeleton />
      ) : (
        <FaqList
          faqs={filteredFaqs}
          onDragEnd={handleDragEnd}
          onEdit={openEditModal}
          onDelete={(faq) => setDeleteTarget(faq)}
          hasSearch={search.length > 0}
        />
      )}

      {!isLoading && !seedOrdem.isPending && (
        <FaqsPagination
          page={page}
          activeTab={activeTab}
          counts={counts}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}

      <FaqModal
        open={modalState.open}
        faq={modalState.faq}
        onClose={closeModal}
        onSaveDraft={handleSaveDraft}
        onSubmitReview={handleSubmitReview}
        onPublish={handlePublish}
        isSaving={isSaving}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir FAQ?"
        description={
          deleteTarget
            ? `A pergunta "${deleteTarget.pergunta}" será removida permanentemente. Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />

      {toast.visible && (
        <Toast
          message={toast.message}
          onClose={() => setToast((t) => ({ ...t, visible: false }))}
        />
      )}
    </div>
  );
};
