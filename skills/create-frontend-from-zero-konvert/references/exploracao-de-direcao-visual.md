# Exploração de direção visual para uma interface nova

Este roteiro ajuda a transformar o briefing em uma direção concreta antes de acumular componentes. A direção deve nascer da tarefa, do conteúdo e das restrições do produto; uma galeria inspira possibilidades, mas não substitui o entendimento de quem usará a interface.

## Decidir o que a página precisa fazer

Escreva uma frase para a tarefa principal da pessoa e outra para o papel da página nessa tarefa. Uma página de decisão precisa tornar opções comparáveis; uma ferramenta precisa deixar entrada, processamento e resultado compreensíveis; conteúdo longo precisa sustentar leitura e retorno. Um mesmo produto pode exigir ênfases diferentes em páginas diferentes. Não deduza a direção visual apenas da categoria do negócio.

Reúna fatos do briefing: identidade, conteúdo verdadeiro, público conhecido, dispositivos, dados disponíveis, estados, restrições de stack e materiais licenciados. Marque o que está ausente. Separe atributos já definidos pela marca das escolhas que você fará.

## Formular uma direção executável

Descreva a direção em decisões que possam ser implementadas e verificadas:

- qual conteúdo recebe atenção primeiro e por quê;
- como títulos, corpo, números, controles e ações se distinguem;
- que papéis de cor, espaço, forma e imagem sustentam a tarefa;
- como os componentes respondem a erro, espera, vazio e sucesso;
- o que muda em tela estreita sem esconder informação;
- como o movimento explica estado ou relação, e como a interface funciona com movimento reduzido.

Registre essas decisões nos tokens e no inventário de componentes da skill. A descrição não é um inventário de adjetivos: deve orientar uma escolha concreta no código e permitir conferir o resultado renderizado.

## Teste de genericidade antes de construir

Escreva o plano curto (papéis de cor, tipografia, conceito de layout e alinhamento, princípios) e revise-o contra o brief antes do código:

1. Imagine o plano que você faria para qualquer página parecida. O que coincidir é padrão herdado, não escolha.
2. Para cada parte coincidente, procure uma razão no brief, no conteúdo ou na tarefa. Sem razão, substitua e registre o que mudou e por quê.
3. Perguntas de controle:
   - O topo abre com o elemento mais característico do assunto, ou com o arranjo-padrão de número grande, rótulo pequeno e gradiente?
   - Cada borda, divisor, rótulo acima de título e numeração carrega informação real do conteúdo? Numeração só serve a uma sequência verdadeira.
   - Raio, sombra e cards repetidos refletem hierarquia ou só repetição?
   - O movimento não iniciado pela pessoa tem função, ou é o mesmo fade-up em toda seção?
4. Um padrão comum continua válido quando o brief, a marca ou a tarefa o justificam. O que o usuário fixou no brief vence; use a liberdade deixada em aberto para decidir, não para repetir o padrão. É um teste de justificativa, não uma lista de proibições (ver [fundação visual](fundacao-visual.md)).
5. Concentre a ousadia em um elemento memorável, mantenha o resto sóbrio e corte decoração sem função.

## Quando explorar alternativas

Se duas direções plausíveis mudarem materialmente a hierarquia ou a personalidade da página, compare opções curtas antes de construir todo o fluxo. Para cada uma, descreva o mesmo conteúdo, a tarefa principal, a decisão visual distinta e o risco para leitura, uso ou implementação. Limite a exploração ao que ajuda a escolher; uma página simples ou identidade já definida pode seguir com uma direção só. Não apresente uma imagem gerada como prova de comportamento funcional.

Quando a escolha só se decide vendo conteúdo real renderizado e o projeto já executa, prefira variantes descartáveis em código a descrições ou imagens:

- **Pergunta e quantidade.** Declare em uma linha, no local do protótipo, a pergunta e o número de variantes. Use 3 por padrão; acima de 5 elas deixam de ser distintas e viram ruído.
- **Diferença estrutural.** Cada variante discorda das outras em layout, hierarquia de informação ou ação primária, não só em cor, tipo ou texto. Três grades de cards com pequenos ajustes não são alternativas. Se duas saírem parecidas, refaça uma excluindo explicitamente o padrão que elas têm em comum. Compartilhe só átomos (um cabeçalho, um botão); compartilhar o layout elimina a diferença que se quer julgar.
- **Onde hospedar.** Prefira a página ou rota real, com cabeçalho, navegação, dados e densidade verdadeiros, porque em uma rota isolada toda variante parece boa. Crie rota provisória somente quando não houver onde hospedar; em projeto vazio, monte antes o shell mínimo com dados sintéticos. Use o caminho de rotas que o projeto já adota e nomes que deixem claro que são provisórios.
- **Somente leitura.** Variantes não executam mutações reais, checkout, envio de formulário nem rastreamento; aponte qualquer ação para um stub. Sem persistência e sem polimento além do necessário para julgar hierarquia e leitura.
- **Seletor.** Barra fixa com anterior, próximo e o nome da variante atual, visualmente distinta do que está sendo avaliado. Guarde a variante em parâmetro de URL, para que seja compartilhável e sobreviva a recarregar. As setas do teclado só trocam de variante fora de campos editáveis. Ative o seletor apenas em ambiente de desenvolvimento, por verificação de ambiente, para que um merge acidental não o leve a usuários.
- **Julgamento.** Julgue no render, em tela estreita e desktop. Variante bonita não prova usabilidade nem substitui verificação de tarefa e estados. O retorno mais útil costuma ser uma combinação ("o cabeçalho de B com a lateral de C"): aceite-a como a direção a implementar.
- **Promoção.** Ao decidir, reescreva a direção escolhida nos tokens e componentes do projeto, com os estados, a acessibilidade e o tratamento de erro que a variante dispensou. Não promova o código da variante direto. Exclua do build o seletor e as variantes e remova os arquivos que você criou nesta tarefa; se houver dúvida de autoria ou de autorização, liste-os como pendência em vez de apagá-los.
- **Registro.** No relatório de entrega, registre a pergunta, a direção escolhida e o motivo, as descartadas que afetaram o resultado e o que foi conferido no render. Sem projeto executável, compare por descrição e declare que não houve comparação renderizada.

Se houver ferramenta de geração visual e o pedido justificar composições exploratórias, produza apenas materiais autorizados e identifique-os como proposta, não como tela implementada. A decisão final deve ser conferida no navegador com conteúdo e estados reais. Não use uma imagem de terceiros como asset do produto sem direito de uso.

Quando uma opção for escolhida pelo briefing ou por evidência suficiente, implemente-a sem esperar uma aprovação adicional para cada detalhe reversível. Se a escolha depender de marca, conteúdo factual ou investimento externo ainda não definido, registre a dependência e mantenha uma solução provisória identificada.

## Construir e conferir

Implemente primeiro a estrutura semântica e a tarefa principal, depois ajuste composição, tipo, cor, imagens e movimento no resultado real. Revise capturas durante a construção, não só no fim, e aplique de novo as perguntas do teste de genericidade ao resultado renderizado. Abra a interface em largura estreita e desktop; confira conteúdo longo, teclado, foco e os estados previstos. Use as ferramentas de captura da executora quando disponíveis. A primeira captura de uma criação nova é uma referência inicial, não um antes/depois de um produto que não existia.

No relatório de entrega, explique a direção adotada, as opções descartadas que afetavam o resultado, as verificações realmente executadas e as limitações de dados, browser ou materiais. Não atribua a escolha a pesquisa com usuários que não ocorreu.
