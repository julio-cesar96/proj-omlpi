# Contratos de API — Observa

Backend já está pronto e estável. Este documento descreve os contratos exatamente como consumidos hoje pelo front atual (fonte: inventário em `docs/archive/plan.md`, complementado com leitura direta de `omlpi-api/public/openapi.yaml`). Não inventar endpoints, parâmetros ou formatos além do que está aqui — se algo for necessário e não estiver descrito, sinalizar como pendência em vez de supor.

## 1. CMS (Strapi)

Base: definir `STRAPI_API_URL` como variável de ambiente.

Collections consumidas hoje:

| Collection | Uso atual | Página/seção nova correspondente |
|---|---|---|
| `banners` | Home banner | Hero (Início) |
| `eixos` | Blocos de eixo temático | Seção "Axis" (Início) |
| `noticias` | Lista de notícias | News strip (Início) |
| `sobres` | Texto institucional | **CONFIRMADO (Fase 1):** N registros, um por aba (Quem somos / Resultados do levantamento / Histórico). Consultar com `getSobres({ _sort: "order:asc" })` — o campo `order` define a ordem das abas. |
| `textoindicadors` | Texto da página de indicadores | **CONFIRMADO:** verificado o código-fonte real (`indicatorsText.js`) — é montado em `#app-indicators-text`, elemento que vive em `indicadores.html`, como texto introdutório antes da busca/overview de indicadores. Como `/indicadores` redireciona para `/#midiateca` no one-page, o destino é um **parágrafo introdutório no topo da seção Midiateca**, preservando o papel original do texto. |
| `guias` | Guias/documentos de referência | Midiateca / PNIPI (a confirmar) — **INVESTIGADO E RESOLVIDO:** não existe content-type "FAQ" ou "Planos de ação" hoje. `blog` (content-type existente, não usado por nenhuma página do front atual — confirmado via busca em `omlpi-www/`) está livre, mas **decisão de modelagem adiada intencionalmente**: o CMS terá uma fase própria de redesign (fora do escopo desta migração de front). "Dúvidas frequentes" e "Planos de ação" permanecem como placeholder estático no front (já implementado na Fase 2) até essa fase futura, quando a estrutura de conteúdo definitiva será decidida junto com o resto do redesign do painel administrativo. Não é pendência bloqueante desta migração. |
| `tags` | Tags de artigos | Midiateca |
| `artigos` | Artigos da biblioteca (busca, tags, paginação) | **CONFIRMADO (Fase 1):** Midiateca usa esta collection para metadados. Paginação via `{ _limit: 15, _start: offset }`. **A busca/filtro em si vem do `omlpi-cms-search` (ver §3), não daqui — ver correção aplicada na Fase 2.** |
| `locales` | Lista de localidades (municípios/estados). **CONFIRMADO (Fase 3d):** Esta é a única fonte oficial para dados completos (incluindo `cod_ibge`, `is_law`, `hide_plan` e o arquivo do plano `plan`). Deve ser usado para popular o MapaBrasil e os Painéis. | Consulta pública — mapa e painéis |
| `privacy-policy` | Conteúdo da política de privacidade | **CONFIRMADO (Fase 1):** não tem seção própria no menu — abre como modal (`<PrivacyPolicyModal />`) a partir de um link no Footer. |

### Padrões de query já em uso (preservar exatamente)

- `_limit` — limite de itens retornados
- `_sort` — ordenação
- `_q` — busca textual
- `_where` — filtro condicional
- `_start` — paginação (offset)
- `locale_id` / `locale_id_ne` — filtro por localidade

**Não usar:** GraphQL, nem strings `populate=` — o front atual não usa nenhum dos dois, então não introduzir sem necessidade confirmada.

### Formato de dados esperado (shapes já consumidos pelo front)

- Campos aninhados: `image.url`, `file.url`, `plan.url`
- Campos de relação: `tags`, `subindicators`, `ods`
- Campos de texto: markdown (renderizado hoje com DOMPurify + marked)

## 2. API custom (Perl/Mojolicious) — `omlpi-api`

Base: definir `OMLPI_API_URL` como variável de ambiente. Fonte da verdade: `omlpi-api/public/openapi.yaml` — **mas com ressalva confirmada na Fase 3b: a spec pode divergir do comportamento real** (`data/compare`/`data/historical` tinham um wrapper `locales` na spec que não existe na implementação real). Para qualquer endpoint ainda não exercido em produção pelo front novo (ex: `data/download`, `data/download_indicator`), tratar o shape do `openapi.yaml` como hipótese a validar contra o código-fonte Perl (`omlpi-api/lib/...`) ou contra uma chamada real, não como garantia.

| Endpoint | Parâmetros | Uso atual | Página/seção nova correspondente |
|---|---|---|---|
| `locales` | — | Lista de localidades. **CORRIGIDO (Fase 3d):** Fornece APENAS `{id, name, type, latitude, longitude}`. NÃO contém `cod_ibge` nem informações do plano. NÃO deve ser usado para popular o mapa ou painéis (usar Strapi `locales` para isso). Resposta vem envelopada como `{ locales: [...] }`. | Uso legado (geocoding/autocomplete básico) |
| `states` | — | **CONFIRMADO (openapi.yaml):** sem parâmetros. Retorna `{ states: State[] }` onde `State = { id, name, latitude, longitude }`. Ordem alfabética. | Consulta pública, aba "Estaduais/Distrital" |
| `cities` | `state_id` (opcional) | **CONFIRMADO (openapi.yaml):** filtra cidades por estado. Retorna `{ cities: City[] }` onde `City = { id, name, latitude, longitude }`. Ordem alfabética. | Consulta pública, aba "Municipais" |
| `areas` | — | **CONFIRMADO (openapi.yaml):** retorna `{ areas: Area[] }` onde `Area = { id, name }`. Taxonomia de dado — distinto da collection `eixos` do Strapi (conteúdo de marketing). | Filtros da Consulta pública |
| `classifications` | — | **CONFIRMADO (openapi.yaml):** retorna `{ classifications: string[] }` — array plano de rótulos (ex: "Sexo", "Raça/Cor"). **CONFIRMADO: não serve como fonte da aba "Monitoramento"** (ver nota abaixo). | Filtros dos dashboards |
| `indicators` | — | **CONFIRMADO (openapi.yaml):** retorna `{ indicators: Indicator[] }` onde `Indicator = { id, description, base, area }`. Campo é `description`, não `name`. **CONFIRMADO: não serve como fonte autônoma da aba "Monitoramento"** — só metadados, sem valores. | Filtros da Consulta pública |
| `data` | `locale_id` (obrigatório); `area_id` (opcional); `year` (opcional, enum `2017\|2018\|2019`) | **CONFIRMADO (Fase 3a):** `values` de cada indicador é um **objeto** `{ year, value_relative, value_absolute }` (diferente de compare/historical, onde é array). | Painel Municipal (ex-`/city`) |
| `data/compare` | `locale_id` (obrigatório); `year` (opcional, enum `2017\|2018\|2019`) | **CORRIGIDO (Fase 3b, verificado contra `Compare.pm`):** o `openapi.yaml` descrevia um wrapper `locales` que **não existe** na resposta real. Shape real: `{ comparison: [{ id, name, type, indicators: [{ id, name, area, base, values: [{ year, value_relative, value_absolute }], subindicators: [{ classification, data: [{ description, id, values: [...] }] }] }] }] }` — array plano de localidades dentro de `comparison`, sem aninhamento extra. `values` é **array**. | Painel Nacional / modo comparação |
| `data/historical` | `locale_id` (obrigatório); `area_id` (opcional) | **CORRIGIDO (Fase 3b, verificado contra `Historical.pm`):** mesmo problema — sem wrapper `locales`. Shape real: `{ historical: [{ id, name, type, indicators: [...] }] }`, array de comprimento 1 com a localidade selecionada. Sem filtro de `year` — retorna toda a série 2017–2019. `values` é **array**. | Painel Nacional / modo histórico |
| `data/random_indicator` | `locale_id_ne` (opcional) | Indicador aleatório (rotator da home) | Home indicators rotator |
| `data/resume` | `locale_id` (obrigatório), `year` (opcional) | **CONFIRMADO:** baixa **PDF** (`produces: application/pdf`). NÃO é JSON. Não é fonte dos números do Hero. | Botão de download de relatório |
| `data/download` | — | Download de planilha com dados de todas as localidades (spec indica `application/pdf`, provável XLSX na prática — validar ao implementar) | Open data / Midiateca |
| `data/download_indicator` | `locale_id` (obrigatório); `indicator_id` (obrigatório) | **CONFIRMADO (openapi.yaml):** retorna XLSX do indicador para a localidade. Sem parâmetros opcionais. | Open data / Midiateca |
| `upload_plan` | POST multipart: `file` (PDF, obrigatório), `name` (obrigatório), `message` (obrigatório), `email` (obrigatório) | Upload de plano municipal. Backend dispara e-mail via SMTP/Minion neste fluxo — infra dedicada, não reaproveitável para contato geral (fora de escopo mexer nisso, ver AGENTS.md) | Consulta pública — fluxo de upload |

> **CONFIRMADO: não existe endpoint para números agregados do Hero.**
> Nenhum endpoint da spec retorna estatísticas nacionais consolidadas (total de municípios mapeados, municípios/estados com plano aprovado, etc.). `data/resume` é PDF, não serve. **Solução adotada:** números do Hero como constantes estáticas no componente — os dados não mudam em tempo real e os números publicados são editorialmente aprovados, não computados ao vivo.

> **CONFIRMADO: não existe endpoint para a aba "Monitoramento".**
> Nem `classifications` (só rótulos) nem `indicators` (só metadados, sem valores) bastam sozinhos. Valores de indicador só existem acoplados a uma `locale_id` via `GET /data`. Uma aba de "Monitoramento" com dado tabular nacional exigiria endpoint novo no backend — **fora do escopo deste projeto** (API Perl não é mantida por este contrato, ver AGENTS.md).

## 3. Busca full-text — `omlpi-cms-search`

Serviço **separado** do Strapi (Node + Restify), porque o Strapi não tem full-text search nativo. **Fonte correta para a Midiateca — não usar a collection `artigos` do Strapi diretamente para busca/filtro.**

Base: definir `CMS_SEARCH_API_URL` como variável de ambiente.

| Endpoint | Funcionalidade |
|---|---|
| `GET /artigos` | Busca de artigos com full-text search, filtro por tags e paginação |

**Status: CONCLUÍDO na Fase 2 (corretiva pontual).** `lib/cms-search.ts` já foi criado apontando para este serviço, e a busca/filtro da Midiateca já foi migrada para ele. `getArtigos()` de `lib/strapi.ts` permanece disponível para outros usos (não busca).

## 4. Variáveis de ambiente necessárias (Next.js)

```
STRAPI_API_URL=
OMLPI_API_URL=
CMS_SEARCH_API_URL=
# se usar Resend para o formulário de contato:
RESEND_API_KEY=
CONTACT_EMAIL_TO=
```