'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/v3.x/concepts/configurations.html#bootstrap
 */

/**
 * Habilita permissões públicas de find/findone para os novos content-types.
 * Idempotente: cria se não existe, habilita se existir desabilitada.
 * Não toca em nenhum content-type existente.
 */
const NEW_CONTENT_TYPES = [
  'categoria',
  'plano',
  'faq',
  'pagina-institucional',
];

const ACTIONS = ['find', 'findone'];

async function enablePublicPermissions() {
  // 1. Busca o role "public"
  const publicRole = await strapi
    .query('role', 'users-permissions')
    .findOne({ type: 'public' });

  if (!publicRole) {
    strapi.log.warn('[bootstrap] Role "public" não encontrado — abortando.');
    return;
  }

  for (const contentType of NEW_CONTENT_TYPES) {
    // O controller no Strapi v3 segue o padrão "application::slug.slug"
    const controller = `application::${contentType}.${contentType}`;

    for (const action of ACTIONS) {
      const existing = await strapi
        .query('permission', 'users-permissions')
        .findOne({ type: 'application', controller, action, role: publicRole.id });

      if (!existing) {
        // Permissão ainda não existe → criar
        await strapi.query('permission', 'users-permissions').create({
          type: 'application',
          controller,
          action,
          enabled: true,
          policy: '',
          role: publicRole.id,
        });
        strapi.log.info(`[bootstrap] Permissão criada: ${controller}.${action}`);
      } else if (!existing.enabled) {
        // Existe mas está desabilitada → habilitar
        await strapi
          .query('permission', 'users-permissions')
          .update({ id: existing.id }, { enabled: true });
        strapi.log.info(`[bootstrap] Permissão habilitada: ${controller}.${action}`);
      } else {
        strapi.log.debug(`[bootstrap] Permissão já ativa: ${controller}.${action}`);
      }
    }
  }
}

module.exports = async () => {
  try {
    await enablePublicPermissions();
  } catch (err) {
    strapi.log.error('[bootstrap] Erro ao configurar permissões públicas:', err);
  }
};
