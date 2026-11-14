# Otimização de Performance e Lighthouse — Observa

> **Status Geral**: Em andamento  
> **Pontuação Inicial (Desktop)**: Performance 71 | Acessibilidade 92 | Boas Práticas 100 | SEO 92  
> **Objetivo**: Elevar as notas sem alterar o design visual nem quebrar funcionalidades existentes.

---

## Tabela de Progresso dos Problemas

| # | Problema | Prioridade | Status | Impacto / Meta |
|---|---|---|---|---|
| **1** | **Payload RSC Gigante** (2,48 MB inline) | Máxima | ✅ **Concluído** | HTML da Home reduzido de ~2,58 MB para < 100 KB descompactado |
| **2** | **Highcharts via CDN unpkg** | Alta | ⏳ **Pendente** | Migrar para npm + dynamic import (ssr: false) com IntersectionObserver |
| **3** | **Imagem LCP (`bebe-ajoelhado.png`)** | Média-Alta | ⏳ **Pendente** | Ajustar `sizes`, `fetchPriority="high"` e `formats: avif/webp` |
| **4** | **Contraste WCAG AA (24 elementos)** | Média | ⏳ **Pendente** | Ajustar `--primary` para `#c33d0c` e links do menu para `#6c6d56` |
| **5** | **JS Legado / Polyfills (14 KiB)** | Baixa | ⏳ **Pendente** | Configurar `.browserslistrc` para navegadores modernos |

---

## Detalhamento por Problema

### 1. Payload RSC Gigante (Concluído ✅)

- **Causa raiz**: O Server Component `ConsultaPublica.tsx` serializava um array com todas as ~5.570 localidades brasileiras do Strapi para dentro dos Client Components `<MapaBrasil>` e `<LocalidadeBusca>`, injetando **2,48 MB** de dados no chunk `self.__next_f.push(...)` do HTML da Home.
- **O que foi implementado**:
  - `src/lib/strapi.ts`: adicionado cache em memória singleton (TTL 1h) e `next: { revalidate: 3600 }` para `getStrapiLocales`, eliminando requisições repetidas ao Strapi.
  - `src/app/api/locales/route.ts`: nova rota de API leve com cache HTTP público para busca autocomplete (`?q=termo`), consulta de cidades por estado para drilldown (`?state=UF`) e consulta por ID (`?id=ID`).
  - `src/components/consulta-publica/ConsultaPublica.tsx`:
    - Processa no servidor um resumo compacto de apenas 27 estados (`StateMapSummary`: ~2 KB) para o mapa nacional inicial.
    - Desacoplou a lista completa de localidades dos componentes clientes.
    - Quando um estado é selecionado, prepara `citiesWithPlan` (municípios daquele estado com plano cadastrado) para exibição direta.
  - `src/components/consulta-publica/MapaBrasil.tsx`:
    - Inicializa o mapa do Brasil com os 27 estados em milissegundos.
    - No drilldown de estado, carrega o GeoJSON e as cidades daquela UF em paralelo via `async/await` (`/maps/${stateKey}.json` e `/api/locales?state=${stateAbbr}`).
    - Botão "Ver como lista" no drilldown agora exibe a lista dos municípios daquele estado com plano.
  - `src/components/consulta-publica/LocalidadeBusca.tsx`:
    - Implementado cache em memória no cliente (`clientSearchCache` via `Map`): termos já buscados respondem em **0 ms** sem chamada de rede.
    - Debounce ajustado para 300 ms e comprimento mínimo de 2 caracteres (evita disparos a cada letra digitada).
    - Botão Limpar (`✕`) no input: ao clicar (ou apagar com backspace), limpa a busca e remove `location_id` da URL, destravando a interface.
  - `src/components/consulta-publica/PainelMunicipal.tsx`:
    - Adicionado botão de navegação "← Voltar ao mapa do Brasil" no topo e no estado vazio.
    - Quando a localidade é um estado, renderiza o grid com todos os municípios daquele estado que possuem plano aprovado ou lei, com botões para download e links de detalhes.
    - Tratamento textual contextualizado ("este estado" vs "este município").
  - `src/components/consulta-publica/PainelEstadual.tsx`:
    - Recebe apenas os 27 estados (`stateLocales`) e repassa `citiesWithPlan`.

---

### 2. Highcharts via npm e Dynamic Import (Pendente ⏳)

- **Diagnóstico**: Scripts carregados via CDN `unpkg.com` (`highmaps.js`, `drilldown.js`, `@highcharts/map-collection/br-all.js`) em `MapaBrasil.tsx`, `GraficoHistorico.tsx` e `GraficoComparacao.tsx`.
- **Plano de ação**:
  1. Instalar `highcharts` oficial via npm.
  2. Substituir o carregamento por CDN por módulos locais empacotados.
  3. Carregar o componente do mapa usando `next/dynamic(() => import(...), { ssr: false })`.
  4. Envolver o container em um `IntersectionObserver` para carregar o bundle do Highcharts somente quando a seção `#consulta-publica` estiver próxima da viewport.

---

### 3. Imagem do LCP & Assets (Pendente ⏳)

- **Diagnóstico**: `bebe-ajoelhado.png` com `fill` e `sizes="50vw"` baixa variante de 1920px (~140 KB) em telas desktop. Logo `logo-observa.png` sem `sizes`. `next.config.ts` sem formatos AVIF/WebP declarados.
- **Plano de ação**:
  1. `src/components/sections/Hero.tsx` (`bebe-ajoelhado.png`):
     - Ajustar `sizes` para `"(max-width: 768px) 100vw, 560px"`.
     - Confirmar `priority` e adicionar `fetchPriority="high"`.
  2. `src/components/sections/Hero.tsx` (`logo-observa.png`):
     - Adicionar `sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 420px"`.
  3. `next.config.ts`:
     - Configurar `images: { formats: ["image/avif", "image/webp"] }`.

---

### 4. Contraste de Cores — WCAG AA (Pendente ⏳)

- **Diagnóstico**: Laranja `#f25d27` sobre fundo claro e texto branco sobre botão laranja têm contraste de ~3.0:1 (reprova no critério AA de 4.5:1). Links do nav com `text-foreground/70` resultam em `#7c7d62` (abaixo de 4.5:1).
- **Plano de ação**:
  1. `src/app/globals.css`:
     - Atualizar `--primary: #f25d27` → `#c33d0c` (contraste ~5.6:1, aprovado AA).
     - Atualizar `--primary-hover` para tom proporcional (ex: `#a83207`).
     - Atualizar `--ring` e `--chart-1` para `#c33d0c`.
  2. `src/components/layout/Header.tsx`:
     - Substituir `text-foreground/70` por cor com contraste aprovado (ex: `#6c6d56`).
     - Atualizar hover hardcoded `#F25D27` para `var(--primary)`.
  3. Conferir ocorrências pontuais hardcoded nos gráficos.

---

### 5. JS Legado / Polyfills (Pendente ⏳)

- **Diagnóstico**: Ausência de `.browserslistrc` faz o bundler injetar polyfills ES2020-ES2022 (`Array.prototype.at`, `flat`, `flatMap`, `Object.fromEntries`, `Object.hasOwn`) totalizando ~14 KiB.
- **Plano de ação**:
  1. Criar `.browserslistrc` em `next/` visando navegadores modernos (`chrome >= 90`, `firefox >= 90`, `safari >= 15`, `edge >= 90`).
  2. Validar eliminação dos polyfills no build final.

