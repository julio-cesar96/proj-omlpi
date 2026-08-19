import React, { useState } from 'react';
import { useSobres } from '../hooks/sobre/useSobres';
import { useSobreMutations } from '../hooks/sobre/useSobreMutations';
import { SobreCard } from '../components/sobre/SobreCard';
import { SobreModal } from '../components/sobre/SobreModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';
import type { Sobre as SobreRecord, SobrePayload } from '../lib/strapi';

export const Sobre: React.FC = () => {
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

  // ─── Handlers de modal ────────────────────────────────────────────────────

  const handleSaveDraft = async (payload: SobrePayload) => {
    try {
      if (modalState === 'novo') {
        await createSobre.mutateAsync({ payload });
        showToast('Aba criada como rascunho.');
      } else if (modalState && typeof modalState === 'object') {
        await updateSobre.mutateAsync({ id: modalState.id, payload });
        showToast('Rascunho salvo.');
      }
      setModalState(null);
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar rascunho.');
    }
  };

  const handlePublish = async (payload: SobrePayload) => {
    try {
      if (modalState === 'novo') {
        await createSobre.mutateAsync({ payload });
        showToast('Aba criada e publicada.');
      } else if (modalState && typeof modalState === 'object') {
        const isAlreadyPublished = Boolean(modalState.published_at);
        await updateSobre.mutateAsync({ id: modalState.id, payload });
        showToast(isAlreadyPublished ? 'Aba atualizada.' : 'Aba publicada com sucesso.');
      }
      setModalState(null);
    } catch (err: any) {
      showToast(err.message || 'Erro ao publicar.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSobre.mutateAsync({ id: deleteTarget.id });
      showToast('Aba excluída.');
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir aba.');
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
            Quem Somos
          </h1>
          {!isLoading && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-soft)', fontWeight: 500 }}>
              {sobres.length === 0
                ? 'Nenhuma aba cadastrada'
                : `${sobres.length} aba${sobres.length > 1 ? 's' : ''} cadastrada${sobres.length > 1 ? 's' : ''}`}
              {' · '}
              <span style={{ fontStyle: 'italic' }}>
                ordem por data de criação — reordenação requer campo extra no Strapi
              </span>
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
          Nova aba
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
      ) : sobres.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            borderRadius: '16px',
            border: '2px dashed var(--border)',
            color: 'var(--text-soft)',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
            Nenhuma aba de "Quem Somos" cadastrada ainda.
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
            Clique em "Nova aba" para criar a primeira.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sobres.map((sobre, index) => (
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
      />

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir aba"
        description={`Tem certeza que deseja excluir a aba "${deleteTarget?.title || 'sem título'}"? Esta ação não pode ser desfeita.`}
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
