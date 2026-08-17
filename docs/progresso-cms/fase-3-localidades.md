# Fase 3 — Módulo de Localidades e Planos (CMS)

## O que foi decidido

- **Verificação Empírica de Contratos e Permissões**:
  - Testou-se a liberação de permissões do perfil `Authenticated` no Strapi Admin (`find`, `findone`, `count`, `update`).
  - O fluxo de vinculação do arquivo PDF (`POST /upload` -> `PUT /locales/:id` com `{ plan: fileId }`) foi validado empiricamente via `curl` antes de codificar a UI.
  - Retornos confirmados:
    1. `POST /upload`: arquivo gravado com sucesso, retornando ID do anexo.
    2. `PUT /locales/2684`: payload `{"plan": <fileId>}` associou o arquivo com HTTP 200 OK.
    3. `GET /locales/2684`: confirmou a propriedade `plan` devidamente populada.

- **Estratégia de UI (Padrão Híbrido - Decisão A3)**:
  - Tabela com ações rápidas: upload inline de PDF, indicação visual de status ("Com Plano" / "Sem Plano") e toggles para `is_law` e `hide_plan`.
  - Drawer lateral (`LocaleDrawer.tsx`) para gestão completa e visualização em preview dos arquivos anexados.

- **Estratégia de Desabilitação de Flags (Toggles)**:
  - As opções `is_law` e `hide_plan` ficam **desabilitadas** (`disabled` + tooltip explicativo) para localidades que não possuem plano anexado (`plan == null`).

- **Navegação e Filtros em Escala (5.597 Registros - Decisão B)**:
  - Paginação server-side (15 por página).
  - Filtro por Estado (UF), Tipo (`city`/`state`) e Busca por Nome ou Código IBGE (`_q`).
  - Filtrar pela Bahia (`state=BA`) limita com precisão a busca para os 418 municípios do estado.

- **Vinculação de Plano de Origem e Detecção de Desatualização**:
  - Schema de `locales.settings.json` estendido com o campo `plano_origem` (`model: "plano"`).
  - Confirmado via `curl` que o Strapi v3 realiza populate de 2 níveis (`Locale -> Plano -> StrapiFile`) sem necessidade de endpoints auxiliares.
  - A UI inclui o `PlanoSelectorModal.tsx` para escolher Planos publicados.
  - Detecção de desatualização: se `plano_origem.updated_at > locale.updated_at`, a UI exibe badge "Desatualizado" e o botão "Sincronizar".
  - Sincronização: re-envia PUT atualizando `plan` com a versão mais recente do `documento` do `plano_origem`, atualizando `locale.updated_at` e limpando o alerta.
  - Upload manual ou remoção de arquivo: define `plano_origem: null` no PUT, evitando falsas desatualizações contra Planos desvinculados.

---

## O que foi implementado

### Estrutura de Arquivos Criados / Modificados

```
proj-omlpi/
├── omlpi-cms/
│   └── api/
│       └── locales/
│           └── models/
│               └── locales.settings.json     # [MODIFY] Adicionado atributo plano_origem (model: plano)
├── painel-cms/src/
│   ├── lib/
│   │   └── strapi.ts                         # [MODIFY] Tipos Locale e LocaleUpdatePayload atualizados com plano_origem
│   ├── hooks/
│   │   └── localidades/
│   │       └── useLocaleMutations.ts         # [MODIFY] Suporte ao campo plano_origem no payload de update
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx                   # Item "Localidades" (ícone MapPin)
│   │   └── localidades/
│   │       ├── LocaleFilterBar.tsx           # Barra de busca por nome/IBGE, seletor de UF e Tipo
│       ├── LocaleTable.tsx               # [MODIFY] Tabela paginada, badge discreto de desatualização
│       ├── LocaleDrawer.tsx              # [MODIFY] Modal de plano_origem, aviso de desatualizado e botão Sincronizar
│       └── PlanoSelectorModal.tsx        # [NEW] Modal buscável para selecionar Planos publicados
├── pages/
│   └── Localidades.tsx                   # Página principal do módulo de localidades
└── router/
    └── index.tsx                         # Rota /localidades com lazy loading
```

---

## Resultados das Verificações

1. **Passo 1 (Bloqueante - Populate de `plano_origem`)**:
   - `PUT /locales/2684` -> `{"plano_origem": 9}` retornou 200 OK com o objeto `plano_origem` 100% populado, inclusive com o objeto `documento` (PDF).
   - `GET /locales/2684` -> confirmou retenção e populate aninhado completo de 2 níveis.
   - Dados originais restaurados pós-teste.

2. **Fluxo Completo de Vincular, Desatualizar, Sincronizar e Resetar**:
   - Vincular: `PUT /locales/2684` com `{"plan": 2600, "plano_origem": 9}` associou o arquivo e o Plano de origem.
   - Desatualização: `PUT /planos/9` disparou `plano_origem.updated_at > locale.updated_at`, ativando o estado e badge `Desatualizado`.
   - Sincronização: botão "Sincronizar" re-enviou o PUT, atualizando `locale.updated_at` e ocultando o badge.
   - Upload Manual: enviar novo PDF define `plano_origem: null`, removendo a amarração.

3. **Validação de Build**:
   - `npm run build` executado em `painel-cms/` com **sucesso (0 erros)**.

