import { useCallback, useEffect, useState } from 'react';

/**
 * Carrega e mantém os dados auxiliares de um módulo de importação
 * (ex: categorias e tags para o import de Planos/FAQs).
 *
 * Extraído de useSpreadsheetImport.ts — antes essas 3 states + o loadContext
 * viviam misturados com parsing/validação/progresso no mesmo hook.
 */
export function useImportContextData<TContext>(fetchContextData: () => Promise<TContext>) {
  const [contextData, setContextData] = useState<TContext | null>(null);
  const [isContextLoading, setIsContextLoading] = useState<boolean>(false);
  const [contextError, setContextError] = useState<string | null>(null);

  const loadContext = useCallback(async () => {
    setIsContextLoading(true);
    setContextError(null);
    try {
      const data = await fetchContextData();
      setContextData(data);
      return data;
    } catch (err) {
      setContextError(err instanceof Error ? err.message : 'Erro ao carregar dados auxiliares do módulo.');
      return null;
    } finally {
      setIsContextLoading(false);
    }
  }, [fetchContextData]);

  // Carregar contexto ao inicializar
  useEffect(() => {
    loadContext();
  }, [loadContext]);

  return { contextData, isContextLoading, contextError, loadContext };
}
