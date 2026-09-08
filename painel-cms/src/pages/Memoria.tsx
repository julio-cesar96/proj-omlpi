import React, { useState } from 'react';
import { useSobres } from '../hooks/sobre/useSobres';
import { useSobreMutations } from '../hooks/sobre/useSobreMutations';
import { SobreCard } from '../components/sobre/SobreCard';
import { SobreModal } from '../components/sobre/SobreModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';
import { parseSobreText } from '../lib/frontmatter';
import type { Sobre as SobreRecord, SobrePayload } from '../lib/strapi';

export const Memoria: React.FC = () => {
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

  // Filtra registros de memória/histórico pelo título ou por metadados de frontmatter
  const memoriaItems = sobres.filter((s) => {
    const t = s.title?.toLowerCase() ?? '';
    const parsed = parseSobreText(s.text);
    const label = parsed.meta.section_label?.toLowerCase() ?? '';
    const title = parsed.meta.section_title?.toLowerCase() ?? '';

    return (
      t.includes('memória') ||
      t.includes('memoria') ||
      t.includes('histórico') ||
      t.includes('historico') ||
      label.includes('memória') ||
      label.includes('memoria') ||
      title.includes('histórico') ||
      title.includes('historico')
    );
  });

  // ─── Handlers de modal ────────────────────────────────────────────────────

  const handleSaveDraft = async (payload: SobrePayload) => {
    try {
      if (modalState === 'novo') {
        await createSobre.mutateAsync({ payload });
        showToast('Registro de Histórico criado como rascunho.');
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
        showToast('Registro de Histórico criado e publicado.');
      } else if (modalState && typeof modalState === 'object') {
        const isAlreadyPublished = Boolean(modalState.published_at);
        await updateSobre.mutateAsync({ id: modalState.id, payload });
        showToast(
          isAlreadyPublished
            ? 'Registro atualizado.'
            : 'Registro publicado com sucesso.'
        );
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
      showToast('Registro excluído.');
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir registro.');
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
            Memória / Histórico
          </h1>
          {!isLoading && (
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: 'var(--text-soft)',
                fontWeight: 500,
              }}
            >
              Gerencie os textos, imagens e rótulos da seção Histórico do site.
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e0521f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--primary)';
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo registro
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
      ) : memoriaItems.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            borderRadius: '16px',
            border: '2px dashed var(--border)',
            color: 'var(--text-soft)',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🕐</div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
            Nenhum registro de Memória / Histórico cadastrado.
          </p>
          <p style={{ margin: '6px 0 16px', fontSize: '13px' }}>
            Clique abaixo para criar o registro da seção Histórico.
          </p>
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
            Criar Histórico
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {memoriaItems.map((sobre, index) => (
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
        defaultSectionType="historico"
      />

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Excluir registro"
        description={`Tem certeza que deseja excluir o registro "${deleteTarget?.title || 'sem título'}"? Esta ação não pode ser desfeita.`}
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
