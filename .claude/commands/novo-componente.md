---
name: novo-componente
description: Cria um novo componente de seção seguindo os padrões do Observa
---

Crie um novo componente de seção chamado $ARGUMENTS seguindo
TODOS os padrões da skill observa-patterns:

- Server Component (sem "use client")
- Chamada ao Strapi com try/catch e fallback
- section com id e aria-label
- Layout max-w-7xl mx-auto px-5 lg:px-10
- SectionLabel como kicker
- Tipagem completa com tipos de lib/strapi.ts
- CSS variables para cores
- Acessibilidade completa

Se o componente precisar de um novo tipo ou função no strapi.ts,
crie também e explique o que foi adicionado.

Salve em next/src/components/sections/
