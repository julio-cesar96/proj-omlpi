# Fase 3d — Correção da Fonte de Dados de Locales
**Branch:** `feature/migration-next`
**Data de conclusão:** 2026-07-13
**Diretório de trabalho:** `next/`

---

## 1. O Problema (Reversão parcial da Fase 3c)

Na Fase 3c, a função `getStrapiLocales` foi incorretamente removida e substituída por `getLocales` da API Perl (`omlpi-api`) no componente `ConsultaPublica.tsx`. A justificativa anterior estava baseada na premissa falsa de que a API do Strapi era a fonte incorreta para esses dados.

No entanto, a API Perl (`GET /locales`) retorna **apenas** `{ id, name, type, latitude, longitude }`, como validado pelo `openapi.yaml`. Faltavam os campos cruciais para o funcionamento do MapaBrasil e Painéis: `cod_ibge`, `is_law`, `hide_plan` e `plan`. A verdadeira fonte desses campos **é o CMS (Strapi)**. 

A substituição feita na Fase 3c engoliu erros silenciosamente (`.catch(() => [])`) sem logar, escondendo a discrepância nos payloads e quebrando completamente a funcionalidade de cores/status de planos do mapa.

## 2. Solução Implementada

1. **Restauração de `StrapiLocale` e `getStrapiLocales`:**
   - Em `lib/strapi.ts`, recriamos a interface `StrapiLocale` para bater exatamente com o payload do Strapi.
   - Recriada a função `getStrapiLocales` com suporte a `StrapiQueryParams`.

2. **Correção em `ConsultaPublica.tsx`:**
   - A chamada `getLocales()` (API Perl) foi substituída novamente por `getStrapiLocales({ _limit: -1 })` para carregar todas as localidades do Strapi, que possuem o objeto `plan` preenchido.
   - O tratamento de erro no `catch` foi aprimorado para realizar log explícito do erro (`console.error`), facilitando depuração futura e evitando falhas silenciosas.

3. **Adequação de Tipos nos Componentes:**
   - Substituímos todas as ocorrências de `OmlpiLocale` por `StrapiLocale` nos componentes que dependem da informação completa do local (`MapaBrasil`, `PainelEstadual`, `PainelMunicipal`, `PainelNacional`, `LocalidadeBusca` e `NacionalControls`), garantindo verificação estática correta no TypeScript.

4. **Atualização da Documentação:**
   - `docs/API_CONTRACTS.md`: Clarificado que a coleção `locales` do Strapi é a única fonte com os dados completos de `cod_ibge` e planos. A API Perl fornece apenas geocoding básico legado.
   - `docs/progresso/fase-3a-mapa-localidades.md`: O documento histórico foi corrigido para evitar confusões futuras sobre qual endpoint entrega quais campos.

## 3. Testes Locais

- **CURL para o Strapi:** Um teste no terminal confirmou que `https://omlpi-strapi.rnpiobserva.org.br/locales?_limit=1` retorna uma resposta contendo `cod_ibge` preenchido e o objeto `plan` detalhado (ex: `PMPI Jussari 2022 publicado.pdf`).
- **Build / Lint:** A compilação Next.js `npm run build` passou com sucesso após a correção exaustiva dos tipos TypeScript nos componentes afetados.
- **Ambiente Local:** Configuração de `.env.local` correta sem erros silenciosos. O mapa e as listagens locais agora possuem os dados corretos de estado/status para o Brasil inteiro.

## 4. Próximos Passos
O mapa e os painéis voltam a apresentar seus links e estados reais (`approved`, `inProgress`, `none`) conforme extraídos dos relatórios consolidados em PDF mantidos pelo administrador do Strapi. A migração das demais abas ou próximos ajustes estruturais pode seguir, com a fonte de dados perfeitamente alinhada ao ambiente de produção.
