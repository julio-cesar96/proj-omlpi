---
name: review-observa  
description: Code review seguindo os padrões do projeto Observa
---

Faça um code review completo dos arquivos em $ARGUMENTS.
Se nenhum argumento for passado, revise o diff atual do git.

Aplique os critérios da skill observa-patterns e verifique:

**Strapi:**
- Usa strapiGet e tipos de lib/strapi.ts?
- Campos em português?
- try/catch com fallback estático?
- URLs de arquivo tratadas (absoluta vs relativa)?

**Componente:**
- Server Component por padrão?
- Layout max-w-7xl mx-auto px-5 lg:px-10?
- section com id e aria-label?
- SectionLabel como kicker?

**Tipagem:**
- Tipos explícitos de strapi.ts?
- Sem any?
- Retornos tipados?

**Acessibilidade:**
- aria-label nas sections?
- aria-hidden em decorativos?
- next/Image com sizes?

**Design System:**
- CSS variables ao invés de cores hardcoded?
- Padrões de botão/card consistentes?

Para cada problema, mostre: arquivo, linha, problema, severidade (alta/média/baixa)
e correção sugerida com código.

No final, dê um resumo com nota geral e lista priorizada do que corrigir primeiro.
