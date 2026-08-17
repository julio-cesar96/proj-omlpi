import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { PlanoTabBar } from '../components/planos/PlanoTabBar';
import { PlanoTable } from '../components/planos/PlanoTable';
import { PlanoDrawer } from '../components/planos/PlanoDrawer';
import { Toast } from '../components/ui/Toast';
import { usePlanos } from '../hooks/planos/usePlanos';
import { usePlanosCount } from '../hooks/planos/usePlanosCount';
import { usePlanoMutations } from '../hooks/planos/usePlanoMutations';
import { exportToExcel } from '../lib/excelParser';
import { planosImportConfig } from '../hooks/planos/usePlanosImportConfig';
import type { EditorialState, Plano, PlanoPayload } from '../lib/strapi';

export const Planos: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'all' | EditorialState>('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Debounce search input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to first page on search
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleTabChange = (tab: 'all' | EditorialState) => {
    setCurrentTab(tab);
    setPage(1);
  };

  // Queries
  const { counts } = usePlanosCount(debouncedSearch);

  const { data: planos = [], isLoading } = usePlanos({
    _start: (page - 1) * limit,
    _limit: limit,
    _sort: 'updated_at:DESC',
    _q: debouncedSearch || undefined,
    estado_editorial: currentTab === 'all' ? undefined : currentTab,
  });

  // Total count for current filter
  const currentTotal = currentTab === 'all' ? counts.all : counts[currentTab] || 0;

  // Mutations
  const { createPlano, updatePlano, publishPlano, archivePlano, duplicatePlano } = usePlanoMutations();

  const handleNewPlan = () => {
    setSelectedPlano(null);
    setIsDrawerOpen(true);
  };

  const handleEditPlan = (plano: Plano) => {
    setSelectedPlano(plano);
    setIsDrawerOpen(true);
  };

  const handleSaveDraft = async (payload: PlanoPayload) => {
    if (selectedPlano?.id) {
      await updatePlano.mutateAsync({ id: selectedPlano.id, payload });
    } else {
      await createPlano.mutateAsync(payload);
    }
    showToast('Rascunho salvo');
  };

  const handleSubmitReview = async (payload: PlanoPayload) => {
    if (selectedPlano?.id) {
      await updatePlano.mutateAsync({ id: selectedPlano.id, payload: { ...payload, estado_editorial: 'revisao' } });
    } else {
      await createPlano.mutateAsync({ ...payload, estado_editorial: 'revisao' });
    }
    showToast('Enviado para revisão');
  };

  const handlePublish = async (payload: PlanoPayload) => {
    if (selectedPlano?.id) {
      await publishPlano.mutateAsync({ id: selectedPlano.id, payload });
    } else {
      const created = await createPlano.mutateAsync(payload);
      await publishPlano.mutateAsync({ id: created.id, payload });
    }
    showToast('Plano publicado');
  };

  const handleArchive = async (id: number) => {
    await archivePlano.mutateAsync({ id });
    showToast('Plano arquivado');
  };

  const handleDuplicate = async (plano: Plano) => {
    await duplicatePlano.mutateAsync(plano);
    showToast(`Conteúdo duplicado: ${plano.titulo}`);
  };

  const handleExport = () => {
    if (!planos || planos.length === 0) return;

    const exportRows = planos.map((plano) => ({
      titulo: plano.titulo || '',
      descricao: plano.descricao || '',
      categoria: plano.categoria?.nome || '',
      tags: plano.tags ? plano.tags.map((t) => t.name).join(', ') : '',
      estado_editorial: plano.estado_editorial || 'rascunho',
    }));

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `planos-exportados-${dateStr}.xlsx`;

    exportToExcel(filename, planosImportConfig.templateHeaders, exportRows, 'Planos');
    showToast(`${exportRows.length} plano(s) exportado(s) com sucesso.`);
  };

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Header */}
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
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-.5px' }}>Planos</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
            Gerencie planos, diretrizes e documentos com fluxo editorial.
          </p>
        </div>

        <button
          type="button"
          onClick={handleNewPlan}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            height: '40px',
            padding: '0 18px',
            borderRadius: '11px',
            background: 'var(--primary)',
            color: '#FFFFFF',
            fontSize: '13.5px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(242,93,39,.28)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} strokeWidth={2.6} />
          Novo plano
        </button>
      </div>

      {/* Tabs */}
      <PlanoTabBar currentTab={currentTab} counts={counts} onTabChange={handleTabChange} />

      {/* Table */}
      <PlanoTable
        planos={planos}
        isLoading={isLoading}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        onEdit={handleEditPlan}
        onDuplicate={handleDuplicate}
        page={page}
        limit={limit}
        totalCount={currentTotal}
        onPageChange={setPage}
        onExport={handleExport}
      />

      {/* Drawer */}
      <PlanoDrawer
        isOpen={isDrawerOpen}
        plano={selectedPlano}
        onClose={() => setIsDrawerOpen(false)}
        onSaveDraft={handleSaveDraft}
        onSubmitReview={handleSubmitReview}
        onPublish={handlePublish}
        onArchive={handleArchive}
        onDuplicate={handleDuplicate}
      />

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};
