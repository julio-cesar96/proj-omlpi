# Fase 3 — Módulo de Configurações

**Branch:** `feature/cms-redesign`
**Data:** 2026-08-06

---

## O que foi implementado

### Endpoint customizado `/cms-config` (Strapi)

Novo endpoint em `omlpi-cms/api/cms-config/`:

| Arquivo | Descrição |
|---|---|
| `config/routes.json` | `GET /cms-config` + `PUT /cms-config` |
| `controllers/cms-config.js` | Usa `strapi.store()` (tabela `core_store`) para leitura e escrita. PUT faz merge seguro com whitelist de campos. Segue as regras antiincidente: `ctx.body =` (não `return`), `await` em todas as chamadas assíncronas. |

**Chave de storage:** `{ environment: '', type: 'plugin', name: 'cms-config', key: 'settings' }`

**Valor padrão** (quando `core_store` não tem registro ainda):
```json
{
  "site_name": "Observa RNPI",
  "site_url": "https://observarnpi.org.br",
  "idioma_padrao": "pt-BR",
  "fuso_horario": "America/Recife",
  "autosave_enabled": false,
  "require_review": false
}
```

### bootstrap.js — `enableCmsConfigPermissions()`

Adicionada função idempotente que habilita `find` e `update` para o role `Authenticated` no controller `cms-config`. Chamada no final da chain do `module.exports`. Segue o mesmo padrão das outras funções do bootstrap (cria se não existe, habilita se desabilitada, log.debug se já ativa).

### Tipos TypeScript — `src/lib/strapi.ts`

```ts
interface CmsConfig {
  site_name: string;
  site_url: string;
  idioma_padrao: string;
  fuso_horario: string;
  autosave_enabled: boolean;
  require_review: boolean; // salvo mas sem efeito operacional — ver Pendências
}
type CmsConfigPayload = Partial<CmsConfig>;
```

### Hook `useConfiguracoes` — `src/hooks/configuracoes/useConfiguracoes.ts`

- `queryKey: ['cms-config']`, `staleTime: 5 min`
- React Query deduplica automaticamente chamadas simultâneas dos 3 editores (sem Context extra)
- Expõe: `config`, `isLoading`, `saveConfig`, `isSaving`, `saveError`
- `onSuccess` do mutation faz `setQueryData` diretamente (evita refetch desnecessário)

### Hook `useAutosave` — `src/hooks/configuracoes/useAutosave.ts`

- Debounce de 3 s após cada mudança em `data`
- Só ativa quando `config.autosave_enabled === true` **e** `isEditing === true`
- `onSave` referenciado via `useRef` (sem `useCallback` obrigatório no caller)
- Erros são silenciosos (`console.warn`) — não interrompem o usuário
- Expõe `cancelTimer()` para cancelamento em ações manuais

### Tela de Configurações — `src/pages/Configuracoes.tsx`

Substituição completa do stub da Fase 1:

- **4 tabs:** Geral (funcional) + Marca/Notificações/Integrações (desabilitadas, badge "Em breve")
- **Card "Informações do site":** grid 2×2 com Nome, URL, Idioma (select), Fuso (select)
- **Card "Fluxo editorial":**
  - Toggle "Exigir revisão antes de publicar" — badge "Pendente", nota explicativa sobre limitação
  - Toggle "Salvamento automático de rascunhos" — funcional
- **Footer:** Descartar (reset ao último salvo) + Salvar alterações
- Skeleton de loading enquanto config chega
- Toast de confirmação ao salvar

### Autosave nos 3 editores

| Editor | Arquivo | Ponto de integração |
|---|---|---|
| Planos | `components/planos/PlanoDrawer.tsx` | Hook `useAutosave` com `autosaveDraft` (useMemo). `cancelAutosaveTimer()` nos 5 handlers: `handleDraft`, `handleReview`, `handlePublish`, `handleArchive`, `handleDuplicate`. Exibe timestamp discreto no header após primeiro autosave. |
| FAQ | `components/faqs/FaqModal.tsx` | Hook `useAutosave` com `form` (FormState). `cancelAutosaveTimer()` em `handleSaveDraft` e `handlePublish`. Payload construído inline (preserva `published_at` atual). |
| Textos | `pages/TextosEditor.tsx` | Hook `useAutosave` com `autosaveDraft` (useMemo). `cancelAutosaveTimer()` em `handleSave`. Guard `if (!id) return` como segurança extra. `published_at` sempre preservado de `pagina`. |

**Regra de segurança crítica (verificada em todos os 3):**
- Planos: `estado_editorial` e `published_at` sempre copiados do registro atual (`plano!.estado_editorial`, `plano!.published_at`)
- FAQ: `published_at: faq!.published_at ?? null` — nunca omitido (bug auto-publicação Strapi v3)
- Textos: `published_at: pagina?.published_at ?? null` — nunca altera

---

## Protocolo de deploy seguido

> **Antes do restart do Strapi:** realizar backup do banco de dados PostgreSQL e confirmar que o arquivo tem tamanho não-zero.

1. Copiar para o servidor: `omlpi-cms/api/cms-config/` + `omlpi-cms/config/functions/bootstrap.js`
2. Restart do Strapi (PM2/Docker conforme o ambiente)
3. Monitorar logs por 3–5 minutos — esperar:
   - `[bootstrap] Permissão criada: cms-config.find`
   - `[bootstrap] Permissão criada: cms-config.update`
4. Testar incrementalmente:
   - `GET /cms-config` com JWT → deve retornar o objeto de config padrão
   - `PUT /cms-config` com payload parcial → deve retornar merge
   - `GET /planos` → verificar que endpoints existentes continuam OK (sanity check)
5. Deploy do bundle do `painel-cms/` e verificar a tela de Configurações no browser

---

## Pendências formais (fora de escopo)

### Toggle "Exigir revisão antes de publicar"
- **Status:** salva o valor, mas não bloqueia a publicação de nada
- **Motivo:** Planos tem `estado_editorial` (rascunho/revisão/publicado/arquivado) que permitiria a implementação, mas FAQ e Textos Institucionais só têm `published_at` (binário). Para ter paridade nos 3 módulos seria necessário adicionar campo de estado editorial em produção (mudança de schema + migration) — fora do contrato atual
- **Decisão:** cliente é avisado pela badge "Pendente" e pela nota explicativa na própria tela

### Campos de "Informações do site"
- **Status:** salvos e acessíveis via `GET /cms-config`, mas sem consumidor no front-end
- O Sidebar continua exibindo "Observa RNPI" fixo
- O site Next.js (`next/`) não consulta esse endpoint
- **Decisão documentada:** preparação para uso futuro — a decisão de conectar os campos a componentes reais é do cliente

### Abas Marca, Notificações, Integrações
- Exibidas com badge "Em breve", sem conteúdo ou endpoints associados

---

## Estrutura de arquivos criados/modificados

```
omlpi-cms/
├── api/cms-config/                        [NEW]
│   ├── config/routes.json
│   └── controllers/cms-config.js
└── config/functions/bootstrap.js          [MODIFY] +enableCmsConfigPermissions()

painel-cms/src/
├── lib/strapi.ts                          [MODIFY] +CmsConfig, CmsConfigPayload
├── hooks/configuracoes/                   [NEW dir]
│   ├── useConfiguracoes.ts
│   └── useAutosave.ts
├── pages/
│   ├── Configuracoes.tsx                  [MODIFY] substituído stub
│   └── TextosEditor.tsx                   [MODIFY] +useAutosave
└── components/
    ├── planos/PlanoDrawer.tsx             [MODIFY] +useAutosave
    └── faqs/FaqModal.tsx                  [MODIFY] +useAutosave
```

---

## Verificação

- **`npx tsc --noEmit`:** zero erros (executado após todas as edições)
- Testes manuais a realizar no próximo deploy:
  1. GET/PUT `/cms-config` retornam/aceitam o payload correto
  2. Autosave OFF: editar por 5 s → nenhum PUT gerado
  3. Autosave ON: editar, aguardar 3 s → PUT silencioso → `estado_editorial`/`published_at` intactos
  4. Ação manual cancela timer: editar e em 2 s clicar "Publicar" → apenas 1 PUT
  5. Botão "Descartar" restaura valores do último save
