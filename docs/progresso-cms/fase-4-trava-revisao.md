# Fase 4 — Trava de Revisão (`require_review`) e Paridade do Fluxo Editorial

**Branch:** `feature/cms-redesign`  
**Data:** 2026-08-17  

---

## O que foi decidido

### 1. Paridade do Schema `estado_editorial` (Opção A1)
Extensão dos modelos de dados do Strapi v3 para que os content-types `faq` e `pagina-institucional` possuam exatamente o mesmo enum `estado_editorial` (`rascunho`, `revisao`, `publicado`, `arquivado`) com valor default `'rascunho'`, garantindo 100% de paridade com o módulo de Planos.

### 2. Regra de Migração dos Registros Existentes (Regra B)
- O restart do Strapi com a nova configuração de schema criou automaticamente a coluna `estado_editorial` no banco com o default `'rascunho'` para todos os registros.
- Executada a migração SQL no banco de produção para atualizar especificamente os conteúdos com `published_at IS NOT NULL` para o estado `'publicado'`:
  ```sql
  UPDATE faqs SET estado_editorial = 'publicado' WHERE published_at IS NOT NULL;
  UPDATE paginas_institucionais SET estado_editorial = 'publicado' WHERE published_at IS NOT NULL;
  ```
- **Nenhum registro antigo nasceu em revisão**, preservando conteúdos que já estavam no ar sem bloquear edições.

### 3. Trava de Publicação Operacional (`require_review`)
Operacionalizado o toggle `require_review` existente em Configurações (`cms-config`):
- **Se `require_review === true` (Trava Ativa):** O botão **"Publicar"** fica bloqueado e desabilitado nos 3 módulos (Planos, FAQs e Textos Institucionais) a menos que o registro esteja no estado `'revisao'`. O fluxo obrigatório é: `Rascunho → Enviar p/ Revisão → Publicar`.
- **Se `require_review === false` (Trava Desativada):** O comportamento flexível é mantido: rascunhos podem ser publicados diretamente a partir de qualquer estado.

---

## O que foi implementado

### Estrutura de Arquivos Modificados / Criados

```
omlpi-cms/
├── api/
│   ├── faq/models/
│   │   └── faq.settings.json                    # [MODIFY] adiciona enum estado_editorial
│   └── pagina-institucional/models/
│       └── pagina-institucional.settings.json   # [MODIFY] adiciona enum estado_editorial

painel-cms/src/
├── lib/
│   └── strapi.ts                                # [MODIFY] atualiza interfaces Faq, FaqPayload, PaginaInstitucional, PaginaInstitucionalPayload
├── components/
│   ├── ui/
│   │   └── EditorialBadge.tsx                   # [NEW] Pill visual de status editorial com fallback para published_at
│   ├── planos/
│   │   └── PlanoDrawer.tsx                      # [MODIFY] integra useConfiguracoes e trava require_review em handlePublish
│   ├── faqs/
│   │   ├── FaqModal.tsx                         # [MODIFY] inclui botão "Enviar p/ revisão", EditorialBadge e trava
│   │   └── FaqCard.tsx                          # [MODIFY] exibe EditorialBadge em substituição à badge binária
│   └── textos/
│       └── TextoCard.tsx                        # [MODIFY] exibe EditorialBadge na listagem
├── hooks/
│   ├── faqs/
│   │   └── useFaqMutations.ts                   # [MODIFY] suporta payload com estado_editorial
│   └── textos/
│       └── useTextoMutations.ts                 # [MODIFY] suporta payload com estado_editorial
└── pages/
    ├── Faqs.tsx                                 # [MODIFY] inclui handler handleSubmitReview e passa para FaqModal
    └── TextosEditor.tsx                         # [MODIFY] inclui botão "Enviar p/ revisão", EditorialBadge e trava
```

---

## Procedimento de Deploy Realizado no Backend (`omlpi-cms`)

1. **Backup:** `docker exec strapi_pg_db pg_dump -U pgstrapi strapi_prod2024 > /root/backups/omlpicms_pre_fase4_revisao_2026-08-17_1540.sql`
2. **Transferência dos Schemas:** `scp` dos arquivos `faq.settings.json` e `pagina-institucional.settings.json` para o repositório em `/root/proj-omlpi/omlpi-cms/`.
3. **Restart do Strapi:** `cd /root/proj-omlpi && docker compose restart strapi` (executou DDL automático adicionando a coluna `estado_editorial`).
4. **Logs:** `docker compose logs strapi --since 1m -f` (confirmado boot limpo sem exceções).
5. **Migração SQL Executada:**
   ```sql
   UPDATE faqs SET estado_editorial = 'publicado' WHERE published_at IS NOT NULL;
   UPDATE paginas_institucionais SET estado_editorial = 'publicado' WHERE published_at IS NOT NULL;
   ```
6. **Sanity Check (`curl`):** Validadas respostas de `GET /faqs?_publicationState=preview` e `GET /paginas-institucionais?_publicationState=preview` confirmando presença do atributo `estado_editorial`.

---

## Verificação

- **`npm run build` (painel-cms):** Passou com 0 erros de compilação (`tsc -b` + `vite build`).
- **Pills visuais de status (`EditorialBadge`):** Renderizam o status real de cada conteúdo com cores condizentes ao design de Planos (`#A49A87` rascunho, `#F25D27` em revisão, `#17A649` publicado, `#C08585` arquivado).
- **Gating de Publicação:** Desabilita/habilita dinamicamente a ação de publicação conforme o toggle `require_review` de `cms-config`.
