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

## Decisão de arquitetura confirmada (investigação técnica de 14/07/2026)

**Painel administrativo = aplicação React + Vite separada**, consumindo a API REST do Strapi v3 via `users-permissions`/JWT. Não será um plugin/customização do admin nativo — o admin Strapi v3 não suporta o nível de customização visual exigido pelo design (tema limitado a cores/tamanhos, sem drawer nativo, sem drag & drop nativo).

Content-types novos: `plano`, `faq`, `pagina-institucional`, `categoria`. Content-types existentes (`artigo`, `blog`, `locale`, `regiao`, `tag`) permanecem intocados; `blog` fica oculto no novo painel, não deletado.

Stack recomendada: React + Vite, React Query, Lucide React, `@hello-pangea/dnd` (drag & drop), `react-dropzone`, PapaParse (CSV), SheetJS (XLSX). Hospedagem sugerida: Vercel, mesmo provedor do site público.

## Achado de segurança — comunicar separadamente, com urgência

O admin do Strapi está exposto publicamente (`/admin`, sem VPN/restrição de IP), rodando em Strapi v3 + Node 14, ambos sem suporte desde 2023. Mitigação recomendada antes de iniciar o desenvolvimento do painel: restringir `/admin` por IP ou HTTP Basic Auth no Nginx. Isso é uma comunicação urgente ao cliente, separada da decisão de redesign — é risco vivo, independente de qual caminho de painel for escolhido.

**Pendência de verificação:** existe divergência entre a versão do Strapi no `docker-compose.yml` (`3.3.3-node14`) e a lida do `package.json` (`3.0.0-beta.17.5`) — confirmar via lockfile antes de comunicar a gravidade ao cliente.

## Pendências a confirmar com o cliente antes de fechar o plano de fases

1. ~~Escopo real de "controlar ordem de exibição de conteúdos simples" (5.1g)~~ — **Resolvido: é só FAQ.**
2. ~~Escopo real de "exportação de base para conferência" (5.3b)~~ — **Resolvido: é só Planos.**
3. Confirmar que Dashboard analítico, busca global, notificações e histórico de versões são aceitos como fora do MVP (ou se o cliente insiste nalgum desses, tratar como escopo adicional com prazo/custo à parte).

## Pendências de acesso para prosseguir

1. Credenciais de admin do Strapi — para confirmar schemas completos de `locale`/`regiao`/`tag` e criar os content-types novos.
2. Acesso SSH/painel de hosting — para implementar a restrição de `/admin`.
3. Decisão de subdomínio para o novo painel (`admin.rnpiobserva.org.br`? `cms.observarnpi.org.br`?).
