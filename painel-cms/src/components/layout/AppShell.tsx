import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ImportModal } from '../import/ImportModal';
import { Toast } from '../ui/Toast';
import { planosImportConfig } from '../../hooks/planos/usePlanosImportConfig';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mapeamento de módulo ativo com base na rota
  const getActiveImportConfig = () => {
    if (location.pathname.startsWith('/planos')) {
      return planosImportConfig;
    }
    // Futuro: suporte a /faqs e /textos
    return null;
  };

  const activeConfig = getActiveImportConfig();

  const handleImportClick = () => {
    if (activeConfig) {
      setIsImportOpen(true);
    } else {
      setToastMessage('Importação via planilha disponível no módulo Planos.');
    }
  };

  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['planos'] });
    queryClient.invalidateQueries({ queryKey: ['planos-count'] });
    setToastMessage('Importação concluída! A tabela de planos foi atualizada.');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
        <Topbar onImportClick={handleImportClick} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--content-padding-y) var(--content-padding-x) 60px' }}>
          <Outlet />
        </main>
      </div>

      {/* Modal de Importação (se módulo ativo suportar) */}
      {activeConfig && (
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          config={activeConfig}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {/* Toast de Notificação */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

