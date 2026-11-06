# Protótipo de lógica de estado

Use quando a dúvida é se as regras de uma jornada funcionam, não como ela parece: carrinho com cupom, frete e estoque, checkout em etapas, filtros combinados, formulário longo com validação condicional. Quando o modelo de estado tem poucas regras e nenhuma interação entre elas, pule este roteiro e siga os [estados e componentes](estados-e-componentes.md). Para decidir aparência, use a [exploração de direção visual](exploracao-de-direcao-visual.md).

O protótipo é código descartável que responde a uma pergunta. Valide o modelo antes de construir as telas, porque corrigir uma regra errada depois de pronta a interface custa mais.

## Roteiro

1. **Declare a pergunta.** Um parágrafo visível no topo da página do protótipo: qual modelo de estado e qual dúvida. Sem pergunta explícita, não há como saber se ele respondeu.
2. **Isole a lógica em um módulo puro.** Um bloco pequeno, sem DOM, `document` nem manipuladores de botão. Escolha o formato pela pergunta:
   - reducer `(estado, ação) → estado`, quando as ações são eventos discretos;
   - máquina de estados com transições explícitas, quando "quais ações são legais agora" faz parte da pergunta;
   - funções puras sobre um tipo de dado, quando não há estado corrente implícito.
   A página chama o módulo; o fluxo nunca vai no sentido contrário. É isso que permite levar o módulo validado para o código real.
3. **Monte um arquivo HTML único.** HTML, CSS e JS simples, sem framework, bundler nem servidor, que abre com duplo clique e pode ser enviado a quem decide (operação, financeiro, jurídico). Organize de cima para baixo:
   - título e uma frase com a pergunta;
   - estado atual em painel legível, com campos rotulados em vez de JSON cru, redesenhado a cada clique e destacando o que mudou;
   - botões de uso livre, um por ação, sempre disponíveis;
   - cenários guiados, um por aba, com a situação, o que observar e os passos como botões. Iniciar um cenário reinicia o estado para que ele rode igual toda vez.
4. **Escolha cenários que expõem os casos difíceis:** o caminho feliz, um caso limite e uma tentativa que deve ser ilegal, como aplicar o mesmo cupom duas vezes, finalizar com carrinho vazio ou avançar de etapa sem campo obrigatório.
5. **Use a linguagem do negócio.** Rótulos e mensagens falam de pedido, cupom e etapa, não de ações do reducer. Visual sóbrio, sem animação, nada que compita com o estado e os botões.
6. **Restrinja os dados e os efeitos.** Estado só em memória, valores comerciais fictícios e identificados, nenhuma chamada de rede, armazenamento real, pagamento ou rastreamento. Persistência só entra se ela for a pergunta, e nesse caso use um arquivo local com nome que deixe claro que é de teste.
7. **Entregue e escute.** Abra ou envie o arquivo. As reações mais valiosas são "isso não deveria ser possível" e "achei que seria diferente": mostram erro na ideia, não no código. Ajuste ações e cenários conforme o retorno.

## Ao concluir

- Leve o módulo validado para o código real, adaptado à stack do projeto, e então aplique a [verificação](verificacao.md) e os testes pertinentes. Não cole o código do protótipo: ele foi escrito sem tratamento de erro nem testes.
- A página HTML do protótipo não entra no build nem na entrega.
- No relatório de entrega, registre a pergunta, a resposta, os cenários que decidiram e quais regras mudaram por causa deles.

## Limites

O protótipo não mede usabilidade e não prova a integração real com pagamento, estoque ou frete. Não generalize para necessidades futuras: ele responde uma pergunta. Se a pergunta mudar, escreva outro.
