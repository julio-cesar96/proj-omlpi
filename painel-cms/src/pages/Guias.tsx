import React, { useState } from 'react';
import { useGuias } from '../hooks/guias/useGuias';
import { useGuiaMutations } from '../hooks/guias/useGuiaMutations';
import type { Guia, GuiaPayload } from '../lib/strapi';
import { GuiaModal } from '../components/guias/GuiaModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

export const Guias: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [guiaToEdit, setGuiaToEdit] = useState<Guia | null>(null);
  const [guiaToDelete, setGuiaToDelete] = useState<Guia | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: guias = [], isLoading, isError, error } = useGuias({
    _q: debouncedSearch || undefined,
  });

  const { createGuia, updateGuia, deleteGuia, isCreating, isUpdating } = useGuiaMutations();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    // Simple debounce
    const timeout = setTimeout(() => {
      setDebouncedSearch(val);
    }, 300);
    return () => clearTimeout(timeout);
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

  const handleSave = async (payload: GuiaPayload) => {
    if (guiaToEdit) {
      await updateGuia({ id: guiaToEdit.id, payload });
    } else {
      await createGuia(payload);
    }
  };

  const handleConfirmDelete = async () => {
    if (!guiaToDelete) return;
    try {
      await deleteGuia(guiaToDelete.id);
      setGuiaToDelete(null);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Erro ao excluir guia:', err);
    }
  };

  const getFileUrl = (fileUrl?: string) => {
    if (!fileUrl) return '#';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    return `${STRAPI_URL}${fileUrl}`;
  };

  const getFileExtBadge = (mimeOrExt?: string) => {
    if (!mimeOrExt) return 'DOC';
    const clean = mimeOrExt.replace('.', '').toUpperCase();
    if (clean.includes('PDF')) return 'PDF';
    if (clean.includes('XLS') || clean.includes('SPREADSHEET')) return 'XLSX';
    if (clean.includes('DOC') || clean.includes('WORD')) return 'DOCX';
    if (clean.includes('PNG') || clean.includes('JPG') || clean.includes('JPEG')) return 'IMG';
    return clean.slice(0, 4);
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

      {/* Table Card */}
      <div
        style={{
          background: 'var(--card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-soft)' }}>
            Carregando guias e documentos...
          </div>
        ) : isError ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
            Erro ao carregar documentos: {error instanceof Error ? error.message : 'Erro desconhecido'}
          </div>
        ) : guias.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-soft)' }}>
            <FileText size={36} style={{ color: 'var(--border)', marginBottom: '12px' }} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)' }}>
              Nenhum documento encontrado
            </div>
            <p style={{ fontSize: '13.5px', margin: '4px 0 0' }}>
              {debouncedSearch ? 'Tente buscar com outros termos.' : 'Clique em "Novo Documento" para cadastrar o primeiro.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    background: 'var(--bg)',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--text-soft)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <th style={{ padding: '14px 20px', width: '60px' }}>ID</th>
                  <th style={{ padding: '14px 20px' }}>Documento / Título</th>
                  <th style={{ padding: '14px 20px', width: '160px' }}>Categoria</th>
                  <th style={{ padding: '14px 20px', width: '140px' }}>Criado em</th>
                  <th style={{ padding: '14px 20px', width: '120px', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {guias.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '16px 20px', fontSize: '13.5px', color: 'var(--text-soft)', fontWeight: 600 }}>
                      #{item.id}
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: 'rgba(74, 93, 35, 0.1)',
                            color: 'var(--primary)',
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            marginTop: '2px',
                            flexShrink: 0,
                          }}
                        >
                          {getFileExtBadge(item.file?.ext || item.file?.mime)}
                        </span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-h)' }}>
                            {item.title}
                          </div>
                          {item.description && (
                            <div
                              style={{
                                fontSize: '13px',
                                color: 'var(--text-soft)',
                                marginTop: '2px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {item.description}
                            </div>
                          )}
                          {item.file && (
                            <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '4px' }}>
                              Arquivo: <strong>{item.file.name}</strong>
                              {item.file.size ? ` (${(item.file.size / 1024).toFixed(2)} MB)` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      {item.category ? (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                            fontSize: '12.5px',
                            fontWeight: 600,
                          }}
                        >
                          {item.category}
                        </span>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--text-soft)' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-soft)' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '—'}
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {item.file?.url && (
                          <a
                            href={getFileUrl(item.file.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Visualizar / Download"
                            style={{
                              padding: '6px',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              background: 'transparent',
                              color: 'var(--text-soft)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none',
                            }}
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          title="Editar"
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text-soft)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteDialog(item)}
                          title="Excluir"
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default Guias;
