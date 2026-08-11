'use strict';

/**
 * cms-config controller
 *
 * Persiste configurações gerais do painel via strapi.store() (tabela core_store).
 * Segue o mesmo padrão de controller já validado em role-lookup.js:
 * - ctx.body = (não return)
 * - await em TODAS as chamadas assíncronas
 * - merge no PUT (nunca substitui campos não enviados)
 *
 * Endpoint exposto via GET/PUT /cms-config — acessível por JWT Authenticated.
 * Permissões habilitadas pelo bootstrap.js (enableCmsConfigPermissions).
 */

const STORE_KEY = 'settings';
const STORE_ENV = '';
const STORE_TYPE = 'plugin';
const STORE_NAME = 'cms-config';

const DEFAULT_CONFIG = {
  site_name: 'Observa RNPI',
  site_url: 'https://observarnpi.org.br',
  idioma_padrao: 'pt-BR',
  fuso_horario: 'America/Recife',
  autosave_enabled: false,
  require_review: false,
};

// Campos permitidos no PUT — protege contra campos inesperados no body
const ALLOWED_FIELDS = [
  'site_name',
  'site_url',
  'idioma_padrao',
  'fuso_horario',
  'autosave_enabled',
  'require_review',
];

module.exports = {
  async find(ctx) {
    const pluginStore = await strapi.store({
      environment: STORE_ENV,
      type: STORE_TYPE,
      name: STORE_NAME,
    });

    const config = await pluginStore.get({ key: STORE_KEY });

    // Retorna DEFAULT_CONFIG se ainda não foi salvo nenhum valor
    ctx.body = config ?? DEFAULT_CONFIG;
  },

  async update(ctx) {
    const { request: { body } } = ctx;

    const pluginStore = await strapi.store({
      environment: STORE_ENV,
      type: STORE_TYPE,
      name: STORE_NAME,
    });

    // Ler valor atual para merge (protege contra payload parcial)
    const current = await pluginStore.get({ key: STORE_KEY }) ?? DEFAULT_CONFIG;

    // Filtrar apenas campos permitidos do body
    const patch = Object.fromEntries(
      Object.entries(body || {}).filter(([k]) => ALLOWED_FIELDS.includes(k))
    );

    const next = { ...current, ...patch };

    await pluginStore.set({ key: STORE_KEY, value: next });

    ctx.body = next;
  },
};
