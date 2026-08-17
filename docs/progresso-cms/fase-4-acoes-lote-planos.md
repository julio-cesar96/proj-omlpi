# Fase 4 — Seleção Múltipla e Ações em Lote — Módulo Planos

## O que foi decidido

1. **Decisão A (Ações em Lote Habilitadas):**
   - Habilitadas 4 ações editoriais em lote:
     - **Publicar selecionados**: altera `estado_editorial` para `'publicado'` e atribui `published_at = new Date().toISOString()`.
     - **Enviar para revisão**: altera `estado_editorial` para `'revisao'` e força `published_at = null`.
     - **Arquivar selecionados**: altera `estado_editorial` para `'arquivado'` e força `published_at = null`.
     - **Mover para rascunho**: altera `estado_editorial` para `'rascunho'` e força `published_at = null`.

2. **Decisão B1 (Exclusão em Massa Fora de Escopo):**
   - O endpoint `DELETE /planos/:id` permanece restrito (`403 Forbidden` no Strapi).
   - O fluxo de lote foca exclusivamente em mudanças de status de fluxo editorial via `PUT /planos/:id`.

3. **Decisão C (Confirmação Modal Obrigatória):**
   - Todas as ações disparadas pela toolbar em lote abrem um modal `ConfirmDialog` antes de enviar as requisições para a API (ex: *"Tem certeza que deseja alterar o status de 3 plano(s) selecionado(s) para 'Publicado'?"*).

4. **Regra de Limpeza de Seleção:**
   - A seleção (`selectedIds`) é limpa automaticamente quando o usuário navega entre páginas, alterna entre as abas de status (`PlanoTabBar`) ou aplica um novo filtro de busca debounced.

5. **Correção Técnica de Checkbox Indeterminado:**
   - A propriedade `indeterminate` do cabeçalho da tabela é manipulada de forma imperativa através de `ref.current.indeterminate = someSelected && !allSelected` dentro de um `useEffect`, contornando a limitação do React/browsers onde a prop JSX `<input indeterminate={...} />` é ignorada.

---

## O que foi implementado

### Estrutura dos Arquivos Criados / Modificados

```
painel-cms/
├── src/
│   ├── hooks/
│   │   └── planos/
│   │       └── usePlanoBatchActions.ts      # [NEW] Hook de execução resiliente via Promise.allSettled
│   ├── components/
│   │   └── planos/
│   │       ├── PlanoBatchToolbar.tsx        # [NEW] Toolbar contextual exibida quando 1+ item é selecionado
│   │       └── PlanoTable.tsx               # [MODIFY] Checkboxes ativos no header/linhas, ref indeterminado e highlight
│   └── pages/
│       └── Planos.tsx                       # [MODIFY] Estado de seleção, handlers de lote, limpeza automática e ConfirmDialog
docs/
└── progresso-cms/
    └── fase-4-acoes-lote-planos.md          # [NEW] Registro de progresso da fase
```

---

## Verificações Realizadas

1. **Estado Indeterminado via Ref:**
   - Selecionar todos os itens da página e desmarcar 1 item individual exibe corretamente o traço visual ("indeterminado") no checkbox do cabeçalho via `useEffect` + `ref.current.indeterminate`.

2. **Execução de Ação em Lote & ConfirmDialog:**
   - Seleção de múltiplos itens e clique em "Publicar", "Enviar p/ Revisão", "Arquivar" ou "Rascunho" exibe o `ConfirmDialog`.
   - Ao confirmar, as requisições `PUT` são executadas via `Promise.allSettled`, as abas e a tabela atualizam e o Toast confirma o número de alterações.

3. **Limpeza de Seleção Automática:**
   - Ao alterar a página, trocar de aba ou digitar na busca, `selectedIds` é resetado para `[]`.

4. **Tratamento de Erros Parciais:**
   - O loop resiliente via `Promise.allSettled` calcula com precisão `succeeded` e `failed` sem abortar caso um item individual falhe.

5. **Validação de Build:**
   - Executado `npm run build` em `painel-cms/` com **0 erros** de TypeScript e build Vite concluído com sucesso.
