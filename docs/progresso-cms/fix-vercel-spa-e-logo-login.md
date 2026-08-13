# Fix: SPA fallback na Vercel + logo real na tela de Login

**Data:** 2026-08-13  
**Branch:** `feature/cms-redesign`  
**Tipo:** bugfix (sem nova funcionalidade, sem migração de dados)

---

## Problema 1 — 404 em rotas diretas na Vercel

A Vercel, ao servir uma SPA Vite estática, não sabe que todas as rotas
devem ser resolvidas pelo `index.html` do React Router. Qualquer acesso
direto a uma URL como `/dashboard`, `/banners` ou `/login` retornava
**404 Not Found**.

### Causa raiz

Ausência de configuração de rewrite no projeto. A Vercel serve arquivos
estáticos literalmente; sem um fallback explícito, rotas que não possuem
um arquivo físico correspondente falham.

### Solução

Criado `painel-cms/vercel.json` com rewrite universal:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Todas as requisições passam pelo `index.html`, o React Router assume o
controle e resolve a rota internamente.

---

## Problema 2 — Ícone de olho (`Eye`) no lugar da logo na tela de Login

O container laranja arredondado no topo do card de Login exibia o ícone
`Eye` do `lucide-react` — remanescente da fase inicial de prototipagem —
em vez da logo real do produto.

### Solução

Substituído `<Eye>` por `<img src="/logo-icon.png">`, reutilizando o
mesmo asset já presente em `painel-cms/public/` desde a correção do
Sidebar (conversa anterior). O import de `Eye` foi removido do arquivo;
`Mail` e `Lock` continuam importados e em uso nos campos do formulário.

---

## Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `painel-cms/vercel.json` | **[NOVO]** Rewrite SPA fallback para `index.html` |
| `painel-cms/src/pages/Login.tsx` | `Eye` → `<img src="/logo-icon.png">`; `Eye` removido do import |

---

## Verificação realizada

- `npm run build` em `painel-cms/` — **✓ sem erros** (`built in 316ms`).
- Logo visível na tela de Login confirmada via revisão do código.
- `vercel.json` não é testável localmente — efeito real após o próximo
  deploy na Vercel (rotas diretas deixam de retornar 404).

---

## Pendências

Nenhuma. Mudanças autocontidas; não afetam o site público (`next/`) nem
o Strapi.
