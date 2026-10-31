# Fundação visual

Defina os tokens antes dos componentes. Uma única fonte de tokens evita valores soltos no código e permite ajustar a direção visual sem reescrever a interface.

## Papéis mínimos

Use os papéis da tabela de [papéis e tokens](../../design-por-referencia-konvert/references/papeis-e-tokens.md) (cor, tipografia, espaçamento, forma, elevação, movimento, composição, imagens, responsividade e componentes). Em uma criação do zero, a origem de quase todos os valores é **decidido**: registre o motivo de cada decisão relevante. Quando valer a pena documentar de forma durável, use o [modelo de DESIGN.md](../../design-por-referencia-konvert/references/modelo-design-md.md).

Ponto de partida que funciona na maioria dos projetos:

| Papel | Ponto de partida | Ajuste conforme |
| --- | --- | --- |
| Cor | Fundo, superfície, texto, texto secundário, borda, ação principal, foco, sucesso, aviso, erro | Marca fornecida; modo escuro só se pedido ou justificado. |
| Tipografia | Uma família para texto, no máximo uma segunda para títulos; escala com poucos níveis | Conteúdo longo pede corpo maior e linha confortável; interfaces densas pedem escala mais compacta. |
| Espaçamento | Unidade-base e escala múltipla dela | Densidade do produto: dashboard é mais denso que landing. |
| Forma | Raio e espessura de borda consistentes | Tom da marca. |
| Movimento | Durações curtas, só para feedback e transição de estado | Sempre respeitar `prefers-reduced-motion`. |

## Restrições verificáveis

Estes limites vêm do texto normativo da WCAG 2.2 (github.com/w3c/wcag@9b94e18), lido em 2026-10-31. A revisão humana ainda está pendente.

- **Contraste de texto (SC 1.4.3, AA):** pelo menos 4,5:1; texto grande, pelo menos 3:1. Logotipos e elementos inativos ou decorativos são exceções.
- **Contraste não textual (SC 1.4.11, AA):** pelo menos 3:1 para bordas de campos, ícones necessários e indicadores de estado.
- **Alvos de toque (SC 2.5.8, AA):** pelo menos 24×24 px CSS, ou espaçamento equivalente; 44×44 px CSS se o escopo declarar AAA (SC 2.5.5).
- **Cor como único meio (SC 1.4.1):** erro, seleção e status também precisam de texto, ícone ou forma.
- **Foco visível (SC 2.4.7):** o indicador de foco é um token próprio, não o `outline` padrão removido.
- **Reflow (SC 1.4.10):** o layout funciona em 320 px CSS sem rolagem horizontal da página.

Verifique contraste e alvos medindo o resultado renderizado (`extract-styles`, com `--axe` quando disponível), não apenas a tabela de tokens.

## Regras

- Não copie paleta, tipografia ou ilustrações de uma referência com marca; extraia princípios, como contraste entre níveis ou densidade.
- Carregue só as fontes e os pesos usados. Fontes externas são dependência de rede e de privacidade: registre a decisão.
- Nomeie tokens pelo papel (`--color-text`, `--space-4`), não pelo valor (`--gray-900`), para que a troca de tema não quebre o significado.
