# Observa RNPI — proj-omlpi

Monorepo da plataforma **Observa RNPI**, o observatório da **Rede Nacional Primeira Infância (RNPI)** que dá transparência pública ao andamento dos planos municipais, estaduais e distrital pela primeira infância no Brasil (PNIPI — Plano Nacional Integrado pela Primeira Infância e agenda correlata de marco legal). A sigla histórica do projeto, `omlpi`, remonta ao nome original do backend/domínio ("observatório do marco legal/marco da primeira infância").

O site público permite consultar, por município ou estado, se existe um plano aprovado, comparar indicadores entre localidades e acompanhar a série histórica de dados; o painel administrativo permite que a equipe da RNPI mantenha esse conteúdo sem depender de desenvolvedores.

- **Site público:** https://www.rnpiobserva.org.br
- **CMS (Strapi, API + admin nativo):** https://omlpi-strapi.rnpiobserva.org.br
- **Painel administrativo (novo):** aplicação própria, roda localmente em `http://localhost:5173`

## Sumário

- [Arquitetura do monorepo](#arquitetura-do-monorepo)
- [`next/` — site público](#next--site-público)
- [`painel-cms/` — painel administrativo](#painel-cms--painel-administrativo)
- [Strapi (`omlpi-cms/`)](#strapi-omlpi-cms)
- [Integrações externas](#integrações-externas)
- [Fluxo de conteúdo](#fluxo-de-conteúdo-do-painel-ao-site)
- [Decisões técnicas relevantes](#decisões-técnicas-relevantes)
- [Histórico de desenvolvimento](#histórico-de-desenvolvimento)

---

## Arquitetura do monorepo

O repositório reúne duas gerações de código: um stack legado, em produção há mais tempo e fora do escopo de desenvolvimento ativo, e o stack novo (`next/` + `painel-cms/`), que é onde o trabalho atual acontece.

| Pasta | Papel | Status |
|---|---|---|
| **`next/`** | Site público novo — Next.js (App Router) + TypeScript. Substitui `omlpi-www/`. | 🟢 Em desenvolvimento ativo — documentado em profundidade abaixo |
| **`painel-cms/`** | Painel administrativo novo — React + Vite, app separada que consome a API REST do Strapi. Substitui a necessidade de usar o admin nativo do Strapi para o dia a dia editorial. | 🟢 Em desenvolvimento ativo — documentado em profundidade abaixo |
| `omlpi-cms/` | Strapi v3 (CMS headless) — fonte de todo o conteúdo institucional/editorial consumido por `next/` e gerenciado por `painel-cms/`. | 🟡 Legado estável, mas **alvo de mudanças de schema** nesta fase (novos content-types para o painel novo) |
| `omlpi-api/` | API de dados em Perl/Mojolicious — indicadores, localidades, comparação, série histórica, upload de plano. | ⚪ Legado, **somente leitura/referência** — não mantido neste contrato |
| `omlpi-cms-search/` | Microsserviço Node/Restify de busca full-text de artigos (`/artigos`), roteado por path no mesmo domínio do Strapi. | ⚪ Legado — **não é mais consumido por `next/`** (aba de busca de artigos foi removida na migração) |
| `omlpi-www/` | Site público ATUAL em produção (Hugo + Vue 2), sendo substituído por `next/`. | ⚪ Legado — **não modificar**; referência de comportamento a preservar/migrar |
| `docs/` | Documentação viva do projeto: contratos de API, plano de migração, escopo do CMS, e o histórico fase a fase (`docs/progresso/` para o site, `docs/progresso-cms/` para o painel). | — |
| `design-reference-cms/` | Referência visual do redesign do painel (`CMS_DESIGN_SPEC.md`, `observa-redesign.html`) — **apenas consulta**, não faz parte do build de nenhum app. | — |
| `docker-compose.yml`, `.env.example` | Orquestração local do stack **legado** (Postgres, Strapi, API Perl, busca, site Hugo). `next/` e `painel-cms/` **não** fazem parte deste compose — cada um roda com seu próprio dev server e é implantado separadamente (Vercel). | — |

> O `README.md` original deste repositório mencionava `git submodule init/update` para sincronizar `omlpi-api`/`omlpi-cms`/etc. Isso está desatualizado: `omlpi-api`, `omlpi-cms` e `omlpi-cms-search` foram, de fato, submódulos Git até o commit `cc8538f` (2026-06-11, *"Removendo submodulos do backend, mantendo apenas o frontend para a Vercel"*) e o código real dos três foi materializado como arquivos normais no commit `065c134` (2026-07-09, *"subir back sem os arquivos lfs"*, 230 arquivos/47.270 linhas). Não há mais `.gitmodules` no estado atual — todas as pastas são diretórios normais versionados no mesmo monorepo.

### Regras de escopo entre as pastas (de `AGENTS.md`)

- `omlpi-api` e `omlpi-cms-search`: **somente leitura, contratos fixos**. Não propor nem implementar mudanças nesses dois repositórios — o backend Perl não é mantido neste contrato. Uma funcionalidade sem endpoint correspondente é documentada como limitação conhecida, nunca resolvida "por fora".
- `omlpi-cms` (Strapi): passou a ser **alvo de mudanças de schema** a partir da fase de redesign do painel — é onde os content-types novos (`plano`, `faq`, `pagina-institucional`, `categoria`) foram criados. Toda mudança deve rodar no plano **gratuito (Community)** do Strapi — nunca depender de Review Workflows ou Content History nativos (recursos pagos).
- `omlpi-www`: **não modificar em nenhuma circunstância** durante a migração — é a referência de comportamento e o site que continua servindo tráfego até o corte (cutover).

---

## `next/` — site público

Site institucional **one-page**: as seções institucionais (Início, Sobre, PNIPI, Midiateca, Elabore o Plano, Contato) são navegadas por âncora na mesma página; o bloco "Consulta pública" (mapa do Brasil + painéis de dados) mantém seu estado (aba ativa, localidade, filtros) refletido na query string, para permitir compartilhar/citar links diretos (ex: "o status do plano do Ceará") sem sair da página única.

### Stack e dependências principais

| Pacote | Versão | Papel |
|---|---|---|
| `next` | 16.2.10 | Framework, App Router. **Atenção:** nesta versão o roteamento intermediário usa `src/proxy.ts` em vez do tradicional `middleware.ts` — convenção recente, não assumir o comportamento de versões anteriores do Next. |
| `react` / `react-dom` | 19.2.4 | — |
| `typescript` | ^5 | — |
| `tailwindcss` | ^4 (+ `@tailwindcss/postcss`) | Estilização |
| `@sentry/nextjs` | ^10.65.0 | Observabilidade de erros (client, server e edge) |
| `lucide-react` | ^1.24.0 | Ícones |
| `eslint` / `eslint-config-next` | ^9 / 16.2.10 | Lint (flat config, regra `core-web-vitals` + TypeScript) |

**Sem dependência de gráficos, mapas ou formulários no `package.json`.** Highcharts Maps é carregado via `<Script>` (`next/script`) direto do CDN `unpkg.com` em runtime no client — tanto o pacote principal (`highcharts@10.0.0`) quanto o de geometria de mapas (`@highcharts/map-collection@2.0.0`). Formulários (Contato, Upload de Plano) são feitos à mão com `useState`, sem `react-hook-form`/Zod.

Não há suíte de testes automatizados (nenhuma dependência de Jest/Vitest/Playwright, nenhum arquivo `*.test.*`/`*.spec.*`).

### Estrutura de pastas

```
next/
├── next.config.ts               # redirects legados + withSentryConfig
├── src/
│   ├── proxy.ts                 # substitui middleware.ts (Next 16) — redirects 301 preservando query string
│   ├── app/
│   │   ├── layout.tsx           # RootLayout: fontes, Metadata API, Header/Footer/CookieBanner/AnalyticsScripts
│   │   ├── page.tsx             # página raiz — orquestra todas as seções one-page
│   │   ├── robots.ts, sitemap.ts
│   │   ├── paginas/[slug]/page.tsx   # única rota dinâmica além da home — páginas institucionais do Strapi
│   │   └── api/
│   │       ├── midiateca-publica/route.ts   # proxy GET -> Strapi /midiateca-publica
│   │       └── upload-plan/route.ts         # proxy POST multipart -> omlpi-api /upload_plan
│   ├── lib/
│   │   ├── strapi.ts            # cliente tipado do CMS (server-only)
│   │   ├── omlpi-api.ts         # cliente tipado da API Perl (server-only)
│   │   └── contact.ts           # envio do formulário via Web3Forms (client)
│   ├── components/
│   │   ├── layout/               # Header, Footer, CookieBanner, AnalyticsScripts
│   │   ├── ui/                   # BackToTopButton
│   │   ├── sections/              # Hero, Sobre(+Client), Pnipi(+Client), ElaborePlano, Midiateca(+Client),
│   │   │                          # Contato, PrivacyPolicyModal, StatCard
│   │   └── consulta-publica/      # ConsultaPublica (orquestrador), TabsNav, MapaBrasil,
│   │                              # PainelMunicipal, PainelEstadual, PainelNacional, PainelMonitoramento,
│   │                              # GraficoComparacao, GraficoHistorico, UploadPlano, LocalidadeBusca
│   └── assets/illustrations/
├── public/
│   ├── maps/br-<uf>.json         # 27 geojson por estado (drilldown do mapa), ~19 MB no total
│   ├── br-all.geo.json           # geojson nacional
│   └── levantamento-PEPI-PMPI-relatorio-final.pdf
└── .env.local(.example)
```

### Seções do site e de onde vem cada dado

| Seção | Componente(s) | Fonte de dado | Observações |
|---|---|---|---|
| Início / Hero | `Hero.tsx` | Strapi `getBanner()` (singleType `banners`) | Números da faixa de estatísticas (municípios mapeados, planos aprovados etc.) são **placeholders estáticos hardcoded** — não existe endpoint de números agregados no backend. Imagem do Hero é um SVG decorativo, não vem do CMS (schema de `banners` não tem campo `image`). |
| Sobre | `Sobre.tsx` + `SobreClient.tsx` | Strapi `getSobres()` (collection `sobres`, um registro por aba) | Sem campo `order` no schema — ordenação usa `createdAt:asc` como proxy determinístico. |
| Elabore o Plano | `ElaborePlano.tsx` | Strapi `getElaborePlano()` (singleType `elabore-planos`) | Seção adicionada na fase 5; layout condicional por `image_position` (campo ainda pendente no Strapi, com fallback `'topo'`). |
| PNIPI | `Pnipi.tsx` + `PnipiClient.tsx` | Strapi `getGuias()`, `getFaqs()`, `getPlanos()` | **Seção oculta na home** (comentada em `page.tsx`) a pedido do cliente — código funcional, mas não renderizado atualmente. |
| Midiateca | `Midiateca.tsx` + `MidiatecaClient.tsx` | Strapi `getGuias()` (aba "Documentos") + `getMidiaPublica()` via `/api/midiateca-publica` (aba "Mídias") | A aba "Artigos" (busca full-text via `omlpi-cms-search`) foi **removida** da migração. |
| Consulta pública — Mapa | `MapaBrasil.tsx` | Strapi `getStrapiLocales()` + geojson local (`public/maps/`) | Cores por status do plano vêm dos campos `plan`/`is_law`/`hide_plan` do Strapi; nenhuma chamada à API Perl aqui. |
| Consulta pública — Municipais | `PainelMunicipal.tsx` | Strapi `getStrapiLocales()` | — |
| Consulta pública — Estaduais/Distrital | `PainelEstadual.tsx` | Strapi `getStrapiLocales()` (filtro `type: "state"`) | — |
| Consulta pública — Nacional (Comparação/Histórico) | `PainelNacional.tsx`, `GraficoComparacao.tsx`, `GraficoHistorico.tsx` | **API Perl** (`omlpi-api`): `getAreas()`, `getCompareData()`, `getHistoricalData()` | Único ponto do site que consome indicadores quantitativos da API Perl. |
| Consulta pública — Monitoramento | `PainelMonitoramento.tsx` | Nenhuma — placeholder "Em breve" | **Sem endpoint no backend** para dado tabular agregado — limitação documentada, fora do escopo resolver via backend. |
| Upload de Plano | `UploadPlano.tsx` | `POST /api/upload-plan` (proxy) → `omlpi-api /upload_plan` | Proxy necessário porque `OMLPI_API_URL` é server-only. |
| Contato | `Contato.tsx` | **Web3Forms** (`lib/contact.ts`, POST direto do client) | Substituiu o fluxo original via link `wa.me` (WhatsApp) na Fase 2. Os comentários dentro de `Contato.tsx` ainda descrevem o fluxo antigo — desatualizados, o código real usa Web3Forms. |
| Página institucional (`/paginas/[slug]`) | `app/paginas/[slug]/page.tsx` | Strapi `getPaginaInstitucional(slug)` | Renderiza HTML gerado pelo editor rich-text do painel via `dangerouslySetInnerHTML`. |
| Política de Privacidade | `PrivacyPolicyModal.tsx` | Strapi `getPrivacyPolicy()` | Exibida em modal (aberto a partir de link no Footer), não em rota própria; `/rastreio` (rota legada) redireciona 301 para `/`. |

### Variáveis de ambiente

Arquivo de referência: `next/.env.local.example`.

| Variável | Propósito | Obrigatória? |
|---|---|---|
| `STRAPI_API_URL` | Base URL do CMS Strapi (server-only) | **Sim** — lança erro em runtime se ausente |
| `OMLPI_API_URL` | Base URL da API Perl, já com sufixo `/v2` (server-only) | **Sim** — idem |
| `NEXT_PUBLIC_STRAPI_URL` | Mesma base do Strapi, exposta ao client (usada para montar URLs absolutas de arquivos em componentes client) | Recomendada — tem fallback hardcoded para a URL de produção, mas **não está documentada** no `.env.local.example` apesar de usada em vários componentes |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Chave pública do Web3Forms (plano gratuito) para o formulário de Contato | **Sim**, para o formulário funcionar — sem ela `submitContactForm()` lança erro |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 (Measurement ID `G-XXXXXXXXXX`), condicionado a consentimento de cookies | Opcional |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Facebook Pixel, idem | Opcional |
| `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Observabilidade de erros; `SENTRY_AUTH_TOKEN` só é necessário para subir source maps no build de produção | Opcional em dev |
| `CMS_SEARCH_API_URL` | Variável **órfã** — a busca full-text (`omlpi-cms-search`) foi removida do front; nenhum código a consome mais | Não usar |

### Como rodar localmente

```bash
cd next
npm install
cp .env.local.example .env.local
# preencher STRAPI_API_URL, OMLPI_API_URL, NEXT_PUBLIC_WEB3FORMS_KEY
# (e, idealmente, NEXT_PUBLIC_STRAPI_URL)
npm run dev
# http://localhost:3000
```

Scripts disponíveis (`next/package.json`): `dev`, `build` (inclui upload de source maps ao Sentry se `SENTRY_AUTH_TOKEN` estiver setado), `start`, `lint`. Não há script `test`.

### Como fazer deploy

Não há `vercel.json` versionado, mas a plataforma-alvo é a **Vercel** — evidenciado por documentação de progresso específica sobre correção de mapas em produção na Vercel, pela integração Sentry+Vercel (`sentry.*.config.ts`) e por instruções de configuração de env vars via "Vercel → Settings → Environment Variables". Deploy é o fluxo padrão da Vercel (push/PR aciona build e preview; produção aponta para a branch principal).

Roteamento de redirects legados é feito em duas camadas:
- `next.config.ts`: redirects estáticos (`/pt/*`, `/planos-pela-primeira-infancia`, `/indicadores`, `/biblioteca`, `/rastreio`).
- `src/proxy.ts` (equivalente ao `middleware.ts` no Next 16): redirects 301 que precisam preservar query string (`/city`, `/comparacao`, `/historico`).

**Pendência conhecida:** `metadataBase` (em `layout.tsx`), `sitemap.ts` e `robots.ts` ainda apontam para um domínio placeholder de fase anterior (`observa.rnpi.org.br`), não para o domínio real de produção (`www.rnpiobserva.org.br`) — precisa ser corrigido antes/durante o cutover final.

---

## `painel-cms/` — painel administrativo

Aplicação React + Vite **separada** do admin nativo do Strapi. Decisão de arquitetura (21/jul, revertendo uma decisão anterior de usar o admin nativo customizado): construir uma SPA própria consumindo a API REST do Strapi via JWT do plugin `users-permissions`, priorizando fidelidade visual ao design aprovado pelo cliente e reduzindo o esforço de customizar o admin nativo do Strapi v3. Não depende de nenhum recurso pago do Strapi (plano Community).

### Stack e dependências principais

| Pacote | Versão | Papel |
|---|---|---|
| `react` / `react-dom` | ^19.2.7 | — |
| `vite` (+ `@vitejs/plugin-react`) | ^8.1.1 / ^6.0.3 | Build tool / dev server |
| `typescript` | ~6.0.2 | `tsc -b` roda como parte do build |
| `react-router-dom` | ^7.18.1 | Roteamento client-side |
| `@tanstack/react-query` | ^5.101.4 | Data-fetching/cache do servidor — não há Redux/Zustand |
| `@tiptap/react` + extensões | ^3.28.0 | Editor rich-text (Textos Institucionais) |
| `@hello-pangea/dnd` | ^18.0.1 | Drag-and-drop (reordenação de FAQs) |
| `react-dropzone` | ^19.1.1 | Upload de arquivos |
| `papaparse` | ^5.5.4 | Importação de CSV |
| `xlsx` (SheetJS) | ^0.18.5 | Importação/exportação de XLSX |
| `lucide-react` | ^1.25.0 | Ícones |
| `@radix-ui/react-alert-dialog` | ^1.1.21 | Único componente Radix usado — não há kit de UI completo (sem MUI/Chakra/shadcn); componentes em `src/components/ui/` são feitos à mão |
| `oxlint` | ^1.71.0 | Lint |

Sem suíte de testes automatizados (nenhuma dependência ou arquivo de teste encontrado).

### Estrutura de pastas

```
painel-cms/
├── vite.config.ts               # config mínima (plugin react) — porta 5173 é o default puro do Vite
├── vercel.json                  # rewrite SPA fallback (todas as rotas -> index.html)
├── index.html                   # título "Painel de Conteúdo — Observa RNPI"
└── src/
    ├── main.tsx, App.tsx
    ├── router/index.tsx          # todas as rotas, lazy-loaded (exceto Login)
    ├── contexts/AuthContext.tsx  # user, jwt, login(), logout()
    ├── lib/
    │   ├── strapi.ts             # tipos TS de todas as entidades Strapi
    │   ├── api.ts                # apiFetch() — wrapper fetch com JWT + tratamento de 401
    │   ├── auth.ts                # loginUser() -> POST /auth/local
    │   ├── excelParser.ts         # parse/gera XLSX para importação de planos
    │   └── media.ts
    ├── hooks/                    # um hook por domínio: planos/ faqs/ guias/ localidades/
    │   │                         # midiateca/ sobre/ usuarios/ configuracoes/ elabore-plano/ textos/
    │   └── useSpreadsheetImport.ts   # engine genérica de importação, reaproveitada entre módulos
    ├── components/
    │   ├── layout/                # AppShell, Sidebar, Topbar
    │   ├── planos/ faqs/ midiateca/ localidades/ textos/ sobre/ guias/ usuarios/
    │   ├── import/                # ImportModal, ImportPreviewTable, ImportReport — genéricos
    │   └── ui/                    # Avatar, ConfirmDialog, EditorialBadge, StatusBadge, Toast
    ├── pages/                    # 15 páginas (ver tabela abaixo)
    ├── styles/ (tokens.css, base.css)   # design tokens em CSS puro — sem Tailwind
    └── types/import.ts
```

### Autenticação e comunicação com o Strapi

- **Login:** `src/lib/auth.ts` → `loginUser()` faz `POST {VITE_STRAPI_URL}/auth/local` (plugin `users-permissions` nativo do Strapi), com `{identifier, password}`.
- **Armazenamento do token:** `sessionStorage` (chaves `cms_jwt`, `cms_user`) — **não** `localStorage`, então a sessão não sobrevive ao fechar a aba.
- **Cliente HTTP genérico:** `src/lib/api.ts` → `apiFetch(path, init)` injeta `Authorization: Bearer <jwt>` em toda chamada, lendo o token do `sessionStorage`. Em resposta `401`, limpa a sessão e força `window.location.href = '/login'`. Não há refresh token (Strapi v3 `users-permissions` não emite um).
- **React Query por domínio:** cada content-type tem hooks `useX` (listagem), `useXCount` (paginação/contadores) e mutations (`create`/`update`/`delete`) que invalidam a query correspondente após sucesso.
- **Regra crítica de Draft & Publish:** o payload de `published_at` nunca pode ser omitido em `PUT`/`POST` para content-types com Draft & Publish ativo (`plano`, `faq`, `pagina-institucional`, `banners`, `sobre`, `elabore-planos`) — campo ausente/`undefined` aciona um bug de auto-publicação do Strapi v3. `null` = rascunho, ISO string = publicado; sempre reenviado explicitamente.
- **Endpoints customizados do Strapi** consumidos pelo painel (implementados em `omlpi-cms/api/`, sem content-type tradicional por trás — ver seção Strapi abaixo): `/role-lookup`, `/midiateca-publica` (+ `/bulk`, `/:id`), `/cms-config`.

### Páginas e funcionalidades

| Página/Rota | Funcionalidade | Content-type(s)/endpoint Strapi |
|---|---|---|
| `/login` | Autenticação | `/auth/local` |
| `/dashboard` | Home pós-login, atalhos de navegação (sem métricas/analytics — fora do MVP contratual) | — |
| `/inicio` | Edição do banner/hero da home pública | `banners` (singleType) |
| `/planos` | CRUD de planos, abas por `estado_editorial`, seleção múltipla + ações em lote (publicar/revisão/arquivar/rascunho), importação CSV/XLSX, exportação XLSX, upload de PDF | `plano`, `categoria`, `tags` |
| `/localidades` | Vincula plano de origem a município/estado, upload de PDF direto, flags `is_law`/`hide_plan` | `locales`, `plano` |
| `/midiateca` | Biblioteca de mídia: upload, toggle público/privado (individual e em lote), exclusão | `/upload/files`, `/midiateca-publica` (custom) |
| `/guias` | CRUD de documentos/guias de referência | `guias` |
| `/faqs` | CRUD de FAQs com reordenação por drag-and-drop, fluxo editorial completo | `faq`, `categoria` |
| `/textos`, `/textos/novo`, `/textos/:id` | CRUD de páginas institucionais com editor rich-text (TipTap), preview de URL pública, autosave, fluxo editorial | `pagina-institucional` |
| `/sobre` | CRUD das abas "Quem Somos" | `sobre` |
| `/memoria` | **View sintética** sobre o mesmo content-type de Sobre — filtra client-side por título contendo "memória"/"histórico" (só update, sem create/delete) — não é um content-type próprio no Strapi | `sobre` (filtrado) |
| `/elabore-plano` | Edição do singleType "Elabore o Plano" | `elabore-planos` (singleType) |
| `/usuarios` | CRUD de usuários do painel, atribuição de perfil (Administrador/Editor/Revisor) | `/users` (users-permissions), `/role-lookup` (custom) |
| `/configuracoes` | Nome do site, idioma, fuso, autosave, toggle "exigir revisão antes de publicar" | `/cms-config` (custom, persistido via `strapi.store()`, não é content-type tradicional) |

Rotas protegidas por `ProtectedRoute` (redireciona para `/login` sem sessão); `/` e catch-all redirecionam para `/dashboard`.

### Variáveis de ambiente

Arquivo de referência: `painel-cms/.env.local.example`.

| Variável | Propósito | Obrigatória? |
|---|---|---|
| `VITE_STRAPI_URL` | Base URL da API REST do Strapi | Recomendada — há fallback hardcoded para a URL de produção, mas deve ser setada para apontar a outros ambientes |
| `VITE_SITE_URL` | URL pública do site (`next/`), usada só para montar o link de preview nos cards/editor de Textos Institucionais | Não — fallback seguro sem link se ausente |

### Como rodar localmente

```bash
cd painel-cms
npm install
cp .env.local.example .env.local
# ajustar VITE_STRAPI_URL se necessário
npm run dev
# http://localhost:5173 (porta default do Vite — sem override em vite.config.ts)
```

Scripts disponíveis: `dev` (Vite), `build` (`tsc -b && vite build`), `lint` (oxlint), `preview`.

Deploy: também Vercel, com `vercel.json` fazendo rewrite de SPA (`/(.*) → /index.html`), necessário porque o React Router não é resolvido nativamente pela Vercel em rotas client-side.

---

## Strapi (`omlpi-cms/`)

Strapi **v3.3.3** (Node 14) — versão estável final do v3, porém em EOL desde 2023. Hospedado em produção em `https://omlpi-strapi.rnpiobserva.org.br`, com `/admin` protegido por HTTP Basic Auth via Nginx (mitigação de segurança aplicada após o painel ter ficado exposto publicamente).

> **Nota sobre o histórico de commits desta pasta:** dos ~36 mil acréscimos de linha registrados em `omlpi-cms/` no histórico do git, a grande maioria não é desenvolvimento novo — é a materialização de dois eventos administrativos: a importação do código real do submódulo (`065c134`, 2026-07-09) e um `rsync` de sincronização com o servidor de produção (`289207a`, *"sync do repo local com os arquivos do servidor real"*, 2026-07-16, -1.556 linhas — corrigia divergência entre o clone local desatualizado e o Strapi real em produção). O desenvolvimento novo de fato, para este contrato, é bem mais enxuto: os content-types `categoria`/`plano`/`faq`/`pagina-institucional` (`241a82d`, 16 arquivos/404 linhas), a habilitação de permissões públicas para eles (`c8f0e4b`), e os módulos subsequentes (`elabore-planos`, vínculo `plano_origem` em `locales`, trava de revisão, Guias/Documentos) — listados na tabela de content-types novos acima.

### Content-types existentes (pré-existentes ao redesign do painel — intocados)

| Content-type | Tipo | Consumido por |
|---|---|---|
| `banners` | singleType | Hero do `next/` |
| `eixos` | collection | Blocos de eixo temático (não usado ativamente na seção one-page atual) |
| `noticias` | collection | Faixa de notícias (não usado ativamente na seção one-page atual) |
| `sobre` (`sobres`) | collection | Seção "Sobre" do `next/`, módulo `/sobre` e `/memoria` do painel |
| `textoindicadors` | singleType | Texto introdutório (uso pontual) |
| `guias` | collection | Midiateca/PNIPI do `next/`, módulo `/guias` do painel |
| `tags`, `tags-alias` | collection | Taxonomia de artigos |
| `artigos` | collection | Biblioteca de artigos — busca full-text feita pelo `omlpi-cms-search`, **não usada atualmente pelo `next/`** |
| `locales` | collection | Consulta pública (mapa, painéis municipal/estadual), módulo `/localidades` do painel |
| `politica-de-privacidade` | singleType | Modal de política de privacidade do `next/` |
| `infographics` | singleType | **Content-type morto** — zero uso confirmado, não incluído no painel novo |
| `listaplanos` | singleType | Sem sobreposição com `plano` (conceito diferente) — deixado intocado |

### Content-types novos (criados para o painel/redesign)

| Content-type | Tipo | Campos principais | Papel |
|---|---|---|---|
| `plano` | collection, Draft & Publish | `titulo`, `descricao`, `documento` (upload), `categoria`, `tags`, `estado_editorial` (enum) | Registro de plano por localidade — módulo `/planos` do painel |
| `faq` | collection, Draft & Publish | `pergunta`, `resposta` (richtext), `categoria`, `ordem`, `estado_editorial` | Módulo `/faqs` — única collection com ordenação manual (requisito contratual 5.1g) |
| `pagina-institucional` | collection, Draft & Publish | `titulo`, `slug` (uid), `conteudo` (richtext), `capa`, `seo_meta_titulo`, `seo_meta_descricao`, `estado_editorial` | Textos institucionais — módulo `/textos` do painel, consumido em `next/app/paginas/[slug]` |
| `categoria` | collection | `nome`, `slug` | Taxonomia compartilhada entre `plano` e `faq` |
| `elabore-planos` | singleType, Draft & Publish | `titulo_secao`, `titulo_guia`, `descricao` (richtext), `capa`, `arquivo`, `image_position` | Seção "Elabore o Plano" do `next/` |

### Endpoints customizados (sem content-type tradicional, implementados como controller próprio em `omlpi-cms/api/`)

| Endpoint | Arquivo | Função |
|---|---|---|
| `GET/PUT /cms-config` | `api/cms-config/controllers/cms-config.js` | Persiste configurações gerais do painel via `strapi.store()` (tabela `core_store` do plugin), com merge no PUT e valores padrão |
| `GET /midiateca-publica`, `PUT /midiateca-publica/:id`, `PUT /midiateca-publica/bulk` | `api/midiateca-publica/controllers/midiateca-publica.js` | Estende o plugin Upload nativo (que não tem conceito de público/privado) com o campo `is_public`; expõe só arquivos públicos ao endpoint de leitura, mantendo `/upload/files` sempre autenticado |
| `GET /role-lookup` | `api/role-lookup/controllers/role-lookup.js` | Retorna só os 3 perfis do painel (Administrador/Editor/Revisor), contornando a policy `admin::hasPermissions` que bloqueia o endpoint nativo `/users-permissions/roles` para usuários não-admin |

### Fluxo editorial customizado

O requisito contratual de "publicar/despublicar" com revisão em 4 estados (Rascunho → Em revisão → Publicado → Arquivado) **não usa o Review Workflows nativo do Strapi** (recurso pago, Growth/Enterprise). Foi implementado como campo próprio `estado_editorial` (enum), replicado manualmente no schema de `plano`, `faq` e `pagina-institucional`. Esse campo é independente do campo nativo `published_at`/Draft & Publish, que continua controlando o binário rascunho/publicado nativo do Strapi em paralelo.

Mudanças de schema em produção são aplicadas manualmente via SSH/`docker compose restart` + migração SQL manual quando necessário — **não há pipeline de migração automatizada** para o Strapi.

---

## Integrações externas

| Serviço | Consumido por | Propósito |
|---|---|---|
| **Strapi** (`STRAPI_API_URL` / `VITE_STRAPI_URL`) | `next/` (leitura, server-only), `painel-cms/` (CRUD, via JWT) | Conteúdo institucional/editorial |
| **API Perl `omlpi-api`** (`OMLPI_API_URL`, base `/v2`) | `next/` (leitura server-only e proxy de upload) | Indicadores, localidades, comparação, série histórica, upload de plano |
| **`omlpi-cms-search`** (roteado por path em `/artigos` no mesmo domínio do Strapi) | Não consumido atualmente por `next/` (aba removida) | Busca full-text de artigos — legado |
| **Web3Forms** (`NEXT_PUBLIC_WEB3FORMS_KEY`) | `next/` (client, `lib/contact.ts`) | Envio do formulário de Contato, sem backend próprio |
| **Highcharts / Highcharts Maps** (CDN `unpkg.com`) | `next/` (client, `MapaBrasil.tsx`, `GraficoComparacao.tsx`, `GraficoHistorico.tsx`) | Mapa do Brasil com drilldown e gráficos de comparação/histórico — carregado em runtime, não é dependência npm |
| **Sentry** | `next/` | Observabilidade de erros (client/server/edge) |
| **Google Analytics 4 / Facebook Pixel** | `next/` (client, atrás de `CookieBanner`/consentimento) | Analytics/marketing |

---

## Fluxo de conteúdo (do painel ao site)

1. Um editor autentica no **`painel-cms/`** (JWT via `/auth/local`) e cria/edita um registro em um content-type do Strapi (ex: um `plano`, uma `faq`, uma `pagina-institucional`).
2. O painel salva o registro com `estado_editorial: "rascunho"` por padrão. Se a opção "exigir revisão antes de publicar" estiver ativa em `/configuracoes` (`cms-config`), o conteúdo precisa passar por `"revisao"` antes de poder ir a `"publicado"`.
3. Ao mover para `"publicado"`, o painel também garante `published_at` preenchido (ISO string) no mesmo payload — é o campo nativo do Draft & Publish do Strapi que efetivamente controla se o registro aparece nas consultas públicas (não autenticadas) da API REST.
4. O **`next/`**, ao renderizar cada seção (Server Components, sem cache de aplicação própria — depende do cache do Next/CDN), busca os dados diretamente do Strapi via `lib/strapi.ts`, usando os mesmos padrões de query (`_limit`, `_sort`, `_where`, `_start`) já validados em produção. Conteúdo `"arquivado"` ou com `published_at` vazio não é retornado nessas consultas públicas.
5. Para o módulo Textos Institucionais, o registro publicado passa a responder em `next/app/paginas/[slug]`, usando o `slug` (campo `uid`) definido em `pagina-institucional` — o painel mostra um link de preview usando `VITE_SITE_URL` + esse slug.
6. Arquivos (PDFs, imagens) sobem pelo plugin Upload nativo do Strapi a partir do painel (dropzone); no caso da Midiateca, um passo adicional marca o arquivo como `is_public` via o endpoint customizado `/midiateca-publica` antes que ele apareça nas consultas públicas.

---

## Decisões técnicas relevantes

**No `next/`:**
- Nunca usar `populate=` ou GraphQL contra o Strapi — o front nunca usou nenhum dos dois; manter os padrões de query já documentados (`_limit`, `_sort`, `_q`, `_where`, `_start`).
- `STRAPI_API_URL` e `OMLPI_API_URL` são **server-only** — nunca expor no client. Qualquer necessidade de acesso do client passa por um proxy em `app/api/*`.
- `plan.url` (retornado pela API Perl) deve ser usado como veio, nunca concatenado manualmente com uma base URL — bug conhecido de barra dupla gera erro 400 no backend Perl.
- `banners` e `textoindicadors` são `singleType` no Strapi — funções que os buscam não recebem `_sort` nem retornam array.
- `getLocales()` normaliza defensivamente dois formatos possíveis de resposta da API Perl (`{ locales: [...] }` vs. array plano) — manter esse padrão ao integrar novos endpoints dessa API.
- Uso de `src/proxy.ts` em vez de `middleware.ts` é obrigatório nesta versão do Next (16.2.10) — não assumir convenções de versões anteriores.
- Highcharts via CDN é uma escolha deliberada (evita bundle size), mas cria dependência de disponibilidade externa do `unpkg.com` em runtime, sem pinning/SRI nas tags `<Script>`.

**No `painel-cms/`:**
- Nunca omitir `published_at` em `PUT`/`POST` para content-types com Draft & Publish — omitir/`undefined` aciona auto-publicação indevida (bug do Strapi v3).
- Nunca usar o Review Workflows ou o Content History nativos do Strapi — são recursos pagos (Enterprise), fora do plano Community contratado. O fluxo de revisão de 4 estados e qualquer necessidade futura de versionamento devem ser resolvidos com content-types/campos próprios.
- Nunca chamar `/users-permissions/roles` nativo para listar perfis — é bloqueado por policy; usar `/role-lookup`.
- Nunca tratar `/upload/files` como fonte pública — não existe conceito nativo de público/privado no plugin Upload do Strapi v3; usar sempre `/midiateca-publica`.
- JWT fica em `sessionStorage`, não em `localStorage` — sessão não persiste entre reinícios do navegador (decisão implícita de escopo de sessão).
- `/memoria` é uma view sintética sobre o content-type `sobre` (filtro client-side por palavras-chave no título) — não criar/esperar um content-type `memoria` dedicado no Strapi.
- Sem dashboard analítico, busca global ou notificações — cortados do design por não serem requisito contratual (ver `docs/CMS_ESCOPO_MVP.md`).

**Entre repositórios:**
- `omlpi-api` e `omlpi-cms-search` são contratos fixos — qualquer funcionalidade sem endpoint correspondente é uma limitação documentada, nunca um convite a alterar esses dois repositórios.
- `omlpi-www` não é modificado durante a migração — é referência de comportamento até o cutover.
- `design-reference-cms/` (e o equivalente `design-reference/`, ignorado no git) servem só para extrair tokens visuais e composição de layout — nunca rodar, buildar ou importar código de lá.

---

## Histórico de desenvolvimento

Reconstruído a partir de `git log --stat`/`git log --follow` sobre os 168 commits do repositório (primeiro commit: 2024-10-18; commit mais recente na branch `main` no momento desta documentação: `112ff3d`, 2026-09-04).

### Linha do tempo

| Data | Commit | Marco |
|---|---|---|
| 2024-10-18 → 2024-12 | `6e67810` … | Repositório iniciado (autor: Renato Cron) como infraestrutura do stack legado — `docker-compose.yml`, config de Nginx, submódulos `omlpi-www`, `omlpi-cms`, `omlpi-api`, `omlpi-cms-search`. 31 commits nesse período, todos fora de `next/`/`painel-cms/` (ainda não existiam). |
| 2026-06-11 | `cc8538f` | Submódulos Git removidos — o monorepo passa a versionar `omlpi-api`, `omlpi-cms` e `omlpi-cms-search` como pastas normais, preparando o deploy do front na Vercel. |
| 2026-07-08 | `d0e686c` | **Início do desenvolvimento novo:** primeiro commit em `next/` — "fase 1 da migração de stack" (App Router, layout base, `lib/strapi.ts`, `lib/omlpi-api.ts`, `lib/contact.ts`). |
| 2026-07-09 | `065c134` | Código real dos três backends legados materializado no repo (230 arquivos, 47.270 linhas) — confirma que `omlpi-api`/`omlpi-cms-search` entraram no monorepo como estavam, sem alteração de conteúdo. |
| 2026-07-09 – 2026-07-15 | `f3849a7` … `a1cbcb7` | Fases 2–3 do site: seções institucionais, bloco de Consulta Pública integrado à home, migração do formulário de Contato para Web3Forms. |
| 2026-07-15/16 | `426919a`, `289207a` | Strapi de produção investigado via `docker exec`; repo local de `omlpi-cms/` sincronizado (`rsync --delete`) com o código real do servidor — correção de uma leitura anterior desatualizada sobre a versão/schemas do CMS. |
| 2026-07-16 | `241a82d`, `c8f0e4b` | **Início do redesign do CMS:** criação dos 4 content-types novos (`categoria`, `plano`, `faq`, `pagina-institucional`) e habilitação de permissões públicas — primeira mudança de schema no Strapi desde que o projeto começou. |
| 2026-07-21 | `c675e79` | **Início de `painel-cms/`:** fundação da aplicação React + Vite (auth, layout shell, rotas placeholder) — decisão final pelo "Caminho A2" (app separada) em vez de customizar o admin nativo do Strapi. |
| 2026-08 | — | Mês de maior atividade (71 commits): grosso das fases 3–5 do site (mapa com geojson real, painéis municipal/estadual/nacional, SEO/tracking) e das fases 2–4 do painel (Planos, FAQs, Midiateca, Localidades, Usuários, importação/exportação, trava de revisão). |
| 2026-08-17 | `d33a0be` | Vínculo `plano_origem` entre `locales` (Strapi) e `plano` — painel passa a detectar automaticamente quando o PDF de uma localidade está desatualizado em relação ao plano vinculado. |
| 2026-08-21 → 2026-09-04 | `d641ae2` … `112ff3d` | Fase 5 e ajustes finais de lançamento: módulo "Elabore o Plano" (site + painel), correções de layout, migração de conteúdo do módulo Sobre para uma visão "Histórico"/"Memória" editável. |

### Volume por área (commits e linhas, `git log --shortstat`)

| Pasta | Commits | Linhas + | Linhas − | Autores | Janela de atividade |
|---|---|---|---|---|---|
| `next/` | 76 | ~119.100 | ~52.500 | julio-cesar96 (62), Julio Cesar Brito da Silva (14) — mesma pessoa, dois identificadores git | 2026-07-08 → 2026-09-04 |
| `painel-cms/` | 33 | ~22.400 | ~600 | julio-cesar96 (33) | 2026-07-21 → 2026-09-04 |
| `omlpi-cms/` (legado + redesign) | 17 | ~36.150¹ | ~5.175¹ | julio-cesar96 | 2026-07-15 → 2026-08-21 |
| `omlpi-api/` | 8 | — | — | Renato Cron (maioria), 1 commit de materialização por julio-cesar96 | Sem alteração de conteúdo desde 2026-07-08 |
| `omlpi-www/` | 21 | — | — | Renato Cron, julio-cesar96 (fase pré-migração) | **Zero commits desde 2026-07-08** — confirma que a regra "não modificar" de `AGENTS.md` foi respeitada na prática |
| `docs/` | 44 | — | — | julio-cesar96 | Acompanha as fases do site e do painel |

¹ Ver nota na seção do Strapi acima — a maior parte dessas linhas vem de dois commits administrativos (importação do submódulo e sync com produção), não de desenvolvimento incremental.

Contagem de arquivos no estado atual (excluindo `node_modules`/build): **125 arquivos em `next/`**, **135 arquivos em `painel-cms/`**.

### O que isso confirma sobre as regras de escopo

A leitura do histórico bate com o que `AGENTS.md` descreve como regra, não só como intenção:

- **`omlpi-www` nunca foi tocado** depois que a migração começou (2026-07-08) — nenhum commit no período.
- **`omlpi-api` teve um único commit** no período, e é puramente administrativo (materialização do submódulo em arquivos normais) — nenhuma mudança de código Perl.
- **`omlpi-cms` só passou a receber desenvolvimento novo a partir de 2026-07-16** (`241a82d`), exatamente no início da fase de redesign do painel — antes disso, os únicos commits eram de sincronização/infra, consistente com a nota de fase em `AGENTS.md` que libera `omlpi-cms` de ser somente-leitura "a partir da fase de redesign do painel administrativo".
- **`next/` e `painel-cms/` concentram praticamente todo o desenvolvimento novo do projeto** (109 dos 168 commits do repositório, ~65%), confirmando que são, de fato, o escopo ativo deste contrato.

## Referências adicionais

- `docs/API_CONTRACTS.md` — contratos detalhados de API (Strapi + Perl), campo a campo.
- `docs/PLANO_ONEPAGE.md` — arquitetura e fases da migração do site.
- `docs/CMS_ESCOPO_MVP.md` — escopo contratual vs. design completo do painel.
- `docs/progresso/` — histórico fase a fase da migração do site (`next/`).
- `docs/progresso-cms/` — histórico fase a fase do redesign do painel (`painel-cms/`).
- `AGENTS.md` — convenções e regras de escopo para trabalho assistido por IA neste monorepo.
- `importacao.md` — detalhes do script de importação de dados da API Perl.
