Resumo da investigação
Pendências resolvidas (7 de 7)
Item Resultado
data/compare Resolvido. Params: locale_id (obrigatório) + year (opcional, enum 2017|2018|2019). Retorna comparison[] com locales[] → indicators[] → values[] + subindicators[].
data/historical Resolvido. Params: locale_id (obrigatório) + area_id (opcional). Não aceita year — retorna toda a série. Estrutura idêntica ao compare, mas array raiz chama-se historical.
data/download_indicator Resolvido. Dois params, ambos obrigatórios: locale_id + indicator_id. Retorna XLSX.
classifications Resolvido. Sem params. Retorna { classifications: string[] } — array plano de rótulos, sem id.
indicators Resolvido. Sem params. Retorna { indicators: [{ id, description, base, area }] }. Atenção: campo é description, não name.
areas Resolvido. Sem params. Retorna { areas: [{ id, name }] }. Taxonomia de dado — conceito distinto de eixos do Strapi.
states / cities Resolvidos. states sem params; cities aceita state_id opcional. Ambos retornam { id, name, latitude, longitude }.
Viraram limitações confirmadas do backend (sem solução interna)
Números agregados do Hero — Não existe nenhum endpoint que retorne totais nacionais (municípios mapeados, com plano aprovado, etc.). Decisão documentada: usar constantes estáticas no componente Hero. Verificar antes se o Strapi tem campo editorial para isso; caso contrário, hardcode é a saída correta.

Aba "Monitoramento" — classifications retorna só strings sem id; indicators retorna só metadados sem valores. Dados reais de indicadores existem apenas atrelados a locale_id via GET /data. Uma visão tabular nacional exigiria novo endpoint — fora do escopo do projeto.
