# Fase 2 — Seções Institucionais: Resumo de Implementação

**Branch:** `feature/nextjs-migration`
**Data de conclusão:** 2026-07-09
**Diretório de trabalho:** `next/` (nenhum arquivo em `omlpi-www/` foi tocado)

---

## 1. Estrutura de arquivos criada

```
next/src/
├── app/
│   ├── api/
│   │   └── artigos/
│   │       └── route.ts          [NEW] — proxy GET para Strapi (server-only)
│   └── page.tsx                  [MODIFY] — monta todas as seções
└── components/
    ├── layout/
    │   └── Footer.tsx            [MODIFY] — layout 3 col + getPrivacyPolicy() + modal
    └── sections/
        ├── Hero.tsx              [NEW] — server, getBanners + getEixos + stats strip
        ├── Sobre.tsx             [NEW] — server, getSobres({ _sort: "order:asc" })
        ├── SobreClient.tsx       [NEW] — client, tabs com useState
        ├── Pnipi.tsx             [NEW] — server, getGuias({ _sort: "order:asc" })
        ├── PnipiClient.tsx       [NEW] — client, 3 abas (leis real, planos/faq placeholder)
        ├── Midiateca.tsx         [NEW] — server, getGuias + getArtigos + getTags em paralelo
        ├── MidiatecaClient.tsx   [NEW] — client, tabs Documentos e Artigos
        ├── Contato.tsx           [NEW] — client, formulário + WhatsApp redirect
        └── PrivacyPolicyModal.tsx [NEW] — client, modal acessível
```

Também modificado:
- `lib/contact.ts` — `WHATSAPP_NUMBER` preenchido (`5521982581194`), campo `state` adicionado ao `ContactFormData` e à mensagem WhatsApp.

---

## 2. Decisões técnicas

### 2.1 Padrão server/client split

Cada seção com dado do Strapi segue o mesmo padrão:
- **Server Component** (`Sobre.tsx`, `Pnipi.tsx`, `Midiateca.tsx`): busca dados, trata erros com `try/catch` gracioso, passa dados como props.
- **Client Component** (`SobreClient.tsx`, `PnipiClient.tsx`, `MidiatecaClient.tsx`): gerencia estado das tabs com `useState`, sem acesso direto à API.

Vantagem: zero JS de fetch no bundle inicial para dados estáticos; interatividade fica isolada nos client components.

### 2.2 Route Handler proxy para artigos (`/api/artigos`)

A paginação/busca client-side da Midiateca precisa chamar o Strapi a partir do browser. Como `STRAPI_API_URL` é server-only, o `MidiatecaClient` chama `/api/artigos?...` (Route Handler interno) que repassa apenas parâmetros autorizados por whitelist (`_q`, `_where`, `_limit`, `_start`, `_sort`). Nenhuma env var é exposta no client.

### 2.3 Lógica de artigos portada de `articles.js`

Comportamento preservado de `omlpi-www/src/assets/scripts/articles.js`:
- `pagination_limit = 15`, `pagination_offset` incremental no "Carregar mais"
- Nova busca/filtro reseta offset para 0
- `hasMore = response.hasMore ?? results.length === LIMIT`
- Filtro por tags: envia `_where[tags_in][]=id` para cada tag selecionada (equivalente ao `qs.stringify({ _where: { tags } })` do Vue)

### 2.4 Midiateca: duas abas

Decisão aprovada em revisão: aba **Documentos** usa `getGuias()` (grade por categoria: Legislação / Plano Nacional / Guia / Relatório); aba **Artigos** usa `getArtigos()` com busca, tags e paginação. Preserva ambos os comportamentos do site atual sem descartar nenhum.

### 2.5 Contato: WhatsApp confirmado

Número `+55 21 98258-1194` preenchido como `5521982581194`. Formulário valida campos obrigatórios via `validateContactForm()` e exibe feedback inline por campo. Após submit bem-sucedido, exibe estado de confirmação por 3s e reseta o formulário.

### 2.6 Footer: server component com client component filho

`Footer.tsx` permanece server component, busca `getPrivacyPolicy()` e passa `content: string` como prop para `<PrivacyPolicyModal />`. Esse é o padrão correto do App Router — server pode renderizar client components como filhos passando dados serializáveis como props.

### 2.7 PrivacyPolicyModal: acessibilidade

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="privacy-modal-title"`
- Fecha com tecla Escape e clique no backdrop
- Scroll do `body` bloqueado enquanto aberto
- Foco movido para o botão "Fechar" ao abrir; restaurado ao trigger ao fechar

### 2.8 Markdown simples sem dependência

Em vez de instalar `marked` ou similar, a renderização de markdown usa uma função `renderMarkdown()` com regex simples (h1–h3, bold, italic, listas, parágrafos). Suficiente para o conteúdo do Strapi (textos institucionais e política de privacidade). Se a necessidade crescer, trocar por `marked` ou `remark` é uma mudança de 1 linha.

---

## 3. Tabela de componentes e endpoints

| Componente | Tipo | Endpoint(s) |
|---|---|---|
| `Hero.tsx` | Server | `getBanners({ _sort: "order:asc" })`, `getEixos({ _sort: "order:asc" })` |
| `Sobre.tsx` + `SobreClient.tsx` | Server + Client | `getSobres({ _sort: "order:asc" })` |
| `Pnipi.tsx` + `PnipiClient.tsx` | Server + Client | `getGuias({ _sort: "order:asc" })` (aba "Leis e decretos") |
| `Midiateca.tsx` + `MidiatecaClient.tsx` | Server + Client | `getGuias()`, `getArtigos({ _limit: 15, _start: 0 })`, `getTags({ _limit: -1 })` |
| `MidiatecaClient.tsx` (paginação) | Client → Route Handler | `GET /api/artigos?_q=...&_where=...&_limit=15&_start=N` |
| `Contato.tsx` | Client | `buildWhatsAppUrl()` (lib/contact.ts) |
| `Footer.tsx` + `PrivacyPolicyModal.tsx` | Server + Client | `getPrivacyPolicy()` |

---

## 4. Verificação de qualidade

| Verificação | Resultado |
|---|---|
| `npm run lint` | ✅ Exit code 0, 0 erros ESLint |
| `npm run build` (Next.js 16.2.10 + Turbopack) | ✅ Exit code 0, 0 erros TypeScript |
| Nenhum arquivo de `design-reference/` importado em runtime | ✅ Confirmado |
| Nenhum arquivo em `omlpi-www/` modificado | ✅ Confirmado |
| `STRAPI_API_URL` não exposta no client | ✅ — uso exclusivo em server components e Route Handler |

---

## 5. Pendências abertas para a Fase 3

### Da Fase 2 (não implementadas, aguardando confirmação)

1. **Collection "Dúvidas frequentes" do PNIPI** — não há collection documentada em `API_CONTRACTS.md`. Aba implementada com placeholder estático (accordion funcional). Para conectar dados reais: criar a collection no Strapi, confirmar o nome, adicionar função em `lib/strapi.ts`, substituir `FAQ_PLACEHOLDER` em `PnipiClient.tsx`.

2. **Collection "Planos de ação" do PNIPI** — mesmo cenário. Placeholder estático com aviso visível na UI.

3. **Fonte dos números do Hero (stats strip)** — valores atuais são placeholder (`5.570`, `2.022`, `19/27`). Confirmar se `data/resume/` da API Perl fornece os totais nacionais e substituir a constante `STATS_PLACEHOLDER` em `Hero.tsx`.

4. **`textoindicadors`** — collection existe em `lib/strapi.ts` (`getTextoIndicadors()`), mas não foi encaixada em nenhuma seção. Seção destino ainda sem decisão. **Não implementada na Fase 2 conforme escopo da tarefa.** Listar explicitamente como pendência para revisão de arquitetura antes da Fase 3.

### Da Fase 1 (mantidas em aberto)

5. **Parâmetros exatos de `data/compare` e `data/historical`** — confirmar com backend antes da implementação dos painéis na Fase 3.
6. **Comportamento de query params no redirect `/city`** — validar com `npm run dev` + teste manual.
7. **`metadataBase`** — confirmar domínio final antes da Fase 4.

---

## 6. Desvios em relação ao planejado

| Item no plano | O que foi feito | Motivo |
|---|---|---|
| Midiateca com 3 abas (Documentos / Links externos / Materiais de referência) | Implementada com 2 abas (Documentos / Artigos) | Decisão aprovada na revisão do plano: preserva comportamento da `biblioteca.html` (artigos + busca) e da `open-data.html` (documentos por categoria) sem criar abas sem dados reais |
| Stats do Hero conectados ao endpoint | Implementados como placeholder com TODO explícito | Endpoint não confirmado; aprovado pelo usuário para encaixar quando validado |
| `getTags` chamado com `{ _limit: -1 }` | Passado como `Parameters<typeof getTags>[0]` | `StrapiQueryParams` não define `_limit: -1` literalmente; o cast garante type safety sem alterar o comportamento |
