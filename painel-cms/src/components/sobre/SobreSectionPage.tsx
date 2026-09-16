import React, { useState } from 'react';
import { useSobres } from '../../hooks/sobre/useSobres';
import { useSobreMutations } from '../../hooks/sobre/useSobreMutations';
import { SobreCard } from './SobreCard';
import { SobreModal } from './SobreModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Toast } from '../ui/Toast';
import type { Sobre as SobreRecord, SobrePayload } from '../../lib/strapi';

export interface SobreSectionPageCopy {
  pageTitle: string;
  /** Parágrafo abaixo do título — recebe a quantidade de itens filtrados. */
  renderDescription: (count: number) => React.ReactNode;
  newButtonLabel: string;
  emptyIcon: string;
  emptyTitle: string;
  emptySubtitle: string;
  /** Botão extra no empty-state (ex: "Criar Histórico"), opcional. */
  emptyActionLabel?: string;
  toastCreateDraft: string;
  toastUpdateDraft: string;
  toastCreatePublish: string;
  toastUpdateAlreadyPublished: string;
  toastUpdatePublished: string;
  toastDeleteSuccess: string;
  errorSaveDraft: string;
  errorPublish: string;
  errorDelete: string;
  deleteDialogTitle: string;
  deleteDialogDescription: (title: string) => string;
}

interface SobreSectionPageProps {
  /** Filtra a coleção `sobres` para exibir só os itens desta seção. */
  filterPredicate: (sobre: SobreRecord) => boolean;
  defaultSectionType: 'sobre' | 'historico';
  copy: SobreSectionPageCopy;
}

/**
 * Página genérica para as duas views sobre o content-type `sobre`:
 * "Quem Somos" (Sobre.tsx) e "Memória / Histórico" (Memoria.tsx).
 * Cada rota passa seu próprio filtro e textos via `copy`.
 */
export const SobreSectionPage: React.FC<SobreSectionPageProps> = ({
  filterPredicate,
  defaultSectionType,
  copy,
}) => {
  const { data: sobres = [], isLoading } = useSobres();
  const { createSobre, updateSobre, deleteSobre } = useSobreMutations();

  // Modal: null = fechado, 'novo' = criação, SobreRecord = edição
  const [modalState, setModalState] = useState<SobreRecord | 'novo' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SobreRecord | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showToast = (message: string) => setToast({ visible: true, message });

  const isSaving =
    createSobre.isPending || updateSobre.isPending || deleteSobre.isPending;

  const items = sobres.filter(filterPredicate);

  // ─── Handlers de modal ────────────────────────────────────────────────────

  const handleSaveDraft = async (payload: SobrePayload) => {
    try {
      if (modalState === 'novo') {
        await createSobre.mutateAsync({ payload });
        showToast(copy.toastCreateDraft);
      } else if (modalState && typeof modalState === 'object') {
        await updateSobre.mutateAsync({ id: modalState.id, payload });
        showToast(copy.toastUpdateDraft);
      }
      setModalState(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : copy.errorSaveDraft);
    }
  };

  const handlePublish = async (payload: SobrePayload) => {
    try {
      if (modalState === 'novo') {
        await createSobre.mutateAsync({ payload });
        showToast(copy.toastCreatePublish);
      } else if (modalState && typeof modalState === 'object') {
        const isAlreadyPublished = Boolean(modalState.published_at);
        await updateSobre.mutateAsync({ id: modalState.id, payload });
        showToast(isAlreadyPublished ? copy.toastUpdateAlreadyPublished : copy.toastUpdatePublished);
      }
      setModalState(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : copy.errorPublish);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSobre.mutateAsync({ id: deleteTarget.id });
      showToast(copy.toastDeleteSuccess);
    } catch (err) {
      showToast(err instanceof Error ? err.message : copy.errorDelete);
    } finally {
      setDeleteTarget(null);
    }
  };

  // ─── Renderização ─────────────────────────────────────────────────────────

  return (
    <div style={{ animation: 'fadeIn .3s ease', maxWidth: '840px' }}>
      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '24px',
              fontWeight: 900,
              letterSpacing: '-.4px',
              margin: 0,
            }}
          >
            {copy.pageTitle}
          </h1>
          {!isLoading && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-soft)', fontWeight: 500 }}>
              {copy.renderDescription(items.length)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setModalState('novo')}
          style={{
            height: '40px',
            padding: '0 18px',
            borderRadius: '11px',
            border: 'none',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(242,93,39,.28)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background .15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e0521f'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {copy.newButtonLabel}
        </button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: '72px',
                borderRadius: '14px',
                background: 'var(--muted)',
                animation: 'pulse 1.5s ease infinite',
              }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            borderRadius: '16px',
            border: '2px dashed var(--border)',
            color: 'var(--text-soft)',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>{copy.emptyIcon}</div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
            {copy.emptyTitle}
          </p>
          <p style={{ margin: copy.emptyActionLabel ? '6px 0 16px' : '6px 0 0', fontSize: '13px' }}>
            {copy.emptySubtitle}
          </p>
          {copy.emptyActionLabel && (
            <button
              type="button"
              onClick={() => setModalState('novo')}
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {copy.emptyActionLabel}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((sobre, index) => (
            <SobreCard
              key={sobre.id}
              sobre={sobre}
              index={index}
              onEdit={(s) => setModalState(s)}
              onDelete={(s) => setDeleteTarget(s)}
            />
          ))}
        </div>
      )}

      {/* Modal de edição / criação */}
      <SobreModal
        open={modalState !== null}
        sobre={modalState !== 'novo' ? (modalState as SobreRecord | null) : null}
        onClose={() => setModalState(null)}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isSaving={isSaving}
        defaultSectionType={defaultSectionType}
      />

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={copy.deleteDialogTitle}
        description={copy.deleteDialogDescription(deleteTarget?.title || 'sem título')}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />

      {/* Toast */}
      {toast.visible && (
        <Toast
          message={toast.message}
          onClose={() => setToast((t) => ({ ...t, visible: false }))}
        />
      )}
    </div>
  );
};
