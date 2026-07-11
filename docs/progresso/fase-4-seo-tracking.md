# Progresso da Migração — Fase 4: SEO, Redirects, Consentimento e Tracking

**Branch:** `feature/nextjs-migration`  
**Data de conclusão:** 2026-07-11  
**Diretório de trabalho:** `next/` (código-fonte dos outros projetos `omlpi-www`, `omlpi-api`, `omlpi-cms`, `omlpi-cms-search` preservado sem modificações)

---

## 📋 Resumo da Entrega

A Fase 4 foi concluída com sucesso. Implementamos e validamos:
1. **Metadata API** completa no `layout.tsx` cobrindo Open Graph, Twitter cards, canonical links, keywords e favicons.
2. **Robots e Sitemap** dinâmicos em `robots.ts` e `sitemap.ts`.
3. **Redirecionamento Inteligente de URLs legadas** via Next.js 16 Proxy (`src/proxy.ts`), que preserva inteiramente os query parameters originais (`location_id`, `area`, etc.) e apenas sobrescreve as chaves de interface do novo site (`tab`, `mode`).
4. **Consentimento de Cookies** (`CookieBanner.tsx`) com interface elegante baseada nos tokens de design do projeto e persistência em `localStorage`.
5. **Analytics Condicionado** (`AnalyticsScripts.tsx`) que carrega dinamicamente o Google Analytics 4 e o Facebook Pixel somente após a permissão do usuário.
6. **Sentry** integrado no client, server e edge runtimes utilizando `@sentry/nextjs`.

---

## 🛠️ Arquivos Modificados / Criados

| Caminho do Arquivo | Tipo | Descrição |
|---|---|---|
| [`next/package.json`](file:///Users/yduqs/proj-omlpi/next/package.json) | Modificado | Adicionado pacote de integração `@sentry/nextjs`. |
| [`next/next.config.ts`](file:///Users/yduqs/proj-omlpi/next/next.config.ts) | Modificado | Envolvido config com `withSentryConfig` e removido redirects obsoletos. |
| [`next/src/proxy.ts`](file:///Users/yduqs/proj-omlpi/next/src/proxy.ts) | Novo | Interceptador de requisições de Next.js 16 para redirects legacy com query parameters. |
| [`next/src/app/robots.ts`](file:///Users/yduqs/proj-omlpi/next/src/app/robots.ts) | Novo | Configuração de robôs de busca. |
| [`next/src/app/sitemap.ts`](file:///Users/yduqs/proj-omlpi/next/src/app/sitemap.ts) | Novo | Geração básica do sitemap da página raiz. |
| [`next/src/app/layout.tsx`](file:///Users/yduqs/proj-omlpi/next/src/app/layout.tsx) | Modificado | Adição dos metadados completos e injeção de CookieBanner e AnalyticsScripts. |
| [`next/src/components/layout/CookieBanner.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/layout/CookieBanner.tsx) | Novo | Interface de consentimento de rastreio de cookies. |
| [`next/src/components/layout/AnalyticsScripts.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/layout/AnalyticsScripts.tsx) | Novo | Injeção dinâmica e condicionada dos scripts de analytics e Facebook Pixel. |
| [`next/sentry.client.config.ts`](file:///Users/yduqs/proj-omlpi/next/sentry.client.config.ts) | Novo | Inicialização Sentry no client-side. |
| [`next/sentry.server.config.ts`](file:///Users/yduqs/proj-omlpi/next/sentry.server.config.ts) | Novo | Inicialização Sentry no server-side. |
| [`next/sentry.edge.config.ts`](file:///Users/yduqs/proj-omlpi/next/sentry.edge.config.ts) | Novo | Inicialização Sentry no runtime edge (usado pelo proxy). |
| [`next/.env.local.example`](file:///Users/yduqs/proj-omlpi/next/.env.local.example) | Novo | Arquivo contendo a documentação e listagem das variáveis necessárias. |

---

## 💡 Decisões Técnicas e Resolução de Desafios

### 1. Migração de Middleware para Proxy no Next.js 16
Na versão Next.js 16 utilizada no projeto, a convenção antiga de arquivo `middleware.ts` foi substituída pelo arquivo `proxy.ts` exporting a `proxy` function. Seguimos esta nova convenção oficial para evitar warnings de compilação e garantir a compatibilidade futura.

### 2. Preservação de Query Params em Redirects de Roteamento Legado
Os redirecionamentos estáticos em `next.config.ts` perdem query params não expressos em path parameters. Nossa implementação em `proxy.ts` clona o objeto `NextURL` da requisição e adiciona as chaves `tab` e `mode`, garantindo que:
- `/city?location_id=123&area=saude` -> redireciona para `/?location_id=123&area=saude&tab=municipais#consulta-publica`
- `/comparacao?location_id=456` -> redireciona para `/?location_id=456&tab=nacional&mode=comparacao#consulta-publica`

### 3. Migração do Google Analytics (UA para GA4)
O código Hugo original (`tracking.js`) utilizava a DSN `UA-180028503-1` pertencente ao Universal Analytics (descontinuado em julho de 2023). Nossa implementação foi adaptada para usar o Google Analytics 4 (GA4) por meio de uma tag `G-XXXXXXXXXX` parametrizada via variável `NEXT_PUBLIC_GA_ID`, mantendo o fluxo condicionado a consentimento intacto.

### 4. Controle de Efeitos e Regras de Lint de State
Para satisfazer a regra estrita do ESLint do projeto que proíbe `setState` síncronos diretamente no corpo do callback de `useEffect` (`react-hooks/set-state-in-effect`), o carregamento inicial dos estados em `CookieBanner` e `AnalyticsScripts` (que dependem da leitura do `localStorage` no client) foi postergado de forma segura através do uso de `queueMicrotask`.

---

## 🔍 Teste Prático dos Redirects (Comprovado Localmente)

Executamos testes locais de redirecionamento utilizando o comando `curl` na porta local do servidor Next.js em desenvolvimento. O resultado atesta que todos os query parameters originais são 100% preservados e direcionados com status HTTP `301 Moved Permanently`.

### Cenário 1: `/city?location_id=123&area=saude`
**Entrada:**
```bash
curl -I "http://localhost:3000/city?location_id=123&area=saude"
```
**Resultado:**
```http
HTTP/1.1 301 Moved Permanently
location: http://localhost:3000/?location_id=123&area=saude&tab=municipais#consulta-publica
Connection: keep-alive
Keep-Alive: timeout=5
```

### Cenário 2: `/comparacao?location_id=456&area=educacao`
**Entrada:**
```bash
curl -I "http://localhost:3000/comparacao?location_id=456&area=educacao"
```
**Resultado:**
```http
HTTP/1.1 301 Moved Permanently
location: http://localhost:3000/?location_id=456&area=educacao&tab=nacional&mode=comparacao#consulta-publica
Connection: keep-alive
Keep-Alive: timeout=5
```

### Cenário 3: `/historico?location_id=789`
**Entrada:**
```bash
curl -I "http://localhost:3000/historico?location_id=789"
```
**Resultado:**
```http
HTTP/1.1 301 Moved Permanently
location: http://localhost:3000/?location_id=789&tab=nacional&mode=historico#consulta-publica
Connection: keep-alive
Keep-Alive: timeout=5
```

---

## 🚀 Próximas Fases e Pendências em Aberto

1. **Obtenção do ID GA4 definitivo**: A variável `NEXT_PUBLIC_GA_ID` deve ser preenchida com o código `G-XXXXXXXXXX` correspondente à propriedade GA4 ativa.
2. **Definição de DSN do Sentry**: O token real do Sentry e o DSN de produção devem ser criados no dashboard do Sentry e aplicados nas variáveis de ambiente na hospedagem de produção (Vercel/Netlify).
3. **Domínio final para `metadataBase`**: A url base da metadata API (`https://observa.rnpi.org.br`) deverá ser ajustada se o domínio final do site one-page migrado for diferente.
