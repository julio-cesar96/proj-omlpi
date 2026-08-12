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

const ACTIONS = ['find', 'findOne'];

async function cleanupMalformedPublicPermissions() {
  // Remove permissões com o formato antigo/errado (application::slug.slug)
  // que podem ter sido geradas por versões anteriores deste bootstrap.
  // Idempotente: se não houver registros malformados, não faz nada.
  const malformed = await strapi.query('permission', 'users-permissions').find({
    controller_contains: 'application::',
    _limit: -1,
  });
  for (const perm of malformed) {
    await strapi.query('permission', 'users-permissions').delete({ id: perm.id });
    strapi.log.info(`[bootstrap] Permissão malformada removida: ${perm.controller}.${perm.action}`);
  }
}

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
    // O controller no Strapi v3 usa o nome puro do content-type (sem prefixo application::)
    const controller = contentType;

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

async function setupCustomRoles() {
  const usersPermissionsService = strapi.plugins['users-permissions'].services.userspermissions;
  const basePermissions = usersPermissionsService.getActions();

  const enableAll = (p, name) => {
    if (p.application?.controllers?.[name]) {
      ['find', 'findOne', 'count', 'create', 'update', 'delete'].forEach(action => {
        if (p.application.controllers[name][action]) {
          p.application.controllers[name][action].enabled = true;
        }
      });
    }
  };

  const enableWrite = (p, name) => {
    if (p.application?.controllers?.[name]) {
      ['find', 'findOne', 'count', 'create', 'update'].forEach(action => {
        if (p.application.controllers[name][action]) {
          p.application.controllers[name][action].enabled = true;
        }
      });
    }
  };

  const enableUploadAll = (p) => {
    if (p.upload?.controllers?.upload) {
      ['find', 'findOne', 'count', 'upload', 'destroy'].forEach(action => {
        if (p.upload.controllers.upload[action]) {
          p.upload.controllers.upload[action].enabled = true;
        }
      });
    }
  };

  const enableUploadWrite = (p) => {
    if (p.upload?.controllers?.upload) {
      ['find', 'findOne', 'count', 'upload'].forEach(action => {
        if (p.upload.controllers.upload[action]) {
          p.upload.controllers.upload[action].enabled = true;
        }
      });
    }
  };

  const enableUserAll = (p) => {
    if (p['users-permissions']?.controllers?.user) {
      ['find', 'findOne', 'create', 'update', 'destroy', 'me'].forEach(action => {
        if (p['users-permissions'].controllers.user[action]) {
          p['users-permissions'].controllers.user[action].enabled = true;
        }
      });
    }
  };

  const enableUserMe = (p) => {
    if (p['users-permissions']?.controllers?.user?.me) {
      p['users-permissions'].controllers.user.me.enabled = true;
    }
  };

  const enableRoleLookup = (p) => {
    if (p.application?.controllers?.['role-lookup']?.find) {
      p.application.controllers['role-lookup'].find.enabled = true;
    }
  };

  const rolesToCreate = [
    {
      name: 'Administrador',
      description: 'Acesso total de gestão de conteúdo e usuários',
      type: 'administrador',
      config: (p) => {
        ['plano', 'faq', 'pagina-institucional', 'categoria', 'tags'].forEach(c => enableAll(p, c));
        enableUploadAll(p);
        enableUserAll(p);
        enableRoleLookup(p);
      }
    },
    {
      name: 'Editor',
      description: 'Cria e edita conteúdo, sem permissão de exclusão',
      type: 'editor',
      config: (p) => {
        ['plano', 'faq', 'pagina-institucional', 'categoria', 'tags'].forEach(c => enableWrite(p, c));
        enableUploadWrite(p);
        enableUserMe(p);
        enableRoleLookup(p);
      }
    },
    {
      name: 'Revisor',
      description: 'Revisa e edita conteúdo, com permissão de publicação',
      type: 'revisor',
      config: (p) => {
        ['plano', 'categoria', 'tags'].forEach(c => enableWrite(p, c));
        enableWrite(p, 'faq'); // Sem delete (Correção 3)
        // Revisor de pagina-institucional: apenas find, findone, count, update
        if (p.application?.controllers?.['pagina-institucional']) {
          ['find', 'findOne', 'count', 'update'].forEach(action => {
            if (p.application.controllers['pagina-institucional'][action]) {
              p.application.controllers['pagina-institucional'][action].enabled = true;
            }
          });
        }
        enableUploadWrite(p);
        enableUserMe(p);
        enableRoleLookup(p);
      }
    }
  ];

  for (const roleDef of rolesToCreate) {
    const existing = await strapi.query('role', 'users-permissions').findOne({ name: roleDef.name });
    if (!existing) {
      const perms = JSON.parse(JSON.stringify(basePermissions));
      roleDef.config(perms);

      await usersPermissionsService.createRole({
        name: roleDef.name,
        description: roleDef.description,
        type: roleDef.type,
        permissions: perms,
        users: []
      });
      strapi.log.info(`[bootstrap] Role criada com sucesso: ${roleDef.name}`);
    }
  }
}

/**
 * Habilita permissão pública (role Public) de find no endpoint /midiateca-publica.
 * Nunca abre /upload/files para o Public — apenas o endpoint customizado.
 * Idempotente: cria se não existe, habilita se existir desabilitada.
 */
async function enableMidiatecaPublicaPermission() {
  const publicRole = await strapi
    .query('role', 'users-permissions')
    .findOne({ type: 'public' });

  if (!publicRole) {
    strapi.log.warn('[bootstrap] Role "public" não encontrado — abortando midiateca-publica permission.');
    return;
  }

  const existing = await strapi
    .query('permission', 'users-permissions')
    .findOne({ type: 'application', controller: 'midiateca-publica', action: 'find', role: publicRole.id });

  if (!existing) {
    await strapi.query('permission', 'users-permissions').create({
      type: 'application',
      controller: 'midiateca-publica',
      action: 'find',
      enabled: true,
      policy: '',
      role: publicRole.id,
    });
    strapi.log.info('[bootstrap] Permissão criada: midiateca-publica.find (Public)');
  } else if (!existing.enabled) {
    await strapi
      .query('permission', 'users-permissions')
      .update({ id: existing.id }, { enabled: true });
    strapi.log.info('[bootstrap] Permissão habilitada: midiateca-publica.find (Public)');
  } else {
    strapi.log.debug('[bootstrap] Permissão já ativa: midiateca-publica.find (Public)');
  }
}

/**
 * Habilita permissões de update e bulkUpdate do endpoint /midiateca-publica
 * para o role Authenticated (somente quem está logado pode alterar visibilidade).
 * Idempotente: cria se não existe, habilita se existir desabilitada.
 */
async function enableMidiatecaAuthenticatedPermissions() {
  const authRole = await strapi
    .query('role', 'users-permissions')
    .findOne({ type: 'authenticated' });

  if (!authRole) {
    strapi.log.warn('[bootstrap] Role "authenticated" não encontrado — abortando midiateca-publica auth permissions.');
    return;
  }

  for (const action of ['update', 'bulkupdate']) {
    const existing = await strapi
      .query('permission', 'users-permissions')
      .findOne({ type: 'application', controller: 'midiateca-publica', action, role: authRole.id });

    if (!existing) {
      await strapi.query('permission', 'users-permissions').create({
        type: 'application',
        controller: 'midiateca-publica',
        action,
        enabled: true,
        policy: '',
        role: authRole.id,
      });
      strapi.log.info(`[bootstrap] Permissão criada: midiateca-publica.${action} (Authenticated)`);
    } else if (!existing.enabled) {
      await strapi
        .query('permission', 'users-permissions')
        .update({ id: existing.id }, { enabled: true });
      strapi.log.info(`[bootstrap] Permissão habilitada: midiateca-publica.${action} (Authenticated)`);
    } else {
      strapi.log.debug(`[bootstrap] Permissão já ativa: midiateca-publica.${action} (Authenticated)`);
    }
  }
}

/**
 * Habilita permissões de find e update do endpoint /cms-config
 * para o role Authenticated.
 * Idempotente: cria se não existe, habilita se existir desabilitada.
 */
async function enableCmsConfigPermissions() {
  const authRole = await strapi
    .query('role', 'users-permissions')
    .findOne({ type: 'authenticated' });

  if (!authRole) {
    strapi.log.warn('[bootstrap] Role "authenticated" não encontrado — abortando cms-config permissions.');
    return;
  }

  for (const action of ['find', 'update']) {
    const existing = await strapi
      .query('permission', 'users-permissions')
      .findOne({ type: 'application', controller: 'cms-config', action, role: authRole.id });

    if (!existing) {
      await strapi.query('permission', 'users-permissions').create({
        type: 'application',
        controller: 'cms-config',
        action,
        enabled: true,
        policy: '',
        role: authRole.id,
      });
      strapi.log.info(`[bootstrap] Permissão criada: cms-config.${action}`);
    } else if (!existing.enabled) {
      await strapi
        .query('permission', 'users-permissions')
        .update({ id: existing.id }, { enabled: true });
      strapi.log.info(`[bootstrap] Permissão habilitada: cms-config.${action}`);
    } else {
      strapi.log.debug(`[bootstrap] Permissão já ativa: cms-config.${action}`);
    }
  }
}

module.exports = async () => {
  try {
    await cleanupMalformedPublicPermissions();
    await enablePublicPermissions();
    await setupCustomRoles();
    await enableCmsConfigPermissions();
    await enableMidiatecaPublicaPermission();
    await enableMidiatecaAuthenticatedPermissions();
  } catch (err) {
    strapi.log.error('[bootstrap] Erro ao configurar permissões:', err);
  }
};
