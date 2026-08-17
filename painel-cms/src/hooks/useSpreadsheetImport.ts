import { useState, useCallback, useEffect } from 'react';
import { parseSpreadsheetFile, downloadTemplateFile } from '../lib/excelParser';
import type {
  ImportModuleConfig,
  ImportProgress,
  ImportRowValidation,
  ImportStatus,
  ImportSummary,
} from '../types/import';

export function useSpreadsheetImport<TRow = any, TPayload = any, TContext = any>(
  config: ImportModuleConfig<TRow, TPayload, TContext>
) {
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRowValidation<TRow, TPayload>[]>([]);
  const [rawRowsCache, setRawRowsCache] = useState<TRow[]>([]);
  
  const [contextData, setContextData] = useState<TContext | null>(null);
  const [isContextLoading, setIsContextLoading] = useState<boolean>(false);
  const [contextError, setContextError] = useState<string | null>(null);

  // Decisão A3: Checkbox para criar categorias e tags inexistentes automaticamente
  const [autoCreateCategoriesTags, setAutoCreateCategoriesTags] = useState<boolean>(false);

  const [progress, setProgress] = useState<ImportProgress>({ current: 0, total: 0 });
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  // Carregar dados de contexto (ex: lista de categorias e tags existentes)
  const loadContext = useCallback(async () => {
    setIsContextLoading(true);
    setContextError(null);
    try {
      const data = await config.fetchContextData();
      setContextData(data);
      return data;
    } catch (err: any) {
      setContextError(err?.message || 'Erro ao carregar dados auxiliares do módulo.');
      return null;
    } finally {
      setIsContextLoading(false);
    }
  }, [config]);

  // Carregar contexto ao inicializar
  useEffect(() => {
    loadContext();
  }, [loadContext]);

  // Re-validar linhas mantidas no cache
  const validateRows = useCallback(
    async (rawRows: TRow[], ctx: TContext, autoCreate: boolean) => {
      const validated: ImportRowValidation<TRow, TPayload>[] = [];

      for (let i = 0; i < rawRows.length; i++) {
        const rawRow = rawRows[i];
        const rowIndex = i + 1; // 1-indexed

        const validation = await config.validateAndMapRow(rawRow, rowIndex, ctx, {
          autoCreateCategoriesTags: autoCreate,
        });

        validated.push({
          rowIndex,
          rawRow,
          status: validation.status,
          errors: validation.errors,
          warnings: validation.warnings,
          payload: validation.payload,
          pendingAutoCreates: validation.pendingAutoCreates,
        });
      }

      setRows(validated);
    },
    [config]
  );

  // Selecionar arquivo e fazer parse inicial
  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setStatus('parsing');

      let ctx = contextData;
      if (!ctx) {
        ctx = await loadContext();
      }

      try {
        const parsedRawRows = (await parseSpreadsheetFile(selectedFile)) as TRow[];
        setRawRowsCache(parsedRawRows);

        if (ctx) {
          await validateRows(parsedRawRows, ctx, autoCreateCategoriesTags);
        }
        setStatus('preview');
      } catch (err: any) {
        setStatus('idle');
        throw new Error(err?.message || 'Erro ao ler arquivo de planilha.');
      }
    },
    [contextData, loadContext, validateRows, autoCreateCategoriesTags]
  );

  // Alterar opção de auto-criação (Decisão A3) e re-validar preview
  const handleToggleAutoCreate = useCallback(
    async (enabled: boolean) => {
      setAutoCreateCategoriesTags(enabled);
      if (rawRowsCache.length > 0 && contextData) {
        await validateRows(rawRowsCache, contextData, enabled);
      }
    },
    [rawRowsCache, contextData, validateRows]
  );

  // Baixar modelo de planilha (.xlsx)
  const handleDownloadTemplate = useCallback(() => {
    downloadTemplateFile(
      config.templateFilename,
      config.templateHeaders,
      config.templateSampleRow
    );
  }, [config]);

  // Iniciar Importação das linhas válidas
  const startImport = useCallback(async () => {
    // Importa todas as linhas que não tenham erros fatais (status 'valid' ou 'warning')
    const importableRows = rows.filter((r) => r.status !== 'invalid' && r.payload);

    if (importableRows.length === 0) {
      return;
    }

    setStatus('importing');
    setProgress({ current: 0, total: importableRows.length });

    const results: ImportSummary['results'] = [];
    let successCount = 0;
    let errorCount = 0;

    let ctx = contextData;
    if (!ctx) {
      ctx = await loadContext();
    }

    for (let i = 0; i < importableRows.length; i++) {
      const item = importableRows[i];
      const title = (item.payload as any)?.titulo || `Linha ${item.rowIndex}`;

      setProgress({
        current: i + 1,
        total: importableRows.length,
        currentTitle: title,
      });

      try {
        await config.executeImportRow(item.payload!, ctx!, {
          autoCreateCategoriesTags,
          pendingAutoCreates: item.pendingAutoCreates,
        });

        successCount++;
        results.push({
          rowIndex: item.rowIndex,
          title,
          success: true,
        });
      } catch (err: any) {
        errorCount++;
        results.push({
          rowIndex: item.rowIndex,
          title,
          success: false,
          error: err?.message || 'Erro de criação na API Strapi.',
        });
      }
    }

    const finalSummary: ImportSummary = {
      total: importableRows.length,
      successCount,
      errorCount,
      results,
    };

    setSummary(finalSummary);
    setStatus('completed');
  }, [rows, contextData, loadContext, config, autoCreateCategoriesTags]);

  // Resetar modal para estado inicial
  const reset = useCallback(() => {
    setStatus('idle');
    setFile(null);
    setRows([]);
    setRawRowsCache([]);
    setProgress({ current: 0, total: 0 });
    setSummary(null);
  }, []);

  return {
    status,
    file,
    rows,
    autoCreateCategoriesTags,
    isContextLoading,
    contextError,
    progress,
    summary,
    handleFileSelect,
    handleToggleAutoCreate,
    handleDownloadTemplate,
    startImport,
    reset,
    reloadContext: loadContext,
  };
}
