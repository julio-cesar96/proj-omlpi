import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Faq, FaqPayload } from '../../lib/strapi';

interface UseFaqsModalParams {
  localFaqs: Faq[];
  createFaq: UseMutationResult<Faq, Error, { payload: FaqPayload; faqsAtuais: Faq[] }>;
  updateFaq: UseMutationResult<Faq, Error, { id: number; payload: Partial<FaqPayload> }>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

// Estado do modal de criação/edição de FAQ e os handlers de salvar
// (rascunho, revisão, publicação) chamados por ele.
export function useFaqsModal({ localFaqs, createFaq, updateFaq, onSuccess, onError }: UseFaqsModalParams) {
  const [modalState, setModalState] = useState<{ open: boolean; faq: Faq | null }>({
    open: false,
    faq: null,
  });

  const openCreateModal = () => setModalState({ open: true, faq: null });
  const openEditModal = (faq: Faq) => setModalState({ open: true, faq });
  const closeModal = () => setModalState({ open: false, faq: null });

  const saveFaq = (payload: FaqPayload) =>
    modalState.faq
      ? updateFaq.mutateAsync({ id: modalState.faq.id, payload })
      : createFaq.mutateAsync({ payload, faqsAtuais: localFaqs });

  const handleSaveDraft = async (payload: FaqPayload) => {
    try {
      await saveFaq(payload);
      closeModal();
      onSuccess(modalState.faq ? 'FAQ atualizada.' : 'Rascunho de FAQ salvo.');
    } catch (err) {
      onError((err as Error).message);
    }
  };

  const handlePublish = async (payload: FaqPayload) => {
    try {
      await saveFaq(payload);
      closeModal();
      onSuccess(modalState.faq ? 'FAQ atualizada.' : 'FAQ criada com sucesso.');
    } catch (err) {
      onError((err as Error).message);
    }
  };

  const handleSubmitReview = async (payload: FaqPayload) => {
    try {
      await saveFaq(payload);
      closeModal();
      onSuccess('FAQ enviada para revisão.');
    } catch (err) {
      onError((err as Error).message);
    }
  };

  const isSaving = createFaq.isPending || updateFaq.isPending;

  return {
    modalState,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveDraft,
    handlePublish,
    handleSubmitReview,
    isSaving,
  };
}
