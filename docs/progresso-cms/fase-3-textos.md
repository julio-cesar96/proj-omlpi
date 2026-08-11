# Fase 3 — Módulo Textos Institucionais (CMS)

## O que foi decidido e Passo 0

### Passo 0 — Verificação empírica
Antes de codificar o módulo, foi feita a validação empírica contra a API de produção da rota de criação do content-type `pagina-institucional`.
* **Endpoint real**: O endpoint correto no Strapi v3 para a coleção é `/paginas-institucionais` (com o plural "paginas" em vez de "pagina" como no singular).
* **Curl de teste**:
  ```bash
  curl -X POST https://omlpi-strapi.rnpiobserva.org.br/paginas-institucionais \
    -H "Authorization: Bearer $JWT" \
    -H "Content-Type: application/json" \
    -d '{"titulo":"Teste slug","slug":"teste-slug","conteudo":"<p>Teste</p>","published_at":null}'
  ```
* **Resultado**: Retornou `201 Created` contendo o registro com `id: 1` e `slug: "teste-slug"`. Também foi validada a exclusão (`DELETE`) e recuperação (`GET`), comprovando que todas as permissões (`find`, `findone`, `create`, `update`, `delete`) da role `Authenticated` já estavam ativadas no Strapi de produção.

### Decisão de Slug (A1)
* O slug é calculado automaticamente pelo client-side a partir do título inserido (`slugify` com remoção de acentos, lowercase, conversão de espaços para hífens e remoção de caracteres não-alfanuméricos).
* O slug **sempre recalcula** a partir do título atual nas edições subsequentes, não congelando após a primeira publicação.
* **Mitigação de URL**: Se a página já estiver publicada (`published_at !== null`) e o slug for modificado em relação ao valor anterior, ao salvar a página é exibido um toast de alerta ao usuário destacando que a URL mudou (ex: `"A URL desta página mudou de /slug-antigo para /slug-novo — links externos antigos deixarão de funcionar."`).

### Editor de Rich Text
* Implementado com **Tiptap v3** (`@tiptap/react` versão `^3.28.0` com extensões `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image` e `@tiptap/extension-underline`).
* Toolbar funcional com opções para: Parágrafo/Título 1/Título 2, Negrito, Itálico, Sublinhado, Lista sem ordenação, Lista ordenada, Inserção de Link (via prompt), Inserção de Imagem por URL (via prompt) e Citações.
* As marcações do editor geram HTML diretamente para ser armazenado no campo `conteudo` (richtext) do Strapi.

### Upload de Capa (Imagem Única)
* Generalizado o hook de upload de arquivo único (`useUploadFile`) para `useUploadSingleFile({ allowedTypes, maxMB })` permitindo reaproveitamento da lógica XHR com progresso e tratativa de erro.
* Componente `ImageDropzone` valida o arquivo (somente imagens JPEG, PNG e WebP até 10 MB) e mostra progresso em porcentagem, além de um visual dashed de 120px e um preview da imagem enviada com opção de remoção.

### Rotas e Navegação
* Criada a view dedicada de editor com sub-rotas `/textos/novo` e `/textos/:id` no `BrowserRouter`.
* Ao salvar um novo texto pela primeira vez, o painel navega automaticamente para `/textos/:id` correspondente, permitindo a continuação da edição do mesmo registro sem duplicá-lo.
* Botões "Salvar rascunho" e "Publicar" mantêm o usuário na página atual do editor.

---

## O que foi implementado

### Estrutura de Arquivos Criados / Modificados

```
painel-cms/
├── src/
│   ├── lib/
│   │   └── strapi.ts                        # [MODIFY] Atualizada interface PaginaInstitucional,
│   │                                        #           adicionado PaginaInstitucionalPayload e TextosListParams
│   ├── hooks/
│   │   ├── useUploadSingleFile.ts           # [NEW] Generalização do hook de upload único com progresso
│   │   └── textos/                          # [NEW pasta]
│   │       ├── useTextos.ts                 # GET /paginas-institucionais?_publicationState=preview
│   │       ├── useTexto.ts                  # GET /paginas-institucionais/:id?_publicationState=preview
│   │       ├── useTextosCount.ts            # useQueries paralelas de contagem das abas (Todas, Publicados, Rascunhos)
│   │       └── useTextoMutations.ts         # Mutations de CRUD para criar, atualizar e excluir páginas
│   ├── components/
│   │   └── textos/                          # [NEW pasta]
│   │       ├── TextoCard.tsx                # Card de página na listagem
│   │       ├── TextoList.tsx                # Listagem com abas, busca e paginação
│   │       ├── RichTextEditor.tsx           # Wrapper do editor Tiptap com a toolbar
│   │       ├── ImageDropzone.tsx            # Dropzone de imagem usando useUploadSingleFile
│   │       └── TextoEditor.tsx              # Layout grid principal do editor com metadados e SEO
│   ├── pages/
│   │   ├── TextosList.tsx                   # [NEW] Página que exibe a listagem de páginas institucionais
│   │   ├── TextosEditor.tsx                 # [NEW] Página da view dedicada do editor
│   │   └── Textos.tsx                       # [DELETE] Removido o placeholder antigo
│   └── router/
│       └── index.tsx                        # [MODIFY] Rotas de listagem e editor adicionadas ao BrowserRouter
```

---

## Desvios do plano original

* **useTextosCount**: Adicionado o hook `useTextosCount` e as contagens correspondentes no `TextoList` (Todas, Publicadas, Rascunhos) para paridade de UX com o módulo de FAQs e Planos, trazendo maior consistência nas tabs.

---

## Pendências para fases futuras

* **Autosave**: Salvamento automático global de rascunhos (requer persistência global e controle em Configurações).
* **Histórico de Versões**: Versionamento com histórico e rollback (requer modelagem customizada no Strapi para não depender de plano pago).
* **Estado "Em Revisão"**: Implementar um campo do tipo enum de estado editorial na tabela do banco do Strapi caso o cliente decida por um fluxo editorial de 4 estados para as páginas.

---

## Correções e Refinamentos Pós-Fase 3

Durante a revisão do módulo de Textos Institucionais, foram aplicadas correções pontuais e melhorias de UX para remover diálogos nativos do navegador e definir o comportamento de edição de slug.

### 1. Remoção do `window.prompt` nativo no RichTextEditor
* **Problema**: O editor utilizava o diálogo `window.prompt` padrão do navegador para coletar URLs ao inserir links ou imagens.
* **Solução**: Criado o componente [LinkImageModal](file:///Users/yduqs/proj-omlpi/painel-cms/src/components/textos/LinkImageModal.tsx) em `components/textos/`. Este componente atua como um modal centralizado moderno e elegante, alinhado com a UX dos demais modais do projeto (ex: `ConfirmDialog`).
* **Regras de Link**:
  * Se houver texto selecionado no editor, o link é aplicado diretamente a ele.
  * Se não houver seleção, a URL inserida é incluída como o próprio texto exibido no link, evitando que o link se perca na tela (padrão de ferramentas modernas como Notion e Google Docs).
  * Exibição de um botão "Remover Link" quando editamos um link existente, facilitando a limpeza.

### 2. Comportamento do Slug Manual vs. Automático
* **Comportamento Implementado**:
  * Adicionado o estado de UI local `slugEditadoManualmente: boolean` no editor.
  * Enquanto o slug não for editado manualmente na sessão, ele é atualizado automaticamente a partir do título do texto.
  * No momento em que o usuário digita no campo de slug ou o altera, o estado muda para `true` e a sincronização com o título é congelada.
  * O botão "Reset" reverte o slug para o padrão derivado do título e descongela a sincronização automática.
* **Decisão sobre Persistência do Congelamento**:
  * Ficou decidido que a flag `slugEditadoManualmente` **não é persistida no banco** (Strapi) — sendo puramente um estado local de controle durante a sessão atual de edição.
  * Ao recarregar a página existente para edição, a flag reinicia como `false`. Isso significa que se o usuário editar o título novamente após carregar a página, o slug será atualizado automaticamente, a menos que ele clique em "Editar slug" e o altere na mesma sessão (evitando estados fantasmas de sessões anteriores).

### Estrutura de Arquivos Atualizada
* [NEW] [LinkImageModal.tsx](file:///Users/yduqs/proj-omlpi/painel-cms/src/components/textos/LinkImageModal.tsx)
* [MODIFY] [RichTextEditor.tsx](file:///Users/yduqs/proj-omlpi/painel-cms/src/components/textos/RichTextEditor.tsx)
* [MODIFY] [TextoEditor.tsx](file:///Users/yduqs/proj-omlpi/painel-cms/src/components/textos/TextoEditor.tsx)
* [MODIFY] [TextosEditor.tsx](file:///Users/yduqs/proj-omlpi/painel-cms/src/pages/TextosEditor.tsx)

