# Correção de Leitura de Propriedades no Mapa do Brasil (Highcharts)

## Resumo da Fase 3e

Nesta correção, ajustamos a forma como os dados geográficos e metadados associados a estados e municípios são processados no componente `MapaBrasil` da nova aplicação Next.js.

## Causa Raiz Real

O problema principal relatado era que os dados dos planos estaduais e municípios associados não estavam sendo vinculados corretamente às geometrias dos estados no Highcharts. Após debugar os valores reais retornados por `H.geojson()`, identificamos que os dados da API do Highcharts (do mapa `countries/br/br-all`) aninham metadados customizados dentro de um objeto chamado `properties`. 

- **Errado**: O código estava tentando ler `item["hc-key"]` diretamente na raiz do objeto de features do mapa.
- **Correto**: O valor real estava em `item.properties["hc-key"]`.

Também identificamos que `item.properties["hc-a2"]` já contém diretamente a sigla do estado (ex: "BA", "MA"), eliminando a necessidade de mapear as chaves de `hc-key` de volta para siglas de estados no fluxo principal.

Em contrapartida, os dados para o mapa municipal provenientes de `/api/maps/br-XX.json` (que leem diretamente dos arquivos estáticos originais de produção em `omlpi-www/src/static/maps`) têm uma estrutura achatada onde atributos como `name` estão efetivamente na raiz do objeto (ex: `city["name"]`). Por isso, não foi necessário alterar o parse para o mapa municipal.

## Solução Aplicada

1. Modificamos o loop `mapData.forEach` em `next/src/components/consulta-publica/MapaBrasil.tsx` para extrair os dados de `properties`:
   ```ts
   const properties = (item["properties"] as Record<string, unknown>) || {};
   const hcKey = properties["hc-key"] as string | undefined;
   const stateAbbr = properties["hc-a2"] as string | undefined;
   ```
2. O drilldown automático provido pelo Highcharts continua funcionando sem mais edições, pois populamos `item["drilldown"] = hcKey` com a chave extraída de `properties`.
3. Os logs de debug inseridos nas iterações recentes de desenvolvimento em `MapaBrasil.tsx` e `ConsultaPublica.tsx` foram removidos em sua totalidade para limpar o código.
4. Passamos os testes estáticos (`npm run lint` e `npm run build`) sem erros na base atualizada.

## Confirmação Visual e Teste

Verificamos visualmente e em testes no navegador que a renderização dos dados se normalizou:
- O estado do **Maranhão (MA)** reflete corretamente a cor **Laranja** ("Em elaboração / Lei").
- **Espírito Santo (ES)** e **Distrito Federal (DF)** refletem a cor **Verde** ("Aprovado").
- Ao clicar em **Bahia (BA)**, o drilldown para o mapa de municípios funciona com perfeição: o mapa de cidades carrega e colore municípios como **Jussari** (com o plano visível) e **Ruy Barbosa** (marcada com status pertinente de Lei).
