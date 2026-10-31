# Validação

Execute o que for proporcional ao escopo. Para cada item, registre se foi **verificado**, **não verificado** ou **não aplicável**. Ter lido ou escrito o código não prova o resultado visual. Como capturar e medir: [captura e inspeção](captura-e-inspecao.md).

## 1. Fidelidade ao nível combinado

- Compare, papel por papel, a implementação com a tabela de extração.
- Compare a tela aberta com a captura ou a página de referência, nas mesmas larguras e estados, fatia por fatia, quando houver.
- Em **inspiração**, avalie hierarquia e clima; em **adaptação**, papéis de cor, tipo, espaço e composição; em **réplica estrutural**, estrutura e valores, com diff de pixels (limiar combinado e % de pixels diferentes) quando houver ferramenta no projeto.
- Diferenças deliberadas devem estar registradas como **decidido**.
- Valores da implementação devem ser conferidos por medição (`extract-styles.mjs`), não por leitura do CSS.

## 2. Acessibilidade mínima

Referência: WCAG 2.2 nível AA. Não declare conformidade sem avaliação que a sustente.

- Contraste de texto (1.4.3): 4,5:1 para texto comum e 3:1 para texto grande (a partir de 24 px, ou 18,66 px em negrito). Componentes de interface e ícones informativos: 3:1 (1.4.11).
- Foco visível em todo controle, na ordem do DOM (2.4.7), e não obscurecido por cabeçalho fixo ou banner (2.4.11).
- Alvos de toque e clique de pelo menos 24×24 px CSS, salvo exceções como links em linha e espaçamento suficiente (2.5.8). Em mobile, mire em 44×44 px como boa prática.
- Estados não dependem só de cor.
- Controles funcionam por teclado e têm nome acessível. Imagens informativas têm `alt`; decorativas têm `alt=""` (1.1.1).
- Movimento não essencial respeita `prefers-reduced-motion`.
- Zoom e texto: sem perda de conteúdo a 200% (1.4.4), reflow em 320 px de largura sem rolagem horizontal (1.4.10) e com espaçamento de texto ampliado (1.4.12).

## 3. Estados

Confira os que o fluxo possui: padrão, hover, foco, ativo, desabilitado, carregando, vazio e erro. A referência pode não mostrar todos; os que faltam seguem os tokens do projeto. Capture hover e foco dos controles principais; os demais exigem interação e só se o usuário pedir, sem efeitos colaterais.

## 4. Tamanhos de tela

- Teste em 320, 375, 768, 1024 e 1440 px, e ao redor de cada ponto em que o layout muda.
- Procure rolagem horizontal inesperada (`horizontalOverflow` no índice de captura), texto cortado, alvos de toque pequenos e conteúdo escondido apenas para caber.
- Verifique zoom de 200% e texto ampliado sem perda de conteúdo.
- Escolha breakpoints a partir de onde o conteúdo real quebra e reaproveite os do projeto.
- Se o produto tem modo escuro, repita as capturas com `--schemes light,dark`.

## 5. Imagens e desempenho percebido

- Compare o inventário de imagens antes e depois: peso, formato, tamanho natural x renderizado, `alt`, lazy loading.
- A imagem do LCP não deve usar `loading="lazy"`; avalie `fetchpriority="high"` (hipótese de ganho).
- Imagens com dimensões declaradas ou `aspect-ratio` para evitar salto de layout.
- Referência de métricas (Core Web Vitals, limites "bom" no campo): LCP até 2,5 s, CLS até 0,1, INP até 200 ms. Valores de laboratório do índice de captura são indicativos, não substituem dados de campo.
- Se a mudança adicionou fonte ou imagem pesada, informe o custo em bytes.

## 6. Integração

- Console sem erros novos e sem requisições falhas novas (`consoleErrors` e `failedRequests` no índice de captura).
- Lint, typecheck ou build do projeto, quando existirem e forem relevantes.
- Nenhum token duplicado ou sobrescrito fora da convenção do projeto.

## 7. Como relatar

Escreva o que foi verificado, como (navegador, script de captura, medição, ferramenta) e o resultado, com o caminho das evidências. Liste o que ficou sem verificar e o motivo: rotas, larguras, estados, esquemas de cor e imagens não cobertos. Não use "conforme WCAG" sem uma avaliação que sustente a frase.
