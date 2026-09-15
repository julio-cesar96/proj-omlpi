---
name: commit-patterns
description: "Padrão de mensagens de commit do projeto Observa. Use SEMPRE que sugerir mensagens de commit ou quando o desenvolvedor pedir ajuda com commits. Ative para qualquer tarefa que envolva git, versionamento ou changelog."
---

# Padrão de Commits — Observa

## Regra principal
NUNCA faça git commit ou git push. Apenas sugira a mensagem.
O desenvolvedor faz o commit manualmente.

## Formato

```bash
feat: <ação> <área> - <descrição curta>

<corpo do commit opcional>
```

## Tipos permitidos

- `feat` — funcionalidade nova
- `fix` — correção de bug
- `refactor` — refatoração sem mudar comportamento
- `style` — formatação, CSS, espaçamento (sem lógica)
- `chore` — configs, dependências, CI, skills
- `docs` — documentação, CLAUDE.md, README
- `perf` — melhoria de performance
- `a11y` — melhoria de acessibilidade
- `test` — testes

## Escopos comuns

- `Hero`, `Pnipi`, `Contato`, etc. — nome do componente
- `strapi` — lib/strapi.ts ou consumo do CMS
- `cms` — painel-cms
- `ui` — componentes compartilhados em ui/
- `layout` — Header, Footer, estrutura de página

## Exemplos

```bash
git commit -m "fix(PnipiClient): resolver URLs de arquivo do Strapi"
git commit -m "refactor(sections): extrair renderMarkdown para lib/markdown.ts"
git commit -m "a11y(StatCard): vincular tooltip com aria-describedby"
git commit -m "style(Hero): trocar cores hardcoded por CSS variables"
git commit -m "chore: adicionar skills e commands do Claude Code"
git commit -m "feat(FAQ): criar componente de seção com dados do Strapi"
```

## Regras

- Mensagem sempre em português
- Descrição curta com no máximo 72 caracteres
- Primeira letra minúscula depois do `:`
- Sem ponto final
- Um commit por mudança lógica (não juntar refactor + feat)
- Se o commit tiver mais de 3 arquivos, adicionar corpo explicando