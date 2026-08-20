import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ImportModal } from '../import/ImportModal';
import { Toast } from '../ui/Toast';
import type { ImportModuleConfig } from '../../types/import';
import { planosImportConfig } from '../../hooks/planos/usePlanosImportConfig';
import { faqsImportConfig } from '../../hooks/faqs/useFaqsImportConfig';
import { textosImportConfig } from '../../hooks/textos/useTextosImportConfig';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mapeamento de módulo ativo com base na rota
  const getActiveImportConfig = (): ImportModuleConfig<any, any, any> | null => {
    if (location.pathname.startsWith('/planos')) {
      return planosImportConfig;
    }
    if (location.pathname.startsWith('/faqs')) {
      return faqsImportConfig;
    }
    if (location.pathname.startsWith('/textos')) {
      return textosImportConfig;
    }
    return null;
  };

  const activeConfig = getActiveImportConfig();

  const handleImportClick = () => {
    if (activeConfig) {
      setIsImportOpen(true);
    } else {
      setToastMessage('Importação não disponível nesta seção.');
    }
  };

  const handleImportSuccess = () => {
    if (location.pathname.startsWith('/planos')) {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      queryClient.invalidateQueries({ queryKey: ['planos-count'] });
      setToastMessage('Importação concluída! A tabela de planos foi atualizada.');
    } else if (location.pathname.startsWith('/faqs')) {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs-count'] });
      setToastMessage('Importação concluída! A lista de FAQs foi atualizada.');
    } else if (location.pathname.startsWith('/textos')) {
      queryClient.invalidateQueries({ queryKey: ['textos'] });
      queryClient.invalidateQueries({ queryKey: ['textos-count'] });
      setToastMessage('Importação concluída! A lista de textos institucionais foi atualizada.');
    } else {
      setToastMessage('Importação concluída!');
    }
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

