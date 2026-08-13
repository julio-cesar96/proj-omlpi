# Restauração do Drilldown por Município no Mapa (Fase 3h)

## Resumo da Fase 3h

Esta atividade realiza uma reversão parcial de uma decisão anterior para atender à nova solicitação do cliente. O objetivo foi reintroduzir o drilldown interativo por município no mapa do Highcharts, mantendo a aba "Municipais" ativa separadamente para busca por nome.

## Decisões & Mudanças

1. **Restauração de Arquivos GeoJSON**:
   - Os 27 arquivos de mapas municipais de estados brasileiros foram copiados de `omlpi-www/src/static/maps/*.json` para [next/public/maps/](file:///Users/yduqs/proj-omlpi/next/public/maps/), garantindo o fornecimento estático pelo Next.js.

2. **Restauração do Drilldown em [MapaBrasil.tsx](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/MapaBrasil.tsx)**:
   - **Enriquecimento do Mapa Nacional**: Readicionado `item["drilldown"] = hcKey` para cada estado no loop de preparação dos dados.
   - **Manipulação de Eventos do Highcharts**:
     - **`drilldown`**: Intercepta o clique no estado, carrega o arquivo GeoJSON municipal respectivo, vincula os municípios ao banco de dados pelo `cod_ibge` e define o status de forma binária (`0` para sem plano, `100` para tem plano). No final, anexa a série ao Highcharts e define o nome do estado como subtítulo do mapa.
     - **`drillup`**: Reseta o estado local de drilldown e limpa o título de nível estadual no Highcharts.
   - **Aparência do colorAxis**:
     - O Highcharts colore automaticamente as regiões com valor `0` (sem plano) usando `MAP_COLORS.none` (branco-esverdeado sutil) e regiões com valor `100` (tem plano) usando `MAP_COLORS.approved` (verde-destaque).

3. **Formatação do Tooltip condicional**:
   - No nível de municípios (dentro do drilldown), se o município tiver um plano cadastrado (`planUrl` preenchido), o tooltip mostra o nome dele acompanhado de um link clicável (abertura em nova aba) escrito:
     - `"↓ Baixar Lei"` se for lei (`is_law`).
     - `"↓ Baixar Plano"` caso contrário.
   - Se o município não possuir um plano anexado, o tooltip exibe apenas o nome do município, sem links quebrados.

4. **Resolução de Conflitos e Navegação Deliberada**:
   - O evento nativo de clique no mapa nacional que anteriormente forçava a mudança imediata para a aba Municipais foi removido.
   - Foi adicionado um cabeçalho dinâmico de controle do mapa na UI. Quando em modo drilldown de um estado, o cabeçalho mostra:
     - O nome do estado atualmente visualizado.
     - Um botão **"Ver como lista"**: permite a navegação deliberada para a aba Municipais filtrando pelo estado em questão (utilizando `router.replace` com `location_id` correto).
     - Um botão **"Voltar ao Brasil"**: dispara a ação `drillUp()` nativa do Highcharts para retornar à visualização nacional.

## Verificação e Resultados

- **Compilação**: O comando `npm run build` foi executado no diretório `next/` e foi concluído com sucesso, sem qualquer erro de compilação ou de lint de tipos no TypeScript.
- **Estrutura de Arquivos**: Confirmada a presença de todos os 27 arquivos JSON estáticos de mapas em `next/public/maps/`.

## Pendências / Validação Manual

> [!IMPORTANT]
> A verificação automatizada via browser subagent foi temporariamente ignorada devido a um erro de protocolo CDP Playwright local.
> Solicita-se que o usuário realize testes manuais na interface local dev para confirmar:
> 1. O clique no estado de SP e AC entra corretamente no drilldown.
> 2. O hover nos municípios do Acre exibe os respectivos links corretos ("Baixar Plano" / "Baixar Lei").
> 3. O clique no botão "Ver como lista" migra o usuário para a aba de Municipais com o filtro correto aplicado.
