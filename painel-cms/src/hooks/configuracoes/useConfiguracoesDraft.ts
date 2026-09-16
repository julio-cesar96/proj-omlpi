import { useEffect, useState } from 'react';
import { useConfiguracoes } from './useConfiguracoes';
import type { CmsConfig } from '../../lib/strapi';

/**
 * Gerencia o rascunho local de configurações (draft) e sua sincronização
 * com o valor persistido: inicialização, edição de campo, descarte e salvamento.
 */
export function useConfiguracoesDraft() {
  const { config, isLoading, saveConfig, isSaving } = useConfiguracoes();

  const [draft, setDraft] = useState<CmsConfig | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inicializar draft quando os dados chegam
  useEffect(() => {
    if (config && draft === null) {
      setDraft(config);
    }
  }, [config, draft]);

  const setField = <K extends keyof CmsConfig>(key: K, value: CmsConfig[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const discard = () => {
    if (config) setDraft({ ...config });
  };

  const save = async () => {
    if (!draft) return;
    try {
      await saveConfig(draft);
      setToastMessage('Configurações salvas.');
    } catch {
      setToastMessage('Erro ao salvar configurações. Tente novamente.');
    }
  };

  const clearToast = () => setToastMessage(null);

  return {
    draft,
    isLoading,
    isSaving,
    setField,
    discard,
    save,
    toastMessage,
    clearToast,
  };
}
