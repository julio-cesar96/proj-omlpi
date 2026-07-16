# Correção de Schemas Strapi — Divergências TypeScript

> **Data:** 16/07/2026 | **Branch:** feature/migration-next  
> **Fonte das divergências:** investigação de schemas em `omlpi-cms/api/*/models/*.settings.json`  
> **Relatório de investigação:** `brain/30673250-994d-4f0e-a778-8ea6e125527b/cms_schema_investigation.md`

---

## Resumo das correções aplicadas

Três divergências confirmadas entre schema real do Strapi e as interfaces TypeScript foram corrigidas. Todas as mudanças passaram em `npm run lint` (zero erros/warnings) e `npm run build` (TypeScript sem erros).

---

## 1. `StrapiBanner` — `banners` é singleType, sem `image`/`subtitle`/`link`/`order`

### Problema
A interface `StrapiBanner` declarava campos que **não existem** no schema real:
- `image?: StrapiFile` — não existe
- `subtitle?: string` — não existe  
- `link?: string` — não existe
- `order?: number` — não existe

O schema real de `banners` (singleType) tem apenas: `title` (string) e `text` (richtext).

Além disso, `getBanners()` retornava `Promise<StrapiBanner[]>` (array), mas como `banners` é **singleType**, a API retorna um único objeto.

### Bug visível
`Hero.tsx` usava `firstBanner?.subtitle` para o parágrafo descritivo → sempre `undefined` → caía no fallback estático (que por acaso é o correto, mas pelo motivo errado). `BannerImage` checava `banner?.image?.url` → sempre `undefined` → renderizava o SVG decorativo.

### Correções aplicadas
- **`lib/strapi.ts`:**
  - `StrapiBanner`: removidos `image?`, `subtitle?`, `link?`, `order?`; adicionado `text?` (campo real); `id` tornou-se opcional (singleType não garante `id`)
  - `getBanners(params?)` → `getBanner()` sem parâmetros (singleType ignora `_sort`)
  - Retorno: `Promise<StrapiBanner>` (não array)
- **`components/sections/Hero.tsx`:**
  - Import: `getBanners` → `getBanner`
  - `let banners: StrapiBanner[] = []` → `let banner: StrapiBanner | null = null`
  - `Promise.all([getBanners({ _sort: "order:asc" }), ...])` → `Promise.all([getBanner(), ...])`
  - Removido `const firstBanner = banners[0] ?? null`
  - `firstBanner?.subtitle` → `banner?.text` (campo real) com mesmo fallback estático
  - `BannerImage` simplificada: sem parâmetro (campo `image` não existe no schema); SVG decorativo permanece como visual do Hero
  - Call site: `<BannerImage banner={firstBanner} />` → `<BannerImage />`

### Decisão de design pendente
> [!NOTE]
> O Hero **não renderiza imagem real** do CMS — o schema real de `banners` não tem campo `image`. A área visual do Hero usa SVG decorativo hardcoded. Se o cliente quiser uma imagem real no Hero, será necessário adicionar campo `image` ao content-type `banners` no Strapi — **escopo do redesign do CMS**, não desta migração.

---

## 2. `StrapiSobre` — campo `text` (não `content`), sem campo `order`

### Problema
A interface `StrapiSobre` declarava:
- `content?: string` — campo real é `text` (richtext)
- `tab?: string` — não existe no schema
- `order?: number` — **não existe no schema real**

O schema real de `sobres` (collectionType) tem: `title`, `text`, `image`, `link`, `link_title`, `link2`, `link2_title`.

`getSobres({ _sort: "order:asc" })` tentava ordenar por um campo inexistente → ordem imprevisível (comportamento do Strapi com campo inexistente: fallback silencioso).

### Bug visível
`SobreClient.tsx` renderizava `activeAba.content` → sempre `undefined` → **conteúdo das abas Sobre completamente em branco** no site. Bug crítico.

### Verificação visual — ordem das abas
A ordem atual dos 3 registros de `sobres` no CMS não é controlável via campo `order` (ele não existe). Com `createdAt:asc`, a ordem será a de inserção histórica dos registros. **Não foi possível verificar visualmente a ordem das abas** (API de produção não testada localmente nesta tarefa), mas o sort mudou de comportamento imprevisível (`order` inexistente) para determinístico (`createdAt:asc`).

> [!IMPORTANT]
> **Decisão pendente para o cliente:** A ordem das abas (Quem somos / Resultados / Histórico) atualmente depende da data de criação dos registros no Strapi. Se a ordem precisar ser **controlável via painel**, é necessário adicionar um campo `order` (integer) ao content-type `sobre` no Strapi — isso é escopo do redesign do CMS. Se a ordem estiver correta via `createdAt:asc`, nenhuma ação adicional é necessária.

### Correções aplicadas
- **`lib/strapi.ts`:**
  - `StrapiSobre`: `content?` → `text?`; removidos `tab?`, `order?`; adicionados campos reais `image?`, `link?`, `link_title?`, `link2?`, `link2_title?`
  - Docstring atualizada com aviso sobre ausência de campo `order`
  - `getSobres()`: docstring atualizada recomendando `{ _sort: "createdAt:asc" }`
- **`components/sections/SobreClient.tsx`:**
  - `activeAba.content` → `activeAba.text` (renderização do conteúdo da aba)
  - `renderMarkdown(activeAba.content)` → `renderMarkdown(activeAba.text)`
  - Cast `(activeAba as { image?: { url: string } }).image` removido — `image` agora está tipado em `StrapiSobre`
  - Docstring atualizada: `order:asc` → `createdAt:asc`, `content` → `text`
- **`components/sections/Sobre.tsx`:**
  - `getSobres({ _sort: "order:asc" })` → `getSobres({ _sort: "createdAt:asc" })`
  - Docstring atualizada com aviso sobre ausência de campo `order` no schema

---

## 3. `StrapiTextoIndicador` — campos em português: `titulo`/`texto`

### Problema
A interface `StrapiTextoIndicador` declarava `title?` e `content?`, mas os campos reais do schema são:
- `titulo` (string)
- `texto` (richtext)

Além disso, `textoindicadors` é **singleType** → retorna um único objeto, não array. `getTextoIndicadors()` (plural, retornava `Promise<StrapiTextoIndicador[]>`) estava errado estruturalmente.

### Bug visível
`getTextoIndicadors()` retornava array de um único objeto com campos `titulo`/`texto`, mas a interface tipava `title`/`content` → TypeScript não detectava o erro (campos extras são permitidos via `[key: string]: unknown`), mas o consumidor nunca acharia dados nos campos tipados. Como nenhum componente atual consome `getTextoIndicadors()` diretamente (não há chamada em nenhum componente do `src/`), o bug não produzia efeito visível ainda — mas seria crítico ao implementar o parágrafo introdutório da Midiateca.

### Correções aplicadas
- **`lib/strapi.ts`:**
  - `StrapiTextoIndicador`: `title?` → `titulo?`, `content?` → `texto?`, `id` tornou-se opcional (singleType)
  - `getTextoIndicadors(params?): Promise<StrapiTextoIndicador[]>` → `getTextoIndicador(): Promise<StrapiTextoIndicador>` (sem parâmetros, sem array)
  - Docstring atualizada documentando singleType e campos em português

---

## 4. Verificação final

| Check | Resultado |
|---|---|
| `npm run lint` | ✅ 0 erros, 0 warnings |
| `npm run build` | ✅ TypeScript sem erros, build OK |
| Aviso pré-existente `next.config.ts sentry` | ⚠️ pré-existente, fora do escopo desta tarefa |

---

## 5. Pendências de design (fora do escopo desta migração)

| Item | Descrição | Responsável |
|---|---|---|
| Campo `order` em `sobre` | Sem esse campo, a ordem das abas no CMS não é controlável via painel. Usar `createdAt:asc` como proxy. | Redesign do CMS |
| Imagem no Hero | `banners` não tem campo `image`. Hero usa SVG decorativo. Para imagem real, adicionar campo `image` ao singleType `banners`. | Redesign do CMS |
| Parágrafo introdutório Midiateca | `getTextoIndicador()` corrigido mas nenhum componente consome ainda. Implementar ao conectar o topo da seção Midiateca. | Fase futura |
