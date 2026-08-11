# CMS Observa RNPI — Escopo MVP vs. Design Completo

## Objetivo deste documento

O README.md (design de alta fidelidade) e o requisito contratual original do cliente (seção 5, abaixo) não são idênticos em escopo. Este documento separa o que é **obrigação contratual (MVP)** do que é **extra do design** (bonito, mas não pedido), para orientar priorização de desenvolvimento e decisões de negócio com o cliente.

## Requisito contratual original (fonte da verdade de escopo)

> 1. Painel administrativo ou CMS. Para evitar dependência técnica em atualizações rotineiras, recomenda-se fortemente um painel administrativo ou CMS.
> 5.1 O painel deverá permitir, no mínimo:
> a) editar textos institucionais; b) cadastrar e editar FAQs; c) cadastrar e editar materiais da Midiateca; d) cadastrar e editar registros de planos; e) fazer upload de PDFs; f) publicar/despublicar conteúdos; g) controlar ordem de exibição de conteúdos simples.
> 5.2 Permissões: perfis de usuário necessários no administrativo (ex.: administrador, editor, revisor).
> 5.3 Importação de dados: a) importação por planilha CSV/XLSX para cadastro em lote; b) exportação de base para conferência.

## Decisão de licenciamento já tomada

**Plano gratuito (Community) do Strapi.** Nenhuma feature deste projeto deve depender de plano pago (Growth/Enterprise). Onde o design pede algo que mapeia para um recurso nativo pago do Strapi, a solução é construir uma versão customizada equivalente (campo/content-type próprio), não habilitar plano superior.

## Mapeamento requisito → design → status

| Requisito | Coberto no design? | Observação |
|---|---|---|
| 5.1a Textos institucionais | ✅ Sim | Módulo "Textos Institucionais" |
| 5.1b FAQs | ✅ Sim | Módulo "FAQs" |
| 5.1c Midiateca | ✅ Sim | Módulo "Midiateca" |
| 5.1d Registros de planos | ✅ Sim | Módulo "Planos" |
| 5.1e Upload de PDF | ✅ Sim | Dropzone em Planos e Midiateca |
| 5.1f Publicar/despublicar | ✅ Sim | Draft & Publish + status pill em todos os módulos de conteúdo |
| 5.1g Ordem de exibição de "conteúdos simples" | ✅ Confirmado | **Confirmado com o cliente**: é só FAQ mesmo. Design já cobre 100%. |
| 5.2 Perfis (admin/editor/revisor) | ✅ Sim | Módulo Usuários + matriz de permissão por content-type |
| 5.3a Importação CSV/XLSX | ✅ Sim | Overlay "Importar dados", com relatório de erro por linha |
| 5.3b Exportação de base | ✅ Confirmado | **Confirmado com o cliente**: exportação é só de Planos mesmo. Design já cobre 100%. |

## Itens do design SEM correspondência no requisito contratual

Não são obrigação — tratar como extra opcional, priorizar por último, e usar como item de negociação se o cliente pedir prazo mais curto ou quiser reduzir custo:

| Item do design | Por que não é MVP | Recomendação |
|---|---|---|
| Dashboard (KPIs, atividades recentes, atalhos, acessos recentes) | Não mencionado no requisito | Cortar do MVP ou simplificar para uma tela básica de boas-vindas |
| Busca global (⌘K), sino de notificações | Não mencionado | Cortar do MVP |
| **Histórico de versões com Restaurar** (Textos Institucionais) | Não mencionado — cliente só pediu publicar/despublicar, não versionamento | **Forte candidato a corte.** É a única feature do design que mapeia para recurso pago do Strapi (Content History, Growth/Enterprise). Construir uma versão customizada (content-type de snapshot) exige esforço de desenvolvimento real para algo que não foi contratado. Recomenda-se não implementar no MVP; oferecer como adicional pago se o cliente quiser depois. |
| SEO (meta título/descrição) em Textos Institucionais | Não mencionado explicitamente | Barato de incluir (só campos a mais) — pode entrar no MVP sem custo relevante, diferente do histórico de versões |

## Sobre o fluxo editorial de 4 estados (Rascunho → Em revisão → Publicado → Arquivado)

Não é possível usar o "Review Workflows" nativo do Strapi (recurso pago). **Solução:** campo `estado_editorial` customizado (enum), como o próprio design já sugere no modelo de dado — sem custo de licença, só trabalho de modelagem normal.

## Decisão de arquitetura (investigação técnica de 14/07/2026 — SUPERSEDED)

> [!NOTE]
> **ATUALIZAÇÃO EM 16/07/2026:** A decisão de construir uma aplicação React + Vite separada foi revertida. Ver seção *"Decisão de caminho — MVP vs. redesign rico"* abaixo.

Content-types novos: `plano`, `faq`, `pagina-institucional`, `categoria`. Content-types existentes (`artigos`, `banners`, `eixos`, `guias`, `infographics`, `listaplanos`, `locales`, `noticias`, `politica-de-privacidade`, `sobre`, `tags`, `tags-alias`, `textoindicadors`) permanecem intocados.


## Achado de segurança — RESOLVIDO (15/07/2026)

O admin do Strapi estava exposto publicamente. **Mitigação aplicada e confirmada**: HTTP Basic Auth via Nginx em `/admin` (`/etc/nginx/sites-available/observa`, com backup salvo antes da mudança). Testado: `/admin` → `401`; `/locales` e `/artigos` → `200`, sem impacto no restante do tráfego.

**Versão real do Strapi confirmada**: `3.3.3` (última versão estável do v3, via `docker exec` no container de produção) — não a beta que uma investigação anterior havia indicado incorretamente, por ter lido um clone GitHub desatualizado em vez do código real do servidor. EOL desde 2023 continua valendo (é a versão, não a idade dela, que está sem suporte).

**Pendência secundária, não urgente**: o arquivo Nginx tem um bloco `server_name` duplicado (cópia inativa, sem a rota `/artigos`) — vale limpar depois, sem pressa.

## Content-types existentes — decisão final sobre sobreposição (investigação de 16/07/2026)

- **`listaplanos`**: intocado. É `singleType` (1 documento só), conceito diferente de `plano` (registro individual por município), zero uso confirmado no front atual. `plano` será criado do zero como `collectionType`. Se houver dado real em produção dentro de `listaplanos`, confirmar com o cliente antes de eventualmente descontinuar — não é urgente.
- **`infographics`**: não expor no novo painel. `singleType`, zero uso confirmado no front atual — provável feature nunca lançada. Não deletar do Strapi, só não incluir como módulo do painel novo.

## Pendências a confirmar com o cliente antes de fechar o plano de fases

1. ~~Escopo real de "controlar ordem de exibição de conteúdos simples" (5.1g)~~ — **Resolvido: é só FAQ.**
2. ~~Escopo real de "exportação de base para conferência" (5.3b)~~ — **Resolvido: é só Planos.**
3. Confirmar que Dashboard analítico, busca global, notificações e histórico de versões são aceitos como fora do MVP (ou se o cliente insiste nalgum desses, tratar como escopo adicional com prazo/custo à parte).

## Pendências de acesso para prosseguir

1. Credenciais de admin do Strapi — para confirmar schemas completos, habilitar permissão pública de `find` em `politica-de-privacidade` (atualmente retornando 403), e criar os content-types novos.
2. Acesso SSH/painel de hosting — para implementar a restrição de `/admin`.
3. Decisão de subdomínio para o novo painel (`admin.rnpiobserva.org.br`? `cms.observarnpi.org.br`?).

## Decisão de caminho — MVP vs. redesign rico (revisão final: 21/07/2026)

Decisão de 16/07/2026 (Caminho A, admin nativo do Strapi) foi revertida.
Decidido definitivamente: **Caminho A2 — aplicação React + Vite separada**,
consumindo a API REST do Strapi, conforme design em `CMS_DESIGN_SPEC.md` /
`observa-redesign.html`. Motivo: melhorar o processo de desenvolvimento.

A pendência de importação CSV/XLSX (antes associada ao Caminho A) deixa de
ser um problema — no Caminho A2 ela é resolvida nativamente pelo overlay
de importação já especificado no design (Fase 4 do painel novo), usando
PapaParse/SheetJS no client e chamadas em lote à API REST do Strapi.

