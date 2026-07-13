# Fase 3a — Mapa, Localidades e Upload: Resumo de Implementação

**Branch:** `feature/nextjs-migration`  
**Data de conclusão:** 2026-07-10  
**Diretório de trabalho:** `next/` (nenhum arquivo em `omlpi-www/`, `omlpi-api/`, `omlpi-cms/` ou `omlpi-cms-search/` foi modificado)

---

## 1. Estrutura de arquivos criada/modificada

```
next/src/
├── app/
│   ├── api/
│   │   ├── maps/[state]/
│   │   │   └── route.ts            [NEW] — serve br-XX.json via whitelist dos 27 estados
│   │   └── upload-plan/
│   │       └── route.ts            [NEW] — proxy multipart para OMLPI_API_URL/upload_plan
│   └── page.tsx                    [MODIFY] — async Server Component com searchParams
├── components/
│   └── consulta-publica/           [NEW dir]
│       ├── ConsultaPublica.tsx     [NEW] — server, orquestrador de abas
│       ├── TabsNav.tsx             [NEW] — client, router.replace shallow
│       ├── MapaBrasil.tsx          [NEW] — client, Highcharts Maps + drilldown
│       ├── LocalidadeBusca.tsx     [NEW] — client, combobox sem deps externas
│       ├── PainelMunicipal.tsx     [NEW] — server, GET /data
│       ├── PainelEstadual.tsx      [NEW] — server, grid de estados + PainelMunicipal
│       └── UploadPlano.tsx         [NEW] — client, POST multipart
└── lib/
    └── omlpi-api.ts                [MODIFY] — tipos completos, funções corrigidas
```

---

## 2. Decisão de fonte de geometria do mapa

### `next/src/assets/illustrations/mapa.svg` → **descartado para o mapa interativo**

O SVG é uma ilustração única (14 linhas, 1 único `<path>`). Não possui estados separáveis — serve apenas como silhueta decorativa.

### `omlpi-www/src/static/maps/br-*.json` → **formato Highcharts proprietário**

Os 27 arquivos têm o formato `{ type, joinBy, mapData[], data[] }` com `mapData[].path` contendo SVG pré-projetado e `mapData[].name` com o código IBGE no formato `"mun_3550308"`. Não são GeoJSON padrão — só funcionam no pipeline Highcharts.

### Decisão: **Highcharts Maps via CDN (licença não-comercial confirmada)**

- Nível estado: `Highcharts.maps['countries/br/br-all']` (CDN Highcharts Maps)
- Drilldown cidade: `br-*.json` de `omlpi-www/src/static/maps/` servidos pelo Route Handler `/api/maps/[state]` com `fs.readFile` em runtime (somente leitura, sem modificar `omlpi-www/`)

---

## 3. Decisões técnicas

### 3.1 Paleta de cores do mapa

Extraída de `design-reference/src/styles/theme.css`:

| Status | Cor | Token |
|---|---|---|
| Aprovado | `#17a649` | `--secondary` |
| Em elaboração / Lei | `#f25d27` | `--primary` |
| Sem plano | `#e8f0e8` | branco-esverdeado sutil |
| Hover | `#444525` | `--foreground` |

### 3.2 Shape de `GET /data` (confirmado em `omlpi-api/public/openapi.yaml`)

```
Locale {
  id, name, type, latitude, longitude,
  indicators: IndicatorWithSubindicator[] {
    id, name, area { id, name }, base,
    values: { year, value_relative, value_absolute },
    subindicators: [{
      classification: string,
      data: [{ description, id, values: { year, value_relative, value_absolute } }]
    }]
  }
}
```

Nota: no `GET /data`, `values` é um **objeto** (não array). Em `/compare` e `/historical` é array. Os tipos em `omlpi-api.ts` usam union `| OmlpiIndicatorValue[]` para cobrir os dois casos.

### 3.3 Correção de `getLocales()`

A API retorna `{ locales: [...] }` (wrapper), não array plano. A função agora normaliza os dois formatos com defesa:
```ts
const res = await omlpiGet<{ locales: OmlpiLocale[] } | OmlpiLocale[]>("locales");
if (Array.isArray(res)) return res;
return (res as { locales: OmlpiLocale[] }).locales ?? [];
```

### 3.4 URL do PDF — `plan.url` DIRETAMENTE

Conforme instrução do usuário, o campo `plan.url` retornado pela API é usado **sem concatenar base URL**. Bug conhecido de produção: concatenar `storageDomain + plan.url` gera barra dupla → erro 400 "Malicious Path". A interface `OmlpiLocale` documenta essa restrição em JSDoc.

### 3.5 LocalidadeBusca — sem deps externas

Normalização de acentos: `normalize("NFD").replace(/[\u0300-\u036f]/g, "")`. Debounce 150ms, máx 10 resultados. Acessível com `role="combobox"`, `aria-autocomplete="list"`, `aria-controls`, `aria-activedescendant`.

### 3.6 `TabsNav` — router.replace shallow

Preserva `location_id` e `area` na URL ao trocar de aba. Limpa ambos ao voltar para o Mapa. Abas "Nacional" e "Monitoramento" marcadas como "em breve" (badge visual).

### 3.7 `UploadPlano` — sem SweetAlert2

Estados de feedback gerenciados com `useState`: `idle` → `loading` → `success | error`. Timeout de 5s para voltar ao `idle` após sucesso. Validação inline por campo.

---

## 4. Shape do `GET /locales` (Strapi) — campos relevantes para o mapa

**CORREÇÃO (Fase 3d):** Estes campos vêm exclusivamente do CMS (Strapi), endpoint `/locales`. A API em Perl não possui `cod_ibge` nem os detalhes do `plan`.

```ts
StrapiLocale {
  id: number
  name: string
  type: "country" | "region" | "state" | "city"
  state?: string        // sigla, ex: "SP" → matching com hc-key "br-sp"
  cod_ibge?: number     // código IBGE → matching com mapData[].name "mun_XXXXXXX"
  is_law?: boolean      // true = plano na forma de lei
  hide_plan?: boolean   // true = não exibir plano
  plan?: { url: string } | null
}
```

---

## 5. Verificação de qualidade

| Verificação | Resultado |
|---|---|
| `npm run lint` (dentro de `next/`) | ✅ Exit code 0, 0 erros ESLint |
| `npm run build` (Next.js 16.2.10 + Turbopack) | ✅ Exit code 0, 0 erros TypeScript |
| Nenhum arquivo de `omlpi-www/`, `omlpi-api/`, `omlpi-cms/` modificado | ✅ Confirmado |
| `OMLPI_API_URL` não exposta no client | ✅ — uso exclusivo em `lib/omlpi-api.ts` (server) e Route Handlers |
| Rotas geradas | ✅ `ƒ /api/maps/[state]`, `ƒ /api/upload-plan` |

---

## 6. Pendências abertas

### Pendências desta fase (3a)

1. **⚠ Drilldown de cidade: validação visual pendente**  
   A tela de drilldown por cidade não tem design aprovado no Figma. A implementação usa a mesma paleta de 3 cores do nível estado. **Validação necessária com quem aprovou o design antes do deploy em produção.**

2. **⚠ Bug de URL do PDF**  
   Se `locale.plan.url` vier com barra dupla da origem (backend), será visível como link quebrado. Limitação de backend (`omlpi-cms` / `omlpi-api`) — não corrigir aqui. O front usa `plan.url` diretamente conforme instrução.

3. **Matching `cod_ibge` vs `mapData[].name`**  
   O matching entre locales e pontos do mapa de cidades usa `locale.cod_ibge === codIbge` (extraído de `"mun_XXXXXXX"`). Se `cod_ibge` não vier preenchido no response de `GET /locales`, a cidade ficará sem coloração/tooltip. A verificar com dados reais.

4. **Estado selecionado no mapa vs. aba "Municipais"**  
   Ao clicar num estado no mapa, o comportamento atual redireciona para `?tab=municipais&location_id=<id_do_estado>` (carregando o painel do estado, não das cidades). Este é um comportamento razoável de fallback — mas pode ser refinado para mostrar as cidades do estado em vez de um painel de estado no tab municipal, dependendo do feedback do design.

### Pendências das fases anteriores (mantidas)

5. **Collection "Dúvidas frequentes" do PNIPI** — placeholder estático
6. **Collection "Planos de ação" do PNIPI** — placeholder estático
7. **Fonte dos números do Hero (stats strip)** — constante hardcoded
8. **`textoindicadors`** — seção destino sem decisão de arquitetura
9. **`metadataBase`** — aguardando domínio final

### Próxima fase (3b)

- **Painel Nacional** — comparação (`GET /data/compare`) e histórico (`GET /data/historical`)
- **Aba Monitoramento** — sem endpoint confirmado; aguarda definição de escopo com o time
