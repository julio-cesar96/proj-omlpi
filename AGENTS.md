# Convenções do projeto — Observa (migração para Next.js)

## Limite de escopo (importante)

Este projeto é **exclusivamente a migração do front-end**. A API Perl (`omlpi-api`) foi desenvolvida por outro prestador e não é mais mantida como parte deste trabalho — o escopo pago aqui é o site novo, não correções ou evoluções de backend. Trate os contratos de `omlpi-api`, `omlpi-cms` e `omlpi-cms-search` como **fixos e definitivos**, mesmo que pareçam incompletos, inconsistentes ou limitados:

- Nunca proponha, sugira ou implemente mudanças nesses três repositórios.
- Se uma funcionalidade do design não tiver um endpoint correspondente (ex: dado que alimentaria a aba "Monitoramento", ou os números agregados do Hero), **documente como limitação conhecida** em vez de sugerir alteração de backend. A decisão de resolver isso (mudar o design, aceitar o dado ausente, ou contratar trabalho de backend à parte) é do cliente, não uma tarefa desta migração.
- Isso vale mesmo para capacidades que o backend já tem prontas mas não expõe do jeito ideal (ex: infraestrutura de e-mail existente para `upload_plan` não deve ser cogitada como base para um futuro endpoint de contato — isso seria escopo de backend).

> **NOTA DE FASE (redesign do CMS):** a partir da fase de redesign do painel administrativo, `omlpi-cms` **deixa de ser somente-leitura** — é o alvo principal de trabalho desta fase. As regras de "não modificar" continuam valendo integralmente para `omlpi-api` e `omlpi-cms-search`, que seguem fora de escopo e imutáveis. Ao trabalhar em tarefas desta fase, ignore a restrição de somente-leitura especificamente para `omlpi-cms`; para os outros dois repositórios, a restrição permanece.
>
> **Restrição de licenciamento desta fase:** todo o trabalho no CMS deve rodar no plano **gratuito (Community)** do Strapi. Nunca implementar, sugerir ou depender de recursos pagos (Growth/Enterprise), como "Review Workflows" ou "Content History" nativos. Onde o design pede um comportamento equivalente, construir uma versão customizada (campo/content-type próprio) — ver `docs/CMS_ESCOPO_MVP.md` para o que está dentro e fora do MVP.

## Estrutura do repositório

- `omlpi-www/` — site ATUAL em produção (Hugo + Vue2). **Não modificar sob nenhuma circunstância** durante a migração.
- `omlpi-api/`, `omlpi-cms/`, `omlpi-cms-search/` — código-fonte do backend (API Perl, Strapi, serviço de busca full-text). **Somente leitura/referência.** Use para confirmar contratos reais de endpoint (ex: ler `omlpi-api/public/openapi.yaml` para parâmetros exatos) — nunca para editar, a menos que uma tarefa explicitamente peça uma mudança de backend.
- `next/` — site NOVO em construção (Next.js, App Router). Todo o trabalho desta migração acontece aqui. Todo comando (instalação, dev server, build) deve rodar a partir de `next/`, nunca da raiz do repo.
- `design-reference/` — clone local do repo `julio-cesar96/observa` (export do Figma Make aprovado pelo cliente). Não versionado neste repo (está no `.gitignore`). **Nunca rodar, buildar ou importar código dele.** Serve apenas para: (1) extrair tokens de design — cores, tipografia, espaçamento — de `design-reference/src/app/styles/`; (2) consultar a composição visual de cada seção em `design-reference/src/app/components/` e `App.tsx`.
- `docs/PLANO_ONEPAGE.md` — fonte da verdade ATUAL de arquitetura, decisões e fases. Seguir esse documento para toda decisão estrutural.
- `docs/API_CONTRACTS.md` — contratos de API (Strapi + Perl) a seguir à risca. Backend já está pronto e estável — não supor endpoints, parâmetros ou formatos além do que está descrito ali. Se faltar informação, sinalizar como pendência em vez de inventar.
- `docs/archive/` — documentos históricos (`plan.md`, `MIGRATION_PLAN.md`, `migration.md`) de uma fase anterior do planejamento, que assumia design e estrutura diferentes (multi-página, sem one-page). Usar **apenas** como inventário técnico de referência (lista de arquivos Hugo/Vue antigos, endpoints, complexidade por página) — nunca seguir as fases ou a arquitetura descritas neles.

## Regras gerais

- Stack alvo: Next.js (App Router), TypeScript.
- Site novo é **one-page**: seções institucionais (Início, Sobre, PNIPI, Midiateca, Contato) navegadas por âncora, sem query params. O bloco "Consulta pública" (mapa + dashboards) mantém estado sincronizado via `searchParams` no servidor e `useSearchParams`/`router.replace` no client — não usar `localStorage`/`sessionStorage` para esse estado.
- Mapa do Brasil: usar a geometria real existente no site atual (`src/static/maps`), não a forma livre do mockup do Figma Make. O design de referência define cores e estilo, não a geometria.
- Formulário de contato: se não houver endpoint de backend confirmado, seguir alternativa descrita em `docs/PLANO_ONEPAGE.md` (Resend + Route Handler como primeira opção, Web3Forms como fallback de menor esforço).
- Trabalhar por fase, conforme `docs/PLANO_ONEPAGE.md`. Não pular fases nem antecipar trabalho de uma fase posterior sem indicação explícita.
- Ao final de cada fase, gerar um resumo do que foi implementado e quais pendências (das listadas em `docs/API_CONTRACTS.md` ou `docs/PLANO_ONEPAGE.md`) seguem em aberto.
