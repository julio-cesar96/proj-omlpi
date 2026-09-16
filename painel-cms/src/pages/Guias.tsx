import React, { useState, useRef } from 'react';
import { useGuias } from '../hooks/guias/useGuias';
import { useGuiaMutations } from '../hooks/guias/useGuiaMutations';
import type { Guia, GuiaPayload } from '../lib/strapi';
import { GuiaModal } from '../components/guias/GuiaModal';
import { GuiaTable } from '../components/guias/GuiaTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';
import { Plus, Search, BookOpen } from 'lucide-react';

export const Guias: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [guiaToEdit, setGuiaToEdit] = useState<Guia | null>(null);
  const [guiaToDelete, setGuiaToDelete] = useState<Guia | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => setToastMessage(msg);

  const { data: guias = [], isLoading, isError, error } = useGuias({
    _q: debouncedSearch || undefined,
  });

  const { createGuia, updateGuia, deleteGuia, isCreating, isUpdating } = useGuiaMutations();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
    }, 300);
  };

  const handleOpenCreateModal = () => {
    setGuiaToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (guia: Guia) => {
    setGuiaToEdit(guia);
    setModalOpen(true);
  };

  const handleOpenDeleteDialog = (guia: Guia) => {
    setGuiaToDelete(guia);
    setDeleteDialogOpen(true);
  };

  // Erros de salvamento são tratados pelo próprio GuiaModal (submitError inline);
  // aqui só notificamos o sucesso, sem interceptar a rejeição da Promise —
  // o modal só chama onClose() quando onSave resolve sem lançar.
  const handleSave = async (payload: GuiaPayload) => {
    if (guiaToEdit) {
      await updateGuia({ id: guiaToEdit.id, payload });
      showToast('Documento atualizado com sucesso.');
    } else {
      await createGuia(payload);
      showToast('Documento cadastrado com sucesso.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!guiaToDelete) return;
    try {
      await deleteGuia(guiaToDelete.id);
      setGuiaToDelete(null);
      setDeleteDialogOpen(false);
      showToast('Documento excluído com sucesso.');
    } catch (err) {
      setGuiaToDelete(null);
      setDeleteDialogOpen(false);
      showToast(err instanceof Error ? err.message : 'Erro ao excluir o documento.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--text-h)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <BookOpen size={24} style={{ color: 'var(--primary)' }} />
            Guias e Documentos
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-soft)' }}>
            Gerencie os documentos de referência exibidos nas seções PNIPI e Midiateca
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--primary)',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-btn)',
            transition: 'transform 0.15s ease, opacity 0.15s ease',
          }}
        >
          <Plus size={18} />
          Novo Documento
        </button>
      </div>

      {/* Toolbar / Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'var(--card)',
          padding: '16px 20px',
          borderRadius: '14px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-soft)',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar por título ou descrição..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ fontSize: '13.5px', color: 'var(--text-soft)', fontWeight: 600 }}>
          {isLoading ? 'Carregando...' : `${guias.length} documento${guias.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Table */}
      <GuiaTable
        guias={guias}
        isLoading={isLoading}
        isError={isError}
        error={error}
        debouncedSearch={debouncedSearch}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteDialog}
      />

      {/* Guia Form Modal */}
      <GuiaModal
        open={modalOpen}
        guia={guiaToEdit}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir documento"
        description={`Tem certeza que deseja excluir "${guiaToDelete?.title || 'este documento'}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

export default Guias;
