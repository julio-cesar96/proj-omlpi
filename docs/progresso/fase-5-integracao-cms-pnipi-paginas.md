# Progresso da Migração — Fase 5: Integração PNIPI e Rota de Páginas Institucionais

**Branch:** `feature/migration-next`  
**Data de conclusão:** 2026-08-06  
**Diretório de trabalho:** `next/` (com alterações exclusivas em `next/` e `next/src/lib/strapi.ts` — repositório `omlpi-cms` e `omlpi-api` preservados intactos)

---

## 📋 Resumo da Entrega

A Fase 5 foi concluída com sucesso. Implementamos e validamos:
1. **Limpeza do Repositório (Git):** Remoção completa dos arquivos temporários e dependências acidentais de `painel-cms/` (`node_modules`, `dist`, `.env.local`) que haviam sido versionados por engano.
2. **Integração de Modelos Strapi em `next/src/lib/strapi.ts`:** Definição das interfaces tipadas `StrapiFaq`, `StrapiPlano`, `StrapiPaginaInstitucional` e `StrapiCategoria`, bem como os respectivos fetchers assíncronos.
3. **Migração do PNIPI (Abas Planos e FAQs):** Substituição completa dos placeholders estáticos pelos dados de produção do Strapi na seção PNIPI:
   * **FAQs:** As perguntas frequentes agora são carregadas da API `/faqs`. A resposta é renderizada como texto simples respeitando as quebras de linha com `whitespace-pre-wrap` (sem processamento de Markdown, evitando falsos positivos de tags ou marcações).
   * **Planos de Ação:** O card foi ajustado para a estrutura do schema real do content-type `plano`, exibindo apenas título, categoria e botão de download do PDF real (`plano.documento.url`). Vigência, ministérios e metas foram eliminados por não existirem na API.
4. **Nova Rota Dinâmica de Páginas Institucionais (`/paginas/[slug]`):** Implementação da primeira sub-rota de conteúdo dinâmico do projeto. Carrega o título, imagem de capa, metadados de SEO e renderiza diretamente o conteúdo em HTML puro (gerado pelo editor Tiptap do CMS), protegendo a formatação e as tags HTML vindas da API de produção.

---

## 🛠️ Arquivos Modificados / Criados

| Caminho do Arquivo | Tipo | Descrição |
|---|---|---|
| [`.gitignore`](file:///Users/yduqs/proj-omlpi/.gitignore) | Modificado | Adicionado regras para ignorar permanentemente `painel-cms/node_modules/`, `painel-cms/dist/` e `painel-cms/.env.local`. |
| [`next/src/lib/strapi.ts`](file:///Users/yduqs/proj-omlpi/next/src/lib/strapi.ts) | Modificado | Inclusão de tipos e funções fetcher (`getFaqs`, `getPlanos`, `getPaginaInstitucional`). |
| [`next/src/components/sections/Pnipi.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/sections/Pnipi.tsx) | Modificado | Busca assíncrona paralela (Promise.all) de Guias, FAQs e Planos com fallbacks robustos. |
| [`next/src/components/sections/PnipiClient.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/sections/PnipiClient.tsx) | Modificado | Substituição das constantes estáticas por carregamento dinâmico e correção de renderização do FAQ e dos cards de Planos. |
| [`next/src/app/paginas/[slug]/page.tsx`](file:///Users/yduqs/proj-omlpi/next/src/app/paginas/[slug]/page.tsx) | Novo | Rota de texto institucional dinâmico com suporte a SEO metadata e injeção direta de HTML puro. |

---

## 💡 Decisões Técnicas e Resolução de Desafios

### 1. Detecção da Estrutura Real de Conteúdo no Strapi v3
Através de consultas diretas à API de produção (`https://omlpi-strapi.rnpiobserva.org.br`) e validação de schemas históricos, confirmamos as seguintes peculiaridades que guiaram o desenvolvimento das tipagens TypeScript:
* **`pagina-institucional.conteudo` é HTML puro:** O editor do CMS (Tiptap) gera HTML (ex: `<p>`, `<strong>`, `<ul>`). Aplicar `renderMarkdown` neste campo quebraria a exibição das tags. Portanto, o campo é injetado diretamente usando `dangerouslySetInnerHTML`.
* **`faq.resposta` é texto puro:** O editor de FAQ no CMS é uma textarea comum, sem formatação. Renderizamos o conteúdo diretamente como texto de elemento React utilizando o estilo `whitespace-pre-wrap` para manter a formatação original de quebras de linha enviada pelo usuário.

### 2. Tratamento Paralelo de Erros no Server Component PNIPI
Para evitar que a falha de rede em um único endpoint da API do Strapi impeça o carregamento de toda a seção PNIPI na home, encapsulamos as requisições em um `Promise.all` com fallbacks individuais `.catch(() => [])`. Se, por exemplo, o banco de FAQs estiver indisponível temporariamente, as abas de "Leis e decretos" e "Planos de ação" continuarão funcionando normalmente.

---

## 🔍 Verificação Empírica de Tags HTML

Realizamos a criação de um documento de teste institucional com o slug `sobre-plataforma-teste` via painel administrativo. A chamada HTTP de verificação resultou na seguinte resposta JSON literal:

**Entrada:**
```bash
curl -s "https://omlpi-strapi.rnpiobserva.org.br/paginas-institucionais" | jq '.[0].conteudo'
```

**Resultado:**
```json
"<p>Esta é uma página de <strong>teste</strong> criada programaticamente.</p><ul><li>Item 1</li><li>Item 2</li></ul>"
```

A presença de tags HTML como `<p>`, `<strong>` e `<ul>` atesta que a página é salva como HTML puro (gerado por Tiptap) e validou a decisão de renderizá-la diretamente sem parsing de markdown.

---

## 🚀 Próximas Fases e Pendências em Aberto

1. **Produção do conteúdo real das Páginas Institucionais:** É necessário que os editores acessem o CMS para cadastrar as páginas oficiais (utilizando slugs idênticos ao planejado no menu, ex: `sobre`, `historia`) de forma que a navegação do site as encontre sem retornar erro 404.
