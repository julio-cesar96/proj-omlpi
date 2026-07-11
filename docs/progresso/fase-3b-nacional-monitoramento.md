# Progresso da Migração — Fase 3b: Painel Nacional e Monitoramento

## 📋 Resumo da Entrega

A Fase 3b foi concluída com sucesso. Implementamos a lógica do Painel Nacional de comparação e série histórica de indicadores, além de construir o esqueleto funcional e elegante para a aba de Monitoramento.

Todos os componentes seguem as premissas de UX Premium, responsividade e fidelidade visual ao design do Figma Make, mantendo as lógicas de negócio dos scripts Vue legados (`compare.js` e `history.js`).

---

## 🛠️ Arquivos Modificados / Criados

| Caminho do Arquivo | Tipo | Descrição |
|---|---|---|
| [`next/src/lib/omlpi-api.ts`](file:///Users/yduqs/proj-omlpi/next/src/lib/omlpi-api.ts) | Modificado | Adição dos tipos TypeScript e funções `getCompareData` e `getHistoricalData`. |
| [`next/src/components/consulta-publica/PainelMonitoramento.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/PainelMonitoramento.tsx) | Novo | UI estática de "Em breve" para monitoramento, refletindo restrições de backend. |
| [`next/src/components/consulta-publica/NacionalControls.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/NacionalControls.tsx) | Novo | Client Component que gerencia os switchers de modo, área e a busca de localidade via URL. |
| [`next/src/components/consulta-publica/GraficoComparacao.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/GraficoComparacao.tsx) | Novo | Client Component para renderizar a comparação de dados por localidade usando Highcharts. |
| [`next/src/components/consulta-publica/GraficoHistorico.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/GraficoHistorico.tsx) | Novo | Client Component para renderizar a série histórica por localidade usando Highcharts. |
| [`next/src/components/consulta-publica/PainelNacional.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/PainelNacional.tsx) | Novo | Server Component que busca os dados no servidor com base em `location_id`, `area` e `mode`. |
| [`next/src/components/consulta-publica/TabsNav.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/TabsNav.tsx) | Modificado | Remoção do badge "em breve" da aba Nacional (mantido somente para Monitoramento). |
| [`next/src/components/consulta-publica/ConsultaPublica.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/ConsultaPublica.tsx) | Modificado | Integração das abas Nacional e Monitoramento na árvore principal da Consulta Pública. |
| [`next/src/components/consulta-publica/MapaBrasil.tsx`](file:///Users/yduqs/proj-omlpi/next/src/components/consulta-publica/MapaBrasil.tsx) | Modificado | Remoção de aviso redundante do ESLint. |

---

## 💡 Decisões Técnicas e Resolução de Desafios

### 1. Shape Real dos Dados (openapi.yaml vs Modelos Perl)
Confirmamos no código-fonte Perl do backend (`Compare.pm` e `Historical.pm`) que o wrapper intermediário `locales` descrito no `openapi.yaml` **não existe** no JSON retornado pela API real. O campo `comparison` é um array plano de localidades, e `historical` é um array de comprimento 1 contendo a localidade selecionada. Tipamos as interfaces TypeScript seguindo a API real e mantivemos compatibilidade com o legado `compare.js` e `history.js`.

### 2. Ciclo de Vida do Highcharts no Next.js (SSR)
Evitamos conflitos de rendering no servidor (SSR) carregando o Highcharts dinamicamente via Next.js `<Script>` a partir da CDN oficial unpkg. Os gráficos limpam suas instâncias com `chart.destroy()` em `useEffect` para prevenir memory leaks durante as transições de abas.

### 3. Navegação por URL e Shallow Routing
Respeitando o padrão estabelecido na Fase 3a, o modo ativo (`?mode=comparacao` ou `?mode=historico`) e a área de indicadores (`?area=X`) são preservados de maneira integrada na URL. A navegação utiliza `router.replace` shallow, garantindo que o estado não seja perdido e não polua a pilha de histórico de navegação do usuário.

---

## 📈 Contratos de API Consumidos

### GET `/data/compare`
- **Parâmetros**: `locale_id` (number, obrigatório), `year` (number, opcional).
- **Retorno Real**:
  ```json
  {
    "comparison": [
      {
        "id": 1,
        "name": "São Paulo, SP",
        "type": "city",
        "indicators": [ ... ]
      }
    ]
  }
  ```

### GET `/data/historical`
- **Parâmetros**: `locale_id` (number, obrigatório), `area_id` (number, opcional).
- **Retorno Real**:
  ```json
  {
    "historical": [
      {
        "id": 1,
        "name": "São Paulo, SP",
        "type": "city",
        "indicators": [ ... ]
      }
    ]
  }
  ```

---

## 🚀 Próximas Fases e Pendências em Aberto

1. **Licenciamento Comercial do Highcharts**: Se o cliente decidir colocar o site em produção com fins comerciais, precisará adquirir a licença do Highcharts Maps/Charts.
2. **Preenchimento de cod_ibge**: Como herdado da Fase 3a, o backend precisa preencher todos os códigos IBGE dos municípios para a correta indexação e drilldown do mapa.
3. **Estabilização de URLs no Strapi**: URLs de plano com barras duplas (erro originado no backend) persistem como limitação externa conhecida.
