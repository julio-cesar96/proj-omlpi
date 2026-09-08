# Separação da Seção Histórico (Next.js) e Customização de Rótulos (CMS)

## O que foi decidido

### D1 — Separação física em arquivos no Next.js
A seção `#historico` foi desacoplada de `SobreClient.tsx` e movida para seus próprios componentes dedicados:
- `next/src/components/sections/Historico.tsx` (Server Component)
- `next/src/components/sections/HistoricoClient.tsx` (Client Component)
- Inserido na página raiz em `next/src/app/page.tsx` logo após `<Sobre />`.

A seção `#sobre` permaneceu em `Sobre.tsx` e `SobreClient.tsx`, filtrando apenas as abas de "Quem somos".

### D2 — Estratégia de Metadados (Opção B — Frontmatter transparente)
Para permitir que o editor altere o rótulo ao lado da tarja laranja (padrão: `"Memória"`) e o título principal H2 (padrão: `"Histórico"`) sem exigir alteração de schema ou migração no Strapi:
- Metadados serializados no início do campo `text`:
  ```markdown
  ---
  section_label: Memória
  section_title: Histórico
  ---

  Conteúdo da seção...
  ```
- Utilitário dedicado criado em `lib/frontmatter.ts` tanto no `next/` quanto no `painel-cms/`.
- Ao abrir o modal no CMS, o frontmatter é extraído para campos visuais dedicados, deixando o textarea de texto limpo para edição.
- Ao salvar, o frontmatter é reinsere automaticamente de forma transparente.

### D3 — Painel CMS (Quem Somos vs Memória / Histórico)
- `painel-cms/src/pages/Sobre.tsx`: filtra e lista apenas as abas de "Quem Somos", eliminando a exibição duplicada de registros de Histórico.
- `painel-cms/src/pages/Memoria.tsx`: implementado fluxo completo de listagem, criação ("Novo registro"), edição e exclusão de itens de Memória/Histórico com confirmação.
- `SobreModal.tsx`: adicionado bloco "Personalização Visual no Site" com campos dedicados para `section_label` e `section_title`.
- `SobreCard.tsx`: exibe miniatura e resumo dos rótulos configurados para fácil identificação.

---

## Verificação de Build

- `painel-cms npm run build`: **passou com sucesso** (código de saída 0).
- `next npm run build`: **passou com sucesso** (código de saída 0, 8 páginas estáticas/SSR geradas).
