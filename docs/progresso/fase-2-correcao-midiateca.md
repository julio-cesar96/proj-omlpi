# Fase 2 — Correção da Midiateca: `omlpi-cms-search` como fonte de artigos

**Branch:** `feature/nextjs-migration`
**Data:** 2026-07-10
**Diretório de trabalho:** `next/` (nenhum arquivo em `omlpi-www/`, `omlpi-api/`, `omlpi-cms/` ou `omlpi-cms-search/` foi tocado)

---

## 1. Problema corrigido

A Fase 2 implementou a aba **Artigos** da Midiateca chamando `getArtigos()` de
`lib/strapi.ts` e um Route Handler proxy em `/api/artigos` que encaminhava as
requisições ao mesmo Strapi. Isso estava incorreto conforme
`docs/API_CONTRACTS.md §3`: **o Strapi não tem full-text search nativo** — a
busca por texto e o filtro por tags só existem no serviço separado
`omlpi-cms-search` (Node + Restify + PostgreSQL com `plainto_tsquery`).

**Confirmação explícita:** a busca por texto e o filtro por tag agora batem no
`omlpi-cms-search`, não no Strapi.

---

## 2. Contratos reais extraídos de `omlpi-cms-search/src/index.js`

| Aspecto | `omlpi-cms-search` (correto) | Strapi (incorreto — fase anterior) |
|---|---|---|
| Busca full-text | `_q` → `plainto_tsquery` pt-BR + unaccent | `_q` básico, sem full-text real |
| Filtro de tags | `_where[tags][]=id` (inclusivo) | `_where[tags_in][]=id` |
| Paginação | `_offset` / `_start` (aliases) | `_start` |
| Shape de resposta | `{ hasMore, limit, offset, results[] }` | array plano |
| Campo de resumo | `description` | `summary` |
| Campos extras | `author`, `organization`, `youtube` | — |

---

## 3. Arquivos modificados

### 3.1 `next/src/lib/cms-search.ts` — **[NOVO]**

Cliente tipado para o `omlpi-cms-search`. Segue o mesmo padrão estrutural de
`lib/omlpi-api.ts`:

- `getCmsSearchUrl()` — lê `CMS_SEARCH_API_URL`, lança erro descritivo se ausente
- `cmsSearchGet<T>()` — helper genérico de fetch com `cache: "no-store"`
- `CmsSearchTag` — shape de tag (compatível com Strapi)
- `CmsSearchFile` — shape de upload (ROW_TO_JSON do PostgreSQL)
- `CmsSearchArtigo` — shape completo do artigo (com `description`, `youtube`, `author`, etc.)
- `CmsSearchArtigosResponse` — wrapper paginado `{ hasMore, limit, offset, results[] }`
- `CmsSearchArtigosParams` — params tipados para `searchArtigos()`
- `searchArtigos(params?)` — função exportada; monta `URLSearchParams` corretamente
  (incluindo `_where[tags][]` via `append` para arrays)

### 3.2 `next/src/app/api/artigos/route.ts` — **[MODIFICADO]**

- Trocou `STRAPI_API_URL` → `CMS_SEARCH_API_URL`
- Whitelist de params atualizada: `_q`, `_limit`, `_start`
- Tradução transparente de filtro de tags:
  - Recebe do `MidiatecaClient`: `_where[tags_in][]=id` (padrão Strapi)
  - Reenvia ao `omlpi-cms-search`: `_where[tags][]=id`
  - O `MidiatecaClient` não precisou mudar sua lógica de montagem de query

### 3.3 `next/src/components/sections/Midiateca.tsx` — **[MODIFICADO]**

- Import trocado: `getArtigos` de `lib/strapi` → `searchArtigos` de `lib/cms-search`
- `getGuias()` e `getTags()` do Strapi permanecem (metadados que o Strapi serve corretamente)
- Desestrutura `{ results: artigos }` da resposta paginada do `omlpi-cms-search`
- Tipo da prop `artigos` atualizado para `CmsSearchArtigo[]`

### 3.4 `next/src/components/sections/MidiatecaClient.tsx` — **[MODIFICADO]**

- Import: `StrapiArtigo` removido; `CmsSearchArtigo` importado de `lib/cms-search`
- Todos os usos de `StrapiArtigo` substituídos por `CmsSearchArtigo`
- `artigo.summary` → `artigo.description` (campo correto do `omlpi-cms-search`)
- Cast `(artigo as { link?: string }).link` removido; substituído por `artigo.youtube`
  com label "Assistir" e TODO para player embarcado
- Lógica de `hasMore`: simplificada para `data?.hasMore ?? false` (o serviço
  sempre retorna a flag nativamente — não precisa de `results.length === LIMIT`)
- Normalização de `results`: removido fallback `Array.isArray(data)` (o
  `omlpi-cms-search` sempre retorna `{ results[] }`, nunca array plano)
- Props interface do componente e `ArtigosTab` atualizadas

### 3.5 `next/src/lib/strapi.ts` — **[NOTA JSDoc]**

- `getArtigos()` permanece intacta (pode ser usada para outros fins futuros)
- JSDoc atualizado com aviso explícito de não usar para o fluxo da Midiateca

---

## 4. Verificação de qualidade

| Verificação | Resultado |
|---|---|
| `npm run lint` (dentro de `next/`) | ✅ Exit code 0, 0 erros ESLint |
| `npm run build` (Next.js 16.2.10 + Turbopack) | ✅ Exit code 0, 0 erros TypeScript |
| Nenhum arquivo de `omlpi-www/`, `omlpi-api/`, `omlpi-cms/` ou `omlpi-cms-search/` modificado | ✅ Confirmado |
| `CMS_SEARCH_API_URL` server-only (não exposta no client) | ✅ — uso exclusivo em `lib/cms-search.ts` (server component) e Route Handler |
| `STRAPI_API_URL` não mais usada em `/api/artigos` | ✅ Confirmado |

---

## 5. Pendências abertas (inalteradas desta correção)

As pendências da Fase 2 original permanecem. Nenhuma delas é afetada por esta
correção:

1. **Collection "Dúvidas frequentes" do PNIPI** — placeholder estático
2. **Collection "Planos de ação" do PNIPI** — placeholder estático
3. **Fonte dos números do Hero (stats strip)** — constante hardcoded `STATS_PLACEHOLDER`
4. **`textoindicadors`** — seção destino sem decisão de arquitetura
5. **Parâmetros de `data/compare` e `data/historical`** — aguardando confirmação
6. **`metadataBase`** — aguardando domínio final

Nova pendência identificada nesta correção:

7. **`artigo.youtube` sem player embarcado** — quando o artigo tem link YouTube,
   o `ArtigoCard` exibe um link "Assistir" simples. Para exibir um player
   `<iframe>` embarcado, implementar na Fase 3 ou em uma sub-tarefa dedicada.
