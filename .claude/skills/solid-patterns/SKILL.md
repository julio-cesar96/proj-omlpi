---
name: solid-patterns
description: "Princípios SOLID adaptados para desenvolvimento assistido por IA. Use SEMPRE que estiver criando, revisando ou refatorando componentes, hooks, pages ou libs em qualquer parte do projeto Observa. Foco em arquivos pequenos, responsabilidade única e composição — padrões que reduzem consumo de tokens e aumentam a precisão do agente."
---

# SOLID para Desenvolvimento Assistido por IA

## Por que SOLID importa para AI-assisted dev

Arquivos grandes e com múltiplas responsabilidades custam mais tokens para ler
e produzem saídas menos precisas. SOLID bem aplicado gera arquivos pequenos,
previsíveis e independentes — o cenário ideal para um agente de código.

Regra de ouro: se o agente precisa ler mais de 200 linhas para entender
o que fazer, o arquivo precisa ser dividido.

## Prioridade por impacto no dev com IA

1. S — Single Responsibility (MÁXIMA) — arquivos menores = menos tokens
2. O — Open/Closed (ALTA) — criar arquivo novo > editar existente
3. I — Interface Segregation (MÉDIA-ALTA) — props mínimas = menos contexto
4. D — Dependency Inversion (MÉDIA) — camadas isoladas = edição focada
5. L — Liskov Substitution (BAIXA) — relevante só pra componentes ui/


## S — Single Responsibility (PRIORIDADE MÁXIMA)

O princípio mais impactante para economia de tokens.
Um arquivo = uma razão para mudar.

### Regras

- Componente: só renderização e handlers simples (< 150 linhas)
- Hook: só UMA responsabilidade de estado/fetch/mutation
- Lib/util: só funções puras de um domínio
- Page: só composição de componentes, sem lógica de negócio

### Sinais de violação

- Arquivo > 200 linhas
- Mais de 3 useState no mesmo componente
- Componente que faz fetch E renderiza lista E tem modal E tem form
- Hook que mistura query + mutation + validação + transformação

### ERRADO — Page com 400 linhas fazendo tudo

```typescript
// pages/Planos.tsx
export const Planos = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingPlano, setEditingPlano] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  // ... 350 linhas de lógica + renderização misturadas
};
```

### CERTO — Page compondo componentes focados

```typescript
// pages/Planos.tsx (~40 linhas)
export const Planos = () => {
  return (
    <PageLayout title="Planos" description="Gerencie os planos cadastrados.">
      <PlanosFilterBar />
      <PlanosTable />
      <PlanosDeleteDialog />
    </PageLayout>
  );
};
```

Cada pedaço em seu arquivo:
- components/planos/PlanosTable.tsx (~80 linhas) — só tabela
- components/planos/PlanosFilterBar.tsx (~50 linhas) — só filtros
- components/planos/PlanosDeleteDialog.tsx (~40 linhas) — só confirmação
- hooks/planos/usePlanosFilters.ts (~30 linhas) — só estado de filtro


## O — Open/Closed (ALTA PRIORIDADE)

Impacto direto: quando o agente precisa adicionar funcionalidade,
ele cria um arquivo novo em vez de editar um existente. Menos risco
de quebrar o que funciona, menos contexto necessário.

### Regras

- Componentes extensíveis via composição e props, não via edição interna
- Hooks genéricos reutilizáveis, especializados via parâmetros
- Novos filtros/colunas/abas = novo componente, não if/else no existente

### ERRADO — cada tipo novo edita o mesmo componente

```typescript
function ContentCard({ type }: { type: string }) {
  if (type === 'plano') return <div>...</div>;
  if (type === 'faq') return <div>...</div>;
  if (type === 'guia') return <div>...</div>;
  // cada adição = editar este arquivo
}
```

### CERTO — extensível via composição

```typescript
interface ContentCardProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

function ContentCard({ children, actions }: ContentCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {children}
      {actions && <div className="flex gap-2 mt-4">{actions}</div>}
    </div>
  );
}

// Cada domínio cria seu próprio componente sem editar ContentCard
<ContentCard actions={<PlanoActions plano={plano} />}>
  <PlanoSummary plano={plano} />
</ContentCard>
```


## I — Interface Segregation (MÉDIA-ALTA PRIORIDADE)

Interfaces menores = menos contexto para o agente = saídas mais precisas.

### Regras

- Props de componente: só o que ele usa, nunca o objeto inteiro do Strapi
- Tipos de payload separados dos tipos de leitura
- Params de hook: só os filtros que aquele hook aceita

### ERRADO — componente recebe o objeto Strapi inteiro

```typescript
// O agente precisa ler o tipo Plano inteiro pra entender o componente
function PlanoCard({ plano }: { plano: Plano }) {
  return (
    <div>
      <h3>{plano.titulo}</h3>
      <span>{plano.estado_editorial}</span>
    </div>
  );
  // Usa só 2 campos mas importa o tipo com 15+
}
```

### CERTO — interface mínima com só o que usa

```typescript
interface PlanoCardProps {
  titulo: string;
  estado: Plano['estado_editorial'];
  atualizadoEm: string;
  onEdit: () => void;
}

function PlanoCard({ titulo, estado, atualizadoEm, onEdit }: PlanoCardProps) {
  return (
    <div>
      <h3>{titulo}</h3>
      <span>{estado}</span>
      <button onClick={onEdit}>Editar</button>
    </div>
  );
}
```


## D — Dependency Inversion (MÉDIA PRIORIDADE)

O agente trabalha melhor quando pode focar em uma camada por vez.

### Camadas do projeto

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

O agente edita UMA camada por tarefa:
- "Mudar como planos são exibidos" → só componentes
- "Mudar a query de planos" → só o hook
- "Adicionar header de auth" → só lib/api.ts

### ERRADO — componente chama apiFetch direto

```typescript
// PlanosList.tsx — mistura UI com detalhes de HTTP
import { apiFetch } from '../../lib/api';

export function PlanosList() {
  const [planos, setPlanos] = useState<Plano[]>([]);

  useEffect(() => {
    async function load() {
      const res = await apiFetch('/planos?_publicationState=preview');
      const data = await res.json();
      setPlanos(data);
    }
    load();
  }, []);

  return <ul>{planos.map(p => <li key={p.id}>{p.titulo}</li>)}</ul>;
}
```

### CERTO — componente depende do hook (abstração)

```typescript
// hooks/planos/usePlanos.ts — só dados
export function usePlanos(params: PlanosListParams = {}) {
  return useQuery<Plano[]>({
    queryKey: ['planos', params],
    queryFn: async () => {
      const res = await apiFetch('/planos?_publicationState=preview');
      if (!res.ok) throw new Error('Erro ao carregar planos.');
      return res.json();
    },
  });
}

// components/planos/PlanosList.tsx — só UI, não sabe nada de HTTP
import { usePlanos } from '../../hooks/planos/usePlanos';

export function PlanosList() {
  const { data: planos, isLoading } = usePlanos();

  if (isLoading) return <Skeleton />;
  return <ul>{planos?.map(p => <li key={p.id}>{p.titulo}</li>)}</ul>;
}
```


## L — Liskov Substitution (BAIXA PRIORIDADE)

Menos aplicável em React, mas vale para componentes base em ui/.

### Regra única

Componentes em ui/ devem aceitar todas as props HTML nativas
do elemento que encapsulam via spread.

### ERRADO — botão que ignora props HTML nativas

```typescript
function Button({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick}>{label}</button>;
  // Não aceita disabled, type, className, aria-*, etc.
}
```

### CERTO — aceita todas as props do elemento base

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

function Button({ variant = 'primary', children, className, ...rest }: ButtonProps) {
  const base = 'px-4 py-2 rounded-xl font-semibold transition-colors';
  const variants = {
    primary: 'bg-primary text-white hover:bg-[var(--primary-hover)]',
    secondary: 'border-2 border-border text-foreground hover:border-primary',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className ?? ''}`} {...rest}>
      {children}
    </button>
  );
}

// Qualquer prop de <button> funciona sem editar o componente
<Button variant="primary" disabled={isSaving} type="submit" aria-busy={isSaving}>
  Salvar
</Button>
```


## Padrão de divisão de arquivo grande

Quando encontrar um arquivo > 200 linhas, seguir esta receita:

1. Identificar quantos useState existem → agrupar por responsabilidade
2. Cada grupo vira um hook em hooks/[domínio]/
3. Cada bloco visual distinto (tabela, filtros, modal, form) vira componente
4. A page original vira composição pura importando tudo

Resultado esperado:
- Page: ~30-50 linhas (só composição)
- Componentes: ~50-120 linhas cada (só UI)
- Hooks: ~20-50 linhas cada (só dados/estado)


## Checklist antes de criar ou editar

1. Este arquivo tem mais de 200 linhas? → Dividir
2. Este componente tem mais de 3 useState? → Extrair hook
3. Este componente faz fetch direto? → Mover para hook
4. Estou editando arquivo existente para adicionar feature? → Criar novo
5. As props recebem o objeto inteiro do Strapi? → Criar interface mínima
6. A page tem lógica de negócio? → Mover para hook ou componente