# Handoff: CMS Observa RNPI (baseado em Strapi)

## Visão geral
Painel administrativo (CMS) para o site **Observa RNPI** — observatório da Rede
Nacional Primeira Infância. Permite que usuários **não técnicos** gerenciem
planos (upload de PDF), midiateca de arquivos, FAQs, textos institucionais,
usuários/permissões e configurações. O backend-alvo é o **Strapi**; o frontend
do painel deve usar os **relacionamentos e o RBAC nativos do Strapi**.

## Sobre os arquivos de design
O arquivo neste pacote (`Observa RNPI CMS.dc.html`) é uma **referência de
design feita em HTML** — um protótipo navegável que mostra a aparência e o
comportamento pretendidos. **Não é código de produção para copiar diretamente.**

A tarefa é **recriar este design no ambiente do projeto existente** (o repo do
CMS que será refeito), usando os padrões, bibliotecas e o design system já
estabelecidos. Se o projeto for um plugin/admin do Strapi, recriar com a stack
de admin do Strapi (React + o design system do Strapi, ou uma app React/Next
separada que consome a REST/GraphQL API do Strapi). O HTML é fonte de verdade
apenas para **layout, tokens visuais e fluxos** — não para arquitetura.

> Como abrir o protótipo: é um arquivo `.dc.html` autocontido. Basta abrir no
> navegador. Toda a navegação entre módulos, drawers e modais é funcional.

## Fidelidade
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, raios e interações
são finais e devem ser reproduzidos fielmente com as bibliotecas do codebase.

---

## Design Tokens

Use exatamente estes valores (identidade visual do Observa RNPI — **não criar
nova identidade**).

### Cores
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#FFFFF0` | Fundo geral da aplicação |
| `--card` | `#FFFFFF` | Cards, sidebar, topbar, superfícies |
| `--text` | `#444525` | Texto principal |
| `--text-soft` | `#7a7663` | Texto secundário / labels |
| `--primary` | `#F25D27` | Cor primária (botões de ação, ativo, laranja) |
| primary hover | `#e0521f` / `#d94e1c` | Hover do primário |
| `--secondary` | `#17A649` | Sucesso, publicado, toggles ativos (verde) |
| `--accent` | `#E8F5EE` | Fundo suave verde (badges "publicado") |
| `--muted` | `#F5F5E8` | Fundo neutro (chips, hovers, badges neutros) |
| `--destructive` | `#D4183D` | Erros, excluir, arquivar |
| `--border` | `rgba(164,154,135,.2)` | Bordas de cards, tabelas, inputs |
| Laranja suave (bg) | `#FDE7DE` / `#FDF2ED` | Fundos de ícone/badge laranja |
| Roxo (Revisor) | `#8a6bd6` sobre `#efe6fb` | Badge de perfil Revisor / tipo vídeo |
| Azul (doc) | `#3b6bd6` sobre `#e6eefb` | Tipo documento |
| Erro (bg) | `#fbeaee` | Fundo de linhas de erro / arquivar hover |

### Tipografia
- **Títulos:** `Nunito` (pesos 400/600/700/800/900). Headings de página em 800,
  ~26px, `letter-spacing:-.5px`. Nomes/valores fortes em 800–900.
- **Texto/corpo:** `Plus Jakarta Sans` (400/500/600/700). Corpo 13–14px,
  `line-height:1.45`. Labels de formulário 12.5px/700. Metadados 11.5–12px em
  `--text-soft`.
- Google Fonts:
  `Nunito:wght@400;600;700;800;900` e `Plus+Jakarta+Sans:wght@400;500;600;700`.

### Forma e profundidade
- **Radius:** base `--radius: 16px` (cards). Botões/inputs 10–11px. Chips/pills
  20px. Avatares circulares.
- **Sombra suave (cards):** `0 1px 2px rgba(68,69,37,.04), 0 8px 24px rgba(68,69,37,.05)`
- **Sombra elevada (drawer/modal):** `0 12px 40px rgba(68,69,37,.14)`
- **Sombra de botão primário:** `0 4px 12px rgba(242,93,39,.28)`

### Espaçamento
- Padding de conteúdo principal: `28px 32px`. Cards: `16–22px`. Gap de grid: `16–20px`.
- Sidebar: 264px. Topbar: 66px. Drawer de plano: 640px; drawer de usuário: 560px.

### Animações
- `fadeIn .3s ease` (troca de módulo), `slideIn .25s ease` (toast/modal),
  `drawerIn .28s cubic-bezier(.2,.8,.2,1)` (drawers), `spin .7s linear` (loader).

---

## Estrutura de navegação
SPA com **sidebar fixa clara à esquerda** + **topbar** + área de conteúdo que
troca. Sidebar em dois grupos:
- **Principal:** Dashboard, Planos (badge de contagem), Midiateca, FAQs, Textos Institucionais
- **Administração:** Usuários, Configurações
- Rodapé da sidebar: card de **Armazenamento** com barra de progresso (6,4 / 20 GB).
- Item ativo: fundo `--primary`, texto branco. Hover: fundo `--muted`.

**Topbar:** busca global (`⌘K`, placeholder "Buscar em todo o conteúdo…"),
botão **Importar**, botão **Criar** (primário), sino de notificações (com dot),
avatar do usuário com nome + perfil.

---

## Telas / Módulos

### 1. Dashboard
- **Propósito:** panorama do conteúdo.
- **Layout:** saudação + data à direita; grid de 5 **KPI cards**; abaixo, grid
  2 colunas (1.6fr / 1fr).
- **KPIs:** Planos publicados (128, +12), FAQs ativas (54, +5), Arquivos (1.842,
  +63), Armazenamento (6,4 GB, 32%), Uploads no mês (37, +9). Cada card: ícone
  em quadrado colorido, badge de delta (verde `--accent` para positivo), valor
  grande em Nunito 800, label.
- **Atividades recentes:** lista com ícone, "quem fez o quê", timestamp e badge
  de tipo (Publicado/Upload/Editado/Usuário/Revisão).
- **Atalhos rápidos:** grid 2×2 (Novo plano, Enviar arquivo, Nova FAQ, Importar CSV).
- **Acessos recentes:** lista de usuários com avatar/inicial, nome, perfil, tempo.

### 2. Planos
- **Propósito:** gerenciar planos, cada um essencialmente **um PDF** com título e
  descrição. CRUD completo com fluxo editorial.
- **Layout:** header com "Novo plano"; **tabs de status** (Todos, Rascunhos, Em
  revisão, Publicados, Arquivados) com contagem; card de tabela.
- **Toolbar da tabela:** busca (filtra título/categoria), Filtros, Exportar.
- **Colunas:** checkbox · Título (com tags e nº de anexos) · Categoria · Status
  (pill com dot colorido) · Atualizado · Ações (editar, duplicar).
- **Paginação** no rodapé (mostrando N de 128).
- **Status/fluxo editorial:** `Rascunho → Em revisão → Publicado → Arquivado`.
  Cores: Rascunho (neutro `--muted`), Em revisão (laranja `#FDE7DE`), Publicado
  (verde `--accent`), Arquivado (vermelho suave).

#### Drawer: Editor de plano (640px, entra pela direita)
Simplificado — o plano **é um upload de PDF**; edição mínima.
- **Header:** "Novo conteúdo"/"Editando" + título "Editor de plano" + fechar.
- **Stepper do fluxo editorial** (4 etapas, círculos numerados; concluídas com a
  cor do status, atual em destaque, linha conectora).
- **Corpo (nesta ordem):**
  1. **Documento do plano (PDF)** — dropzone de destaque (drag & drop) +
     cartão do arquivo enviado (ícone PDF, nome, tamanho, status "Enviado",
     remover). Um único PDF, até 200 MB.
  2. **Título do plano** (input).
  3. **Breve descrição** (textarea, recomendado até 160 caracteres).
  4. **Categoria (opcional)** (select).
- **Footer:** Duplicar · Arquivar (destrutivo) · [Salvar rascunho] [Enviar p/
  revisão] [Publicar (primário)].

### 3. Midiateca
- **Propósito:** gestão de arquivos estilo Google Drive.
- **Layout:** header + uso de armazenamento; **dropzone** grande (drag & drop,
  muda borda/fundo ao arrastar); painel de **uploads em progresso** (barras com
  %, verde quando concluído, spinner); barra de **filtros por tipo** (Todos,
  PDFs, Imagens, Vídeos, Documentos) + **ordenação** (recentes, nome, tamanho);
  **grid de 5 colunas** de cards de arquivo.
- **Card de arquivo:** thumbnail (ícone por tipo em fundo colorido; imagens
  mostram ícone de imagem), badge de tipo (PDF/IMG/VÍD/DOC), menu "⋯", nome,
  tamanho, data.
- **Tipos/cores:** PDF (laranja), IMG (verde), VÍD (roxo), DOC (azul).

### 4. FAQs
- **Propósito:** CRUD de perguntas frequentes, **ordenáveis por drag & drop**.
- **Layout:** header "Nova FAQ"; busca; lista de cards.
- **Card de FAQ:** handle de arraste (6 pontos), número de ordem, pergunta +
  categoria, badge de publicação (Publicada verde / Rascunho neutro), editar.

#### Modal: Nova FAQ (560px, centralizado)
Pergunta · Resposta · Categoria (select) · Publicação (Publicar agora / Salvar
rascunho). Footer: Cancelar / Criar FAQ.

### 5. Textos Institucionais
- **Propósito:** páginas de conteúdo (Sobre, Missão, Contato, Política de
  Privacidade, Termos) com editor rich text, SEO, capa e histórico.
- **Lista:** cards de página (ícone, título, slug/URL, autor, data, status,
  chevron).
- **Editor (view dedicada, não drawer):** breadcrumb + Salvar rascunho / Publicar.
  - **Coluna principal (card):** título inline grande, URL/slug, **toolbar rich
    text** (parágrafo/H1/H2, B/I/U, listas, link, imagem, citação), área de conteúdo.
  - **Coluna lateral (320px):** cards de **Publicação** (status/visibilidade/
    atualizado), **Imagem de capa** (upload), **SEO** (meta título, meta
    descrição, slug), **Histórico de versões** (v4 atual → v1, com "Restaurar").

### 6. Usuários
- **Propósito:** perfis e permissões — **Administrador, Editor, Revisor** (roles
  nativos do Strapi).
- **Tabela:** Usuário (avatar+email) · Perfil (badge colorido) · Status (Ativo/
  Inativo com dot) · Último acesso · editar.
- **Cores de perfil:** Administrador (laranja), Editor (verde), Revisor (roxo).

#### Drawer: Novo/Editar usuário (560px)
- Nome + E-mail; seleção de **Perfil** (3 cards: Administrador/Editor/Revisor);
  **matriz de permissões por coleção** (linhas = Planos, Midiateca, FAQs, Textos,
  Usuários; colunas = Criar/Ler/Editar/Excluir com checkboxes). Footer: Cancelar
  / Salvar usuário.

### 7. Configurações
- Abas: Geral (ativa), Marca, Notificações, Integrações.
- **Informações do site:** nome, URL base, idioma padrão, fuso horário.
- **Fluxo editorial:** toggles "Exigir revisão antes de publicar" e "Salvamento
  automático de rascunhos" (ambos on, verde). Footer: Descartar / Salvar alterações.

### Overlay global: Importar dados (CSV/XLSX) — modal 640px
Acessível pela topbar e por Planos.
- **Stepper:** Enviar arquivo → Validação → Concluir.
- **Passo 1:** dropzone (CSV/XLSX, até 5.000 linhas) + link "Baixar modelo CSV".
- **Passo 2:** cartão do arquivo validado; contadores **Linhas válidas** (verde)
  e **Com erros** (vermelho); **relatório de erros** por linha (ex.: categoria
  inexistente, campo obrigatório vazio, status inválido); link "Baixar relatório".
- Footer CTA: "Validar arquivo" → "Importar N registros".

### Toast
Fixo no rodapé centro, fundo `--text` escuro, texto branco, ícone de check
verde. Mensagens: "Rascunho salvo", "Plano publicado", "FAQ criada com sucesso",
"121 registros importados", etc. Auto-dismiss ~2,6s.

---

## Componentes reutilizáveis
Implementar como componentes do design system do codebase:
**Data Table** (com checkbox, ordenação, paginação), **Cards** (KPI, arquivo,
página, FAQ), **Modal** (centralizado, com overlay), **Drawer** (lateral direito,
overlay), **Toast**, **Tabs**, **Upload/Dropzone** (drag & drop + progresso),
**Search input**, **Pagination**, **Filter Chips/Pills**, **Status Badge**,
**Stepper** (fluxo editorial e import), **Avatar**, **Toggle**.

---

## Interações e comportamento
- Navegação de módulo troca a área de conteúdo (com `fadeIn`).
- Botão **Criar** da topbar é contextual (abre o criador do módulo atual).
- Drawers/modais fecham ao clicar no overlay ou no X; conteúdo interno para
  propagação de clique.
- Busca de Planos filtra por título/categoria; tabs filtram por status.
- Filtros da Midiateca filtram o grid por tipo; select de ordenação reordena.
- Dropzones mudam borda/fundo no `dragover`; drop dispara toast de sucesso.
- Toggles e ações disparam toasts de confirmação.
- Todos os alvos de toque ≥ 40px.

## Estado necessário (referência)
`active` (módulo atual), `globalSearch`, `toast`, `planSearch`, `planStatus`,
`planDrawer`+`editPlan`, `faqModal`, `importOpen`+`importStep`,
`userDrawer`+`editUser`, `textEditor`+`editPage`, `mediaFilter`, `mediaSort`,
`dragOver`.

---

## Modelo de dados sugerido (Strapi)
Usar **Content-Types** e **relations** nativos.
- **Plano** (collection): `titulo` (string, obrigatório), `descricao` (text),
  `documento` (media, single, PDF), `categoria` (relation → Categoria), `tags`
  (relation manyToMany → Tag), `estado_editorial` (enum: rascunho, revisao,
  publicado, arquivado). Usar **Draft & Publish** do Strapi.
- **Categoria** (collection): `nome`, `slug`.
- **Tag** (collection): `nome`.
- **Arquivo de mídia:** usar a **Media Library** nativa do Strapi (upload
  múltiplo, tipos, tamanho). Filtros por MIME type.
- **FAQ** (collection): `pergunta`, `resposta` (richtext), `categoria`
  (relation ou enum), `ordem` (integer, para drag & drop), Draft & Publish.
- **Página institucional** (collection): `titulo`, `slug` (uid), `conteudo`
  (richtext/blocks), `capa` (media), `seo` (component: metaTitle, metaDescription),
  versões via histórico. Draft & Publish.
- **Usuários & Permissões:** plugin nativo. Roles **Administrador/Editor/Revisor**
  com permissões CRUD por content-type (a matriz do drawer mapeia 1:1 para o RBAC
  do Strapi).
- **Import/Export CSV/XLSX:** validar contra os content-types (relations
  existentes, campos obrigatórios, valores de enum) antes de gravar; retornar
  relatório de erros por linha.

## Assets
- Ícones: SVGs inline (estilo linha, `stroke-width` ~2, cantos arredondados) —
  substituir pela biblioteca de ícones do codebase (ex.: Lucide/Feather), que
  têm equivalentes de todos os usados.
- Fontes: Google Fonts (Nunito, Plus Jakarta Sans).
- Sem imagens raster; thumbnails de mídia são placeholders de ícone.

## Arquivos neste pacote
- `Observa RNPI CMS.dc.html` — protótipo de alta fidelidade, todos os módulos e overlays.
- `README.md` — este documento (auto-suficiente).
