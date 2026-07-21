# Convenções do projeto — Observa (migração para Next.js)

## Limite de escopo (importante)

Este projeto é **exclusivamente a migração do front-end**. A API Perl (`omlpi-api`) foi desenvolvida por outro prestador e não é mais mantida como parte deste trabalho — o escopo pago aqui é o site novo, não correções ou evoluções de backend. Trate os contratos de `omlpi-api`, `omlpi-cms` e `omlpi-cms-search` como **fixos e definitivos**, mesmo que pareçam incompletos, inconsistentes ou limitados:

- Nunca proponha, sugira ou implemente mudanças nesses três repositórios.
- Se uma funcionalidade do design não tiver um endpoint correspondente (ex: dado que alimentaria a aba "Monitoramento", ou os números agregados do Hero), **documente como limitação conhecida** em vez de sugerir alteração de backend. A decisão de resolver isso (mudar o design, aceitar o dado ausente, ou contratar trabalho de backend à parte) é do cliente, não uma tarefa desta migração.
- Isso vale mesmo para capacidades que o backend já tem prontas mas não expõe do jeito ideal (ex: infraestrutura de e-mail existente para `upload_plan` não deve ser cogitada como base para um futuro endpoint de contato — isso seria escopo de backend).

> **NOTA DE FASE (redesign do CMS):** a partir da fase de redesign do painel administrativo, `omlpi-cms` **deixa de ser somente-leitura** — é o alvo principal de trabalho desta fase. As regras de "não modificar" continuam valendo integralmente para `omlpi-api` e `omlpi-cms-search`, que seguem fora de escopo e imutáveis. Ao trabalhar em tarefas desta fase, ignore a restrição de somente-leitura especificamente para `omlpi-cms`; para os outros dois repositórios, a restrição permanece.
>
> **Restrição de licenciamento desta fase:** todo o trabalho no CMS deve rodar no plano **gratuito (Community)** do Strapi. Nunca implementar, sugerir ou depender de recursos pagos (Growth/Enterprise), como "Review Workflows" ou "Content History" nativos. Onde o design pede um comportamento equivalente, construir uma versão customizada (campo/content-type próprio) — ver `docs/CMS_ESCOPO_MVP.md` para o que está dentro e fora do MVP.
>
> **DECISÃO DE CAMINHO E ARQUITETURA (21/07/2026 — revisão final):** Após reavaliação, confirmado o **Caminho A2 — aplicação React + Vite separada**, revertendo a decisão de 16/07/2026 (Caminho A, admin nativo do Strapi). Motivo da reversão: melhorar o processo de desenvolvimento — o esforço de manter customizações dentro do admin nativo do Strapi v3 se mostrou maior que construir a app separada, e o cliente priorizou fidelidade visual ao design aprovado. O painel roda como app própria (`painel-cms/`), consumindo a API REST do Strapi via JWT (`users-permissions`), sem depender de nenhum recurso pago do Strapi (Growth/Enterprise). Content-types novos: `plano`, `faq`, `pagina-institucional`, `categoria` — já criados e em produção. Content-types existentes (`artigos`, `banners`, `eixos`, `guias`, `infographics`, `listaplanos`, `locales`, `noticias`, `politica-de-privacidade`, `sobre`, `tags`, `tags-alias`, `textoindicadors`) permanecem intocados por padrão.
>
> **DETALHE DE ROTA / PERMISSÃO (16/07/2026):** A rota de política de privacidade no Strapi é `/politica-de-privacidade` (não `/privacy-policy`), porém ela retorna `403 Forbidden` devido às permissões públicas de `find` estarem desativadas no Strapi admin (precisa ser habilitada pelo cliente/admin em Settings -> Roles -> Public).
>
> **VERSÃO REAL CONFIRMADA (15/07/2026, via `docker exec` no container de produção):** Strapi `3.3.3` — a última versão estável do v3, não uma beta. Uma investigação anterior baseada no clone GitHub desatualizado havia indicado incorretamente `3.0.0-beta.17.5`; essa leitura estava errada porque o repo local (`omlpi-cms/`) não era fiel ao código real em produção (`/root/strapi-prod/` no servidor). Isso já foi corrigido via `rsync --delete` do servidor para o repo local — `omlpi-cms/` agora reflete os 13 content-types reais. Ainda assim, Strapi v3 + Node 14 seguem EOL desde 2023.
>
> **MITIGAÇÃO DE SEGURANÇA APLICADA E CONFIRMADA (15/07/2026):** o `/admin` do Strapi, antes exposto publicamente, agora está protegido por HTTP Basic Auth via Nginx (`/etc/nginx/sites-available/observa`, backup salvo). Testado e confirmado: `/admin` retorna `401`; `/locales` e `/artigos` continuam respondendo normalmente (`200`), sem impacto no restante do tráfego. Existe um bloco `server_name` duplicado nesse mesmo arquivo Nginx (a cópia sem a rota `/artigos`, atualmente inativa/ignorada) — limpeza recomendada como tarefa separada, não urgente.

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

## Documentação de progresso

Duas frentes de trabalho neste monorepo, com pastas de progresso separadas:

- `docs/progresso/` — migração do front-end (Hugo/Vue2 → Next.js), branch `feature/migration-next`.
- `docs/progresso-cms/` — redesign do painel administrativo (CMS), branch `feature/cms-redesign`.

Ao final de cada fase implementada, registrar um resumo na pasta correspondente,
seguindo o padrão `fase-N-nome-curto.md`, com: o que foi decidido, o que foi
implementado, qualquer desvio do plano original, e pendências para a próxima fase.
