# Migração OMLPI

## Objetivo

Migrar o site para uma base moderna sem perder o comportamento atual, preservando URLs, conteúdo, SEO, tracking e integrações com os sistemas existentes.

## Contexto atual

O projeto hoje combina:

- site público em Hugo com scripts globais em Vue 2
- conteúdo vindo do Strapi
- dashboards e dados vindos de uma API Perl/Mojolicious
- páginas com gráficos, mapas, busca e upload de planos

## Princípios da migração

- manter a superfície de rotas atual
- migrar por etapas, começando pelo que tem menor risco
- preservar integrações e contratos de API
- tratar SEO, consentimento e monitoramento como parte da migração, não como ajuste final
- manter dashboards e fluxos dinâmicos como áreas críticas de validação

## Escopo principal

- páginas de conteúdo e CMS
- dashboards de dados
- mapa e busca de planos
- upload de plano
- tracking, consentimento, metadata e redirecionamentos

## Riscos principais

- quebra de SEO ou URLs antigas
- regressão nos gráficos e filtros dos dashboards
- falha no fluxo de consentimento e tracking
- problemas no upload de plano e nas chamadas da API
- dependências sensíveis no mapa e na chave do Google Maps

## Critério de sucesso

A migração só é considerada concluída quando o novo frontend reproduzir o comportamento atual com estabilidade, sem perda de conteúdo, rastreamento, acessibilidade básica ou integração com as APIs existentes.
