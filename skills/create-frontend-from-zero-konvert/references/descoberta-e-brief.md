# Descoberta e brief

Transforme o pedido em um brief curto antes de construir. O brief separa o que foi **fornecido** do que foi **suposto**, e cada suposição vira uma decisão registrada, não uma pergunta automática.

## Quando perguntar

Pergunte apenas quando a resposta mudar a implementação e errar for caro: escolha de plataforma, publicação, dados reais, pagamento, autenticação, preços ou condições comerciais, identidade de marca obrigatória. Agrupe as dúvidas em uma única mensagem, no máximo cinco, cada uma com a opção recomendada. Nas demais lacunas, adote o padrão da tabela abaixo, registre a suposição e avance.

| Tema | Pergunta | Padrão quando não houver resposta |
| --- | --- | --- |
| Produto e objetivo | Qual tarefa principal a interface precisa permitir? | Deduzir do pedido e declarar a tarefa escolhida. |
| Público | Quem usa, em que dispositivo e com que familiaridade? | Familiaridade desconhecida; priorizar mobile e clareza. |
| Escopo | Quais páginas, rotas e estados entram nesta entrega? | Uma jornada completa da tarefa principal, com seus estados. |
| Conteúdo | Existe texto, imagem ou dado real? | Conteúdo sintético identificado como fictício. |
| Marca | Há identidade visual, tokens ou guia? | Direção visual original documentada em uma fonte de tokens. |
| Stack e hospedagem | Há stack, plataforma ou hospedagem definida? | Seguir o projeto existente; em projeto vazio, ver [escolha de stack](escolha-de-stack.md). |
| Integrações | Formulários, pagamento, busca, login, analytics? | Simular com dados sintéticos e marcar como não integrado. |
| Idioma e região | Idioma, moeda, formatos de data e endereço? | Português do Brasil, real (BRL) e formatos brasileiros quando o pedido estiver em português. |
| Requisitos de acessibilidade | Algum nível de conformidade declarado? | Buscar os critérios WCAG 2.2 A e AA aplicáveis, sem alegar conformidade. |
| Critério de pronto | Como o pedido será considerado concluído? | A [definição de pronto](entrega.md) desta skill. |

## Modelo de brief

```markdown
# Brief: <nome>

- **Tarefa principal:** <o que a pessoa precisa conseguir fazer>
- **Público e dispositivo:** <fornecido | suposto>
- **Escopo desta entrega:** <páginas, rotas e estados>
- **Fora do escopo:** <o que não será feito>
- **Conteúdo:** <real fornecido | sintético identificado>
- **Marca e tokens:** <fonte | direção original>
- **Stack:** <existente | escolhida e por quê>
- **Integrações:** <reais | simuladas> — <quais>
- **Restrições:** <prazos, hospedagem, dependências proibidas>

## Suposições registradas
| Suposição | Motivo | Impacto se estiver errada |
| --- | --- | --- |

## Perguntas em aberto
- <apenas o que mudaria a implementação>
```

## Regras

- Não invente personas, pesquisas, depoimentos, métricas ou resultados. Um público descrito pelo usuário é fato; qualquer detalhe adicional é suposição e vai para a tabela.
- Preço, frete, prazo, parcelamento, descontos e textos legais são dados comerciais: use apenas valores fornecidos ou valores fictícios claramente marcados.
- Uma referência visual fornecida é inspiração. Registre o que será aproveitado como princípio e o que não será copiado (marca, textos, imagens).
- Atualize o brief quando uma suposição mudar; a [entrega](entrega.md) repete as suposições que permaneceram.
