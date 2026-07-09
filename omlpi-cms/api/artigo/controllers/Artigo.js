'use strict';

module.exports = {
  byTag: async (ctx) => {

    const result = await strapi
      .query('artigo')
      .model.query(qb => {
        qb.join('artigos__tags', 'artigos.id', 'artigos__tags.artigo_id');
        qb.join('tags', 'tags.id', 'artigos__tags.tag_id');

        const tagName = ctx.params.tag;
        qb.where('tags.name', '=', tagName);
      })
      .fetchAll();

    return result
      .toJSON()
      .map(({tags, ...k}) => k)
  },
};
