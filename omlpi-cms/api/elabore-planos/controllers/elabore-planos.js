'use strict';

module.exports = {
  async find(ctx) {
    const entity = await strapi.query('elabore-planos').findOne();
    ctx.body = entity || {};
  },
  async update(ctx) {
    const entity = await strapi.query('elabore-planos').update(
      { id: 1 },
      ctx.request.body
    );
    ctx.body = entity;
  },
};
