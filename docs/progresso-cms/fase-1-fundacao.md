# Fase 1 — Fundação do Painel CMS (React + Vite)

## O que foi decidido
- Confirmada a decisão de arquitetura (21/07/2026): **Caminho A2 — aplicação React + Vite separada** (`painel-cms/`), revertendo a decisão anterior de 16/07/2026.
- Stack adotada: Vite + React 18 + TypeScript + `react-router-dom` v6 + `@tanstack/react-query` v5.
- Autenticação via REST API do Strapi v3 (`POST /auth/local`), armazenando o JWT em `sessionStorage`.
- Adotada a biblioteca `xlsx@0.18.5` (Apache 2.0) para evitar licença comercial das versões 0.19+.
- Design tokens fiéis ao protótipo `observa-redesign.html` e `CMS_DESIGN_SPEC.md` implementados em CSS puro (`tokens.css`, `base.css`).

## O que foi implementado
- [x] Projeto `painel-cms/` Scaffolded com `create-vite` (React + TypeScript).
- [x] Instalação de dependências principais: `react-router-dom`, `@tanstack/react-query`, `lucide-react`, `@hello-pangea/dnd`, `react-dropzone`, `papaparse`, `@types/papaparse`, `xlsx@0.18.5`.
- [x] Configuração de fontes (`Nunito` e `Plus Jakarta Sans` via Google Fonts no `index.html`) e CSS tokens.
- [x] Infraestrutura de autenticação (`lib/auth.ts`, `lib/api.ts`, `AuthContext.tsx`, `useAuth.ts`) com tratamento de sessão e interceptor HTTP para 401.
- [x] Layout shell (`AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx`):
  - Sidebar em 2 grupos: **PRINCIPAL** (Dashboard, Planos [128], Midiateca, FAQs, Textos Institucionais) e **ADMINISTRAÇÃO** (Usuários, Configurações), com card de Armazenamento no rodapé.
  - Topbar limpa (sem busca global e sem notificações, conforme escopo MVP) com botão de importar, criar e avatar com info do usuário logado.
- [x] Componentes UI base: `StatusBadge.tsx`, `Avatar.tsx`, `Toast.tsx`.
- [x] Roteador centralizado (`router/index.tsx`) com proteção de rotas (`ProtectedRoute`).
- [x] Tela de `Login.tsx` estilizada e conectada ao Strapi.
- [x] Tela de `Dashboard.tsx` (boas-vindas sem KPIs fictícios e atalhos rápidos).
- [x] Placeholders para as demais 6 rotas: `/planos`, `/midiateca`, `/faqs`, `/textos`, `/usuarios`, `/configuracoes`.
- [x] Variáveis de ambiente (`.env.local` e `.env.local.example`) apontando para `VITE_STRAPI_URL`.

## Desvios do plano original
- Nenhum desvio técnico. A versão `xlsx@0.18.5` foi rigorosamente respeitada conforme instrução do usuário.

## Pendências para as próximas fases
- **Fase 2:** Implementação dos CRUDs de **Planos** (listagem com tabs de status, drawer editor 640px, upload PDF via Dropzone), **Midiateca** (grid 5 colunas, upload com progresso) e **FAQs** (lista ordenável por drag & drop, modal 560px).
- **Fase 3:** Implementação dos CRUDs de **Textos Institucionais** (rich text editor + SEO), **Usuários** (tabela + drawer com matriz de permissões) e **Configurações**.
- **Fase 4:** Implementação do overlay de **Importação CSV/XLSX** (stepper de validação e relatório de erros) e **Exportação**.
