# Progresso da Migração — Módulo e Integração "Elabore o Plano" (`/elabore-planos`)

**Data:** 2026-08-21  
**Branch:** `feature/migration-next` / `feature/cms-redesign`  
**Escopo:** Integração do endpoint público `GET /elabore-planos` e administrativo `PUT /elabore-planos` ao `next/` e ao `painel-cms`.

---

## 📋 O que foi decidido

1. **Endpoint & Estrutura:**
   - SingleType `/elabore-planos` gerenciado via `GET /elabore-planos` (público) e `PUT /elabore-planos` (autenticado com JWT do painel).
   - Campos: `titulo_secao` (string), `titulo_guia` (string), `descricao` (richtext/markdown), `capa` (mídia/imagem), `arquivo` (mídia/documento PDF ou Word).

2. **Front-end (`next/`):**
   - Converter `ElaborePlano.tsx` de estático para Server Component dinâmico.
   - Processamento de `descricao` com `renderMarkdown()`, mantendo paridade visual com a seção *Sobre*.
   - Exibição de `<Image>` real se `capa` estiver preenchida; caso contrário, manutenção da caixa placeholder tracejada.
   - Adição do botão **"Baixar Guia"** quando o campo `arquivo` estiver preenchido.
   - Fallback gracioso para o conteúdo estático atual em caso de erro na requisição ou se o retorno do Strapi estiver vazio.

3. **Painel Administrativo (`painel-cms`):**
   - Novo item no Sidebar chamado **"Elabore o Plano"** com o ícone `FileEdit`, posicionado entre *"Quem Somos"* e *"Textos Institucionais"*.
   - Rota `/elabore-plano` renderizando `ElaborePlanoPage`.
   - Formulário com os 5 campos e upload individual para imagem (`capa`) e documento (`arquivo`).
   - Botão único **"Salvar"** (sem opção de rascunho, tratando a publicação como direta).

---

## 🛠️ Arquivos Modificados / Criados

| Arquivo | Tipo | Descrição |
|---|---|---|
| [`next/src/lib/strapi.ts`](file:///Users/yduqs/proj-omlpi/next/src/lib/strapi.ts) | Modificado | Inclusão de `StrapiElaborePlano` e da função fetcher `getElaborePlano()`. |
| [`next/src/components/sections/ElaborePlano.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/sections/ElaborePlano.tsx) | Modificado | Server Component convertido de estático para dinâmico com suporte a Markdown, capa e download do arquivo. |
| [`painel-cms/src/lib/strapi.ts`](file:///Users/yduqs/proj-omlpi/painel-cms/src/lib/strapi.ts) | Modificado | Adicionadas interfaces `ElaborePlano` e `ElaborePlanoPayload`. |
| [`painel-cms/src/hooks/elabore-plano/useElaborePlano.ts`](file:///Users/yduqs/proj-omlpi/painel-cms/src/hooks/elabore-plano/useElaborePlano.ts) | **Novo** | Hook com `useQuery` e `useMutation` para `GET` e `PUT /elabore-planos`. |
| [`painel-cms/src/pages/ElaborePlanoPage.tsx`](file:///Users/yduqs/proj-omlpi/painel-cms/src/pages/ElaborePlanoPage.tsx) | **Novo** | Tela do editor com inputs, textarea de markdown, uploaders de mídia e botão Salvar. |
| [`painel-cms/src/router/index.tsx`](file:///Users/yduqs/proj-omlpi/painel-cms/src/router/index.tsx) | Modificado | Rota `/elabore-plano` registrada com lazy loading. |
| [`painel-cms/src/components/layout/Sidebar.tsx`](file:///Users/yduqs/proj-omlpi/painel-cms/src/components/layout/Sidebar.tsx) | Modificado | Item adicionado no menu principal do Sidebar. |

---

## 🔍 Verificação de Builds

- **`next/`**:
  ```bash
  npm run build
  # ✓ Compiled successfully in 2.4s
  # 0 erros de compilação ou TypeScript
  ```

- **`painel-cms/`**:
  ```bash
  npm run build
  # ✓ built in 429ms
  # 0 erros TypeScript
  ```

---

## 🚀 Status da Entrega

- [x] Endpoint `GET /elabore-planos` tipado e integrado no `next/`.
- [x] Seção `ElaborePlano.tsx` dinâmica com suporte a Markdown, Capa, Download e Fallback estático.
- [x] Módulo *"Elabore o Plano"* criado no `painel-cms` com formulário completo e integração `PUT /elabore-planos` (com `_publicationState=preview` no GET e `published_at` no payload para publicação direta de singleType com `draftAndPublish` no Strapi v3).
- [x] Sidebar e Router atualizados no `painel-cms`.
- [x] Compilação sem erros em ambos os repositórios.


