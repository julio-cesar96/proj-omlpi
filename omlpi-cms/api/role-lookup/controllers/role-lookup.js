'use strict';

module.exports = {
  async find(ctx) {
    const roles = await strapi.query('role', 'users-permissions').find({
      name_in: ['Administrador', 'Editor', 'Revisor']
    });

    ctx.body = roles.map(role => ({
      id: role.id,
      name: role.name
    }));
  }
};
