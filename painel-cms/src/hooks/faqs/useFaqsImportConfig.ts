import { apiFetch } from '../../lib/api';
import type { Categoria, FaqPayload } from '../../lib/strapi';
import type { ImportModuleConfig, PendingAutoCreate, RowValidationStatus } from '../../types/import';
import { normalizeText, slugify } from '../planos/usePlanosImportConfig';

export interface FaqsImportContext {
  categorias: Categoria[];
}

export interface FaqsImportRawRow {
  pergunta?: string;
  resposta?: string;
  categoria?: string;
  ordem?: string | number;
  [key: string]: any;
}

export const faqsImportConfig: ImportModuleConfig<
  FaqsImportRawRow,
  FaqPayload,
  FaqsImportContext
> = {
  moduleKey: 'faqs',
  moduleName: 'FAQs',
  templateFilename: 'modelo-importacao-faqs.xlsx',
  templateHeaders: ['pergunta', 'resposta', 'categoria', 'ordem'],
  templateSampleRow: {
    pergunta: 'Como consultar o Plano Municipal da Primeira Infância?',
    resposta: 'Acesse a aba Consulta Pública no menu principal para visualizar dados e documentos por município.',
    categoria: 'Geral',
    ordem: '1',
  },

  fetchContextData: async () => {
    const resCat = await apiFetch('/categorias?_sort=nome:ASC').catch(() => null);
    const categorias: Categoria[] = resCat && resCat.ok ? await resCat.json() : [];
    return { categorias };
  },

  validateAndMapRow: async (rawRow, _rowIndex, contextData, options) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const pendingAutoCreates: PendingAutoCreate = { categories: [], tags: [] };

    // 1. Validação de Pergunta (Obrigatório)
    const pergunta = rawRow.pergunta ? String(rawRow.pergunta).trim() : '';
    if (!pergunta) {
      errors.push('O campo "pergunta" é obrigatório.');
    }

    // 2. Validação de Resposta (Opcional)
    const resposta = rawRow.resposta ? String(rawRow.resposta).trim() : '';

    // 3. Mapeamento de Categoria
    let categoriaId: number | null = null;
    const catName = rawRow.categoria ? String(rawRow.categoria).trim() : '';
    if (catName) {
      const targetCat = normalizeText(catName);
      const foundCat = contextData.categorias.find(
        (c) => normalizeText(c.nome) === targetCat
      );
      if (foundCat) {
        categoriaId = foundCat.id;
      } else if (options.autoCreateCategoriesTags) {
        pendingAutoCreates.categories.push(catName);
        warnings.push(`Categoria "${catName}" será criada automaticamente.`);
      } else {
        warnings.push(`Categoria "${catName}" não encontrada no Strapi.`);
      }
    }

    // 4. Validação de Ordem (Opcional - Integer)
    let ordemVal: number | null = null;
    if (rawRow.ordem !== undefined && rawRow.ordem !== null && String(rawRow.ordem).trim() !== '') {
      const parsed = parseInt(String(rawRow.ordem).trim(), 10);
      if (isNaN(parsed)) {
        errors.push('O campo "ordem" deve ser um número inteiro.');
      } else {
        ordemVal = parsed;
      }
    }

    let status: RowValidationStatus = 'valid';
    if (errors.length > 0) {
      status = 'invalid';
    } else if (warnings.length > 0) {
      status = 'warning';
    }

    const payload: FaqPayload = {
      pergunta,
      resposta,
      ...(categoriaId ? { categoria: categoriaId } : {}),
      ...(ordemVal !== null ? { ordem: ordemVal } : {}),
      published_at: null, // Sempre rascunho
    };

    return {
      status,
      errors,
      warnings,
      payload,
      pendingAutoCreates,
    };
  },

  executeImportRow: async (payload, contextData, options) => {
    const finalPayload = { ...payload };

    // Auto-criar categorias pendentes se opção A3 estiver ativa
    if (options.autoCreateCategoriesTags && options.pendingAutoCreates) {
      for (const catName of options.pendingAutoCreates.categories) {
        const targetCat = normalizeText(catName);
        let existing = contextData.categorias.find(
          (c) => normalizeText(c.nome) === targetCat
        );
        if (!existing) {
          const res = await apiFetch('/categorias', {
            method: 'POST',
            body: JSON.stringify({ nome: catName, slug: slugify(catName) }),
          });
          if (res.ok) {
            existing = await res.json();
            contextData.categorias.push(existing!);
          }
        }
        if (existing) {
          finalPayload.categoria = existing.id;
        }
      }
    }

    // Executar criação da FAQ via POST /faqs
    const requestPayload: FaqPayload = {
      ...finalPayload,
      published_at: null,
    };

    const res = await apiFetch('/faqs', {
      method: 'POST',
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Erro ao criar FAQ via importação.');
    }

    return res.json();
  },
};
