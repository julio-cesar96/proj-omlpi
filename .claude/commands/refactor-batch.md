---
name: refactor-batch
description: Refatora múltiplos componentes do Observa de uma vez
---

Analise todos os componentes em $ARGUMENTS e execute o refactor completo:

1. PRIMEIRO: leia todos os arquivos e liste os problemas encontrados
   segundo os padrões do observa-patterns, agrupados por severidade
2. PEÇA CONFIRMAÇÃO antes de editar qualquer coisa
3. Aplique as correções arquivo por arquivo
4. Faça um commit separado por arquivo com mensagem descritiva
   no formato: refactor(NomeComponente): descrição curta da mudança
5. Depois de tudo, rode uma verificação final e reporte o que mudou

Foque em:
- Padronizar try/catch e fallbacks do Strapi
- Trocar cores hardcoded por CSS variables
- Adicionar tipagem explícita
- Garantir acessibilidade (aria-label, aria-hidden)
- Remover use client desnecessário
