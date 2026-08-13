# Correção — Texto "null" no subtítulo do mapa durante o drilldown (Fase 3i)

## Resumo da Fase 3i

Esta correção resolve a exibição do texto "null" no subtítulo (canto superior direito) do mapa interativo quando o usuário realiza o drilldown em um estado para visualizar seus municípios.

## Causa Raiz

No handler de evento `drilldown(e)` em [MapaBrasil.tsx](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/MapaBrasil.tsx), o valor de `point["name"]` extraído do GeoJSON não é confiável e retorna `null` (ou strings ausentes) dependendo da origem e formatação do arquivo de mapa. Com isso:
1. `chart.addSeriesAsDrilldown` (propriedade `name`)
2. `chart.setTitle` (propriedade `text`)

Ambos usavam `String(point["name"])`, resultando em um subtítulo visual "null" no mapa.

## Solução Aplicada

Substituímos as duas ocorrências de `String(point["name"])` no arquivo [MapaBrasil.tsx](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/MapaBrasil.tsx) pela variável segura e já existente no mesmo escopo léxico:

```typescript
stateLocale?.name ?? stateAbbr ?? ""
```

Dessa forma, o componente tenta usar:
1. O nome formatado retornado pelo Strapi (`stateLocale.name`).
2. A sigla do estado (`stateAbbr`).
3. Uma string vazia como fallback de segurança absoluto, evitando qualquer exibição de `"null"` ou `"undefined"`.

## Verificação e Resultados

- **Build**: Executado `npm run build` com sucesso no diretório `next/`, sem erros de compilação ou de verificação de tipos (TypeScript).
- **Consistência de Tipos**: O valor de `stateLocale` é validado adequadamente e está perfeitamente disponível no fechamento léxico (closure) do callback assíncrono do fetch.
