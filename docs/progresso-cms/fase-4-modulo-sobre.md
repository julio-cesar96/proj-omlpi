# Fase 4 — Módulo Quem Somos (CMS)

## O que foi decidido

### D1 — Campos link/link2
Exibidos no editor em **card colapsável** com aviso "não exibidos no site atualmente".
Os 4 campos (`link`, `link_title`, `link2`, `link2_title`) ficam acessíveis sem poluir
o formulário principal. Card começa expandido automaticamente se algum campo já tiver
conteúdo (como é o caso do registro real em produção, que tem links da RNPI e da ANDI).

### D2 — Texto de ajuda Markdown (opção B2)
Bloco `<pre>` visível abaixo da textarea com a seguinte sintaxe:
```
Formatação disponível:
  **negrito**   → texto em negrito
  *itálico*     → texto em itálico
  ## Título     → subtítulo
  - item        → lista com marcadores
  [texto](https://url.com "Dica ao passar o mouse") → link com tooltip
```
Incluída a sintaxe de link, com extensão correspondente do `renderMarkdown()` no `next/`.

### D3 — Sem paginação
Coleção pequena (1 registro em produção, previsto máximo ~5 abas). Lista completa
sem paginação.

### D4 — Ordem de exibição
`created_at:ASC` — sem campo `ordem`. Reordenação fica fora do escopo desta fase
(precedente igual ao módulo FAQs antes do campo `ordem` ser adicionado).
Limitação documentada no subtítulo da página no painel.

### D5 — Editor em modal (não rota separada)
Padrão FAQ reutilizado: `SobreModal` inline, sem rota `/sobre/:id`.
Motivo: coleção de no máximo ~5 itens não justifica rota separada.

### D6 — Ícone no sidebar
`Info` (lucide-react), posicionado após "Perguntas Frequentes" e antes de
"Textos Institucionais" no grupo PRINCIPAL.

---

## Verificação empírica (pré-implementação)

- 1 registro em produção: `id=1` "Quem somos", publicado em 2020-01-29, com imagem
- Campos `link`/`link2` preenchidos com valores reais (RNPI e ANDI)
- Permissões Public: `find`/`findone`/`count` ✅ já habilitadas
- Permissões Authenticated: `create`/`update`/`delete` retornam 403 sem configuração
  → precisam ser habilitadas manualmente no Strapi Admin antes do primeiro uso

---

## O que foi implementado

### Tipos TypeScript — `painel-cms/src/lib/strapi.ts`
Adicionadas ao final: `Sobre`, `SobrePayload`, `SobresListParams`.

### Hooks — `painel-cms/src/hooks/sobre/`
- `useSobres.ts` — `GET /sobres?_publicationState=preview&_sort=created_at:ASC`
- `useSobreMutations.ts` — `createSobre`, `updateSobre`, `deleteSobre`

### Componentes — `painel-cms/src/components/sobre/`
- `SobreCard.tsx` — card de linha com miniatura de imagem, badge de status, botões
  editar e excluir
- `SobreModal.tsx` — modal com: título (obrigatório), textarea de texto com bloco de
  ajuda Markdown, upload de imagem com preview + botão remover, card colapsável de
  links opcionais

### Página — `painel-cms/src/pages/Sobre.tsx`
Lista de abas com estados loading/empty/preenchida, botão "Nova aba", modal integrado,
`ConfirmDialog` para exclusão.

**Nota:** tipo `Sobre` importado com alias `SobreRecord` para evitar conflito de
nomenclatura com o componente `export const Sobre`.

### Roteamento — `painel-cms/src/router/index.tsx`
Lazy import + `<Route path="/sobre" element={<Sobre />} />`.

### Sidebar — `painel-cms/src/components/layout/Sidebar.tsx`
Ícone `Info` adicionado ao import. Item `{ to: '/sobre', label: 'Quem Somos', icon: Info }`
inserido após FAQs no grupo PRINCIPAL.

### renderMarkdown() — `next/src/components/sections/SobreClient.tsx`
Regra de links `[texto](url "tooltip")` adicionada antes da regra de parágrafo:
```javascript
.replace(
  /\[([^\]]+)\]\(([^)\s"]+)(?:\s+"([^"]*)")?\)/g,
  (_, text, href, title) =>
    title
      ? `<a href="${href}" title="${title}" target="_blank" rel="noopener noreferrer">${text}</a>`
      : `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
)
```

---

## Verificação de build

- `painel-cms npm run build`: **passou** — `tsc -b` sem erros, chunk `Sobre-DmWy29fW.js`
  gerado (21 kB gzipped 5.29 kB)
- `next npm run build`: **passou** — TypeScript sem erros, 8 páginas geradas

---

## Permissões a habilitar no Strapi Admin antes do uso

**Caminho:** Settings → Roles → **Authenticated** → Sobre

- [ ] `find`
- [ ] `findone`
- [ ] `count`
- [ ] `create`
- [ ] `update`
- [ ] `delete`

> Public já tem `find`, `findone`, `count` habilitados — sem impacto no site público.

---

## Desvios do plano original

- Nenhum desvio funcional.
- Tipo `Sobre` importado como `SobreRecord` em `Sobre.tsx` para resolver conflito de
  declaração TypeScript (TS2395) — desvio técnico menor, sem impacto na API.

---

## Pendências para fases futuras

- **Reordenação de abas:** exige adicionar campo `ordem` ao schema em `omlpi-cms/api/sobre/`
  (fora de escopo desta fase).
- **Exibição de `link`/`link2` no front-end:** o `SobreClient.tsx` atual não renderiza
  esses campos — decisão de design do cliente.
- **Estilização CSS de links gerados pelo `renderMarkdown()`:** os `<a>` produzidos
  herdam os estilos do Tailwind Prose via `[&_a]` — verificar se `text-primary` /
  `underline` estão sendo aplicados no bloco `.prose` do `SobreClient.tsx`. Se não,
  adicionar `[&_a]:text-primary [&_a]:underline` ao className do `div` de conteúdo.
