export type ImportStatus = 'idle' | 'parsing' | 'preview' | 'importing' | 'completed';

export type RowValidationStatus = 'valid' | 'invalid' | 'warning';

export interface PendingAutoCreate {
  categories: string[];
  tags: string[];
}

export interface ImportRowValidation<TRow = any, TPayload = any> {
  rowIndex: number; // 1-indexed (matching Excel row)
  rawRow: TRow;
  status: RowValidationStatus;
  errors: string[];
  warnings: string[];
  payload?: TPayload;
  pendingAutoCreates?: PendingAutoCreate;
}

export interface ImportProgress {
  current: number;
  total: number;
  currentTitle?: string;
}

export interface ImportResultItem {
  rowIndex: number;
  title: string;
  success: boolean;
  error?: string;
}

export interface ImportSummary {
  total: number;
  successCount: number;
  errorCount: number;
  results: ImportResultItem[];
}

export interface ImportModuleConfig<TRow = any, TPayload = any, TContext = any> {
  moduleKey: string;
  moduleName: string;
  templateFilename: string;
  templateHeaders: string[];
  templateSampleRow: Record<string, string>;
  fetchContextData: () => Promise<TContext>;
  validateAndMapRow: (
    rawRow: TRow,
    rowIndex: number,
    contextData: TContext,
    options: { autoCreateCategoriesTags: boolean }
  ) => Promise<{
    status: RowValidationStatus;
    errors: string[];
    warnings: string[];
    payload?: TPayload;
    pendingAutoCreates?: PendingAutoCreate;
  }>;
  executeImportRow: (
    payload: TPayload,
    contextData: TContext,
    options: {
      autoCreateCategoriesTags: boolean;
      pendingAutoCreates?: PendingAutoCreate;
    }
  ) => Promise<any>;
}
