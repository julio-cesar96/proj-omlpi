---
name: review-painel
description: Code review seguindo os padrões do painel-cms (NUNCA revisar next/)
---

Faça um code review EXCLUSIVAMENTE dos arquivos dentro de painel-cms/.
Escopo: $ARGUMENTS (se nenhum argumento for passado, use painel-cms/src/).

IMPORTANTE: IGNORE completamente o diretório next/. Este review é APENAS
para o painel-cms. Use APENAS a skill painel-cms-patterns como referência.

Verifique:

**Hooks:**
- Lógica de fetch/mutation está em custom hook, não no componente?
- queryKey como array?
- _publicationState=preview presente nas queries?
- async/await ao invés de .then/.catch?
- Mutations invalidam queries no onSuccess?

**Strapi:**
- Usa apiFetch, nunca fetch direto?
- published_at reenviado no PUT de singleTypes?
- Campos em português?

**SOLID:**
- Arquivo tem mais de 200 linhas? Precisa dividir?
- Mais de 3 useState? Precisa extrair hook?
- Page tem lógica de negócio? Mover para hook/componente?
- Props recebem objeto inteiro do Strapi? Criar interface mínima?

**Tipagem:**
- Tipos de lib/strapi.ts sendo usados?
- Props tipadas com interface ou React.FC<Props>?
- Sem any?

**Estilização:**
- CSS variables ao invés de cores hardcoded?
- Inline styles que poderiam ser Tailwind?

Para cada problema: arquivo, linha, problema, severidade e correção.
No final: nota geral e ordem de correção priorizada.
