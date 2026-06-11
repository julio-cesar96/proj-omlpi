const productionDomains = [
    'rnpiobserva.org.br',
    'www.rnpiobserva.org.br' // Recomendado incluir com www caso os usuários acessem assim
];

export default {
    api: {
        domain: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'https://omlpi-api.rnpiobserva.org.br/v2/' // Mantemos o /v2/ que a API própria exige
            : ''
        ),
        docs: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'https://docs.rnpiobserva.org.br/' // Conforme seu primeiro relato, esse é o subdomínio dos docs
            : '/'
        ),
    },
    apiCMS: {
        domain: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'https://omlpi-strapi.rnpiobserva.org.br/'
            : 'http://localhost:1243/' // Mantido o padrão original para desenvolvimento local
        ),
    },
    storage: {
        domain: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'https://omlpi-strapi.rnpiobserva.org.br/'
            : 'https://omlpi-strapi.rnpiobserva.org.br/' // Recomendado apontar para o seu Strapi aqui também, para que as imagens carreguem se você rodar o site localmente
        ),
    },
    firstCityId: 5200050,
};
