---
name: review-painel
description: Code review seguindo os padrões do painel-cms
---

Faça um code review completo dos arquivos em $ARGUMENTS.
Se nenhum argumento for passado, revise o diff atual do git.

Aplique os critérios da skill painel-cms-patterns e verifique:

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

**Tipagem:**
- Tipos de lib/strapi.ts sendo usados?
- Props tipadas com interface ou React.FC<Props>?
- Sem any?

**SOLID:**
- Arquivo tem mais de 200 linhas? Precisa dividir?
- Mais de 3 useState? Precisa extrair hook?
- Page tem lógica de negócio? Mover para hook/componente?
- Props recebem objeto inteiro do Strapi? Criar interface mínima?

**Estilização:**
- CSS variables ao invés de cores hardcoded?
- Padrão de layout de página seguido?

Para cada problema: arquivo, linha, problema, severidade e correção.
No final: nota geral e ordem de correção priorizada.
