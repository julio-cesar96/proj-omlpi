import React, { useEffect, useRef, useState } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { Faq, FaqPayload } from '../lib/strapi';
import { useFaqs } from '../hooks/faqs/useFaqs';
import { useFaqsCount } from '../hooks/faqs/useFaqsCount';
import { useFaqMutations } from '../hooks/faqs/useFaqMutations';
import { FaqList } from '../components/faqs/FaqList';
import { FaqModal } from '../components/faqs/FaqModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';

type TabKey = 'all' | 'publicadas' | 'rascunhos';

const PAGE_LIMIT = 20;

// Helper: reordenar array movendo item de sourceIndex para destinationIndex
function reorder<T>(list: T[], sourceIndex: number, destinationIndex: number): T[] {
  const result = [...list];
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, removed);
  return result;
}

// Detecta se qualquer FAQ tem ordem null ou se há valores duplicados
function needsOrdemSeed(faqs: Faq[]): boolean {
  if (faqs.length === 0) return false;
  const hasNull = faqs.some((f) => f.ordem === null || f.ordem === undefined);
  if (hasNull) return true;
  const ordens = faqs.map((f) => f.ordem as number);
  const unique = new Set(ordens);
  return unique.size !== ordens.length;
}

export const Faqs: React.FC = () => {
  // ─── Paginação ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ─── Busca com debounce 400ms ─────────────────────────────────────────────
  const [searchRaw, setSearchRaw] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchRaw(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1); // resetar para primeira página ao buscar
    }, 400);
  };

  // ─── Aba ativa ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1); // resetar paginação ao trocar aba
  };

  // ─── Estado local para optimistic update do DnD ──────────────────────────
  const [localFaqs, setLocalFaqs] = useState<Faq[]>([]);

  // ─── Dados ────────────────────────────────────────────────────────────────
  const { data: faqs = [], isLoading } = useFaqs({
    _q: search,
    _start: (page - 1) * PAGE_LIMIT,
    _limit: PAGE_LIMIT,
  });
  const { counts, isLoading: countsLoading } = useFaqsCount(search);
  const { createFaq, updateFaq, deleteFaq, reorderFaqs, seedOrdem } = useFaqMutations();

  // ─── Seed automático de ordem ─────────────────────────────────────────────
  // Ao carregar a primeira página sem busca, verifica se alguma FAQ tem ordem
  // null/duplicado e, se sim, dispara o seed. Só roda uma vez (quando os dados
  // chegam do servidor pela primeira vez e o seed ainda não está pendente).
  const seedRanRef = useRef(false);

  useEffect(() => {
    if (
      !isLoading &&
      faqs.length > 0 &&
      page === 1 &&
      search === '' &&
      !seedRanRef.current &&
      !seedOrdem.isPending &&
      needsOrdemSeed(faqs)
    ) {
      seedRanRef.current = true;
      seedOrdem.mutate(faqs);
    }
  }, [isLoading, faqs, page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sincronizar localFaqs com dados do servidor
  useEffect(() => {
    setLocalFaqs(faqs);
  }, [faqs]);

  // ─── Modal de criação/edição ──────────────────────────────────────────────
  const [modalState, setModalState] = useState<{ open: boolean; faq: Faq | null }>({
    open: false,
    faq: null,
  });

  const openCreateModal = () => setModalState({ open: true, faq: null });
  const openEditModal = (faq: Faq) => setModalState({ open: true, faq });
  const closeModal = () => setModalState({ open: false, faq: null });

  // ─── Confirm dialog de exclusão ───────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);

  // ─── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showToast = (message: string) => setToast({ visible: true, message });

  // ─── Handlers do modal ────────────────────────────────────────────────────
  const handleSaveDraft = (payload: FaqPayload) => {
    const mutation = modalState.faq
      ? updateFaq.mutateAsync({ id: modalState.faq.id, payload })
      : createFaq.mutateAsync({ payload, faqsAtuais: localFaqs });

    mutation
      .then(() => {
        closeModal();
        showToast(modalState.faq ? 'FAQ atualizada.' : 'Rascunho de FAQ salvo.');
      })
      .catch((err: Error) => showToast(err.message));
  };

  const handlePublish = (payload: FaqPayload) => {
    const mutation = modalState.faq
      ? updateFaq.mutateAsync({ id: modalState.faq.id, payload })
      : createFaq.mutateAsync({ payload, faqsAtuais: localFaqs });

    mutation
      .then(() => {
        closeModal();
        showToast(modalState.faq ? 'FAQ atualizada.' : 'FAQ criada com sucesso.');
      })
      .catch((err: Error) => showToast(err.message));
  };

  const isSaving = createFaq.isPending || updateFaq.isPending;

  // ─── Handler de exclusão ──────────────────────────────────────────────────
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteFaq
      .mutateAsync({ id: deleteTarget.id })
      .then(() => {
        setDeleteTarget(null);
        showToast('FAQ excluída.');
      })
      .catch((err: Error) => {
        setDeleteTarget(null);
        showToast(err.message);
      });
  };

  // ─── Handler de drag & drop ───────────────────────────────────────────────
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const visibleFaqs = filteredFaqs;
    const reorderedVisible = reorder(visibleFaqs, source.index, destination.index);

    if (activeTab === 'all') {
      setLocalFaqs(reorderedVisible);
      reorderFaqs.mutate(reorderedVisible, {
        onError: (err) => {
          setLocalFaqs(faqs);
          showToast(err.message);
        },
      });
    } else {
      const visibleIds = new Set(visibleFaqs.map((f) => f.id));
      const nonVisible = localFaqs.filter((f) => !visibleIds.has(f.id));
      const merged = [...reorderedVisible, ...nonVisible];
      setLocalFaqs(merged);
      reorderFaqs.mutate(merged, {
        onError: (err) => {
          setLocalFaqs(faqs);
          showToast(err.message);
        },
      });
    }
  };

  // ─── Filtragem por aba (client-side sobre localFaqs) ─────────────────────
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

  // ─── Paginação ────────────────────────────────────────────────────────────
  const currentTotal = (() => {
    switch (activeTab) {
      case 'publicadas': return counts.publicadas;
      case 'rascunhos': return counts.rascunhos;
      default: return counts.all;
    }
  })();

  const totalPages = Math.max(1, Math.ceil(currentTotal / PAGE_LIMIT));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // ─── Tabs config ──────────────────────────────────────────────────────────
  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'Todas', count: counts.all },
    { key: 'publicadas', label: 'Publicadas', count: counts.publicadas },
    { key: 'rascunhos', label: 'Rascunhos', count: counts.rascunhos },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ animation: 'fadeIn .3s ease', maxWidth: '860px' }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-.5px', margin: 0 }}>
            FAQs
          </h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
            Perguntas frequentes. Arraste para reordenar como aparecem no site.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            height: '40px',
            padding: '0 18px',
            borderRadius: '11px',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '13.5px',
            fontWeight: 700,
            border: 'none',
            boxShadow: '0 4px 12px rgba(242,93,39,.28)',
            cursor: 'pointer',
            transition: 'background .15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e0521f'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nova FAQ
        </button>
      </div>

      {/* ── Banner de seed em andamento ── */}
      {seedOrdem.isPending && (
        <div
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: '11px',
            padding: '10px 16px',
            fontSize: '13px',
            color: 'var(--text-soft)',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Organizando a ordem das FAQs…
        </div>
      )}

      {/* ── Busca ── */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <svg
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7a7663" strokeWidth="2" strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
        <input
          type="text"
          value={searchRaw}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Pesquisar perguntas…"
          style={{
            width: '100%',
            height: '42px',
            padding: '0 14px 0 40px',
            borderRadius: '11px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            fontSize: '13.5px',
            color: 'var(--text)',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color .15s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
      </div>

      {/* ── Abas ── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '38px',
                padding: '0 14px',
                borderRadius: '9px 9px 0 0',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-soft)',
                fontSize: '13px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'color .15s ease',
                fontFamily: 'var(--font-body)',
              }}
            >
              {tab.label}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '20px',
                  background: isActive ? 'var(--primary)' : 'var(--muted)',
                  color: isActive ? '#fff' : 'var(--text-soft)',
                  transition: 'background .15s ease, color .15s ease',
                  minWidth: '22px',
                  textAlign: 'center',
                }}
              >
                {countsLoading ? '…' : tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Lista ── */}
      {isLoading || seedOrdem.isPending ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: '62px',
                borderRadius: '14px',
                background: 'var(--muted)',
                animation: 'pulse 1.4s ease-in-out infinite',
                opacity: 1 - i * 0.1,
              }}
            />
          ))}
        </div>
      ) : (
        <FaqList
          faqs={filteredFaqs}
          onDragEnd={handleDragEnd}
          onEdit={openEditModal}
          onDelete={(faq) => setDeleteTarget(faq)}
          hasSearch={search.length > 0}
        />
      )}

      {/* ── Paginação ── */}
      {!isLoading && !seedOrdem.isPending && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '20px',
            padding: '12px 0',
            borderTop: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--text-soft)' }}>
            Página {page} de {totalPages} · {currentTotal} FAQs
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrev}
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: hasPrev ? 'var(--text)' : 'var(--text-soft)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: hasPrev ? 'pointer' : 'not-allowed',
                opacity: hasPrev ? 1 : 0.45,
                transition: 'background .15s ease',
              }}
              onMouseEnter={(e) => { if (hasPrev) e.currentTarget.style.background = 'var(--muted)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}
            >
              ← Anterior
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: hasNext ? 'var(--text)' : 'var(--text-soft)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: hasNext ? 'pointer' : 'not-allowed',
                opacity: hasNext ? 1 : 0.45,
                transition: 'background .15s ease',
              }}
              onMouseEnter={(e) => { if (hasNext) e.currentTarget.style.background = 'var(--muted)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}
            >
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* ── Modal de criação/edição ── */}
      <FaqModal
        open={modalState.open}
        faq={modalState.faq}
        onClose={closeModal}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isSaving={isSaving}
      />

      {/* ── Confirm dialog de exclusão ── */}
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

      {/* ── Toast ── */}
      {toast.visible && (
        <Toast
          message={toast.message}
          onClose={() => setToast((t) => ({ ...t, visible: false }))}
        />
      )}
    </div>
  );
};
