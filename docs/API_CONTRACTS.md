# Contratos de API — Observa

Backend já está pronto e estável. Este documento descreve os contratos exatamente como consumidos hoje pelo front atual (fonte: inventário em `docs/archive/plan.md`). Não inventar endpoints, parâmetros ou formatos além do que está aqui — se algo for necessário e não estiver descrito, sinalizar como pendência em vez de supor.

## 1. CMS (Strapi)

Base: definir `STRAPI_API_URL` como variável de ambiente.

Collections consumidas hoje:

| Collection | Uso atual | Página/seção nova correspondente |
|---|---|---|
| `banners` | Home banner | Hero (Início) |
| `eixos` | Blocos de eixo temático | Seção "Axis" (Início) |
| `noticias` | Lista de notícias | News strip (Início) |
| `sobres` | Texto institucional | **CONFIRMADO (Fase 1):** N registros, um por aba (Quem somos / Resultados do levantamento / Histórico). Consultar com `getSobres({ _sort: "order:asc" })` — o campo `order` define a ordem das abas. |
| `textoindicadors` | Texto da página de indicadores | Seção Indicadores — **ainda sem seção destino mapeada no one-page.** Não supor onde entra; sinalizar como pendência na Fase 2. |
| `guias` | Guias/documentos de referência | Midiateca / PNIPI (a confirmar) |
| `tags` | Tags de artigos | Midiateca |
| `artigos` | Artigos da biblioteca (busca, tags, paginação) | **CONFIRMADO (Fase 1):** Midiateca usa esta collection. Paginação via `{ _limit: 15, _start: offset }`. |
| `locales` | Lista de localidades (municípios/estados) | Consulta pública — busca e seleção |
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

Base: definir `OMLPI_API_URL` como variável de ambiente. Fonte da verdade: `omlpi-api/public/openapi.yaml` (ler direto do repo antes de implementar qualquer parâmetro marcado "a confirmar" abaixo).

| Endpoint | Parâmetros | Uso atual | Página/seção nova correspondente |
|---|---|---|---|
| `locales` | — | Lista de localidades para busca/autocomplete | Consulta pública (busca) |
| `states` | — | **CONFIRMADO (openapi.yaml):** sem parâmetros de query. Retorna `{ states: State[] }` onde `State = { id: integer, name: string, latitude: number, longitude: number }`. Lista em ordem alfabética. | Consulta pública, aba "Estaduais/Distrital" |
| `cities` | `state_id` (query, integer, **opcional**) | **CONFIRMADO (openapi.yaml):** filtra cidades por estado. Retorna `{ cities: City[] }` onde `City = { id: integer, name: string, latitude: number, longitude: number }`. Lista em ordem alfabética. | Consulta pública, aba "Municipais" |
| `areas` | — | **CONFIRMADO (openapi.yaml):** sem parâmetros. Retorna `{ areas: Area[] }` onde `Area = { id: integer, name: string }`. Lista de eixos temáticos (taxonomia de dado — distinto do conteúdo de marketing da collection `eixos` do Strapi). | Filtros da Consulta pública |
| `classifications` | — | **CONFIRMADO (openapi.yaml):** sem parâmetros. Retorna `{ classifications: string[] }` — array plano de strings (ex: `"Sexo"`, `"Raça/Cor"`). Não é um objeto com id — apenas os rótulos de desagregação. | Filtros dos dashboards; **CONFIRMADO: não serve como fonte da aba "Monitoramento"** — essa aba não tem endpoint correspondente (ver nota abaixo). |
| `indicators` | — | **CONFIRMADO (openapi.yaml):** sem parâmetros. Retorna `{ indicators: Indicator[] }` onde `Indicator = { id: integer, description: string, base: string, area: Area }`. Nota: campo chama-se `description` (não `name`). | Filtros da Consulta pública; **CONFIRMADO: não serve como fonte autônoma da aba "Monitoramento"** — não retorna valores, apenas metadados dos indicadores. |
| `data` | `locale_id` (query, integer, **obrigatório**); `area_id` (query, integer, opcional); `year` (query, integer, opcional — enum `2017\|2018\|2019`) | Dados do dashboard de uma localidade | Painel Municipal (ex-`/city`) |
| `data/compare` | `locale_id` (query, integer, **obrigatório**); `year` (query, integer, opcional — enum `2017\|2018\|2019`) | **CONFIRMADO (openapi.yaml):** retorna `{ comparison: [{ locales: [{ id, name, type, indicators: [{ id, name, area, base, values: [{ year, value_relative, value_absolute }], subindicators: [{ classification, data: [{ description, id, values: [{ value_relative, value_absolute, year }] }] }] }] }] }] }`. Compara a localidade indicada com todas as localidades do mesmo escopo. | Painel Nacional / modo comparação |
| `data/historical` | `locale_id` (query, integer, **obrigatório**); `area_id` (query, integer, opcional) | **CONFIRMADO (openapi.yaml):** retorna `{ historical: [{ locales: [{ id, name, type, indicators: [{ id, name, area, base, values: [{ year, value_relative, value_absolute }], subindicators: [{ classification, data: [{ description, id, values: [{ value_relative, value_absolute, year }] }] }] }] }] }] }`. Sem filtro de `year` — retorna toda a série histórica disponível (anos 2017–2019). | Painel Nacional / modo histórico |
| `data/random_indicator` | `locale_id_ne` (query, integer, opcional — ids a excluir) | Indicador aleatório (usado no rotator da home) | Home indicators rotator |
| `data/resume` | `locale_id` (obrigatório), `year` (opcional) | **CONFIRMADO:** baixa um **relatório em PDF** (`produces: application/pdf`) — NÃO é JSON. Não é a fonte dos números do Hero. | Botão de download de relatório, não o Hero |
| `data/download` | — | Download de planilha com dados de todas as localidades (`application/pdf` na spec, provável XLSX na prática) | Open data / Midiateca |
| `data/download_indicator` | `locale_id` (query, integer, **obrigatório**); `indicator_id` (query, integer, **obrigatório**) | **CONFIRMADO (openapi.yaml):** retorna um arquivo XLSX com dados do indicador para a localidade especificada. Nenhum parâmetro opcional. | Open data / Midiateca |
| `upload_plan` | POST, multipart/form-data: `file` (PDF, obrigatório), `name` (string, obrigatório), `message` (string, obrigatório), `email` (email, obrigatório) | Upload de plano municipal. Backend já dispara e-mail via SMTP/Minion ao receber upload — infra de e-mail existe, mas é dedicada a este fluxo, não ao contato geral | Consulta pública — fluxo de upload |

> **CONFIRMADO: não existe endpoint para números agregados do Hero.**
> A API Perl não possui nenhum endpoint que retorne estatísticas nacionais consolidadas (total de municípios mapeados, municípios/estados com plano aprovado, etc.). `data/resume` é PDF. Nenhum outro endpoint da spec (`/locales`, `/states`, `/cities`, `/areas`, `/classifications`, `/indicators`, `/data`, `/data/compare`, `/data/historical`, `/data/random_indicator`, `/data/download`, `/data/download_indicator`) retorna esses agregados diretamente. **Solução a adotar na Fase 1/2:** os números do Hero devem ser definidos como constantes estáticas (hardcoded) no componente Hero — os dados do mapa OMLPI não mudam em tempo real e os números publicados no site atual são editorialmente aprovados. Revisar se o Strapi tem campo para isso antes de hardar; caso contrário, constante estática é a alternativa correta.

> **CONFIRMADO: não existe endpoint para a aba "Monitoramento".**
> Nem `classifications` (retorna apenas rótulos de string) nem `indicators` (retorna apenas metadados sem valores) são suficientes para renderizar uma aba de monitoramento isoladamente. Os valores dos indicadores só existem acoplados a uma `locale_id` específica via `GET /data`. Qualquer aba de "Monitoramento" que precise de dados tabulares nacionais dependeria de uma solicitação de novo endpoint ao backend — o que está fora do escopo deste projeto.

## 3. Busca full-text — `omlpi-cms-search`

Serviço **separado** do Strapi (Node + Restify), porque o Strapi não tem full-text search nativo. **Esta é a fonte correta para a Midiateca — não usar a collection `artigos` do Strapi diretamente para busca/filtro.**

Base: definir `CMS_SEARCH_API_URL` como variável de ambiente.

| Endpoint | Funcionalidade |
|---|---|
| `GET /artigos` | Busca de artigos com suporte a full-text search, filtro por tags e paginação |

**Ação corretiva necessária:** a Fase 2 implementou a Midiateca usando `getArtigos()` de `lib/strapi.ts` (Strapi direto). Antes da Fase 3, criar `lib/cms-search.ts` apontando para este serviço e migrar a busca/filtro da Midiateca para ele. Strapi pode continuar sendo usado para outros campos que ele de fato serve (ex: metadados que não dependem de busca textual), mas não para o fluxo de busca em si.

## 3. Variáveis de ambiente necessárias (Next.js)

```
STRAPI_API_URL=
OMLPI_API_URL=
CMS_SEARCH_API_URL=
# se usar Resend para o formulário de contato:
RESEND_API_KEY=
CONTACT_EMAIL_TO=
```
