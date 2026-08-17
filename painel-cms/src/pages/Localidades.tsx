import React, { useState, useEffect } from 'react';
import { LocaleFilterBar } from '../components/localidades/LocaleFilterBar';
import { LocaleTable } from '../components/localidades/LocaleTable';
import { LocaleDrawer } from '../components/localidades/LocaleDrawer';
import { Toast } from '../components/ui/Toast';
import { useLocales } from '../hooks/localidades/useLocales';
import { useLocalesCount } from '../hooks/localidades/useLocalesCount';
import { useLocaleMutations } from '../hooks/localidades/useLocaleMutations';
import { useUploadFile } from '../hooks/planos/useUploadFile';
import type { Locale, LocaleUpdatePayload } from '../lib/strapi';

export const Localidades: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Debounce search input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setPage(1);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setPage(1);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Queries
  const { data: totalCount = 0 } = useLocalesCount({
    state: selectedState || undefined,
    type: (selectedType as any) || undefined,
    _q: debouncedSearch || undefined,
  });

  const { data: locales = [], isLoading } = useLocales({
    _start: (page - 1) * limit,
    _limit: limit,
    _sort: 'name:ASC',
    state: selectedState || undefined,
    type: (selectedType as any) || undefined,
    _q: debouncedSearch || undefined,
  });

  // Mutations
  const { updateLocale } = useLocaleMutations();
  const { uploadFile } = useUploadFile();

  const handleEditLocale = (locale: Locale) => {
    setSelectedLocale(locale);
    setIsDrawerOpen(true);
  };

  const handleToggleLaw = async (locale: Locale, isLaw: boolean) => {
    await updateLocale.mutateAsync({
      id: locale.id,
      payload: { is_law: isLaw },
    });
    showToast(`Configuração 'É Lei' atualizada para ${locale.name}.`);
  };

  const handleToggleHidePlan = async (locale: Locale, hidePlan: boolean) => {
    await updateLocale.mutateAsync({
      id: locale.id,
      payload: { hide_plan: hidePlan },
    });
    showToast(`Visibilidade do plano atualizada para ${locale.name}.`);
  };

  const handleUploadPdf = async (locale: Locale, file: File) => {
    const uploadedFile = await uploadFile(file);
    await updateLocale.mutateAsync({
      id: locale.id,
      payload: { plan: uploadedFile.id },
    });
    showToast(`Plano em PDF associado com sucesso a ${locale.name}.`);
  };

  const handleSaveDrawer = async (id: number, payload: LocaleUpdatePayload) => {
    await updateLocale.mutateAsync({ id, payload });
    showToast('Localidade atualizada com sucesso.');
  };

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-.5px' }}>
          Localidades & Planos
        </h1>
        <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
          Gerencie os arquivos de Plano/Lei de Primeira Infância por estado e município.
        </p>
      </div>

      {/* Filter Bar */}
      <LocaleFilterBar
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        selectedState={selectedState}
        onStateChange={handleStateChange}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        totalCount={totalCount}
      />

      {/* Table */}
      <LocaleTable
        locales={locales}
        isLoading={isLoading}
        onEdit={handleEditLocale}
        onToggleLaw={handleToggleLaw}
        onToggleHidePlan={handleToggleHidePlan}
        onUploadPdf={handleUploadPdf}
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={setPage}
      />

      {/* Drawer */}
      <LocaleDrawer
        isOpen={isDrawerOpen}
        locale={selectedLocale}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveDrawer}
      />

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};
