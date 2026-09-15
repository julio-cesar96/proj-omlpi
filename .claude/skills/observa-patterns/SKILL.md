---
name: observa-patterns
description: "Padrões e convenções do projeto Observa (Observatório do Marco Legal da Primeira Infância). Use SEMPRE que estiver escrevendo, revisando ou refatorando código neste repositório. Inclui padrões de consumo do Strapi, estrutura de componentes, design system e tipagem. Ative para qualquer tarefa envolvendo componentes React, chamadas ao CMS, estilização, acessibilidade ou criação de novas seções/páginas."
---

# Padrões do Projeto Observa

## Arquitetura

O projeto é um monorepo com dois apps:
- `next/` — Site público Next.js 14 (App Router)
- `painel-cms/` — Painel administrativo React SPA

Backend: Strapi v3.3.3 hospedado externamente.

## Consumo do Strapi

### Regras obrigatórias
1. Toda chamada ao Strapi usa `strapiGet()` de `next/src/lib/strapi.ts`
2. NUNCA usar `populate=` — o Strapi v3 não suporta
3. NUNCA usar GraphQL — não está habilitado
4. Campos são em PORTUGUÊS: `titulo`, `texto`, `descricao`, `nome`
   - ERRADO: `title`, `content`, `description`, `name`
   - CERTO: `titulo`, `texto`, `descricao`, `nome`
5. `singleType` (ex: `banners`, `textoindicadors`) retorna OBJETO
6. `collectionType` (ex: `sobres`, `guias`, `artigos`) retorna ARRAY

### Padrão de chamada

```typescript
// CERTO
export async function MinhaSecao() {
  let data: StrapiTipo | null = null;
  try {
    data = await getMinhaColecao();
  } catch (err) {
    console.error("[MinhaSecao] Erro ao carregar dados do Strapi:", err);
  }
  const titulo = data?.titulo || "Título padrão";
}

// ERRADO — sem try/catch, sem fallback
export async function MinhaSecao() {
  const data = await getMinhaColecao();
  return <h1>{data.titulo}</h1>;
}
```

### URLs de arquivos do Strapi

```typescript
const url = data?.arquivo?.url
  ? data.arquivo.url.startsWith("http")
    ? data.arquivo.url
    : `${STRAPI_URL}${data.arquivo.url}`
  : null;
```

## Estrutura de Componentes

### Componente de seção padrão

```typescript
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getMinhaColecao, StrapiTipo } from "@/lib/strapi";

export async function MinhaSecao() {
  let data: StrapiTipo | null = null;
  try {
    data = await getMinhaColecao();
  } catch (err) {
    console.error("[MinhaSecao] Erro:", err);
  }

  return (
    <section
      id="minha-secao"
      aria-label="Descrição da seção"
      className="py-16 lg:py-24 bg-white border-t border-border/40"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <SectionLabel>Kicker da seção</SectionLabel>
        <h2
          className="text-3xl lg:text-4xl font-bold text-foreground mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {data?.titulo || "Título fallback"}
        </h2>
      </div>
    </section>
  );
}
```

### Regras de componente
- Server Component por padrão. Só adicionar `"use client"` se tiver hooks/eventos
- Toda `<section>` precisa de `id` (para âncora) e `aria-label`
- Layout: `max-w-7xl mx-auto px-5 lg:px-10`
- Espaçamento vertical: `py-16 lg:py-24`
- Separador: `border-t border-border/40`
- Imagens decorativas: `aria-hidden="true"`
- Usar `next/Image` com `sizes` e `priority` para above-the-fold

## Design System

### Tokens — usar variáveis CSS, NUNCA hardcoded
- `var(--primary)` → `#F25D27` (laranja principal)
- `var(--font-heading)` → fonte dos títulos
- Background alternativo: `#F5F0E8`
- Hover do primary: `#e04d18`

### Padrões de estilo
- Botão primário: `bg-primary text-white font-semibold rounded-full hover:bg-[#e04d18]`
- Botão secundário: `border-2 border-[rgba(164,154,135,0.35)] rounded-full`
- Card: `rounded-2xl border border-border bg-card`
- Texto descritivo: `text-muted-foreground text-[15px] lg:text-base leading-relaxed`

## Tipagem

- Usar SEMPRE os tipos de `next/src/lib/strapi.ts`
- Tipos disponíveis: `StrapiLocale`, `StrapiBanner`, `StrapiSobre`, `StrapiEixo`,
  `StrapiNoticia`, `StrapiGuia`, `StrapiArtigo`, `StrapiElaborePlano`, `StrapiFile`
- Evitar `any` — usar `unknown` quando necessário
- Funções devem ter tipo de retorno explícito
- Interfaces usam `[key: string]: unknown` para extensibilidade do Strapi