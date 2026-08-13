# Correção — Contraste dos Números da Barra de Estatísticas (Fase 3j)

## Resumo da Fase 3j

Esta correção resolve o problema de acessibilidade (contraste insuficiente) nos números exibidos na barra de estatísticas ("Stats strip") no final da seção Hero.

## Causa Raiz

Em uma tarefa anterior, o fundo da barra de estatísticas foi alterado para cinza claro (`#A49A87`). No entanto:
- Os números na barra utilizavam a classe `text-primary` (`#f25d27`, laranja) ou `text-secondary` (`#17a649`, verde) sobre o fundo cinza `#A49A87`.
- O cálculo de contraste WCAG para essa combinação resulta em contraste péssimo (1,19:1 e 1,15:1), ficando muito abaixo do limite mínimo de 3:1 exigido pela WCAG para texto grande (a fonte usada é `text-3xl/38px` negrito).

## Solução Aplicada

Alteramos o componente em [Hero.tsx](file:///Users/yduqs/proj-omlpi/next/src/components/sections/Hero.tsx) para usar a cor verde-oliva escuro (`#444525`, mapeada na variável `--foreground` / classe `text-foreground` do Tailwind) para os números exibidos nessa barra cinza:

- A classe do elemento foi trocada de `text-primary` para `text-foreground`.
- A cor `#444525` garante um contraste de 3,56:1 sobre o fundo `#A49A87`, superando a especificação de 3:1 exigida para texto grande no WCAG.
- Esta alteração foi mantida isolada apenas para a "Stats strip". Os dois cards flutuantes sobre a imagem do Hero mantêm suas cores originais de destaque (`text-primary` e `text-secondary`), uma vez que estão renderizados sobre fundo branco.

```diff
             {STATS_PLACEHOLDER.map(({ value, label }) => (
               <div key={label} className="text-center">
                 <div
-                  className="text-3xl lg:text-[38px] font-black text-primary mb-1.5"
+                  className="text-3xl lg:text-[38px] font-black text-foreground mb-1.5"
                   style={{ fontFamily: "var(--font-heading)" }}
                 >
                   {value}
```

## Verificação e Resultados

- **Build**: Executado `npm run build` com sucesso no diretório `next/` sem erros de compilação.
- **cards flutuantes**: Verificado que os dois cards flutuantes do Hero continuam intactos.
