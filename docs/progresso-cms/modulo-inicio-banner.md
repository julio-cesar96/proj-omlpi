# Fase: Módulo "Início" (Banner) — painel-cms

**Data:** 2026-08-13  
**Branch:** `feature/cms-redesign`

---

## O que foi decidido

- Localização: item próprio na seção **PRINCIPAL** do Sidebar (Opção A do plano).
- Rota: `/inicio`, página `Inicio.tsx`.
- Ícone: `Home` do lucide-react.
- Campo `text` editado com `<textarea>` simples (não RichTextEditor) — o `Hero.tsx` do `next/` renderiza como texto puro, sem markdown/HTML.
- `published_at` sempre reenviado no PUT (draftAndPublish ativo no content-type `banners`).

---

## Verificação empírica — resultados literais

### Curl 1 — GET /banners (autenticado) → HTTP 200
```json
{
    "id": 2,
    "title": "Monitoramento de políticas públicas para a Primeira Infância",
    "text": "Indicadores, análises e referências para a garantia dos direitos das crianças de 0 a 6 anos, nas esferas municipal, estadual e nacional.",
    "type": "home_about",
    "created_at": "2020-01-29T18:14:08.564Z",
    "updated_at": "2020-06-17T13:10:33.836Z",
    "link": "http://andi.org.br/",
    "published_at": "2020-01-29T18:14:08.564Z"
}
```

### Curl 2 — PUT /banners (com published_at original) → HTTP 200 ✅
- Resposta: objeto idêntico, `published_at` mantido em `"2020-01-29T18:14:08.564Z"`.

### Curl 3 — GET /banners pós-PUT → published_at continua preenchido ✅
- Estratégia de repassar o `published_at` lido do GET confirmada segura.

---

## O que foi implementado

### [NEW] `painel-cms/src/hooks/banner/useBanner.ts`
- Hook GET + PUT do singleType `banners`.
- Padrão idêntico a `useConfiguracoes.ts`.
- `staleTime: 5min`. Alerta inline sobre `published_at` obrigatório.

### [NEW] `painel-cms/src/pages/Inicio.tsx`
- Campos: Título (input) + Texto descritivo (textarea 4 linhas, resizável).
- Link "Ver no site ↗" via `VITE_SITE_URL` (condicional).
- Badge de status "Publicado".
- Estados: loading skeleton, erro com retry, salvando com spinner, Toast sucesso/erro.
- `published_at` reenviado do `banner.data`, nunca calculado no cliente.

### [MODIFY] `painel-cms/src/lib/strapi.ts`
- Interfaces `Banner` e `BannerPayload` adicionadas.

### [MODIFY] `painel-cms/src/router/index.tsx`
- Lazy import de `Inicio` + rota `/inicio` entre `/dashboard` e `/planos`.

### [MODIFY] `painel-cms/src/components/layout/Sidebar.tsx`
- Item `Início` (ícone Home) adicionado em `navPrincipal` entre Dashboard e Planos.

---

## Verificação de build

```
> tsc -b && vite build
✓ 2020 modules transformed.
dist/assets/Inicio-CE7x6jtV.js  6.72 kB │ gzip: 2.45 kB
✓ built in 319ms — ZERO erros TypeScript
```

---

## Pendência manual (ação do cliente no Strapi Admin)

**Antes de testar no painel:**
1. `https://omlpi-strapi.rnpiobserva.org.br/admin`
2. Settings → Roles → **Authenticated** → Banners
3. Habilitar `find` e `update`. NÃO habilitar `delete`.
4. Salvar.

Sem isso: 403 no GET e PUT do hook, mesmo com o código correto.

---

## Desvios do plano original

Nenhum. Implementação seguiu o plano aprovado integralmente.

---

## Checklist de verificação pós-deploy

- [ ] Login no painel → `/inicio` → formulário carrega com valores reais.
- [ ] Editar título → Salvar → Toast de sucesso.
- [ ] GET pós-save confirma `published_at` ainda preenchido (não zerou).
- [ ] Hero do `next/` exibe o novo título após recarregar.
- [ ] Sidebar mostra "Início" com ícone Home, ativo ao navegar para `/inicio`.
