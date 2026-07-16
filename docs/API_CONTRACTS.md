# Contratos de API — Observa

Backend já está pronto e estável. Este documento descreve os contratos exatamente como consumidos hoje pelo front atual (fonte: inventário em `docs/archive/plan.md`, complementado com leitura direta de `omlpi-api/public/openapi.yaml`). Não inventar endpoints, parâmetros ou formatos além do que está aqui — se algo for necessário e não estiver descrito, sinalizar como pendência em vez de supor.

## 1. CMS (Strapi)

Base: definir `STRAPI_API_URL` como variável de ambiente.

Collections consumidas hoje:

| Collection | Uso atual | Página/seção nova correspondente |
|---|---|---|
| `banners` | Home banner | Hero (Início). **RESOLVIDO (16/07/2026):** schema real é `singleType` só com `title` + `text` (richtext). `lib/strapi.ts` e `Hero.tsx` corrigidos em `next/` — `getBanners()` virou `getBanner()` (singleType, sem array), Hero usa `banner?.text`. Hero não renderiza imagem real do CMS (campo `image` não existe) — usa SVG decorativo. **Pendência de design pro redesign do CMS:** se quiser imagem real no Hero, precisa adicionar campo `image` ao content-type. |
| `eixos` | Blocos de eixo temático | Seção "Axis" (Início). Schema confirmado batendo: `title` (obrigatório), `image`, `order`, `link`, `text`, `link_title`. |
| `noticias` | Lista de notícias | News strip (Início). Schema confirmado batendo: `title`, `date` (datetime), `image`, `link`, `hide_date`. |
| `sobres` | Texto institucional | **CONFIRMADO (Fase 1):** N registros, um por aba (Quem somos / Resultados do levantamento / Histórico). **RESOLVIDO (16/07/2026):** campos reais são `title`, `text` (richtext), `image` (upload), `link`, `link_title`, `link2`, `link2_title` — corrigido em `next/`. **Bug crítico que estava ativo, agora corrigido:** `SobreClient.tsx` renderizava `activeAba.content` (sempre `undefined`) — as abas do Sobre estavam em branco no site. Sort mudou de `order:asc` (campo inexistente) para `createdAt:asc` (determinístico). **Pendência de design pro redesign do CMS:** sem campo `order`, a ordem das abas não é controlável via painel — se precisar ser controlável, adicionar campo `order` (integer) ao content-type. |
| `textoindicadors` | Texto da página de indicadores | **CONFIRMADO:** é o texto introdutório da Midiateca (ex-`/indicadores`), como parágrafo no topo da seção. **RESOLVIDO (16/07/2026):** campos reais são `titulo`/`texto` (português) — `StrapiTextoIndicador` corrigido em `next/`, e `getTextoIndicadors()` (array) virou `getTextoIndicador()` (singleType, objeto único). Ainda sem componente consumindo — implementar ao conectar o parágrafo introdutório da Midiateca. |
| `guias` | Guias/documentos de referência | Midiateca / PNIPI — **INVESTIGADO E RESOLVIDO:** não existe content-type "FAQ" ou "Planos de ação" hoje. Schema confirmado: `title` (obrigatório), `description` (tipo `text` - plain text/textarea, não richtext), `file` (obrigatório, upload), sem Draft & Publish. **Decisão de modelagem adiada intencionalmente** para a fase de redesign do CMS — "Dúvidas frequentes" e "Planos de ação" permanecem como placeholder estático no front (Fase 2) até lá. |
| `tags` | Tags de artigos | Midiateca. Schema confirmado: `name`, relação `tags_aliases`. |
| `tags-alias` | **NOVO — schema confirmado (16/07/2026).** `Alias` (obrigatório, único), relação M2M com `tags`. Nome no admin: "Temas". Sem uso direto identificado em scripts do front atual. | Sem ação necessária por ora. |
| `artigos` | Artigos da biblioteca (busca, tags, paginação) | **CONFIRMADO (Fase 1):** Midiateca usa esta collection para metadados. Schema confirmado: `title`, `description` (richtext), `tags`, `file`, `author`, `image` (⚠️ collection/upload múltiplo, não model/upload único - comportamento normal do Strapi 3, não um bug), `date` (⚠️ string, não datetime), `organization`, `youtube`. **A busca/filtro em si vem do `omlpi-cms-search` (ver §3), não daqui.** |
| `locales` | Lista de localidades (municípios/estados) | Consulta pública — busca e seleção. Schema confirmado batendo exatamente com `StrapiLocale`: `name`, `type`, `cod_ibge` (único), `state`, `plan`, `region`, `is_capital`, `is_law`, `hide_plan`. |
| `politica-de-privacidade` | Conteúdo da política de privacidade | **CONFIRMADO (16/07/2026):** a rota REST correta é `/politica-de-privacidade` (definida no `routes.json` do Strapi v3, enquanto `privacy-policy` é apenas o `collectionName` do banco). O endpoint público atual retorna `403 Forbidden` porque as permissões públicas de `find` estão desativadas no painel do Strapi (precisa habilitar no admin do Strapi em Settings -> Roles -> Public). Continua sem seção própria no menu — abre como modal (`<PrivacyPolicyModal />`) a partir de um link no Footer. |
| `infographics` | **CONFIRMADO (16/07/2026): content-type morto.** `singleType`, zero uso em `omlpi-www/`. Não incluir no novo painel do CMS; não deletar do Strapi. | Sem ação necessária no front. |
| `listaplanos` | **CONFIRMADO (16/07/2026): sem sobreposição com o `plano` planejado.** `singleType` (1 documento), conceito diferente de um registro de plano por município. Zero uso no front atual. Deixar intocado; `plano` será criado do zero. | Sem ação necessária no front. |

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

Base: definir `OMLPI_API_URL` como variável de ambiente. **CONFIRMADO:** a API tem `basePath: /v2` no openapi.yaml — a URL base correta é `https://omlpi-api.rnpiobserva.org.br/v2`, não a raiz do domínio. O campo `host` do próprio openapi.yaml está desatualizado (aponta `dev-omlpi-api.appcivico.com`, domínio de desenvolvimento antigo) — mais um caso de spec divergindo da realidade, na linha do que a Fase 3b já achou com `data/compare`/`data/historical` (wrapper `locales` que não existe de verdade). **AÇÃO URGENTE:** verificar se `OMLPI_API_URL` em `next/.env.local` e `.env.local.example` já inclui o sufixo `/v2` — se não incluir, todas as chamadas de `lib/omlpi-api.ts` (mapa, painéis, upload) podem estar retornando 404 desde a Fase 3a. Fonte da verdade pra qualquer parâmetro ainda não exercido: `omlpi-api/public/openapi.yaml`, sempre validado contra chamada real, não como garantia isolada.

| Endpoint | Parâmetros | Uso atual | Página/seção nova correspondente |
|---|---|---|---|
| `locales` | — | Lista de localidades para busca/autocomplete. **CONFIRMADO (Fase 3a):** resposta vem envelopada como `{ locales: [...] }`, não array plano — tratar defensivamente. | Consulta pública (busca) |
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

Serviço **separado** do Strapi (Node + Restify), porque o Strapi não tem full-text search nativo.

**CONFIRMADO (15/07/2026), via inspeção direta de `/etc/nginx/sites-available/observa` e teste real:** não existe uma URL/host separado para este serviço. O Nginx roteia por **path**, no mesmo domínio do Strapi: `https://omlpi-strapi.rnpiobserva.org.br/artigos` é redirecionado internamente para o container `cms_search` (porta 2003), enquanto qualquer outra rota nesse mesmo domínio (`/locales`, `/banners`, etc.) vai para o Strapi de verdade (porta 2001). 

Comportamento confirmado com chamadas reais (16/07/2026):
- `GET /artigos?_q=teste` → `200 OK` (retorna `{"hasMore":true,"limit":2,"offset":0,"results":[...]}` com dados reais).
- `HEAD /artigos` → `405 Method Not Allowed` (o microserviço cms_search não suporta o método HEAD).
- Nenhuma ocorrência de `403` em `/artigos`.

**Não existe `CMS_SEARCH_API_URL` como variável separada** — é o mesmo valor de `STRAPI_API_URL`. **Ação necessária:** corrigir `lib/cms-search.ts` (criado na correção da Fase 2) para usar `STRAPI_API_URL` em vez de uma variável de ambiente própria; remover `CMS_SEARCH_API_URL` de `.env.local` e `.env.local.example`.

| Endpoint | Funcionalidade |
|---|---|
| `GET /artigos` (mesmo domínio do Strapi, roteado por path) | Busca de artigos com full-text search, filtro por tags e paginação. Shape confirmado: `{ hasMore, limit, offset, results: [...] }` |

## 4. Variáveis de ambiente necessárias (Next.js)

```
STRAPI_API_URL=
OMLPI_API_URL=
# CMS_SEARCH_API_URL removida (15/07/2026) — /artigos é roteado por path
# dentro do mesmo domínio de STRAPI_API_URL, não precisa de variável própria
# se usar Resend para o formulário de contato:
RESEND_API_KEY=
CONTACT_EMAIL_TO=
```
