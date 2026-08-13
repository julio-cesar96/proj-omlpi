# Fix: URL preview de Textos Institucionais

**Data:** 2026-08-13  
**Branch:** `feature/cms-redesign`  
**Tipo:** bugfix (sem nova funcionalidade, sem migração de dados)

---

## Problema

Os cards e o editor de **Textos Institucionais** exibiam um preview de URL
hardcoded e incorreto:

- **Domínio errado:** `observarnpi.org.br` (domínio antigo/fictício).
- **Caminho errado:** `observarnpi.org.br/{slug}` — mas a rota real no site
  público é `/paginas/{slug}`.
- **Sem link funcional:** o texto era apenas `<span>`, sem nenhum `<a href>`.

---

## Decisão de implementação

1. **Nova variável de ambiente `VITE_SITE_URL`** para desacoplar o domínio do
   código-fonte. Padrão definido:
   `VITE_SITE_URL=https://observa.rnpiobserva.org.br`

2. **Fallback seguro:** se a variável não estiver configurada, o preview exibe
   `/paginas/{slug}` como texto cinza sem link — sem gerar link quebrado
   silenciosamente.

3. **Link clicável com `target="_blank"`** quando a variável está presente.

4. **`stopPropagation` no card** para que clicar no link não abra o editor
   simultaneamente.

5. **Editor:** durante a edição de slug inline o prefixo volta a ser `<span>`
   (não-clicável), evitando clique acidental enquanto o usuário digita.

---

## Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `painel-cms/.env.local.example` | Adicionada `VITE_SITE_URL` com comentário |
| `painel-cms/.env.local` | Adicionada `VITE_SITE_URL=https://observa.rnpiobserva.org.br` |
| `painel-cms/src/components/textos/TextoCard.tsx` | Preview → link `<a>` para `{VITE_SITE_URL}/paginas/{slug}` |
| `painel-cms/src/components/textos/TextoEditor.tsx` | Prefixo de URL → link `<a>` para `{VITE_SITE_URL}/paginas/`, desabilitado durante edição inline |

---

## Verificação realizada

- `npm run build` em `painel-cms/` — **✓ sem erros** (`built in 323ms`).
- Revisão manual dos dois componentes: lógica de fallback e `stopPropagation`
  confirmados no código.

---

## Pendências

Nenhuma. Mudança autocontida; não afeta o site público (`next/`) nem o Strapi.
