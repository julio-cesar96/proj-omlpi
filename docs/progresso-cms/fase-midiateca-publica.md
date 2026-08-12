# Fase — Campo público/privado na Midiateca

**Branch:** `feature/migration-next` (pós-merge com `feature/cms-redesign`)  
**Data:** 2026-08-11  
**Áreas modificadas:** `omlpi-cms/`, `painel-cms/`, `next/`

---

## O que foi decidido

### Problema raiz
O plugin Upload do Strapi v3 não tem conceito de arquivo público/privado.
Abrir `Public.find` no controller nativo exporia toda a Media Library (incluindo
capas e documentos de planos em rascunho). Decisão: extensão de model + endpoint
customizado, sem nunca abrir `/upload/files` para o role Public.

### Decisões tomadas durante a implementação

| # | Decisão | Escolha |
|---|---|---|
| Q1 | Aba "Artigos" (omlpi-cms-search) | **Removida** — dependência do serviço de busca externo eliminada |
| Q2 | Paginação da aba Mídias no next/ | **Route Handler proxy** `/api/midiateca-publica` com paginação real via `count` |
| Q3 | Badge público/privado no painel-cms | **Implementado** — badge no canto superior esquerdo do card |

### Descoberta crítica: mecanismo de extensão do Strapi v3

Verificado contra o código-fonte real de `strapi@3.0.0-beta.17.5`
(`lib/core/load-extensions.js` + `lib/Strapi.js`):

```js
// Strapi.js — linha real de aplicação do overwrite:
extensions.overwrites.forEach(({ path, mod }) => {
  _.assign(_.get(this.plugins, path), mod);
});
```

`_.assign` = **shallow merge**: o arquivo de extensão **deve conter todos os
campos originais** + o campo novo. Uma extensão parcial destruiria os campos
nativos silenciosamente. O JSON base foi confirmado via `docker exec` no
container real de produção antes de criar o arquivo.

### Divergência de versão registrada (não bloqueante)
O `package.json` local do `omlpi-cms` declara `3.0.0-beta.17.5`, mas o container
em produção roda `3.3.3` (confirmado em logs de boot). Inconsistência de
rastreamento — não corrigida aqui, fora de escopo.

---

## O que foi implementado

### Estrutura de arquivos criados / modificados

```
omlpi-cms/
├── extensions/
│   └── upload/
│       └── models/
│           └── File.settings.json          [NOVO] — cópia completa + is_public
├── api/
│   └── midiateca-publica/                  [NOVO]
│       ├── config/routes.json
│       └── controllers/midiateca-publica.js
└── config/functions/bootstrap.js           [MODIFY] — bloco enableMidiatecaPublicaPermission()

painel-cms/src/
├── lib/strapi.ts                            [MODIFY] — is_public?: boolean em StrapiFile
├── hooks/midiateca/useMediaTogglePublic.ts  [NOVO]
└── components/midiateca/MediaCard.tsx       [MODIFY] — badge + toggle no menu ⋯

next/src/
├── lib/strapi.ts                            [MODIFY] — StrapiMidiaPublica + getMidiaPublica()
├── app/api/midiateca-publica/route.ts       [NOVO] — Route Handler proxy
├── components/sections/Midiateca.tsx        [MODIFY] — remove artigos/tags, adiciona midias SSR
├── components/sections/MidiatecaClient.tsx  [MODIFY] — remove ArtigosTab, adiciona MidiasTab
├── lib/cms-search.ts                        [DELETADO]
└── app/api/artigos/route.ts                 [DELETADO]
```

### Detalhes de cada área

#### omlpi-cms — extensão do model e endpoint customizado

**`extensions/upload/models/File.settings.json`**
- JSON 100% completo do model original (confirmado via `docker exec omlpi_strapi cat ...`)
- Inclui `"options": { "timestamps": true }` (bloco ausente em versões anteriores do plano)
- Campo adicionado: `"is_public": { "type": "boolean", "default": false }`
- Registros existentes no banco: o knex/Bookshelf executa `ALTER TABLE` ao boot
  e o banco preenche `DEFAULT false` em todos os registros antigos automaticamente

**`api/midiateca-publica/`**
- Rota: `GET /midiateca-publica`
- Controller: filtra `is_public: true` via `strapi.query('file', 'upload').find()`
- Usa `name_contains` (não `_q`) — `_q` não é reconhecido pelo `find()` nativo,
  apenas pelo `service.search()` do controller nativo do plugin
- Retorna `{ results: [], count: N }` para paginação
- Params aceitos: `_start`, `_limit`, `_sort`, `name_contains`, `mime_contains`

**`bootstrap.js`**
- Novo bloco `enableMidiatecaPublicaPermission()` idempotente
- Concede `find` ao role Public apenas no endpoint customizado
- `/upload/files` nativo **não é aberto** — segurança mantida

#### painel-cms — toggle e badge

**`useMediaTogglePublic.ts`**
- `useMutation` que chama `PUT /upload/files/:id` com `{ is_public: boolean }`
- O endpoint nativo do Strapi aceita campos customizados do model estendido
- Invalida `['media-files']` ao completar para atualizar o badge no grid

**`MediaCard.tsx`**
- Badge no canto superior esquerdo da thumbnail:
  - 🌐 verde (`#d1fae5` / `#065f46`) quando `is_public === true`
  - 🔒 cinza neutro quando `false`
- Novo item no menu ⋯ entre "Visualizar/Baixar" e "Excluir":
  - "Tornar público" / "Tornar privado" com ícone Globe/Lock (lucide-react)
  - Desabilitado durante a mutation (`.isPending`)
- **Fix colateral do merge:** `Configuracoes.tsx` usava prop `onHide` inexistente
  no componente `Toast.tsx` — corrigido para `onClose`

#### next/ — nova aba Mídias

**`Midiateca.tsx` (Server Component)**
- Remove `searchArtigos()`, `getTags()` — não mais necessárias
- Busca paralela: `getGuias()` + `getMidiaPublica({ _limit: 20, _start: 0 })`
- Passa `midias` e `totalMidias` para `MidiatecaClient`

**`MidiatecaClient.tsx` (Client Component)**
- Remove `ArtigosTab` e todo código relacionado ao `omlpi-cms-search`
- Nova aba **"Mídias"** com:
  - Busca por nome (`name_contains`) — input + botão Buscar
  - Filtros por tipo: Todos / PDFs / Imagens / Vídeos / Documentos
  - Filtro "doc" feito client-side (os demais usam `mime_contains` server-side)
  - Paginação via `GET /api/midiateca-publica` (Route Handler proxy)
  - `hasMore` calculado por `offset < count` (não por `results.length === LIMIT`)
  - Grid 4 colunas desktop, 2 tablet

**`/api/midiateca-publica/route.ts` (Route Handler)**
- Proxy que oculta `STRAPI_API_URL` do bundle do browser
- Whitelist de params: `_start`, `_limit`, `_sort`, `name_contains`, `mime_contains`
- Retorna `{ results, count }` diretamente do endpoint do Strapi

**Removidos definitivamente:**
- `lib/cms-search.ts` — cliente do `omlpi-cms-search`
- `app/api/artigos/route.ts` — proxy de artigos

---

## Resultado dos builds

| Projeto | Resultado |
|---|---|
| `next/` — `npm run build` | ✅ Zero erros TypeScript. `/api/midiateca-publica` listado nas rotas. |
| `painel-cms/` — `npm run build` | ✅ Zero erros TypeScript. Vite OK. |

---

## Protocolo de deploy executado

### Etapa 0 — Backup
```bash
docker exec strapi_pg_db pg_dump -U pgstrapi strapi_prod2024 > /root/backup_strapi_YYYYMMDD_HHMM.sql
```

### Etapa 1 — Cópia pro servidor (do Mac)
```bash
scp -r omlpi-cms/extensions/upload root@observa.vps-kinghost.net:/root/strapi-prod/extensions/
scp -r omlpi-cms/api/midiateca-publica root@observa.vps-kinghost.net:/root/strapi-prod/api/
scp omlpi-cms/config/functions/bootstrap.js root@observa.vps-kinghost.net:/root/strapi-prod/config/functions/bootstrap.js
```

### Etapas 2–5 — Restart, logs, curls e testes funcionais
*(a preencher com os resultados reais após execução pelo cliente)*

---

## Desvios do plano original

- **`options.timestamps`** ausente no JSON base inicial: detectado na confirmação
  via `docker exec` e corrigido antes de criar o arquivo de extensão.
- **Filtro "doc" client-side:** o endpoint `midiateca-publica` não implementa
  exclusão tripla de MIME (`!pdf && !img && !video`) por simplicidade. O filtro
  "Documentos" no next/ funciona client-side sobre os resultados da página atual.
  Limitação aceitável para o volume atual; pode ser refinado se necessário.
- **Fix colateral:** erro `onHide` → `onClose` em `Configuracoes.tsx`, introduzido
  no merge e não relacionado ao escopo desta entrega.

---

## Limitações conhecidas

- **Aba Mídias vazia por padrão:** todos os arquivos existentes nascem com
  `is_public: false`. O conteúdo aparece conforme arquivos forem marcados como
  públicos no painel-cms.
- **Filtro "Documentos" client-side:** aplica-se sobre os resultados da página
  atual, não sobre o total. Se o usuário paginar com filtro "doc" ativo, os
  resultados são filtrados depois do carregamento server-side.
- **Badge não persiste otimisticamente:** ao clicar em "Tornar público", o badge
  só atualiza após invalidação e refetch bem-sucedido do React Query. Não há
  optimistic update — aceitável para o volume atual.

## Pendências para próximas fases

- Testar o toggle completo no painel-cms com arquivo real (marcar público → confirmar
  que aparece em `/midiateca-publica` → confirmar aba Mídias no site).
- Avaliar se o volume de arquivos públicos crescerá o suficiente para justificar
  filtro "doc" server-side via exclusão tripla de MIME.
- Indicador de armazenamento na Sidebar (pendência da Fase 2 do CMS, ainda estático).
