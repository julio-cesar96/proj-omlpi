# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Documentação principal: `README.md` (arquitetura completa, tabela de seções/dados, histórico) e `AGENTS.md` (convenções e decisões de fase). Este arquivo resume o que é operacional no dia a dia; em caso de divergência, `AGENTS.md` prevalece sobre o README.

## Comandos

Nunca rodar npm na raiz do monorepo — cada app tem seu próprio `package.json`.

```bash
# site público (Next.js) — http://localhost:3000
cd next && npm install && npm run dev
npm run build      # inclui upload de source maps ao Sentry se SENTRY_AUTH_TOKEN estiver setado
npm run lint       # eslint (flat config, core-web-vitals)

# painel administrativo (React + Vite) — http://localhost:5173
cd painel-cms && npm install && npm run dev
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm run preview
```

Antes de rodar qualquer um dos dois: `cp .env.local.example .env.local` e preencher (ver tabelas de env vars no README).

**Não existe suíte de testes em nenhum app** — nenhuma dependência de Jest/Vitest/Playwright, nenhum arquivo `*.test.*`/`*.spec.*`, nenhum script `test`. Verificação = `npm run build` + `npm run lint` + conferência manual no dev server.

`docker-compose.yml` orquestra apenas o stack **legado** (Postgres, Strapi, API Perl, busca, site Hugo); `next/` e `painel-cms/` ficam fora dele e são implantados na Vercel separadamente.

## Regras de escopo entre as pastas

Este monorepo mistura código em desenvolvimento ativo com código legado que **não deve ser tocado**:

| Pasta | Regra |
|---|---|
| `next/`, `painel-cms/` | Desenvolvimento ativo — é aqui que o trabalho acontece |
| `omlpi-cms/` (Strapi v3.3.3) | Editável **apenas** desde a fase de redesign do painel; restrito ao plano Community |
| `omlpi-api/` (Perl), `omlpi-cms-search/` | **Somente leitura.** Contratos fixos e definitivos — nunca propor nem implementar mudanças |
| `omlpi-www/` (Hugo + Vue 2) | **Não modificar em nenhuma circunstância** — é o site em produção até o cutover |
| `design-reference-cms/`, `design-reference/` (gitignored) | Só consulta visual — nunca rodar, buildar ou importar código de lá |

Funcionalidade do design sem endpoint correspondente no backend vira **limitação documentada**, nunca uma mudança de backend "por fora" (ex.: aba Monitoramento, números agregados do Hero). A decisão sobre isso é do cliente.

Recursos pagos do Strapi (Review Workflows, Content History — Growth/Enterprise) estão proibidos; comportamento equivalente é construído com content-type/campo próprio.

## Arquitetura em uma passada

```
Strapi v3.3.3 (omlpi-cms) ──leitura server-only──> next/ (site público one-page)
        ▲                                             │
        │ CRUD via JWT (/auth/local)                  └─ app/api/* = proxies p/ segredos server-only
        │                                             
   painel-cms/ (SPA React+Vite)          API Perl (omlpi-api /v2) ──> só o painel Nacional do next/
```

- **`next/`** é **one-page**: seções institucionais navegadas por âncora. Só o bloco "Consulta pública" mantém estado, sincronizado via `searchParams` no servidor e `useSearchParams`/`router.replace` no client — **nunca** `localStorage`/`sessionStorage` para esse estado.
- Quase todo dado do site vem do Strapi. A API Perl só alimenta o painel Nacional (comparação/histórico) e o upload de plano.
- O painel escreve no Strapi; o site lê. O elo é o `estado_editorial` (fluxo de 4 estados, campo customizado) rodando em paralelo ao `published_at` nativo do Draft & Publish, que é o que realmente controla visibilidade pública.

## Armadilhas específicas (a lista que quebra coisas em produção)

**`next/`**
- Roteamento intermediário vive em `src/proxy.ts`, **não** `middleware.ts` — convenção do Next 16.2.10.
- `STRAPI_API_URL` e `OMLPI_API_URL` são server-only; acesso do client passa obrigatoriamente por proxy em `app/api/*`.
- Queries ao Strapi usam só `_limit`/`_sort`/`_q`/`_where`/`_start`. Nunca `populate=` nem GraphQL.
- `plan.url` da API Perl é usado como veio — concatenar com base URL gera barra dupla e 400 no backend Perl.
- Highcharts + geometria de mapas vêm do CDN `unpkg.com` via `<Script>`, não do `package.json`.
- Geometria do mapa do Brasil é a real (`public/maps/`), não a forma livre do mockup do Figma.

**`painel-cms/`**
- **Nunca omitir `published_at`** em `POST`/`PUT` de content-type com Draft & Publish (`plano`, `faq`, `pagina-institucional`, `banners`, `sobre`, `elabore-planos`) — ausente/`undefined` aciona auto-publicação indevida no Strapi v3. `null` = rascunho, ISO string = publicado.
- Listar perfis via `/role-lookup` (custom); o `/users-permissions/roles` nativo é bloqueado por policy.
- Arquivos públicos vêm de `/midiateca-publica` (custom); `/upload/files` nunca é fonte pública.
- JWT em `sessionStorage` (`cms_jwt`/`cms_user`), não `localStorage`; sem refresh token — `401` limpa a sessão e redireciona para `/login`.
- `/memoria` é uma view sintética sobre o content-type `sobre` (filtro client-side por título) — não existe content-type `memoria`.

**Strapi**
- Mudanças de schema em produção são manuais (SSH + `docker compose restart` + SQL quando necessário) — não há pipeline de migração.
- `/admin` de produção está atrás de HTTP Basic Auth no Nginx.

## Fluxo de trabalho

- Duas frentes, duas branches: `feature/migration-next` (site) e `feature/cms-redesign` (painel).
- Trabalhar **por fase**, conforme `docs/PLANO_ONEPAGE.md` (site) e `docs/CMS_ESCOPO_MVP.md` (painel). Não antecipar trabalho de fase posterior sem indicação explícita.
- Ao final de cada fase, registrar um resumo em `docs/progresso/` (site) ou `docs/progresso-cms/` (painel), no padrão `fase-N-nome-curto.md`, com: decisões, o que foi implementado, desvios do plano e pendências.
- Contratos de API a seguir à risca em `docs/API_CONTRACTS.md` — não supor endpoints, parâmetros ou formatos além do descrito; faltando informação, sinalizar pendência em vez de inventar.
- `docs/archive/` é de uma fase de planejamento anterior (multi-página) — usar só como inventário técnico, nunca como arquitetura a seguir.

## Regras de Git

- NUNCA faça git commit automaticamente
- NUNCA faça git push
- Apenas edite os arquivos e explique o que mudou
- O desenvolvedor faz o commit manualmente

## Idioma

Código, documentação, commits e nomes de branch estão em português. Manter o padrão.
