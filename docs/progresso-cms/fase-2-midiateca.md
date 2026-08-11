# Fase 2 — Módulo Midiateca (CMS)

## O que foi decidido

- **GET /upload/files/count funcional**: Diferente da suposição inicial, o endpoint de contagem do plugin de Upload do Strapi v3.3.3 **está funcional**. Habilitando as permissões adequadas no Strapi Admin (na seção "UPLOAD"), ele responde normalmente e aceita `mime_contains`.
- **Estratégia de Contagem**: `useMediaCounts.ts` foi construído com 4 queries paralelas via `/count` (`all`, `pdf`, `img`, `video`). A contagem de `doc` é calculada de forma aritmética (`all - pdf - img - video`), pois representa o grupo de extensões variadas.
- **Upload Múltiplo Paralelo**: Para viabilizar barras de progresso individuais (exigidas no layout de handoff), o hook `useMediaUpload.ts` dispara uma requisição XHR para cada arquivo em paralelo, em vez de agrupar em um único payload `multipart/form-data`.
- **Paginação 100% no Servidor**: A listagem principal (`useMediaFiles.ts`) agora é paginada diretamente no Strapi (`_start`, `_limit`, `_sort`, `mime_contains` ou `mime_ncontains`), garantindo desempenho com bibliotecas de mídia extensas.
- **Proteção contra Exclusão Órfã**: O menu de exclusão de cada arquivo verifica se o campo `related` (retornado na resposta padrão de listagem do Strapi) possui vínculos ativos, disparando um aviso de confirmação diferenciado ("Este arquivo está em uso por N registro(s) — excluir mesmo assim?") caso positivo.

## O que foi implementado

### Estrutura de Arquivos Criados / Modificados

```
painel-cms/src/
├── lib/
│   ├── strapi.ts                    # [MODIFY] Adicionado tipos expandidos de StrapiFile e aliases para mídias
│   └── media.ts                     # [NEW] Funções utilitárias (getMediaType, formatFileSize, convert params)
├── hooks/
│   └── midiateca/                   # [NEW pasta]
│       ├── useMediaFiles.ts         # Query paginada de listagem no Strapi
│       ├── useMediaCounts.ts        # Queries paralelas de contagem das abas
│       ├── useMediaUpload.ts        # Upload múltiplo via XHR em paralelo com progresso individual
│       └── useMediaDelete.ts        # Mutation para exclusão de arquivos no Strapi
├── components/
│   └── midiateca/                   # [NEW pasta]
│       ├── MediaDropzone.tsx        # Área drag-and-drop para múltiplos arquivos
│       ├── UploadProgressPanel.tsx  # Barras de progresso individuais por arquivo e remoção da lista
│       ├── MediaFilterBar.tsx       # Filtros por tipo de mídia e ordenação
│       ├── MediaGrid.tsx            # Grid responsivo com 5 colunas e skeletons
│       └── MediaCard.tsx            # Card de arquivo com menu, download e exclusão com proteção órfã
└── pages/
    └── Midiateca.tsx                # [MODIFY] Substituição completa do placeholder
```

## Desvios do plano original

- **Filtragem de Documentos (DOC) no Servidor**: Em vez de carregar sem filtro e filtrar client-side, descobriu-se que o Strapi v3 processa múltiplos parâmetros `mime_ncontains` corretamente. Assim, os DOCs (não-pdf, não-imagem, não-vídeo) são buscados server-side de forma nativa por exclusão: `mime_ncontains=application/pdf&mime_ncontains=image/&mime_ncontains=video/`.

## Limitações conhecidas

- **Sidebar vs Midiateca divergentes**: A barra de armazenamento na Sidebar exibe os dados estáticos da Fase 1 (6,4 GB de 20 GB). O indicador da página de Midiateca exibe o mesmo dado estático por ora, restando a unificação em uma fase futura que defina um mecanismo global de cotas.

## Pendências para as próximas fases

- **Fase 3**: CRUDs de FAQs (drag & drop), Textos Institucionais, Usuários e Configurações.
