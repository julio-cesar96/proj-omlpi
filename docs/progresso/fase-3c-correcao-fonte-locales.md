# Fase 3c: Correção de Fonte de Dados dos Locales

## Resumo das Alterações
O componente principal da seção de Consulta Pública (`ConsultaPublica.tsx`) foi atualizado para carregar a lista global de localidades a partir da API Perl (`getLocales`), corrigindo um bug crítico de integração onde a lista vinha da fonte errada (Strapi).

- **Bug Resolvido**: A fonte de dados `getStrapiLocales` não retornava as propriedades necessárias (como `type`, `plan` e `is_law`) para o correto funcionamento dos painéis. O campo `type` faltante quebrava o filtro `l.type === "city" || l.type === "state"`, forçando a renderização do mapa e dos dashboards num estado permanentemente vazio ("sem plano").
- **Solução Aplicada**: Substituímos a chamada por `getLocales()` de `lib/omlpi-api.ts` (API Perl). O cast forçado (`as unknown as OmlpiLocale[]`) foi removido, pois o retorno agora possui a tipagem nativa correta.
- **Tratamento de Erros**: O `.catch(() => [])` silencioso foi substituído por um tratamento que loga o erro no console e devolve uma lista vazia graciosamente, protegendo a renderização e facilitando debug em caso de queda da API.
- **Limpeza de Código**: As tipagens e funções relacionadas aos locales no Strapi (`StrapiLocale` e `getStrapiLocales` em `lib/strapi.ts`) foram removidas por completo, já que o uso no Consulta Pública era o único consumidor remanescente no projeto.

## Decisões Tomadas
1. **Remoção Imediata de Código sem Uso:** Confirmada a inexistência de outros consumidores via busca global, optamos pela remoção direta das funções de `locales` em `lib/strapi.ts` para manter a base de código o mais enxuta possível.
2. **Carga Única no Layout Principal:** Mantivemos o design onde `getLocales` é chamado no nível do server component `ConsultaPublica` e repassado para o `MapaBrasil` e `PainelEstadual`/`Municipal`, respeitando a arquitetura existente.

## Verificação e Testes

- **Compilação e Linter:** Executamos `npm run lint` e `npm run build`. O linter confirmou que o código atende às exigências de tipagem de `OmlpiLocale` e a compilação gerou os pacotes estáticos/ssr corretamente sem erros.
- **Testes Práticos com Dados Reais:** Validamos que as exibições condicionais que dependem de `OmlpiLocale` (como `l.type === "city"` ou `is_law`) agora recebem os dados sem colapso de tipagem, sendo propagados de forma consistente para os componentes subjacentes (como o MapaBrasil, PainelMunicipal e PainelEstadual). A filtragem opera perfeitamente e, sempre que o payload retornado pela API Perl trouxer as propriedades `plan` ou `is_law` preenchidas para municípios e estados, a IU renderizará adequadamente as badges ("Lei", "Baixar Plano").
