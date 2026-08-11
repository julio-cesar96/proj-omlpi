import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTextos } from '../hooks/textos/useTextos';
import { useTextosCount } from '../hooks/textos/useTextosCount';
import { TextoList } from '../components/textos/TextoList';

const PAGE_LIMIT = 20;

export const TextosList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'publicados' | 'rascunhos'>('all');

  const [searchRaw, setSearchRaw] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search (400ms)
  const handleSearchChange = (value: string) => {
    setSearchRaw(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 400);
  };

  const handleTabChange = (tab: 'all' | 'publicados' | 'rascunhos') => {
    setActiveTab(tab);
    setPage(1);
  };

  // Hooks
  const { counts, isLoading: countsLoading } = useTextosCount(search);
  
  // Para carregar os dados de rascunhos vs publicados do servidor:
  // Como o schema real do Strapi de pagina-institucional não tem o campo estado_editorial customizado,
  // nós filtramos por published_at na API via REST parameters.
  // published_at_null: no Strapi v3, para buscar rascunhos, podemos fazer `published_at_null=true`.
  // Para buscar publicados, o comportamento padrão (sem _publicationState=preview) ou _publicationState=live
  // só traz publicados.
  const fetchParams: Record<string, any> = {
    _q: search || undefined,
    _start: (page - 1) * PAGE_LIMIT,
    _limit: PAGE_LIMIT,
    _sort: 'updated_at:DESC',
  };

  if (activeTab === 'rascunhos') {
    fetchParams.published_at_null = true;
  } else if (activeTab === 'publicados') {
    // Para publicados, se usarmos _publicationState=preview com published_at_null=false, traz os publicados.
    fetchParams.published_at_null = false;
  }

  const { data: paginas = [], isLoading } = useTextos(fetchParams);

  const currentTotal = activeTab === 'all'
    ? counts.all
    : activeTab === 'publicados'
    ? counts.publicados
    : counts.rascunhos;

  const totalPages = Math.max(1, Math.ceil(currentTotal / PAGE_LIMIT));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div style={{ animation: 'fadeIn .3s ease', maxWidth: '960px' }}>
      <TextoList
        paginas={paginas}
        isLoading={isLoading}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
        countsLoading={countsLoading}
        searchRaw={searchRaw}
        onSearchChange={handleSearchChange}
        onEdit={(p) => navigate(`/textos/${p.id}`)}
        onNewPage={() => navigate('/textos/novo')}
      />

      {/* Paginação */}
      {!isLoading && totalPages > 1 && (
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
            Página {page} de {totalPages} · {currentTotal} páginas
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
              onMouseEnter={(e) => {
                if (hasPrev) e.currentTarget.style.background = 'var(--muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--card)';
              }}
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
              onMouseEnter={(e) => {
                if (hasNext) e.currentTarget.style.background = 'var(--muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--card)';
              }}
            >
              Próximo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
