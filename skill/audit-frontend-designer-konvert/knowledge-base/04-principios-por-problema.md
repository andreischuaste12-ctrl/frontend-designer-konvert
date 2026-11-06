# Base de conhecimento 04 — Princípios organizados por problema

Use este módulo depois de entender o produto e o público ([módulo 01](01-auditoria-estetica-e-publico.md)). Cada problema traz o que observar, a evidência que sustenta um achado, os limites do que se pode concluir e como validar. Princípios de psicologia são lentes para formular hipóteses: um achado baseado só neles tem confiança no máximo `medium` e o impacto é escrito como hipótese.

## Como usar

1. Parta de uma tarefa real do usuário e de uma rota, não da lista de princípios.
2. Registre a observação concreta (captura, estilo medido, código, texto da interface) antes de nomear o princípio.
3. Use os limites de cada seção para calibrar `confidence` e a redação de `probable_impact`.
4. Proponha a validação mais barata que possa refutar a hipótese.

## 1. Percepção e hierarquia visual

**Observar:** qual elemento atrai a atenção primeiro em cada viewport; se a ação principal se destaca das secundárias; agrupamento por proximidade, alinhamento e semelhança; contraste de texto e de controles; tamanho e espaçamento dos alvos de toque.

**Evidência:** captura nas larguras relevantes; `computed-styles.json` com cor, peso, tamanho e espaçamento; razão de contraste calculada a partir das cores medidas; dimensões dos alvos.

**Limites:** "o olho vai primeiro para X" é inferência, não medição; padrões de leitura em F ou Z descrevem tendências de páginas com muito texto, não regras de todo layout. Contraste abaixo dos mínimos da WCAG 2.2 (4,5:1 para texto normal, 3:1 para texto grande e componentes) é observação mensurável; dizer que a página "não é acessível" exige avaliação completa.

**Validar:** teste de cinco segundos ou de primeiro clique com pessoas do público; para contraste e alvos, a medição já é a evidência.

## 2. Carga cognitiva e densidade

**Observar:** quantidade de informação concorrente na mesma área; termos internos ou jargão; tarefas que obrigam a lembrar algo de uma tela para outra; formulários longos sem agrupamento; texto em linhas muito longas ou com pouco espaçamento.

**Evidência:** contagem de elementos e decisões por etapa; comprimento de linha e entrelinha medidos; termos encontrados no texto da interface; passos necessários para a tarefa.

**Limites:** densidade alta pode ser adequada para especialistas e tarefas de comparação (tabelas técnicas, painéis). O "número mágico 7±2" trata de memória de curto prazo e não define quantos itens um menu pode ter. Não diagnostique "sobrecarga" sem relacioná-la a uma tarefa e a um público.

**Validar:** teste de tarefa com medição de sucesso, erros e tempo; teste de compreensão dos termos ("o que você espera encontrar aqui?").

## 3. Navegação e orientação

**Observar:** se a pessoa sabe onde está (título, item ativo, breadcrumb); se os rótulos de navegação usam a linguagem do público; menus que só abrem por hover; profundidade até conteúdos importantes; consistência entre mobile e desktop; foco visível e ordem de foco no teclado.

**Evidência:** estrutura de navegação extraída do render; capturas com o menu aberto em mobile; percurso por teclado registrado; rótulos lidos na interface.

**Limites:** a quantidade de itens não determina sozinha a dificuldade: rótulos claros e agrupados podem funcionar com muitos itens. Remover o indicador de foco é observação objetiva; a gravidade depende de quantas tarefas exigem teclado.

**Validar:** tree testing ou card sorting para rótulos e estrutura; teste de tarefa "encontre X" partindo de páginas de entrada diferentes.

## 4. Compreensão de escolhas

**Observar:** se as opções (planos, variações, frete) explicam a diferença em termos do benefício para a pessoa; se há um padrão pré-selecionado e se ele está explícito; a unidade do preço (por mês, por ano, à vista, parcelado); se a comparação exige memorizar valores entre telas.

**Evidência:** texto e estrutura das opções; estado inicial de toggles e seletores; posição das informações de custo em relação ao ponto de decisão.

**Limites:** o efeito de "excesso de escolhas" não se replica de forma consistente: meta-análises encontram efeito médio próximo de zero, com grande variação conforme o contexto. Não afirme que menos opções aumentam a conversão; descreva a dificuldade observável de comparar. Destaque de um plano "recomendado" é prática legítima quando o critério é claro.

**Validar:** teste de compreensão ("qual plano atende a este cenário e quanto custa?"); experimento controlado só quando houver tráfego e aprovação para isso.

## 5. Confiança e transparência

**Observar:** custos, prazos e condições revelados tarde; identificação de quem vende ou presta o serviço; contato e políticas acessíveis; urgência ou escassez sem base aparente; opções de cancelamento difíceis de encontrar; consentimento pré-marcado.

**Evidência:** a etapa em que cada custo ou condição aparece; texto de selos, contadores e avisos; percurso até contato e políticas.

**Limites:** um selo ou contador não é enganoso por si só; só aponte padrão manipulativo com evidência de que a informação é falsa, oculta ou induz ao erro. Confiança percebida varia por público e mercado; não generalize.

**Validar:** entrevista ou teste com perguntas sobre o que a pessoa espera pagar e receber; revisão das informações com o responsável pelo produto, já que alguns dados dependem de regras de negócio.

## 6. Erros, feedback e recuperação

**Observar:** formulários com rótulo apenas no placeholder; mensagens de erro vagas, só em cor ou longe do campo; validação que apaga o que foi digitado; ausência de confirmação ou de desfazer em ações destrutivas; estados de carregamento e vazio sem explicação.

**Evidência:** markup dos campos (rótulos, `aria-describedby`); capturas de estados de erro geradas com dados sintéticos e sem enviar formulários reais; textos das mensagens.

**Limites:** os scripts não enviam formulários; estados que dependem de envio só podem ser observados em ambiente de teste autorizado ou no código. Declare a lacuna em vez de supor o comportamento.

**Validar:** teste de tarefa com erros induzidos em ambiente de teste; revisão dos estados com quem mantém o fluxo.

## Referências consolidadas

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Nielsen Norman Group, 10 heurísticas de usabilidade: https://www.nngroup.com/articles/ten-usability-heuristics/
- Baymard Institute, pesquisa de ecommerce: https://baymard.com/blog
- Scheibehenne, Greifeneder e Todd (2010), meta-análise sobre excesso de escolhas, *Journal of Consumer Research* 37(3).
- Mathur et al. (2019), "Dark Patterns at Scale", *Proceedings of the ACM on Human-Computer Interaction* 3(CSCW).

Consulte a fonte original antes de citar um número ou um resultado no relatório; registre no relatório apenas o que foi efetivamente consultado.
