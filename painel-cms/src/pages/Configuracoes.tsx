import React, { useState } from 'react';
import { useConfiguracoesDraft } from '../hooks/configuracoes/useConfiguracoesDraft';
import { Toast } from '../components/ui/Toast';
import { ConfiguracoesHeader } from '../components/configuracoes/ConfiguracoesHeader';
import { ConfiguracoesSkeleton } from '../components/configuracoes/ConfiguracoesSkeleton';
import { ConfiguracoesTabs, type ConfiguracoesTabKey } from '../components/configuracoes/ConfiguracoesTabs';
import { ConfiguracoesSiteInfoCard } from '../components/configuracoes/ConfiguracoesSiteInfoCard';
import { ConfiguracoesFluxoEditorialCard } from '../components/configuracoes/ConfiguracoesFluxoEditorialCard';
import { ConfiguracoesActions } from '../components/configuracoes/ConfiguracoesActions';

export const Configuracoes: React.FC = () => {
  const { draft, isLoading, isSaving, setField, discard, save, toastMessage, clearToast } = useConfiguracoesDraft();
  const [activeTab, setActiveTab] = useState<ConfiguracoesTabKey>('geral');

  if (isLoading || !draft) {
    return <ConfiguracoesSkeleton />;
  }

  return (
    <div style={{ animation: 'fadeIn .3s ease', maxWidth: '820px' }}>
      <ConfiguracoesHeader />
      <ConfiguracoesTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'geral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ConfiguracoesSiteInfoCard
            siteName={draft.site_name}
            siteUrl={draft.site_url}
            idiomaPadrao={draft.idioma_padrao}
            fusoHorario={draft.fuso_horario}
            onChangeSiteName={(v) => setField('site_name', v)}
            onChangeSiteUrl={(v) => setField('site_url', v)}
            onChangeIdiomaPadrao={(v) => setField('idioma_padrao', v)}
            onChangeFusoHorario={(v) => setField('fuso_horario', v)}
          />
          <ConfiguracoesFluxoEditorialCard
            requireReview={draft.require_review}
            autosaveEnabled={draft.autosave_enabled}
            onChangeRequireReview={(v) => setField('require_review', v)}
            onChangeAutosaveEnabled={(v) => setField('autosave_enabled', v)}
          />
          <ConfiguracoesActions isSaving={isSaving} onDiscard={discard} onSave={save} />
        </div>
      )}

      <Toast
        message={toastMessage ?? ''}
        visible={toastMessage !== null}
        onClose={clearToast}
      />
    </div>
  );
};
