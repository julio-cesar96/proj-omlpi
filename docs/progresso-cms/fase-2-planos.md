# Fase 2 — Módulo de Planos (CMS)

## O que foi decidido

### 1. Regra de `estado_editorial` × Draft & Publish
O content-type `plano` possui o mecanismo nativo de `draftAndPublish` do Strapi v3 combinado com um campo de enum customizado `estado_editorial` (`rascunho`, `revisao`, `publicado`, `arquivado`).

- **Rascunho**: `estado_editorial = 'rascunho'`, `published_at = null` (forçado no payload).
- **Em revisão**: `estado_editorial = 'revisao'`, `published_at = null` (forçado no payload).
- **Publicado**: `estado_editorial = 'publicado'`, `published_at = new Date().toISOString()`.
- **Arquivado**: `estado_editorial = 'arquivado'`, `published_at = null` (forçado no payload para retirar da API pública).
- **Duplicar**: Cria novo registro com título `"[Título] (Cópia)"`, `estado_editorial = 'rascunho'`, `published_at = null` e `documento = null` (PDF não copiado).

> [!CRITICAL]
> **Bug de Segurança de Conteúdo no Strapi v3 (Descoberto e Corrigido)**
> 
> Durante o teste empírico da API, descobriu-se que o Strapi v3 com `draftAndPublish: true` preenche automaticamente `published_at` com o timestamp atual no `POST` ou `PUT` caso o campo `published_at` seja omitido ou enviado como `undefined`. Isso faria com que planos salvos como "rascunho" fossem acidentalmente publicados na API pública (`/planos`).
> 
> **Correção aplicada:** Todos os métodos de criação e atualização em `usePlanoMutations.ts` e no `PlanoDrawer.tsx` passam a enviar obrigatoriamente `published_at: null` de forma explícita no JSON do payload quando o estado não for `'publicado'`.

### 2. Decisões do Plano (D1–D4)
- **D1 (Regra de publicação)**: Aprovada e implementada com a trava explícita de `published_at: null`.
- **D2 (Select de Tags no Drawer)**: Incluído no drawer como seleção opcional via botões de toggle (chips), consumindo `GET /tags`.
- **D3 (Contagens das Tabs)**: Implementadas 5 queries paralelas via `useQueries` e `/planos/count` com filtros por `estado_editorial`.
- **D4 (Progresso de Upload de PDF)**: Desenvolvido via `XMLHttpRequest` nativo (`xhr.upload.onprogress`), sem dependências extras.

---

## O que foi implementado

### Estrutura dos Arquivos Criados / Modificados

```
painel-cms/src/
├── lib/
│   └── strapi.ts                        # Interfaces StrapiFile, Tag, Categoria, Plano, PlanoPayload e PlanosListParams
├── hooks/
│   └── planos/
│       ├── usePlanos.ts                 # Query de listagem com busca debounced (_q) e paginação (_start, _limit, _sort)
│       ├── usePlanosCount.ts            # 5 queries paralelas em /planos/count para contagem por tab
│       ├── usePlanoMutations.ts         # Hook consolidado com createPlano, updatePlano, publishPlano, archivePlano, duplicatePlano
│       ├── useUploadFile.ts             # Upload de PDF via XHR com progresso percentual e validação (200MB / PDF)
│       ├── useCategorias.ts             # Query GET /categorias?_sort=nome:ASC
│       └── useTags.ts                   # Query GET /tags?_sort=name:ASC
├── components/
│   ├── planos/
│   │   ├── PlanoStepper.tsx             # Componente visual do fluxo editorial (4 etapas com cores fiéis ao spec)
│   │   ├── PlanoPdfDropzone.tsx         # Dropzone drag-and-drop de PDF com card de arquivo e barra de progresso
│   │   ├── PlanoTabBar.tsx              # Componente de abas (Todos, Rascunhos, Em revisão, Publicados, Arquivados) com badges
│   │   ├── PlanoTable.tsx               # Tabela de planos com busca, badges de status, pills de tags e paginação
│   │   └── PlanoDrawer.tsx              # Modal drawer de 640px com formulário completo e ações no footer
│   └── ui/
│       └── Toast.tsx                    # Atualizado para suportar auto-dismiss (2.6s) e callback onClose
└── pages/
    └── Planos.tsx                       # Página principal consolidando estado de abas, busca (debounce 400ms), tabela e drawer
```

---

## Desvios do plano original

1. **Consolidação de Hooks de Mutation**: As mutations de CRUD (`createPlano`, `updatePlano`, `publishPlano`, `archivePlano`, `duplicatePlano`) foram consolidadas no hook `usePlanoMutations.ts` em vez de 5 arquivos separados, melhorando a manutenção e o reaproveitamento da invalidação de cache do React Query (`['planos']` e `['planos-count']`).
2. **Envio explícito de `published_at: null`**: Conforme relatado no aviso de segurança, o Strapi v3 exige `published_at: null` explícito nos payloads de `POST` e `PUT` para impedir auto-publicação padrão.

---

## Pendências para as próximas fases

- **Ações em lote / Seleção múltipla**: Checkbox na tabela renderizado e preparado, porém ações em massa dependem da habilitação da permissão `DELETE` em `/planos` (reservado para a Fase 4).
- **Exportação CSV/XLSX e Importação de base**: Botão "Exportar" na toolbar desabilitado temporariamente (Fase 4).
- **Redefinição/Exclusão via API**: O endpoint `DELETE /planos/:id` permanece restrito no Strapi (`403 Forbidden` para role `Authenticated`). Exclusões de registros de teste continuam sendo feitas via Strapi Admin.
