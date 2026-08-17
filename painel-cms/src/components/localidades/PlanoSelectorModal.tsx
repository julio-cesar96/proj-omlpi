import React, { useState } from 'react';
import { X, Search, FileText, Loader2, Check } from 'lucide-react';
import { usePlanos } from '../../hooks/planos/usePlanos';
import type { Plano } from '../../lib/strapi';

interface PlanoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (plano: Plano) => void;
  selectedPlanoId?: number | null;
}

export const PlanoSelectorModal: React.FC<PlanoSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedPlanoId,
}) => {
  const [search, setSearch] = useState('');
  const { data: planos, isLoading } = usePlanos({
    estado_editorial: 'publicado',
    _q: search || undefined,
    _limit: 50,
  });

  if (!isOpen) return null;

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatSize = (kb?: number) => {
    if (!kb) return '';
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${Math.round(kb)} KB`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)',
        animation: 'fadeIn 0.2s ease',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '85vh',
          background: 'var(--card)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
              Selecionar Plano Publicado
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-soft)', margin: '2px 0 0' }}>
              Selecione um plano já cadastrado na coleção de Planos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-soft)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '0 12px',
              height: '40px',
            }}
          >
            <Search size={18} style={{ color: 'var(--text-soft)' }} />
            <input
              type="text"
              placeholder="Buscar plano por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '13.5px',
                color: 'var(--text)',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-soft)', padding: 0 }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '8px', color: 'var(--text-soft)' }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13.5px' }}>Carregando planos...</span>
            </div>
          ) : !planos || planos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-soft)', fontSize: '13.5px' }}>
              Nenhum plano publicado encontrado.
            </div>
          ) : (
            planos.map((plano) => {
              const isSelected = selectedPlanoId === plano.id;
              const hasDoc = Boolean(plano.documento);

              return (
                <div
                  key={plano.id}
                  onClick={() => {
                    if (hasDoc) {
                      onSelect(plano);
                      onClose();
                    }
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(68, 69, 37, 0.05)' : 'var(--card)',
                    cursor: hasDoc ? 'pointer' : 'not-allowed',
                    opacity: hasDoc ? 1 : 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: '#FDE7DE',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={20} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={plano.titulo}
                      >
                        {plano.titulo}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '2px', display: 'flex', gap: '12px' }}>
                        <span>PDF: {plano.documento?.name || 'Sem arquivo'}</span>
                        {plano.documento?.size && <span>• {formatSize(plano.documento.size)}</span>}
                        <span>• Atualizado em {formatDate(plano.updated_at)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!hasDoc}
                    style={{
                      height: '34px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? '#FFFFFF' : 'var(--text)',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: hasDoc ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && <Check size={14} />}
                    {isSelected ? 'Selecionado' : 'Vincular'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--bg)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '38px',
              padding: '0 18px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
