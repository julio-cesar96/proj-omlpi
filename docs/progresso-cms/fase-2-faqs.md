# Fase 2 — Módulo FAQs (CMS)

## O que foi decidido

### D1 — Footer do modal
Dois botões separados: **"Salvar rascunho"** (`published_at: null`) e **"Publicar"**
(`published_at: new Date().toISOString()`). Em modo edição de FAQ já publicada, o
botão de publicação exibe "Atualizar" e preserva o `published_at` original.

### D2 — Editor de resposta
Textarea simples (não WYSIWYG). Pendência futura se o cliente solicitar editor rico.

### D3 — Exclusão (`DELETE /faqs/:id`)
Implementado com `ConfirmDialog` (`variant="destructive"`). Permissões de `Authenticated`
(create, find, findone, count, delete) habilitadas no Strapi Admin. Se `DELETE` retornar
403 num ambiente diferente: **Settings → Roles → Authenticated → FAQ → marcar "delete" → Save**.

### Reorder — Opção A (N PUTs paralelos)
Optimistic update local imediato; `Promise.all` do subconjunto afetado em background.
Em caso de falha, estado local é revertido e Toast de erro é exibido.

> [!IMPORTANT]
> **Regra herdada de Planos:** `_publicationState=preview` é parâmetro fixo em **todos**
> os `GET /faqs` e `GET /faqs/count` do painel-cms. Sem ele, rascunhos ficam invisíveis.

---

## Investigação de `ordem` (23/07/2026)

Output literal do curl executado contra a API de produção:

```json
[
  {
    "id": 1,
    "pergunta": "Devo enviar meu plano?",
    "ordem": null,
    "created_at": "2026-07-23T19:50:25.830Z"
  }
]
```

**Diagnóstico:** 1 FAQ existente com `ordem: null`. Seed necessário.

---

## O que foi implementado

### Implementação inicial (batch 1)

```
painel-cms/src/
├── lib/
│   └── strapi.ts               # [MODIFY] + FaqPayload (published_at obrigatório),
│                               #           FaqsListParams
├── hooks/
│   └── faqs/
│       ├── useFaqs.ts          # Query com _publicationState=preview + _sort=ordem:ASC
│       ├── useFaqsCount.ts     # 2 queries paralelas; rascunhos = all - publicadas
│       └── useFaqMutations.ts  # createFaq, updateFaq, deleteFaq, reorderFaqs
├── components/
│   └── faqs/
│       ├── FaqCard.tsx
│       ├── FaqList.tsx
│       └── FaqModal.tsx
└── pages/
    └── Faqs.tsx                # Placeholder substituído
```

### Correções (batch 2 — pós-revisão)

#### `useFaqMutations.ts`

- **`createFaq`** passou a receber `{ payload, faqsAtuais }` em vez de `payload` isolado.
  `nextOrdem = Math.max(0, ...faqsAtuais.map(f => f.ordem ?? 0)) + 1` garante que toda
  FAQ nova entre no **final da lista**, nunca no topo.
- **`seedOrdem`** mutation adicionada: detecta FAQs com `ordem` null/duplicado,
  ordena por `created_at ASC` e dispara `Promise.all` de PUTs para atribuir
  `ordem = index + 1`. Idempotente: não dispara se todas já tiverem ordem válido e único.

#### `Faqs.tsx`

- **Seed automático:** `useEffect` na primeira carga (página 1, sem busca) chama
  `needsOrdemSeed(faqs)`. Se detectar null/duplicado, dispara `seedOrdem.mutate(faqs)`.
  Exibe banner "Organizando a ordem das FAQs…" e skeleton enquanto o seed está pendente.
  `seedRanRef` garante que o seed roda **no máximo uma vez** por sessão.
- **`createFaq`** chamado com `{ payload, faqsAtuais: localFaqs }` nos handlers
  `handleSaveDraft` e `handlePublish`.
- **Paginação** adicionada no padrão de `Planos.tsx`:
  - `PAGE_LIMIT = 20`
  - State `page`, resetado em troca de busca e de aba
  - `useFaqs` recebe `_start: (page - 1) * PAGE_LIMIT` e `_limit: PAGE_LIMIT`
  - Controles "← Anterior" / "Próximo →" exibidos quando `totalPages > 1`
  - Contador "Página N de M · X FAQs" baseado no `currentTotal` da aba ativa

---

## Verificação

- `npm run build` (painel-cms): **passou** — `tsc -b` sem erros, bundle 516 kB.

---

## Desvios do plano original

- `seedOrdem` como mutation separada (em vez de lógica inline no `useEffect`) para
  reutilizar o padrão de invalidação do React Query após a conclusão.

---

## Pendências para fases futuras

- **Editor WYSIWYG** para o campo `resposta` (decisão do cliente — D2).
- **Endpoint `/faqs/reorder`** no Strapi (Opção B): melhoria incremental se N PUTs
  paralelos gerarem latência perceptível. Exige mudança em `omlpi-cms/`.
