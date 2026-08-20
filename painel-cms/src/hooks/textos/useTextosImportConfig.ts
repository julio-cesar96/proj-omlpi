import { apiFetch } from '../../lib/api';
import type { EditorialState, PaginaInstitucionalPayload } from '../../lib/strapi';
import type { ImportModuleConfig, RowValidationStatus } from '../../types/import';
import { slugify } from '../planos/usePlanosImportConfig';

export interface TextosImportContext {}

export interface TextosImportRawRow {
  titulo?: string;
  conteudo?: string;
  estado_editorial?: string;
  seo_meta_titulo?: string;
  seo_meta_descricao?: string;
  [key: string]: any;
}

const VALID_EDITORIAL_STATES: EditorialState[] = ['rascunho', 'revisao', 'publicado', 'arquivado'];

export const textosImportConfig: ImportModuleConfig<
  TextosImportRawRow,
  PaginaInstitucionalPayload,
  TextosImportContext
> = {
  moduleKey: 'textos',
  moduleName: 'Textos Institucionais',
  templateFilename: 'modelo-importacao-textos.xlsx',
  templateHeaders: ['titulo', 'conteudo', 'estado_editorial', 'seo_meta_titulo', 'seo_meta_descricao'],
  templateSampleRow: {
    titulo: 'Sobre a Rede de Primeira Infância',
    conteudo: 'A Rede Nacional Primeira Infância (RNPI) é uma articulação de organizações da sociedade civil, do poder público e do setor privado.',
    estado_editorial: 'rascunho',
    seo_meta_titulo: 'Sobre a RNPI - Observa',
    seo_meta_descricao: 'Conheça a história e atuação da Rede Nacional Primeira Infância.',
  },

  fetchContextData: async () => {
    return {};
  },

  validateAndMapRow: async (rawRow, _rowIndex, _contextData, _options) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validação de Título (Obrigatório)
    const titulo = rawRow.titulo ? String(rawRow.titulo).trim() : '';
    if (!titulo) {
      errors.push('O campo "titulo" é obrigatório.');
    }

    // 2. Slug derivado do titulo via slugify()
    const slug = titulo ? slugify(titulo) : '';

    // 3. Conteúdo (Texto simples, opcional)
    const conteudo = rawRow.conteudo ? String(rawRow.conteudo).trim() : '';

    // 4. Estado Editorial (Opcional, padrão: rascunho)
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

    // 5. SEO Meta
    const seo_meta_titulo = rawRow.seo_meta_titulo ? String(rawRow.seo_meta_titulo).trim() : undefined;
    const seo_meta_descricao = rawRow.seo_meta_descricao ? String(rawRow.seo_meta_descricao).trim() : undefined;

    let status: RowValidationStatus = 'valid';
    if (errors.length > 0) {
      status = 'invalid';
    } else if (warnings.length > 0) {
      status = 'warning';
    }

    const payload: PaginaInstitucionalPayload = {
      titulo,
      slug,
      conteudo,
      estado_editorial: estadoEditorial,
      published_at: estadoEditorial === 'publicado' ? new Date().toISOString() : null,
      ...(seo_meta_titulo ? { seo_meta_titulo } : {}),
      ...(seo_meta_descricao ? { seo_meta_descricao } : {}),
    };

    return {
      status,
      errors,
      warnings,
      payload,
      pendingAutoCreates: { categories: [], tags: [] },
    };
  },

  executeImportRow: async (payload, _contextData, _options) => {
    // Garantir a trava do Strapi v3 (published_at = null para não-publicados)
    const requestPayload: PaginaInstitucionalPayload = {
      ...payload,
      published_at: payload.estado_editorial === 'publicado'
        ? (payload.published_at || new Date().toISOString())
        : null,
    };

    const res = await apiFetch('/paginas-institucionais', {
      method: 'POST',
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Erro ao criar página institucional via importação.');
    }

    return res.json();
  },
};
