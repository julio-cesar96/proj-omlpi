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
| `sobres` | Texto institucional | Sobre (Quem somos / Resultados / Histórico — confirmar se são 3 registros ou 1 registro com campos distintos) |
| `textoindicadors` | Texto da página de indicadores | Seção Indicadores (a mapear dentro do one-page) |
| `guias` | Guias/documentos de referência | Midiateca / PNIPI (a confirmar) |
| `tags` | Tags de artigos | Midiateca (se biblioteca de artigos for mantida) |
| `artigos` | Artigos da biblioteca (busca, tags, paginação) | Midiateca (a confirmar se substitui ou convive com grade de documentos) |
| `locales` | Lista de localidades (municípios/estados) | Consulta pública — busca e seleção |
| `privacy-policy` | Conteúdo da política de privacidade | Rodapé / seção própria (ex-`/rastreio`) |

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

## 2. API custom (Perl/Mojolicious)

Base: definir `OMLPI_API_URL` como variável de ambiente.

| Endpoint | Parâmetros | Uso atual | Página/seção nova correspondente |
|---|---|---|---|
| `locales` | — | Lista de localidades para busca/autocomplete | Consulta pública (busca) |
| `data` | `locale_id` | Dados do dashboard de uma localidade | Painel Municipal (ex-`/city`) |
| `data/compare` | — (a confirmar params exatos) | Dados de comparação entre localidades | Painel Nacional / modo comparação (ex-`/comparacao`) |
| `data/historical` | — (a confirmar params exatos) | Dados históricos de uma localidade | Painel Nacional / modo histórico (ex-`/historico`) |
| `data/random_indicator` | — | Indicador aleatório (usado no rotator da home) | Home indicators rotator |
| `data/resume/` | `locale_id` | Resumo/sumário de uma localidade | Possível fonte dos números do Hero (5.570 municípios, 2.022 com plano, etc. — a confirmar) |
| `data/download` | — | Download de dados abertos | Open data / Midiateca |
| `data/download_indicator` | — | Download de indicador específico | Open data / Midiateca |
| `upload_plan` | POST, multipart (arquivo de plano) | Upload de plano municipal | Consulta pública — fluxo de upload |

**Pendências a validar com quem tem acesso ao backend antes da Fase 3:**

- Parâmetros exatos de `data/compare` e `data/historical` (o front atual monta isso via JS em `compare.js`/`history.js` — vale confirmar direto com quem mantém a API Perl, não só inferir do front antigo).
- Se existe endpoint que sustente a aba "Monitoramento" do novo design (sem paralelo identificado no inventário atual).
- Se existe endpoint de contato — caso não exista, seguir alternativa descrita em `docs/PLANO_ONEPAGE.md` (Resend + Route Handler ou Web3Forms).

## 3. Variáveis de ambiente necessárias (Next.js)

```
STRAPI_API_URL=
OMLPI_API_URL=
# se usar Resend para o formulário de contato:
RESEND_API_KEY=
CONTACT_EMAIL_TO=
```
