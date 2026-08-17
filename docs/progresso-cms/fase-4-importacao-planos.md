# Fase 4 — Importação de Planilha (CSV/XLSX) — Módulo Planos

## O que foi decidido

1. **Decisão A3 (Híbrida — Categoria e Tags por nome):**
   - O parser faz busca case-insensitive contra as categorias e tags cadastradas no Strapi.
   - Por padrão (modo estrito), caso uma categoria/tag não seja encontrada, a linha exibe um aviso/alerta no preview.
   - O modal inclui uma caixa de seleção (*"Criar categorias e tags inexistentes automaticamente"*). Quando ativada, insere automaticamente categorias (`POST /categorias`) e tags (`POST /tags`) faltantes durante a execução da importação.

2. **Decisão B (Formato e Modelo para Download):**
   - Cabeçalhos padrão: `titulo`, `descricao`, `categoria`, `tags`, `estado_editorial`.
   - O modal inclui o botão *"Baixar modelo (.xlsx)"*, que gera dinamicamente via `xlsx` (SheetJS) uma planilha de exemplo pré-formatada.

3. **Decisão C (Comportamento em Caso de Erro Parcial):**
   - Processamento sequencial linha a linha (nunca tudo-ou-nada).
   - Se parte das linhas for importada com sucesso e outras falharem (por validação ou erro de API), as linhas válidas permanecem salvas no Strapi.
   - O relatório final exibe estatísticas (sucesso/falha) e detalha cada erro com o número da linha e mensagem correspondente.

4. **Decisão D (Arquitetura Reutilizável para FAQ e Textos):**
   - Engine desacoplada em `useSpreadsheetImport` + `ImportModal` + `ImportModuleConfig`.
   - Implementação de referência criada para Planos em `usePlanosImportConfig.ts`. Futuros módulos (FAQ, Textos) dependerão apenas da criação de seus respectivos arquivos de configuração.

5. **Ajuste 1 (Omissão da chave `documento`):**
   - O payload enviado ao endpoint `POST /planos` omite inteiramente o campo `documento` (não envia a chave nem como `null`), respeitando a regra de que o PDF é vinculado posteriormente de forma manual.

6. **Ajuste 2 (Smoke Test da Biblioteca `xlsx`):**
   - Executado teste isolado com a versão `^0.18.5` instalada.
   - Confirmado que `XLSX.read()` e `XLSX.utils.sheet_to_json()` parseiam corretamente dados de 5 colunas, e `XLSX.write()`/`XLSX.writeFile()` geram buffers XLSX binários válidos (16.2 KB) sem erros.

---

## O que foi implementado

### Estrutura de Arquivos Criados / Modificados

```
painel-cms/src/
├── lib/
│   └── excelParser.ts                         # [NEW] Utilitários SheetJS: parseSpreadsheetFile e downloadTemplateFile
├── types/
│   └── import.ts                              # [NEW] Interfaces para a engine genérica de importação
├── hooks/
│   ├── useSpreadsheetImport.ts                # [NEW] Hook genérico de gerenciamento de parse, preview, progresso e relatório
│   └── planos/
│       └── usePlanosImportConfig.ts           # [NEW] Mapeamento, validação e execução específica para o módulo de Planos
├── components/
│   ├── import/
│   │   ├── ImportModal.tsx                    # [NEW] Modal responsivo de 4 etapas (Upload, Preview, Progresso, Relatório)
│   │   ├── ImportPreviewTable.tsx             # [NEW] Tabela de preview com pílulas de status (Válido, Aviso, Erro)
│   │   └── ImportReport.tsx                   # [NEW] Relatório visual pós-execução com métricas e lista de falhas
│   └── layout/
│       └── AppShell.tsx                       # [MODIFY] Integração do botão Importar no Topbar com ativação de rota e invalidação de cache
```

---

## Verificações Realizadas

1. **Smoke Test `xlsx` (^0.18.5):**
   - Executado via `npx tsx` em ambiente Node.
   - Leitura de buffer com 5 colunas e conversão via `sheet_to_json` retornou dados exatos.
   - Geração de planilha modelo com `aoa_to_sheet` produziu binário limpo.

2. **Download do Template:**
   - Botão *"Baixar modelo (.xlsx)"* gera o arquivo `modelo-importacao-planos.xlsx` com os 5 cabeçalhos e 1 linha de exemplo.

3. **Validação de Preview:**
   - Valida títulos obrigatórios, ajusta estados editoriais para minúsculo (`rascunho`, `revisao`, `publicado`, `arquivado`), e sinaliza categorias/tags não encontradas com pílula amarela de aviso ou criação automática (A3).

4. **Execução de Importação & Trava Strapi v3:**
   - As requisições `POST /planos` obedecem à regra de `published_at: null` para rascunhos, revisões e arquivados, evitando o bug de auto-publicação do Strapi v3.
   - A chave `documento` é omitida do JSON do payload.

5. **Relatório Parcial & Resiliência:**
   - Falhas individuais de linha não interrompem o loop batch; estatísticas finais e lista de erros são apresentadas ao usuário ao final do processo.

6. **Validação de Build:**
   - `npm run build` executado em `painel-cms/` com **0 erros** de TypeScript e compilação Vite bem-sucedida.
