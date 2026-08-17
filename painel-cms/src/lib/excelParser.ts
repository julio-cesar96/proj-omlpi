import * as XLSX from 'xlsx';

export interface ParsedSpreadsheetRow {
  [key: string]: any;
}

/**
 * Faz o parse de um arquivo File (.xlsx, .xls, .csv) e retorna um array de objetos linha/coluna.
 */
export async function parseSpreadsheetFile(file: File): Promise<ParsedSpreadsheetRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return [];
  }
  
  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    return [];
  }

  // defval: '' garante que células vazias sejam retornadas como string vazia em vez de undefined
  const rows = XLSX.utils.sheet_to_json<ParsedSpreadsheetRow>(worksheet, { defval: '' });
  return rows;
}

/**
 * Gera um arquivo .xlsx de modelo com os cabeçalhos fornecidos e uma linha de exemplo,
 * disparando o download direto no navegador.
 */
export function downloadTemplateFile(
  filename: string,
  headers: string[],
  sampleRow?: Record<string, string>
): void {
  const data: (string[])[] = [headers];

  if (sampleRow) {
    const rowValues = headers.map((header) => sampleRow[header] ?? '');
    data.push(rowValues);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo');

  XLSX.writeFile(workbook, filename);
}

/**
 * Exporta um array de objetos para um arquivo .xlsx com os cabeçalhos especificados,
 * disparando o download no navegador.
 */
export function exportToExcel(
  filename: string,
  headers: string[],
  rows: Record<string, any>[],
  sheetName: string = 'Planos'
): void {
  const data: string[][] = [headers];

  rows.forEach((row) => {
    const rowValues = headers.map((header) => row[header] ?? '');
    data.push(rowValues);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, filename);
}

