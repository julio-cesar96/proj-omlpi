import { apiFetch } from '../../lib/api';
import type { Categoria, EditorialState, PlanoPayload, Tag } from '../../lib/strapi';
import type { ImportModuleConfig, PendingAutoCreate, RowValidationStatus } from '../../types/import';

export interface PlanosImportContext {
  categorias: Categoria[];
  tags: Tag[];
}

export interface PlanosImportRawRow {
  titulo?: string;
  descricao?: string;
  categoria?: string;
  tags?: string;
  estado_editorial?: string;
  [key: string]: any;
}

const VALID_EDITORIAL_STATES: EditorialState[] = ['rascunho', 'revisao', 'publicado', 'arquivado'];

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function slugify(text: string): string {
  return normalizeText(text)
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export const planosImportConfig: ImportModuleConfig<
  PlanosImportRawRow,
  PlanoPayload,
  PlanosImportContext
> = {
  moduleKey: 'planos',
  moduleName: 'Planos',
  templateFilename: 'modelo-importacao-planos.xlsx',
  templateHeaders: ['titulo', 'descricao', 'categoria', 'tags', 'estado_editorial'],
  templateSampleRow: {
    titulo: 'Plano Municipal da Primeira Infância',
    descricao: 'Diretrizes e metas municipais para atenção à primeira infância',
    categoria: 'Educação',
    tags: 'Saúde, Infância, Gestão',
    estado_editorial: 'rascunho',
  },

  fetchContextData: async () => {
    const [resCat, resTag] = await Promise.all([
      apiFetch('/categorias?_sort=nome:ASC').catch(() => null),
      apiFetch('/tags?_sort=name:ASC').catch(() => null),
    ]);

    const categorias: Categoria[] = resCat && resCat.ok ? await resCat.json() : [];
    const tags: Tag[] = resTag && resTag.ok ? await resTag.json() : [];

    return { categorias, tags };
  },

  validateAndMapRow: async (rawRow, _rowIndex, contextData, options) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const pendingAutoCreates: PendingAutoCreate = { categories: [], tags: [] };

    // 1. Validação de Título (Obrigatório)
    const titulo = rawRow.titulo ? String(rawRow.titulo).trim() : '';
    if (!titulo) {
      errors.push('O campo "titulo" é obrigatório.');
    }

    // 2. Validação de Descrição (Opcional)
    const descricao = rawRow.descricao ? String(rawRow.descricao).trim() : undefined;

    // 3. Validação de Estado Editorial (Opcional, padrão: rascunho)
    let estadoEditorial: EditorialState = 'rascunho';
    if (rawRow.estado_editorial) {
      const stateInput = String(rawRow.estado_editorial).trim().toLowerCase() as EditorialState;
      if (VALID_EDITORIAL_STATES.includes(stateInput)) {
        estadoEditorial = stateInput;
      } else {
        errors.push(
          `Estado editorial "${rawRow.estado_editorial}" inválido. Valores aceitos: rascunho, revisao, publicado, arquivado.`
        );
      }
    }

    // 4. Mapeamento de Categoria
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

    // 5. Mapeamento de Tags (separadas por vírgula)
    const tagIds: number[] = [];
    const tagsString = rawRow.tags ? String(rawRow.tags).trim() : '';
    if (tagsString) {
      const tagNames = tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      for (const tName of tagNames) {
        const targetTag = normalizeText(tName);
        const foundTag = contextData.tags.find(
          (t) => normalizeText(t.name) === targetTag
        );
        if (foundTag) {
          tagIds.push(foundTag.id);
        } else if (options.autoCreateCategoriesTags) {
          pendingAutoCreates.tags.push(tName);
          warnings.push(`Tag "${tName}" será criada automaticamente.`);
        } else {
          warnings.push(`Tag "${tName}" não encontrada no Strapi.`);
        }
      }
    }

    // Determinar Status de Validação da linha
    let status: RowValidationStatus = 'valid';
    if (errors.length > 0) {
      status = 'invalid';
    } else if (warnings.length > 0) {
      status = 'warning';
    }

    // MONTAGEM DO PAYLOAD (AJUSTE 1: OMITIR `documento` EXPLICITAMENTE)
    const payload: PlanoPayload = {
      titulo,
      ...(descricao ? { descricao } : {}),
      ...(categoriaId ? { categoria: categoriaId } : {}),
      ...(tagIds.length > 0 ? { tags: tagIds } : {}),
      estado_editorial: estadoEditorial,
      published_at: estadoEditorial === 'publicado' ? new Date().toISOString() : null,
      // NOTA: 'documento' é intencionalmente omitido do payload (Ajuste 1)
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

    // 1. Criar Categorias/Tags pendentes se auto-criação estiver ativa (Opção A3)
    if (options.autoCreateCategoriesTags && options.pendingAutoCreates) {
      // Auto-criar categorias
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

      // Auto-criar tags
      const currentTags = finalPayload.tags || [];
      for (const tName of options.pendingAutoCreates.tags) {
        const targetTag = normalizeText(tName);
        let existing = contextData.tags.find(
          (t) => normalizeText(t.name) === targetTag
        );
        if (!existing) {
          const res = await apiFetch('/tags', {
            method: 'POST',
            body: JSON.stringify({ name: tName }),
          });
          if (res.ok) {
            existing = await res.json();
            contextData.tags.push(existing!);
          }
        }
        if (existing && !currentTags.includes(existing.id)) {
          currentTags.push(existing.id);
        }
      }
      finalPayload.tags = currentTags;
    }

    // 2. Executar criação do Plano via POST /planos
    // Garantir a trava do Strapi v3 (published_at = null para rascunhos)
    const requestPayload: PlanoPayload = {
      ...finalPayload,
      published_at: finalPayload.estado_editorial === 'publicado'
        ? (finalPayload.published_at || new Date().toISOString())
        : null,
    };

    const res = await apiFetch('/planos', {
      method: 'POST',
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao criar plano via importação.');
    }

    return res.json();
  },
};
