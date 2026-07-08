# Fases Da Migração

## Fase 1: Fundação

### Objetivo

Criar a base do Next.js sem mexer ainda nas páginas mais complexas.

### Entregáveis

- App Router configurado
- layout global
- metadata base
- assets públicos organizados
- clientes para Strapi e API Perl
- redirects essenciais

### Risco

Baixo

### Esforço

M

### Dependências

Nenhuma

### Bloqueia

Todas as demais fases

---

## Fase 2: Conteúdo CMS

### Objetivo

Migrar as páginas com conteúdo majoritariamente estático ou CMS-driven.

### Entregáveis

- home
- indicadores
- biblioteca
- rastreio

### Risco

Médio

### Esforço

M

### Dependências

Fase 1

### Bloqueia

Nada diretamente, mas reduz escopo da fase de cutover

---

## Fase 3: Dashboards

### Objetivo

Migrar a parte mais crítica do frontend, onde estão os gráficos e o comportamento mais dinâmico.
