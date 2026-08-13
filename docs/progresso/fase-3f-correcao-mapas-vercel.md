# Correção de Acesso a Mapas GeoJSON no Vercel (Fase 3f)

## Resumo da Fase 3f

Esta correção resolve a falha no carregamento dos mapas de municípios do drilldown após deploy na plataforma Vercel.

## Causa Raiz

Anteriormente, o Route Handler `next/src/app/api/maps/[state]/route.ts` lia os arquivos JSON da pasta `../omlpi-www/src/static/maps` usando `fs.readFile` em runtime.
Embora essa lógica funcionasse localmente (pois os diretórios `next` e `omlpi-www` estão lado a lado no monorepo), ela falhava em produção na Vercel porque o deploy usa a pasta `next` como Root Directory, e os arquivos fora de `next/` não são carregados na imagem do deploy.

## Solução Aplicada

Para resolver o problema definitivamente e de forma simples, decidimos expor os GeoJSONs como arquivos estáticos gerenciados nativamente pelo Next.js:

1. **Cópia de Arquivos Estáticos**:
   - Copiamos os 27 arquivos JSON de geografia estática (totalizando 19MB) para [next/public/maps/](file:///Users/yduqs/proj-omlpi/next/public/maps).
2. **Atualização no Componente Visual**:
   - Ajustamos o fetch no arquivo [MapaBrasil.tsx](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/MapaBrasil.tsx#L130) para buscar diretamente de `/maps/${stateKey}.json`, usufruindo da entrega estática nativa do Next.js.
3. **Remoção de Código Redundante**:
   - Deletamos a rota da API obsoleta `next/src/app/api/maps/[state]/route.ts` e limpos os diretórios órfãos.

## Verificação e Resultados

- **Build**: `npm run build` executado em `next/` compilou com sucesso sem erros.
- **Validação de Servidor Local**: Uma chamada HTTP local para `/maps/br-ac.json` retornou `200 OK` contendo exatamente o arquivo correspondente e o cabeçalho de tipo `application/json`.
- **Integridade**: Verificado via `diff` que os dados copiados são 100% idênticos aos de produção.

## Próximos Passos (Alerta de Teste)

> [!IMPORTANT]
> O principal ponto de atenção pós-deploy é verificar se a navegação do mapa e o drilldown para cidades estão funcionando corretamente na URL de produção da Vercel.
