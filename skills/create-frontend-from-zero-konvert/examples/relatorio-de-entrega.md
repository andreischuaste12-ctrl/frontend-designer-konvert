# Exemplo sintético: relatório de entrega

Exemplo ilustrativo do formato da [definição de pronto e entrega](../references/entrega.md) para o [brief de e-commerce](brief-ecommerce.md). Os resultados abaixo são fictícios e não representam uma execução real.

## Resumo
Página de produto de café com seleção de variação, cálculo de frete simulado por CEP e carrinho lateral. Resolve a tarefa "escolher, conferir o frete e adicionar ao carrinho" em mobile e desktop.

## Como executar
`python3 -m http.server 8080` na pasta `site/` e abrir `http://127.0.0.1:8080/`. Não há dependências.

## Arquivos
| Arquivo | O que contém |
| --- | --- |
| `site/index.html` | Estrutura semântica da página de produto e do carrinho lateral |
| `site/tokens.css` | Tokens de cor, tipografia, espaçamento, forma e foco |
| `site/app.js` | Variações, frete simulado, carrinho e região de status |

## Decisões
| Decisão | Alternativa descartada | Motivo |
| --- | --- | --- |
| Sem framework | React com Vite | Interação local simples, sem estado entre páginas |
| Carrinho lateral em `dialog` | Página de carrinho separada | Mantém a pessoa na página de produto; foco controlado pelo elemento nativo |

## Suposições mantidas
| Suposição | Impacto se estiver errada |
| --- | --- |
| Frete grátis acima de R$ 150 | Remover a mensagem de frete grátis |

## Verificações executadas
| Verificação | Ferramenta ou método | Resultado |
| --- | --- | --- |
| Tarefa principal em 375 e 1440 px | `capture.mjs --widths 375,1440` e navegação manual | Concluída nos dois tamanhos |
| Reflow em 320 px | `capture.mjs --widths 320` | `horizontalOverflow` falso |
| Contraste e alvos | `extract-styles --axe` | Uma falha de contraste no preço riscado, corrigida no token `--color-text-muted` e medida de novo |
| Teclado | Navegação por Tab, Enter e Esc | Ordem correta; o `dialog` devolve o foco ao botão do carrinho |
| CEP inválido e carregando | Dado sintético "00000-000" e atraso simulado | Mensagem junto ao campo; status anunciado |

## Simulado ou fora do escopo
- Cálculo de frete por tabela local fictícia; preços e parcelamento ilustrativos.
- Checkout, pagamento e login não implementados; o botão "Finalizar compra" está desabilitado com explicação.

## Não verificado
- Leitores de tela além do anúncio das regiões de status.
- Métricas de campo (LCP, INP, CLS): apenas medição local.
