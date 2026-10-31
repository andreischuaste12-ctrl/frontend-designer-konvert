# Inspeção visual orientada à tarefa

Use este roteiro quando o pedido for avaliar a qualidade da interface, sua clareza ou seu acabamento. A auditora continua somente leitura: a saída é um achado com evidência, impacto provável e critério de aceite, nunca uma edição. Escolha as lentes relevantes para a jornada observada; não transforme a lista inteira em defeitos presumidos.

## Delimitar a observação

Registre a rota, a tarefa da pessoa, o estado da interface, a largura da tela e a origem das informações sobre público e marca. Observe também uma situação de uso realista: primeira visita, retorno à tarefa, leitura prolongada, comparação ou operação frequente. Se o público não foi confirmado, descreva a hipótese e a evidência que falta.

## Lentes de inspeção

| Pergunta | Evidência útil | Limite da conclusão |
| --- | --- | --- |
| A próxima ação é reconhecível? | ordem visual, rótulos, posição dos controles e percurso até a tarefa | proeminência não comprova conversão |
| A página permite localizar e entender informação? | títulos, agrupamento, densidade, largura de linha e leitura em telas pequenas | preferência de estilo não é falha de compreensão |
| Os elementos formam um sistema? | papéis de cor, tipo, espaço, forma, estados e exceções entre telas | diferenças podem ser intencionais ou impostas pela marca |
| A interação informa o que aconteceu? | foco, estados de envio, erro, sucesso, vazio e recuperação | captura estática não prova comportamento |
| A interface se adapta ao conteúdo? | reflow, textos longos, zoom, orientação e controles de toque | uma largura não representa todos os contextos |
| Movimento e imagens ajudam a tarefa? | propósito, duração, preferência por movimento reduzido, legibilidade e custo visual | animação atraente não prova utilidade |
| A pessoa mantém controle e confiança? | linguagem, consequências, cancelamento, consentimento e tratamento visível dos dados | sentimentos atribuídos ao público exigem pesquisa |

Compare o estado inicial com o estado após uma interação somente quando essa interação for autorizada e segura. Os scripts de captura da executora não clicam nem enviam formulários; para estados não observados, registre a lacuna em vez de descrever um resultado imaginado.

Quando o alvo é um componente ou diff delimitado, leia a implementação apenas para explicar o comportamento de design observado: rótulo, foco, estado, conteúdo, reflow e movimento. Cite o arquivo e a linha que sustentam o achado. Não transforme essa revisão em diagnóstico de cache, SEO, backend ou desempenho sem evidência e escopo apropriados.

## Formular o achado

1. Aponte o elemento e o estado observados, com a captura ou a leitura de código que sustenta a afirmação.
2. Explique como isso pode afetar a tarefa. Se o efeito depender de pessoas reais, marque-o como hipótese e calibre a confiança.
3. Registre o que já funciona e deve permanecer: conteúdo, identidade, controles, dados ou comportamento.
4. Proponha um próximo passo verificável. O critério de aceite descreve o que será observável depois, sem prometer ganho de negócio.
5. Use o contrato de relatório existente; a prioridade depende do bloqueio real, não da intensidade estética.

Quando o pedido também solicitar correção, conclua primeiro a auditoria somente leitura. A implementação passa à executora apenas com o escopo autorizado e as dependências resolvidas.
