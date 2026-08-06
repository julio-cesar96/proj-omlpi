# Fase 3 — Módulo de Usuários

**Branch:** `feature/cms-redesign`
**Data:** 2026-08-06

---

## O que foi implementado

### Endpoint customizado `/role-lookup`
- Rota HTTP própria em `omlpi-cms/api/role-lookup/`, fora do sistema de roles nativo, para contornar a `policy admin::hasPermissions` que bloqueia `GET /users-permissions/roles` para qualquer JWT não-admin nativo.
- Protegido pelas permissões normais do Strapi (`Authenticated` ou `Administrador`).
- Retorna apenas `{ id, name }` dos 3 roles conhecidos (Administrador, Editor, Revisor).
- **Confirmado funcionando em produção:** ids 3, 4 e 5 respectivamente.

### Correções no `bootstrap.js`
1. **`ctx.body` (controller):** O controller `role-lookup.js` foi corrigido para atribuir explicitamente `ctx.body` em vez de usar `return`, que não funciona em Strapi v3.
2. **`getActions()` sem argumento:** Substituída a chamada `getPlugins('en')` + `getActions(plugins)` (que fazia requisição HTTP a `marketplace.strapi.io`) por `usersPermissionsService.getActions()`, que funciona localmente e de forma síncrona.
3. **Bug de case-sensitivity `findone` → `findOne`:** O método real do controller core em Strapi v3.3.3 é `findOne` (O maiúsculo). Todas as funções auxiliares (`enableAll`, `enableWrite`, `enableUserAll`, bloco do Revisor, `ACTIONS`, `enableUploadAll`, `enableUploadWrite`) foram corrigidas. O bug era silencioso: o `if` guard simplesmente ignorava a action inexistente.
4. **Formato de controller em `enablePublicPermissions`:** O formato antigo `application::${contentType}.${contentType}` não bate com o que o Strapi v3 armazena internamente — o valor correto é o nome puro do content-type (ex: `plano`, `faq`). Corrigido para `const controller = contentType`.
5. **Limpeza de registros malformados:** Adicionada função `cleanupMalformedPublicPermissions()` que remove do banco qualquer permissão com `controller` contendo `application::`, executada no `module.exports` antes do loop principal. Idempotente: nas rodadas seguintes, simplesmente não encontra nada. Os **8 registros malformados** gerados pela versão anterior foram removidos manualmente via Strapi Admin pelo cliente antes do primeiro restart com a versão corrigida.

### Permissões dos 3 roles
Roles criados via `bootstrap.js` idempotente (só cria se ainda não existem):

| Role | Plano | FAQ | Pág. Institucional | Categoria | Tags | Upload | Usuários | Role-lookup |
|---|---|---|---|---|---|---|---|---|
| Administrador | CRUD completo | CRUD completo | CRUD completo | CRUD completo | CRUD completo | CRUD+destroy | CRUD+me | find |
| Editor | find/findOne/count/create/update | idem | idem | idem | idem | find/findOne/count/upload | me | find |
| Revisor | idem | idem (sem delete) | find/findOne/count/update | idem | idem | idem | me | find |

### Frontend — novos arquivos

| Arquivo | Descrição |
|---|---|
| `src/lib/strapi.ts` | Tipos: `RoleLookup`, `UsuarioRole`, `StrapiUsuario`, `UsuarioPayload`, `UsuarioUpdatePayload`, `UsuariosListParams` |
| `src/hooks/usuarios/useUsuarios.ts` | `GET /users?_sort=username:ASC` |
| `src/hooks/usuarios/useRoles.ts` | `GET /role-lookup` (5 min de cache) |
| `src/hooks/usuarios/useUsuarioMutations.ts` | `createUsuario`, `updateUsuario`, `toggleBloqueio` + `generateTempPassword()` |
| `src/components/usuarios/SenhaTemporariaDialog.tsx` | Modal Radix de exibição única da senha, com botão de copiar e aviso |
| `src/components/usuarios/UsuarioDrawer.tsx` | Drawer com campos username/email, 3 cards de role, link para Strapi Admin, bloqueio reversível, proteção anti-lockout |
| `src/pages/Usuarios.tsx` | Tabela completa: avatar+email, badge colorido de role, indicador Ativo/Inativo |

### Decisões aprovadas incorporadas
- **Bloqueio reversível (Opção A):** `PUT /users/:id { blocked: true/false }` — nunca DELETE.
- **Senha temporária automática:** Gerada no momento de `createUsuario.mutateAsync`, 14+ chars, exibida uma única vez no `SenhaTemporariaDialog`. Após fechar, não existe mais em estado algum.
- **Sem "último acesso":** Campo não existe no schema padrão do Strapi v3 User — omitido conforme decisão.
- **Sem matriz de permissões editável:** O drawer exibe apenas os 3 cards de role + link para o Strapi Admin nativo.
- **Proteção anti-lockout:** O usuário logado não pode bloquear nem alterar o próprio role; cards de role e botão de bloqueio ficam desabilitados quando `isSelf === true`.

---

## Incidente de produção

**Data:** 2026-08-04

**Sintoma:** Permissões dos content-types novos (`plano`, `faq`, `pagina-institucional`, `categoria`) não funcionavam publicamente mesmo após o bootstrap rodar sem erros.

**Causa raiz:** `enablePublicPermissions()` criava registros no banco com `controller = "application::plano.plano"` (formato incorreto). O Strapi v3 armazena o nome puro (`plano`). A policy de permissões compara `ctx.request.route.action` literalmente — como nunca batia, a permissão pública nunca era concedida.

**Resolução:**
1. Corrigido `const controller = contentType` (nome puro).
2. Adicionada `cleanupMalformedPublicPermissions()` para remover os 8 registros malformados.
3. Cliente removeu manualmente os 8 registros via Strapi Admin antes do restart.
4. Após restart, bootstrap criou os registros corretos e as permissões públicas passaram a funcionar.

---

## Pendências conhecidas (fora de escopo)

- **Matriz de permissões editável:** Requer UI complexa para o mapeamento de actions × roles. Deliberadamente fora deste MVP — gerenciado exclusivamente via Strapi Admin nativo.
- **Reset de senha do próprio usuário:** Não há endpoint de e-mail confirmado. A senha temporária gerada na criação é a única forma de entrega — se perdida, o usuário deve ser recriado.
- **Paginação da lista de usuários:** `GET /users` retorna todos. Para volume alto, implementar `_limit`/`_start` numa iteração futura.
