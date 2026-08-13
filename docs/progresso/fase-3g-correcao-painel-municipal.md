# Correção do Painel Municipal — Indicadores e Drilldown (Fase 3g)

## Resumo da Fase 3g

Esta fase resolve três problemas encadeados que impediam o carregamento de indicadores
na aba "Municipais" da Consulta Pública, além de remover código morto de drilldown
que havia sido deixado parcialmente por sessões anteriores.

---

## Problema 1 — PainelMunicipal enviava o ID errado para a API

### Causa Raiz

`PainelMunicipal.tsx` recebia `locationId` como o **ID interno do Strapi** (ex: `5615`
para São Paulo) e o passava diretamente para `getLocaleData()`, que espera o
**código IBGE** (ex: `35`). A API Perl (`omlpi-api`) não reconhecia `5615` como
um `locale_id` válido e retornava erro, caindo no `.catch(() => null)` — exibindo
"Não foi possível carregar os dados desta localidade."

### Solução Aplicada

Em [PainelMunicipal.tsx](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/PainelMunicipal.tsx):

```tsx
// Antes (errado):
const data = await getLocaleData(locationId, ...);

// Depois (correto):
const matchedLocale = locales.find((l) => l.id === locationId);
const codIbge = matchedLocale?.cod_ibge;
const data = codIbge ? await getLocaleData(Number(codIbge), ...) : null;
```

O componente já recebia a lista completa de `locales` do Strapi — o `cod_ibge`
estava disponível, só faltava o lookup.

---

## Problema 2 — Código morto de drilldown em MapaBrasil.tsx

### Causa Raiz

Uma sessão anterior havia removido parcialmente o drilldown do mapa nacional, mas
deixou no arquivo:

1. **JSX duplicado no final** (`</div></div>...)` solto após o `}` de fechamento
   do componente) — edição incompleta que corrompeu a estrutura do arquivo.
2. **Comentário e declaração de função colados** na mesma linha, com caractere
   UTF-8 corrompido impedindo o parser de separar `// Mapa de abreviação...`
   do `function getLocaleStatus(...)`.
3. **Docblock desatualizado** descrevendo comportamento de drilldown removido.

`npm run dev` (Turbopack) era tolerante a esses erros, mas `npm run build` falhava.

### Solução Aplicada

Em [MapaBrasil.tsx](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/MapaBrasil.tsx):

- Removido o bloco JSX duplicado do final do arquivo via manipulação binária (byte offset).
- Corrigida a linha com comentário colado na declaração de função.
- Limpo o docblock para refletir o comportamento atual (click → navegação por âncora).
- Confirmado que `chart.events.drilldown/drillup` e `item["drilldown"]` já não existiam.
- Confirmado que `point.events.click` (navega para `?tab=municipais&location_id=`) foi mantido intacto.
- O módulo `drilldown.js` nunca existia no `<Script onLoad>` deste arquivo — nada a remover.

---

## Problema 3 — GET /data retorna envelope `{ locale: {...} }`, não o objeto direto

### Causa Raiz

`getLocaleData()` em [omlpi-api.ts](file:///Users/yduqs/proj-omlpi/next/src/lib/omlpi-api.ts)
estava tipada como `omlpiGet<OmlpiLocaleData>`, assumindo que a API retornaria
o objeto `locale` na raiz. O endpoint real retorna:

```json
{ "locale": { "id": 35, "name": "São Paulo", "indicators": [...], ... } }
```

Resultado: `data.name === undefined`, `data.indicators === undefined` → array vazio
→ "Nenhum indicador disponível".

Descoberto via logs de diagnóstico temporários + `curl` direto à API confirmando
a estrutura real. São Paulo (`locale_id=35`) retorna **61 indicadores**.

### Solução Aplicada

Em [omlpi-api.ts](file:///Users/yduqs/proj-omlpi/next/src/lib/omlpi-api.ts):

```ts
/** Envelope real da resposta de GET /data — o objeto locale vem embrulhado. */
interface OmlpiLocaleDataResponse {
  locale: OmlpiLocaleData;
}

export async function getLocaleData(
  localeId: number,
  params?: { area_id?: number; year?: 2017 | 2018 | 2019 }
): Promise<OmlpiLocaleData> {
  const response = await omlpiGet<OmlpiLocaleDataResponse>("data", {
    locale_id: localeId,
    area_id: params?.area_id,
    year: params?.year,
  });
  return response.locale;
}
```

A assinatura pública de `getLocaleData()` permanece idêntica — nenhum chamador
precisou de ajuste.

---

## Diagnóstico — Metodologia

O Turbopack escreve logs de Server Components em
`.next/dev/logs/next-development.log`. Logs de objetos (via `console.log({...})`)
são serializados como `{}` nesse arquivo JSON; foi necessário mudar para
concatenação de strings primitivas para obter os valores reais.

---

## Commits

| Hash | Descrição |
|------|-----------|
| `3f595fd` | `fix(mapa): remove drilldown residual e lixo de edição anterior` |
| `432451c` | `fix(api): desembrulhar envelope { locale: ... } em getLocaleData` |

> [!NOTE]
> O commit da correção do `PainelMunicipal.tsx` (Problema 1) foi feito na
> sessão anterior (`83cafd55`) e já estava commitado ao início desta sessão.

---

## Verificação e Resultados

- **Build**: `npm run build` em `next/` compila com `✓ Compiled successfully` sem erros ou warnings relacionados.
- **São Paulo (location_id=5615, cod_ibge=35)**: retorna 61 indicadores reais com valores numéricos, anos (2020–2023), áreas (Assistência Social, Saúde, Violência) e desagregações por cor/raça e renda.
- **Município (location_id=2684)**: HTTP 200, sem erros.
- **Console.log de diagnóstico**: removidos completamente antes do commit final.

## Pendências

Nenhuma pendência técnica nesta fase. O fluxo completo
mapa → click → aba municipais → indicadores reais está funcional.
