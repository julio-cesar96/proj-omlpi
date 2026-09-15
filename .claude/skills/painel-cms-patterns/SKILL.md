---
name: painel-cms-patterns
description: "Padrões e convenções do painel-cms do projeto Observa. Use SEMPRE que estiver escrevendo, revisando ou refatorando código dentro de painel-cms/. Inclui padrões de hooks com TanStack Query, consumo do Strapi via apiFetch, estilização com CSS variables e Tailwind, tipagem e estrutura de páginas. Ative para qualquer tarefa envolvendo componentes, hooks, páginas ou mutations do painel administrativo."
---

# Padrões do Painel CMS — Observa

## Arquitetura

- React SPA (sem Next.js, sem SSR)
- Roteamento: React Router DOM
- Data fetching: TanStack Query (React Query)
- Estilização: Tailwind CSS com preset compartilhado + CSS variables
- API: Strapi v3.3.3 via `apiFetch()` de `lib/api.ts`
- Tipos: `lib/strapi.ts`

## Estrutura de diretórios

```
painel-cms/src/
├── components/       # Componentes reutilizáveis
│   ├── layout/       # AppShell, Sidebar, Topbar
│   ├── ui/           # Toast, ConfirmDialog, MediaPickerModal
│   ├── import/       # ImportModal e fluxo de importação
│   └── [domínio]/    # Componentes por domínio (midiateca/, localidades/)
├── hooks/            # Custom hooks por domínio
│   ├── banner/
│   ├── planos/
│   ├── faqs/
│   ├── guias/
│   ├── sobre/
│   ├── localidades/
│   ├── midiateca/
│   ├── configuracoes/
│   └── usuarios/
├── pages/            # Uma page por rota
├── lib/              # api.ts, strapi.ts (tipos)
└── types/            # Tipos auxiliares
```


## Custom Hooks — Padrão obrigatório

### Regra principal

Toda lógica de data fetching, mutations e estado complexo DEVE estar
em custom hooks dentro de `hooks/[domínio]/`. Componentes e páginas
só consomem hooks, nunca chamam `apiFetch` diretamente.

### Hook de leitura (query)

```typescript
// hooks/[domínio]/useMinhaColecao.ts
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { MeuTipo, MinhaListParams } from '../../lib/strapi';

export function useMinhaColecao(params: MinhaListParams = {}) {
  return useQuery<MeuTipo[]>({
    queryKey: ['minha-colecao', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      // CRÍTICO: _publicationState=preview para ver rascunhos no painel
      searchParams.append('_publicationState', 'preview');

      if (params._start !== undefined)
        searchParams.append('_start', params._start.toString());
      if (params._limit !== undefined)
        searchParams.append('_limit', params._limit.toString());
      if (params._sort)
        searchParams.append('_sort', params._sort);

      const res = await apiFetch(`/minha-colecao?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Erro ao carregar dados.');
      return res.json();
    },
  });
}
```

### Hook de escrita (mutation)

```typescript
// hooks/[domínio]/useMinhaColecaoSave.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { MeuTipo, MeuPayload } from '../../lib/strapi';

export function useMinhaColecaoSave() {
  const queryClient = useQueryClient();

  return useMutation<MeuTipo, Error, MeuPayload>({
    mutationFn: async (payload) => {
      const res = await apiFetch('/minha-colecao', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message || 'Erro ao salvar.'
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-colecao'] });
    },
  });
}
```

### Regras de hooks

- Um hook por arquivo, nomeado `use[Domínio][Ação].ts`
- queryKey sempre como array: `['domínio', params]`
- SEMPRE `_publicationState=preview` em queries do painel
- SEMPRE async/await, NUNCA .then()/.catch()
- Errors com mensagem descritiva em português
- Mutations invalidam as queries relacionadas no onSuccess
- singleType (banner, cms-config): GET/PUT sem id
- collectionType (planos, faqs): GET com params, POST/PUT com id


## Strapi v3 — Cuidados

### published_at

CRÍTICO: `published_at` DEVE ser reenviado no PUT de singleTypes.
Bug de auto-publicação do Strapi v3: omitir o campo zera ou sobrescreve
o valor com o timestamp atual. Sempre ler o published_at do GET e
reenviar no PUT.

```typescript
// CERTO
const saveBanner = async (payload: BannerPayload) => {
  const res = await apiFetch('/banners', {
    method: 'PUT',
    body: JSON.stringify({
      ...payload,
      published_at: banner.published_at, // SEMPRE reenviar
    }),
  });
};

// ERRADO — omitir published_at causa bug
const saveBanner = async (payload: BannerPayload) => {
  const res = await apiFetch('/banners', {
    method: 'PUT',
    body: JSON.stringify(payload), // published_at ausente = bug
  });
};
```

### Regras gerais do Strapi

- NUNCA usar populate= — Strapi v3 não suporta
- NUNCA usar GraphQL — não está habilitado
- Campos em PORTUGUÊS: `titulo`, `texto`, `descricao`, `nome`, `ordem`
- `apiFetch()` já inclui headers e base URL — não construir URL manualmente
- Usar `_publicationState=preview` para ver rascunhos (EXCLUSIVO do painel)


## Async/Await

### Regra: SEMPRE usar async/await, NUNCA .then()/.catch()

```typescript
// CERTO
async function loadGuias() {
  try {
    const res = await apiFetch('/guias');
    const data = await res.json();
    setGuias(data);
  } catch (err) {
    console.error('[loadGuias] Erro:', err);
  }
}

// ERRADO
function loadGuias() {
  apiFetch('/guias')
    .then((res) => res.json())
    .then((data) => setGuias(data))
    .catch((err) => console.error(err));
}
```

### Inclui Promise.all e Promise.allSettled

```typescript
// CERTO — múltiplas chamadas paralelas
const [guias, categorias] = await Promise.all([
  apiFetch('/guias').then(r => r.json()),
  apiFetch('/categorias').then(r => r.json()),
]);

// ERRADO — callback hell
apiFetch('/guias').then((r) => r.json()).then((guias) => {
  apiFetch('/categorias').then((r) => r.json()).then((cats) => {
    // aninhado, difícil de ler
  });
});
```


## Estilização

### Migração em andamento: inline styles → Tailwind CSS

O painel usa preset compartilhado de `packages/tailwind-config/tailwind.preset.js`.
Os design tokens são os mesmos do site público (next/).

### Regras de estilo

- Código novo: SEMPRE usar classes Tailwind
- Código existente: migrar inline styles para Tailwind quando tocar no arquivo
- SEMPRE usar CSS variables via tokens do Tailwind: `bg-primary`, `text-foreground`,
  `border-border`, `bg-card`, `text-muted-foreground`, `bg-background-alt`
- NUNCA cores hardcoded sem variável
- Transições: `transition-all duration-150 ease-in-out`
- Hover: classes Tailwind `hover:` ao invés de useState com onMouseEnter/onMouseLeave

### Mapeamento inline → Tailwind

```
color: 'var(--text)'              → text-foreground
color: 'var(--text-soft)'         → text-muted-foreground
background: 'var(--card)'         → bg-card
background: 'var(--primary)'     → bg-primary
border: '1px solid var(--border)' → border border-border
borderRadius: 'var(--radius)'    → rounded
padding: '24px'                  → p-6
fontSize: '14px'                 → text-sm
fontSize: '13px'                 → text-[13px]
fontWeight: 600                  → font-semibold
fontWeight: 700                  → font-bold
fontWeight: 800                  → font-extrabold
gap: '12px'                      → gap-3
```

### Padrão de layout de página

```typescript
export const MinhaPage: React.FC = () => {
  return (
    <div className="animate-fadeIn max-w-[820px]">
      {/* Cabeçalho */}
      <div className="mb-5">
        <h1 className="text-[26px] font-extrabold tracking-tight">
          Título da Página
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Descrição da página.
        </p>
      </div>

      {/* Conteúdo */}
      <div className="bg-card border border-border rounded p-6">
        {/* ... */}
      </div>
    </div>
  );
};
```


## Tipagem

- Tipos em `lib/strapi.ts`: Plano, Faq, Guia, Sobre, Banner, Locale, etc.
- Payloads separados: PlanoPayload, BannerPayload, SobrePayload
- ListParams por domínio: PlanosListParams, FaqsListParams, etc.
- Componentes tipados com `React.FC` ou `React.FC<Props>`
- Evitar `any` — usar `unknown` quando necessário
- IDs de StrapiFile são `number` nos payloads


## SOLID aplicado ao painel

Ver a skill `solid-patterns` para regras completas. Resumo aplicado:

- Page > 200 linhas? Dividir em componentes por domínio
- Componente com > 3 useState? Extrair custom hook
- Componente chama apiFetch direto? Mover para hook
- Props recebem Plano inteiro? Criar interface com só os campos usados
- Adicionando feature? Criar arquivo novo, não editar existente

### Camadas

```
Pages          → só composição, zero lógica
  ↓
Componentes    → só UI, recebe dados via hooks ou props
  ↓
Hooks          → só dados e estado, usa apiFetch
  ↓
lib/api.ts     → só HTTP, abstrai headers e base URL
  ↓
Strapi v3      → backend
```