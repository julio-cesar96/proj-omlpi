'use strict';

/**
 * GET /midiateca-publica
 *
 * Endpoint público que retorna apenas arquivos com is_public: true.
 * Nunca expõe /upload/files inteiro ao role Public.
 *
 * Parâmetros de query aceitos:
 *   _start        — offset de paginação (default: 0)
 *   _limit        — quantidade por página (default: 20)
 *   _sort         — ordenação (default: created_at:DESC)
 *   name_contains — busca parcial por nome do arquivo
 *   mime_contains — filtro por tipo MIME (ex: image/, application/pdf, video/)
 *
 * NOTA: name_contains é usado em vez de _q porque strapi.query().find()
 * não reconhece _q — esse parâmetro só é processado pelo controller
 * nativo do plugin Upload via service.search().
 *
 * PUT /midiateca-publica/:id  (Authenticated)
 * PUT /midiateca-publica/bulk (Authenticated)
 *
 * Rotas customizadas para alternar is_public em arquivos do plugin Upload.
 * Necessárias porque PUT /upload/files/:id não existe no Strapi v3.3.3.
 */
module.exports = {
  async find(ctx) {
    const {
      _start = 0,
      _limit = 20,
      _sort = 'created_at:DESC',
      name_contains,
      mime_contains,
    } = ctx.query;

    const filters = { is_public: true };
    if (name_contains) filters.name_contains = name_contains;
    if (mime_contains) filters.mime_contains = mime_contains;

    const [files, count] = await Promise.all([
      strapi.query('file', 'upload').find({
        ...filters,
        _start: Number(_start),
        _limit: Number(_limit),
        _sort,
      }),
      strapi.query('file', 'upload').count({ is_public: true }),
    ]);

    ctx.body = { results: files, count };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { is_public } = ctx.request.body;
    const file = await strapi.query('file', 'upload').update({ id }, { is_public: !!is_public });
    ctx.body = file;
  },

  async bulkUpdate(ctx) {
    const { ids, filter, is_public } = ctx.request.body;
    let targetIds = ids;

    // Modo novo: buscar todos os arquivos que combinam com o filtro
    if (!targetIds && filter) {
      const matches = await strapi.query('file', 'upload').find({
        ...filter,
        _limit: -1,
      });
      targetIds = matches.map(f => f.id);
    }

    if (!Array.isArray(targetIds) || targetIds.length === 0) {
      return ctx.badRequest('Nenhum arquivo encontrado para atualizar.');
    }

    const updated = await Promise.all(
      targetIds.map(id => strapi.query('file', 'upload').update({ id }, { is_public: !!is_public }))
    );
    ctx.body = { updated: updated.length };
  },
};
