'use strict';

module.exports = {
  async find(ctx) {
    const entity = await strapi.query('elabore-planos').findOne();
    ctx.body = entity || {};
  },
  async update(ctx) {
    const existing = await strapi.query('elabore-planos').findOne();
    let entity;
    if (existing) {
      entity = await strapi.query('elabore-planos').update(
        { id: existing.id },
        ctx.request.body
      );
    } else {
      entity = await strapi.query('elabore-planos').create(ctx.request.body);
    }
    ctx.body = entity;
  },
};
