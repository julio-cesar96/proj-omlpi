import React, { useState } from 'react';
import { useSobres } from '../hooks/sobre/useSobres';
import { useSobreMutations } from '../hooks/sobre/useSobreMutations';
import { SobreCard } from '../components/sobre/SobreCard';
import { SobreModal } from '../components/sobre/SobreModal';
import { Toast } from '../components/ui/Toast';
import type { Sobre as SobreRecord, SobrePayload } from '../lib/strapi';

export const Memoria: React.FC = () => {
  const { data: sobres = [], isLoading } = useSobres();
  const { updateSobre } = useSobreMutations();

  // Modal: null = fechado, SobreRecord = edição
  const [modalState, setModalState] = useState<SobreRecord | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showToast = (message: string) => setToast({ visible: true, message });

  const isSaving = updateSobre.isPending;

  // Filtra registros de memória/histórico pelo título
  const memoriaItems = sobres.filter((s) => {
    const t = s.title?.toLowerCase() ?? '';
    return t.includes('memória') || t.includes('memoria') || t.includes('histórico');
  });

  // ─── Handlers de modal ────────────────────────────────────────────────────

  const handleSaveDraft = async (payload: SobrePayload) => {
    try {
      if (modalState && typeof modalState === 'object') {
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
      if (modalState && typeof modalState === 'object') {
        const isAlreadyPublished = Boolean(modalState.published_at);
        await updateSobre.mutateAsync({ id: modalState.id, payload });
        showToast(isAlreadyPublished ? 'Registro atualizado.' : 'Registro publicado com sucesso.');
      }
      setModalState(null);
    } catch (err: any) {
      showToast(err.message || 'Erro ao publicar.');
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
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-soft)', fontWeight: 500 }}>
              Gerencie o conteúdo da seção Memória exibida no site.
            </p>
          )}
        </div>
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
            Nenhum registro de Memória / Histórico encontrado.
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
            Crie um registro com título contendo "Memória" ou "Histórico" diretamente no Strapi
            (collection <strong>sobres</strong>).
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {memoriaItems.map((sobre, index) => (
            <SobreCard
              key={sobre.id}
              sobre={sobre}
              index={index}
              onEdit={(s) => setModalState(s)}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}

      {/* Modal de edição */}
      <SobreModal
        open={modalState !== null}
        sobre={modalState as SobreRecord | null}
        onClose={() => setModalState(null)}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isSaving={isSaving}
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
