# Fundação visual

Identifique os papéis de tokens e defina a direção visual antes de escolher seus valores e criar os componentes. Uma única fonte de tokens evita valores soltos no código e permite ajustar a direção visual sem reescrever a interface.

## Papéis mínimos

Quando a executora estiver disponível, consulte [papéis e tokens](../../design-por-referencia-konvert/references/papeis-e-tokens.md) (cor, tipografia, espaçamento, forma, elevação, movimento, composição, imagens, responsividade e componentes). Se estiver ausente, use os papéis mínimos abaixo e registre a indisponibilidade. Em uma criação do zero, a origem de quase todos os valores é **decidido**: registre o motivo de cada decisão relevante. Quando valer a pena documentar de forma durável e o modelo existir, use [DESIGN.md](../../design-por-referencia-konvert/references/modelo-design-md.md).

Ponto de partida que funciona na maioria dos projetos:

| Papel | Ponto de partida | Ajuste conforme |
| --- | --- | --- |
| Cor | Fundo, superfície, texto, texto secundário, borda, ação principal, foco, sucesso, aviso, erro | Marca fornecida; modo escuro só se pedido ou justificado. |
| Tipografia | Uma família para texto, no máximo uma segunda para títulos, nitidamente distinta; escala com poucos níveis; corpo com até 80 caracteres por linha (WCAG 2.2 SC 1.4.8, nível AAA: referência, não exigência de AA) | Conteúdo longo pede corpo maior e linha confortável; interfaces densas pedem escala mais compacta. |
| Espaçamento | Unidade-base e escala múltipla dela | Densidade do produto: dashboard é mais denso que landing. |
| Forma | Raio e espessura de borda consistentes | Tom da marca. |
| Movimento | Durações curtas, só para feedback e transição de estado | Sempre respeitar `prefers-reduced-motion`. |

## Derivar uma direção visual

Antes de escolher valores concretos de cores, fontes ou efeitos, traduza o brief em decisões visuais. Use evidências fornecidas sobre a marca, a tarefa e o contexto de uso; a categoria de produto, sozinha, não determina o estilo.

1. Identifique o que precisa ganhar atenção primeiro para a tarefa principal e o que deve permanecer secundário.
2. Considere o contexto de uso: leitura ou operação, frequência, dispositivo, quantidade de informação e condições de acessibilidade.
3. Como ponto de partida, defina uma característica visual dominante e, se útil, uma de apoio. Acrescente outras quando o brief ou a identidade justificar, preservando a coerência. Explique como as escolhas ajudam a tarefa e combinam com a identidade informada.
4. Registre até dois efeitos ou padrões a evitar quando houver motivo concreto — por exemplo, movimento que atrasa uma tarefa frequente ou ornamentação que compete com dados importantes. Não use listas universais de tendências ou antipatrones.
5. Converta as decisões em valores de tokens e componentes. Se houver mais de uma página, mantenha a base consistente e documente exceções apenas quando uma tarefa ou conteúdo exigir diferença.

| Decisão | Pergunta de controle | Registro mínimo |
| --- | --- | --- |
| Hierarquia | O que a pessoa precisa notar ou fazer primeiro? | Elemento primário e secundário, ligados à tarefa. |
| Expressão | Que impressão visual foi pedida ou sustentada pelo brief? | Traço dominante, apoios pertinentes e evidência de origem. |
| Densidade | Quanto conteúdo precisa ser comparado ou operado na mesma tela? | Justificativa de espaçamento, agrupamento e quantidade de informação. |
| Movimento | Alguma animação melhora orientação ou feedback? | Uso específico, comportamento sem movimento e preferência reduzida. |
| Exceções | O que poderia competir com a tarefa ou tornar o uso mais difícil? | Até dois padrões a evitar, quando aplicável, e a razão observável. |
| Estrutura | Cada borda, divisor, rótulo e numeração carrega informação do conteúdo? | Dispositivos estruturais usados e a informação de cada um; numeração só em sequência real. |

Se a marca ou a direção visual não foi fornecida, escolha uma direção original mínima que sustente a tarefa, registre-a como decisão e avance. Não infira paleta, personalidade, público ou preferência estética apenas pelo setor; quando duas opções mudarem materialmente o resultado, declare a suposição ou pergunte conforme o brief. Para conferir se a direção é uma escolha e não um padrão herdado, aplique o [teste de genericidade](exploracao-de-direcao-visual.md).

## Restrições verificáveis

Estes limites vêm do texto normativo da WCAG 2.2 (github.com/w3c/wcag@9b94e18), lido em 2026-10-31. A revisão humana ainda está pendente.

- **Contraste de texto (SC 1.4.3, AA):** pelo menos 4,5:1; texto grande, pelo menos 3:1. Logotipos e elementos inativos ou decorativos são exceções.
- **Contraste não textual (SC 1.4.11, AA):** pelo menos 3:1 para bordas de campos, ícones necessários e indicadores de estado.
- **Alvos de ponteiro (SC 2.5.8, AA):** pelo menos 24×24 px CSS ou uma exceção aplicável, incluindo espaçamento, controle equivalente, inline, controle do navegador e apresentação essencial; para AAA, consulte também as exceções do SC 2.5.5 (44×44 px CSS).
- **Cor como único meio (SC 1.4.1):** erro, seleção e status também precisam de texto, ícone ou forma.
- **Foco visível (SC 2.4.7):** o indicador de foco é um token próprio, não o `outline` padrão removido.
- **Reflow (SC 1.4.10):** conteúdo vertical aplicável se apresenta a 320 px CSS sem perda de informação ou função e sem rolagem em duas dimensões; documente as partes que exigem layout bidimensional e confira zoom.

Verifique contraste e alvos no render (`extract-styles`, com `--axe` quando disponível), não apenas na tabela de tokens. Os resultados são amostrais; registre elementos não avaliados, contraste indeterminado e exceções, e complemente com inspeção apropriada. Não apresente o resultado como certificação.

Para aplicar os limites e suas exceções, consulte a [WCAG 2.2 do W3C](https://www.w3.org/TR/WCAG22/) e suas orientações para [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow) e [tamanho de alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).

## Regras

- Não copie paleta, tipografia ou ilustrações de uma referência com marca; extraia princípios, como contraste entre níveis ou densidade.
- Carregue só as fontes e os pesos usados. Fontes externas são dependência de rede e de privacidade: registre a decisão.
- Nomeie tokens pelo papel (`--color-text`, `--space-4`), não pelo valor (`--gray-900`), para que a troca de tema não quebre o significado.
