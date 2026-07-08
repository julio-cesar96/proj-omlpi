# Fase 1 — Fundação: Resumo de Implementação

**Branch:** `feature/nextjs-migration`
**Data de conclusão:** 2026-07-08
**Diretório de trabalho:** `next/` (nenhum arquivo em `omlpi-www/` foi tocado)

---

## 1. Estrutura de arquivos criada

```
next/
├── .env.local.example               # template de variáveis de ambiente
├── next.config.ts                   # redirects 301 das rotas antigas
├── postcss.config.mjs               # gerado pelo create-next-app (Tailwind v4)
├── tsconfig.json                    # gerado pelo create-next-app
├── eslint.config.mjs                # gerado pelo create-next-app
└── src/
    ├── app/
    │   ├── globals.css              # tokens de design + @theme Tailwind v4
    │   ├── layout.tsx               # layout raiz (fontes, metadata, Header/Footer)
    │   └── page.tsx                 # página placeholder com âncoras reservadas
    ├── components/
    │   └── layout/
    │       ├── Header.tsx           # nav por âncora, server component
    │       └── Footer.tsx           # rodapé, server component
    └── lib/
        ├── strapi.ts                # cliente tipado do CMS (10 funções)
        ├── omlpi-api.ts             # cliente tipado da API Perl (9 funções)
        └── contact.ts               # helper de contato via WhatsApp (provisório)
```

---

## 2. Decisões técnicas

### 2.1 Sistema de tema: CSS custom properties + Tailwind v4 `@theme`

**Decisão:** os tokens foram declarados como CSS custom properties em `:root` dentro de `globals.css` e mapeados para o sistema de utilitários do Tailwind v4 via bloco `@theme inline { }`.

**Por que não apenas Tailwind config:** o Tailwind v4 elimina o `tailwind.config.ts` para definição de tokens — tudo vive no CSS. Isso mantém o design system em um único arquivo, legível sem depender do build do Tailwind para inspecionar os valores, e preserva os tokens disponíveis como variáveis CSS nativas (útil para uso em contextos não-Tailwind, como SVGs e Highcharts Maps na Fase 3).

**Fonte dos tokens:** extraídos manualmente de `design-reference/src/styles/theme.css`. Nenhum arquivo de `design-reference/` é importado em runtime.

### 2.2 Fontes

| Papel | Família | Pesos carregados |
|---|---|---|
| Títulos (`h1`–`h6`) | **Nunito** | 400, 600, 700, 800 |
| Corpo de texto | **Plus Jakarta Sans** | 400, 500, 600, 700 |

Carregadas via `next/font/google` no `layout.tsx`, expostas como variáveis CSS (`--font-nunito`, `--font-plus-jakarta-sans`) e mapeadas no `@theme` como `--font-heading` e `--font-body`. `font-sans` padrão do Tailwind aponta para `--font-body`.

> **Fonte de decisão:** confirmado pelo cliente (não estava documentado no `design-reference/`).

### 2.3 Clientes de API: `fetch` nativo com `cache: "no-store"`

Ambos os clientes (`strapi.ts`, `omlpi-api.ts`) usam `fetch` nativo — sem axios ou bibliotecas externas — com `cache: "no-store"` como padrão conservador. Na Fase 2, cada Server Component pode sobrescrever a opção de cache de acordo com a frequência de atualização do dado (ex.: `{ next: { revalidate: 3600 } }` para dados estáticos como `eixos`).

### 2.4 Formulário de contato: WhatsApp provisório

Nenhum endpoint de backend existe para o formulário de contato. A solução provisória para a Fase 2 usa `lib/contact.ts` com `buildWhatsAppUrl()`, que gera uma URL `wa.me/` com a mensagem pré-preenchida. O número de WhatsApp ainda precisa ser definido (`WHATSAPP_NUMBER = ""`). Substituir por Route Handler + Resend (ou endpoint Perl/Strapi) quando confirmado.

### 2.5 Política de privacidade: modal no footer

Confirmado que `/rastreio` (ex-página de política de privacidade) não terá seção própria no one-page. Na Fase 2, o link no `Footer.tsx` deve abrir um `<PrivacyPolicyModal />` (client component) com conteúdo carregado de `getPrivacyPolicy()` do Strapi.

---

## 3. Funções criadas em `lib/strapi.ts`

Base URL: `process.env.STRAPI_API_URL`

| Função | Collection | Descrição |
|---|---|---|
| `getBanners(params?)` | `banners` | Banners rotativos da seção Hero (Início) |
| `getEixos(params?)` | `eixos` | Blocos de eixos temáticos exibidos na seção Início |
| `getNoticias(params?)` | `noticias` | Lista de notícias para o news strip do Início |
| `getSobres(params?)` | `sobres` | **N registros, um por aba** — uso: `{ _sort: "order:asc" }` |
| `getTextoIndicadors(params?)` | `textoindicadors` | Texto da página de indicadores (seção destino a mapear) |
| `getGuias(params?)` | `guias` | Guias e documentos de referência (Midiateca / PNIPI) |
| `getTags(params?)` | `tags` | Tags dos artigos da Midiateca |
| `getArtigos(params?)` | `artigos` | **Confirmado para Midiateca** — padrão: `{ _limit: 15, _start: offset }` |
| `getStrapiLocales(params?)` | `locales` | Lista de localidades para busca na Consulta pública |
| `getPrivacyPolicy()` | `privacy-policy` | Conteúdo markdown da política de privacidade (modal no footer) |

**Parâmetros de query suportados em todas as funções:** `_limit`, `_sort`, `_q`, `_where`, `_start`, `locale_id`, `locale_id_ne` — exatamente os listados em `API_CONTRACTS.md §1`. Nenhum `populate=` ou GraphQL introduzido.

---

## 4. Funções criadas em `lib/omlpi-api.ts`

Base URL: `process.env.OMLPI_API_URL`

| Função | Endpoint | Descrição |
|---|---|---|
| `getLocales()` | `locales` | Lista de localidades (municípios/estados) para autocomplete |
| `getLocaleData(localeId)` | `data?locale_id=` | Dados do dashboard de uma localidade (Painel Municipal) |
| `compareLocales(params)` | `data/compare` | Comparação entre localidades (Painel Nacional) — **params a confirmar** |
| `getHistoricalData(params)` | `data/historical` | Dados históricos de uma localidade — **params a confirmar** |
| `getRandomIndicator()` | `data/random_indicator` | Indicador aleatório para o rotator da seção Hero |
| `getLocaleResume(localeId)` | `data/resume/` | Resumo de uma localidade — possível fonte dos números do Hero |
| `downloadData()` | `data/download` | Download de dados abertos (retorna `Response` bruto) |
| `downloadIndicator(params?)` | `data/download_indicator` | Download de indicador específico — **params a confirmar** |
| `uploadPlan(formData)` | `upload_plan` | POST multipart — upload de plano municipal |

---

## 5. TODOs marcados no código com endpoints "a confirmar"

| Arquivo | Localização | TODO |
|---|---|---|
| `lib/omlpi-api.ts` | `compareLocales()` / `OmlpiCompareParams` | Parâmetros exatos de `data/compare` — confirmar com backend antes da Fase 3. Não inferir apenas de `compare.js` do front antigo |
| `lib/omlpi-api.ts` | `getHistoricalData()` / `OmlpiHistoricalParams` | Parâmetros exatos de `data/historical` — mesma orientação acima |
| `lib/omlpi-api.ts` | `getLocaleResume()` | Confirmar se este endpoint é a fonte dos números do Hero (5.570 municípios, 2.022 com plano, etc.) |
| `lib/omlpi-api.ts` | `downloadIndicator()` / `OmlpiDownloadIndicatorParams` | Parâmetros de `data/download_indicator` a confirmar |
| `lib/strapi.ts` | `getTextoIndicadors()` | Confirmar seção destino desta collection no one-page (sem mapeamento definitivo no `PLANO_ONEPAGE.md`) |
| `lib/contact.ts` | `WHATSAPP_NUMBER` | Preencher com o número de WhatsApp real antes da Fase 2 |
| `next.config.ts` | Redirect `/city` | Verificar se o Next.js preserva automaticamente query params do source (`?location_id=X&area=Y`) quando não há `:param` declarado |
| `next.config.ts` | Redirects `/indicadores`, `/biblioteca` | Confirmar se o destino é `/#midiateca` ou outro (Fase 4) |
| `app/layout.tsx` | `metadataBase` | Confirmar domínio final antes da Fase 4 (`observa.rnpi.org.br` como placeholder) |

---

## 6. Redirects implementados em `next.config.ts`

| Source | Destination | Status |
|---|---|---|
| `/pt/:path*` | `/:path*` | ✅ Funcional — equivalente ao que existia no `netlify.toml` |
| `/planos-pela-primeira-infancia` | `/#consulta-publica` | ✅ Mapeado |
| `/city` | `/?tab=municipais#consulta-publica` | ⚠️ Funcional, mas verificar comportamento dos query params (ver TODO acima) |
| `/comparacao` | `/?tab=nacional&mode=comparacao#consulta-publica` | ⚠️ Destino de `mode=comparacao` a confirmar com design (Fase 4) |
| `/historico` | `/?tab=nacional&mode=historico#consulta-publica` | ⚠️ Mesmo que acima |
| `/indicadores` | `/#midiateca` | ⚠️ Destino a confirmar (Fase 4) |
| `/biblioteca` | `/#midiateca` | ⚠️ Destino a confirmar (Fase 4) |
| `/rastreio` | `/` | ✅ Confirmado — conteúdo migrará para modal no footer |

---

## 7. Desvios e ajustes em relação ao planejado

### Em relação a `docs/PLANO_ONEPAGE.md`

| Item no plano | O que foi feito | Motivo |
|---|---|---|
| Menciona `lib/contact.ts` como parte da Fase 2 (seção Contato) | Criado na Fase 1 como stub | Decisão de design (WhatsApp provisório) foi tomada durante a Fase 1; faz mais sentido deixar o helper pronto e documentado do que criar na Fase 2 sem contexto |
| Não especificava o arquivo `.env.local.example` | Criado em `next/.env.local.example` | Necessário para onboarding de novos devs e para orientar a configuração do ambiente de CI/CD |

### Em relação a `docs/API_CONTRACTS.md`

| Item no contrato | O que foi feito | Motivo |
|---|---|---|
| Não mencionava `lib/contact.ts` | Arquivo criado como lib auxiliar, sem endpoint de backend | Sem endpoint confirmado; WhatsApp como fallback documentado explicitamente como provisório |
| `sobres` — estrutura "a confirmar" | Resolvido: N registros, um por aba | Confirmado pelo usuário durante a execução |
| `artigos` — uso na Midiateca "a confirmar" | Resolvido: Midiateca usa `artigos` com `_limit=15&_start=0` | Confirmado via URL de produção observada pelo usuário |
| `privacy-policy` — destino "a confirmar" | Resolvido: modal no footer | Confirmado pelo usuário durante a execução |

---

## 8. Verificação de qualidade

| Verificação | Resultado |
|---|---|
| `npm run build` (Next.js 16.2.10) | ✅ Exit code 0, 0 erros TypeScript |
| `npm run lint` (ESLint) | ✅ Exit code 0, 0 erros |
| Nenhum arquivo de `design-reference/` importado em runtime | ✅ Confirmado |
| Nenhum arquivo em `omlpi-www/` modificado | ✅ Confirmado |

---

## 9. Pendências abertas para a Fase 2

1. **Número de WhatsApp** — preencher `WHATSAPP_NUMBER` em `lib/contact.ts`
2. **Parâmetros de `data/compare` e `data/historical`** — confirmar com o time de backend antes da Fase 3 (não da Fase 2)
3. **Fonte dos números do Hero** — confirmar se `data/resume/` fornece os totais nacionais (5.570 municípios, etc.) ou se há outro endpoint
4. **Seção destino de `textoindicadors`** — mapear qual componente do one-page consumirá esta collection
5. **Comportamento de query params no redirect `/city`** — validar com `npm run dev` + teste manual antes de ir para produção
