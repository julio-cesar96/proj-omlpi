# Plano de Migração — Observa (One-Page em Next.js)

## Contexto revisado

Esse plano substitui a premissa original dos documentos `migration.md` e `MIGRATION_PLAN.md` (preservar comportamento visual 1:1 em múltiplas rotas) pelo cenário atual:

- **Backend já pronto e estável** (Strapi + API Perl) — não há modelagem de dados nova, exceto o formulário de contato (ver seção própria).
- **Escopo é 100% front-end.**
- **Novo layout em Figma**, estilo **one-page**: navegação institucional por âncora, dashboards de dado com estado refletido na URL (ver decisão de arquitetura abaixo).
- Mapa de "Consulta pública" deve usar a **geometria real do Brasil**, já existente em `src/static/maps` (drilldown por estado), não a forma livre do mockup.

## Decisão de arquitetura: uma página, dois tipos de navegação

| Tipo de conteúdo | Seções | Navegação |
|---|---|---|
| **Institucional** (estático, sem seleção do usuário) | Início, Sobre, PNIPI, Midiateca, Contato | Âncora simples (`#sobre`, `#pnipi`...), sem query params |
| **Dado/consulta** (o usuário escolhe estado/cidade/aba) | Consulta pública (Panorama nacional, Municipais, Estaduais/Distrital, Nacional, Monitoramento) | Mesma página, mas com estado refletido em query string (`?tab=municipais&location_id=...&area=...`), lido no server component para SSR e sincronizado no client ao interagir |

Motivo: a plataforma existe para transparência de política pública — alguém precisa poder compartilhar/citar "o status do plano do Ceará". Perder isso seria regressão funcional, não só visual. One-page e deep-link não são incompatíveis: é uma página só, mas o estado da consulta vive na URL.

## Estrutura de componentes proposta

```
app/
  page.tsx                      -> monta todas as seções institucionais + <ConsultaPublica />
  layout.tsx                    -> header fixo, footer, metadata base
  components/
    sections/
      Hero.tsx                  -> "Planos pela Primeira Infância no Brasil" + stats
      Sobre.tsx                 -> tabs: Quem somos / Resultados do levantamento / Histórico
      Pnipi.tsx                 -> tabs: Leis e decretos / Planos de ação / Dúvidas frequentes
      Midiateca.tsx             -> tabs: Documentos / Links externos / Materiais de referência
      Contato.tsx                -> formulário (ver seção Contato)
    consulta-publica/
      ConsultaPublica.tsx       -> server component, lê searchParams, decide tab inicial
      TabsNav.tsx                -> client, troca de aba via router.replace (shallow)
      MapaBrasil.tsx             -> client, Highcharts Maps + geojson real de src/static/maps
      PainelMunicipal.tsx        -> ex-city.html (location_id + area)
      PainelEstadual.tsx        -> estaduais/distrital
      PainelNacional.tsx        -> ex-comparacao.html / historico.html, conforme confirmação de design
      PainelMonitoramento.tsx    -> PENDENTE: fonte de dado a confirmar
  lib/
    strapi.ts                   -> cliente CMS (banners, eixos, noticias, sobres, guias, tags, artigos, locales, privacy-policy)
    omlpi-api.ts                 -> cliente API Perl (locales, data, compare, historical, resume, download, upload_plan)
    contact.ts                   -> envio do formulário (ver seção Contato)
```

## Mapeamento de rotas antigas → nova estrutura (redirects)

| Rota atual | Novo destino | Observação |
|---|---|---|
| `/` | `/` | Mantém |
| `/indicadores`, `/biblioteca` | `/#midiateca` (a confirmar) | Ver nota abaixo — pode haver sobreposição de conceito |
| `/planos-pela-primeira-infancia` | `/#consulta-publica` | Mapa + busca + upload viram parte do bloco de dados |
| `/city?location_id=X&area=Y` | `/?tab=municipais&location_id=X&area=Y#consulta-publica` | 1:1 em conteúdo, N:1 em rota |
| `/comparacao?location_id=X&area=Y` | `/?tab=nacional&mode=comparacao&location_id=X&area=Y#consulta-publica` | A confirmar com design se comparação é aba própria ou um modo dentro de outra aba |
| `/historico?location_id=X&area=Y` | `/?tab=nacional&mode=historico&location_id=X&area=Y#consulta-publica` | Mesma observação acima |
| `/rastreio` | `/` | **CONFIRMADO (Fase 1):** não vira seção do menu. Conteúdo migra para `<PrivacyPolicyModal />`, aberto por um link no Footer, usando `getPrivacyPolicy()` do Strapi |
| `/pt/*` | `/*` | Redirect 301 permanece igual (já existe em `netlify.toml`, precisa virar regra no `next.config.js`/Vercel) |

**Pendência a validar com quem desenhou o Figma**: a Midiateca do mockup (grade de PDFs por categoria: Legislação, Plano Nacional, Guia, Relatório) parece ser mais próxima do `open-data.html` atual do que do `biblioteca.html` (que tem busca, tags, paginação e vídeo). Preciso saber se a Midiateca **substitui** a biblioteca de artigos ou se as duas convivem em abas diferentes — isso muda de qual endpoint do Strapi ela deve ler (`artigos` vs. os links fixos de `open-data`).

## Contato — endpoint

**Decisão (definida no início da Fase 2): formulário envia via WhatsApp (link `wa.me`), sem backend próprio por enquanto.**

O formulário mantém os campos do design (Nome, Estado, E-mail, Assunto, Mensagem), mas em vez de POST para uma API, monta a mensagem e redireciona para:

```
https://wa.me/<numero-com-DDI>?text=<mensagem-codificada-com-encodeURIComponent>
```

**Status: `lib/contact.ts` já foi criado na Fase 1** com `buildWhatsAppUrl()`, isolado para que trocar por um endpoint real no futuro (Resend, Route Handler, ou o backend confirmar um endpoint próprio) seja só substituir essa função, sem mexer no componente do formulário. A Fase 2 apenas conecta o componente `Contato.tsx` a essa função já existente — não recria o helper.

Pendências antes de implementar:

- **Bloqueante para a Fase 2**: `WHATSAPP_NUMBER` está vazio em `lib/contact.ts`. Precisa ser preenchido antes de conectar o formulário, senão o link gerado fica quebrado.
- Confirmar se o campo E-mail do formulário deve continuar existindo mesmo não sendo usado para envio (pode servir só de referência de contato de retorno).

**Alternativas descartadas por enquanto** (registradas caso o WhatsApp deixe de ser suficiente): Resend + Route Handler próprio (grátis até 3.000 e-mails/mês, mantém o dado na infraestrutura de vocês), Web3Forms (grátis, zero infra), Formspree (grátis até 50 envios/mês).

## Fases revisadas

**Fase 1 — Fundação (baixo risco, esforço P/M)**

- App Router, layout global, metadata base, `lib/strapi.ts`, `lib/omlpi-api.ts`
- Extração de tokens de design do Figma (cores, tipografia, espaçamento) como base de componentes
- Redirect `/pt/*`

**Fase 2 — Seções institucionais (médio risco, esforço M)**

- Início, Sobre (3 abas), PNIPI (3 abas), Midiateca, Contato (form + integração de envio)
- Todas server-rendered, sem necessidade de sincronizar query string

**Fase 3 — Bloco Consulta pública (alto risco, esforço G — é o novo caminho crítico)**

- Mapa com geojson real + drilldown
- Abas Municipais/Estaduais/Nacional/Monitoramento lendo `searchParams`
- Portar lógica de normalização de dados de `populateData.js`, `compare.js`, `history.js`
- **Bloqueada até confirmar** com design: mapeamento exato de tabs vs. páginas antigas, e a fonte de dado de "Monitoramento"

**Fase 4 — SEO e redirects finais (médio risco, esforço P/M)**

- Metadata da página única, OG/Twitter, robots, sitemap (decisão consciente, já que é one-page)
- Tabela de redirects completa (`/city`, `/comparacao`, `/historico`, `/rastreio`, `/indicadores`, `/biblioteca` → âncoras/query da nova página)
- Consentimento, analytics, Pixel, Sentry

**Fase 5 — QA e cutover (médio-alto risco, esforço M)**

- Validação funcional (não mais comparação visual): dados batendo com a API, deep-links funcionando, upload de plano, formulário de contato
- Smoke test de todos os redirects antigos
- Deploy paralelo e corte de tráfego

## Riscos e pendências abertas

1. Confirmar se o endpoint de contato existe no backend atual.
2. Confirmar mapeamento exato de Comparação/Histórico dentro das abas de Consulta pública (aba própria vs. modo de visualização).
3. Confirmar fonte de dado da aba "Monitoramento" (sem paralelo no site atual).
4. Confirmar se Midiateca substitui ou convive com a biblioteca de artigos atual.
5. Confirmar destino de `/rastreio` (política de privacidade) na nova IA.
6. Decisão consciente sobre perda de URLs indexáveis por cidade/estado (tradeoff aceito de SEO em troca de simplicidade de manutenção).
