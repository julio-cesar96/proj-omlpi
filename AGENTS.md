# Convenções do projeto — Observa (migração para Next.js)

## Estrutura do repositório

- `omlpi-www/` — site ATUAL em produção (Hugo + Vue2). **Não modificar sob nenhuma circunstância** durante a migração.
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
