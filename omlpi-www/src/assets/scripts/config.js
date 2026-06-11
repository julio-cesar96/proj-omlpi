const productionDomains = [
  'rnpiobserva.org.br',
  'www.rnpiobserva.org.br',
  'dev.rnpiobserva.org.br',
  'inspiring-heisenberg-e2220d.netlify.app',
];

export default {
  api: {
    domain: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://omlpi-api.rnpiobserva.org.br/v2/'
      : 'https://omlpi-api.rnpiobserva.org.br/v2/'
    ),
    docs: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://docs.rnpiobserva.org.br/'
      : '/'
    ),
  },
  apiCMS: {
    domain: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://omlpi-strapi.rnpiobserva.org.br/'
      : 'http://localhost:1337/'
    ),
  },
  storage: {
    domain: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://omlpi-strapi.rnpiobserva.org.br/'
      : 'https://omlpi-strapi.rnpiobserva.org.br/'
    ),
  },
  firstCityId: 5200050,
};
