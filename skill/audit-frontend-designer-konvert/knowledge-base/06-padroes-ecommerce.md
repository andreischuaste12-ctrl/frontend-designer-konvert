# Auditoria de design para e-commerce

Use este roteiro como **heurísticas de inspeção**, não como prova de comportamento ou resultado. Escolha uma jornada e um público com base no projeto; registre fatos observados, hipóteses, evidências, o que preservar e teste de validação. Para critérios transversais, use [princípios por problema](04-principios-por-problema.md) e trate a [base de estudos](05-estudos-ux-ui-psicologia.md) como provisória até consultar as fontes.

| Etapa | Perguntas e evidência de design | Preservar e validar |
| --- | --- | --- |
| Descoberta e listagem | Categorias, filtros e ordenação comunicam seu estado? Cards permitem comparar preço, disponibilidade e atributos? Observe rotas, rótulos e estados. | Preserve conteúdo e filtros úteis. Peça a pessoas representativas que encontrem e comparem itens. |
| Busca | A busca reconhece o termo usado pela pessoa? Resultados vazios sugerem próximos passos? Registre consulta sintética e resposta observada. | Preserve filtros e mecanismos existentes. Teste termos e consultas sem resultado em ambiente autorizado. |
| Produto | Imagens, variações, preço, disponibilidade e condições aparecem perto da decisão? Opções são compreensíveis sem depender só de cor? | Preserve variantes, preço e conteúdo real. Teste escolha e entendimento sem compra. |
| Carrinho | Alterar quantidade, remover e revisar condições é compreensível? O total e o próximo passo são visíveis? | Preserve cálculos e itens. Teste recuperação de erro com dados fictícios. |
| Checkout | Campos têm rótulos, feedback e recuperação? Frete, prazo e custo total estão claros antes do compromisso? | Não envie formulários nem conclua transações reais. Valide estados somente em ambiente de teste autorizado. |
| Pós-compra | Confirmação, próximos passos, contato e políticas são localizáveis? | Não crie pedidos reais. Use capturas ou dados fictícios fornecidos e marque lacunas. |

## Contexto brasileiro

Quando realmente oferecidos, verifique a clareza de **Pix**, parcelamento, frete por CEP, WhatsApp e canais de reputação como Reclame Aqui. São convenções contextuais, não exigências universais nem prova de confiança. Não invente taxas, prazos, condições ou avaliações; preserve informação comercial existente e sinalize dependências para o responsável.


## Unidades de inspeção

### UXK-NAV-001 — Cards de listagem com atributos de decisão
- **Contexto:** e-commerce · categoria e coleção · todas as stacks · mobile e desktop · [comercial]
- **Estados:** normal
- **Quando se aplica:** páginas de categoria, coleção ou vitrine com vários produtos.
- **Exceções:** lojas com poucos produtos exibidos em página única de apresentação.
- **Evidência a coletar:** capturas em 375 e 1440 px da listagem; atributos exibidos em cada card (nome, preço final, parcelamento, disponibilidade, variações) e a área clicável.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Exibir em cada card nome, preço final, condição de parcelamento quando houver, disponibilidade e variações principais, com uma única área clicável que leva ao produto.
- **Critério de aceite:** Em 375 px, cada card mostra nome e preço final legíveis, e clicar em qualquer ponto do card abre o mesmo produto.
- **Preservar:** ordem de vitrine definida pelo merchandising e preços exibidos.
- **Dependência externa:** pendente — preços, parcelas e disponibilidade vêm do comercial.
- **Métrica a monitorar:** taxa de clique da listagem para a página de produto.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-NAV-002 — Busca visível e tolerante a erro de digitação
- **Contexto:** e-commerce · busca de produtos · todas as stacks · mobile
- **Estados:** normal
- **Quando se aplica:** a loja oferece busca.
- **Exceções:** catálogos muito pequenos, sem busca.
- **Evidência a coletar:** captura do cabeçalho em 375 px; resultados para termos sintéticos com erro de digitação, sinônimo e plural.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Deixar o campo ou um botão de busca rotulado visível no cabeçalho mobile sem abrir menu, com nome acessível, sugestões e tolerância a erro de digitação.
- **Critério de aceite:** Em 375 px a busca aparece no cabeçalho sem abrir menu, e um termo com erro de digitação comum retorna resultados ou uma sugestão.
- **Preservar:** configuração do motor de busca e dicionário de sinônimos.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** buscas sem resultado e conversão de quem usa a busca.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-GEN-001 — Página de produto com decisão no mesmo bloco
- **Contexto:** e-commerce · página de produto · todas as stacks · mobile e desktop · [comercial]
- **Estados:** normal, erro
- **Quando se aplica:** produto com variações, como tamanho e cor.
- **Exceções:** produto sem variações.
- **Evidência a coletar:** captura em 375 px da área de decisão (preço, variação, disponibilidade, frete e botão de compra); comportamento ao escolher uma variação esgotada.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Manter preço, seleção de variação, disponibilidade e botão de compra no mesmo bloco e indicar variação esgotada em texto, não só por cor ou transparência.
- **Critério de aceite:** Em 375 px, ao escolher uma variação esgotada, a indisponibilidade aparece em texto e o botão de compra informa o motivo.
- **Preservar:** variantes, preço e conteúdo do produto.
- **Dependência externa:** pendente — preço e estoque vêm do comercial.
- **Métrica a monitorar:** adições ao carrinho e erros de seleção de variação.
- **Fonte:** WCAG 2.2 SC 1.4.1 Use of Color — github.com/w3c/wcag@9b94e18, guidelines/sc/20/use-of-color.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-CHK-001 — Carrinho que atualiza e anuncia o total
- **Contexto:** e-commerce · carrinho · todas as stacks · mobile e desktop · [comercial]
- **Estados:** normal, carregando
- **Quando se aplica:** carrinho com itens editáveis.
- **Exceções:** compra direta sem carrinho.
- **Evidência a coletar:** captura em 375 px; alterar quantidade e remover item, registrando a atualização de subtotal, frete e total e o anúncio da mudança.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Atualizar subtotal, frete e total logo após mudar a quantidade, anunciar a mudança e manter visível o botão de avançar.
- **Critério de aceite:** Ao mudar a quantidade, o total atualiza sem perder a posição na página, e a mudança é anunciada por região de status.
- **Preservar:** cálculos de preço, cupom e frete.
- **Dependência externa:** pendente — regras de cupom e frete pertencem ao comercial.
- **Métrica a monitorar:** abandono do carrinho.
- **Fonte:** WCAG 2.2 SC 4.1.3 Status Messages — github.com/w3c/wcag@9b94e18, guidelines/sc/21/status-messages.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-CHK-002 — Etapas do checkout com posição e retorno seguro
- **Contexto:** e-commerce · checkout em etapas · todas as stacks · mobile e desktop
- **Estados:** normal, recuperação
- **Quando se aplica:** checkout dividido em etapas.
- **Exceções:** checkout de etapa única.
- **Evidência a coletar:** capturas de cada etapa; indicador de progresso; campos pedidos por etapa; efeito de voltar uma etapa.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Mostrar a etapa atual e o total de etapas, pedir apenas os campos necessários em cada uma e permitir voltar sem perder dados.
- **Critério de aceite:** Cada etapa indica em texto a posição, como "Etapa 2 de 3", e voltar uma etapa mantém os dados já informados.
- **Preservar:** ordem de etapas exigida pela plataforma.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** abandono por etapa do checkout.
- **Fonte:** WCAG 2.2 SC 3.3.7 Redundant Entry — github.com/w3c/wcag@9b94e18, guidelines/sc/22/redundant-entry.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-CHK-003 — Pós-compra com status, troca e ajuda no mesmo lugar
- **Contexto:** e-commerce · pós-compra · todas as stacks · mobile e desktop · [comercial]
- **Estados:** sucesso
- **Quando se aplica:** a pessoa acompanha um pedido depois da compra.
- **Exceções:** produtos digitais entregues na hora.
- **Evidência a coletar:** capturas da área de pedido ou rastreio e da política de troca; caminho a partir da confirmação; posição do canal de ajuda em páginas diferentes.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Dar acesso ao status do pedido com número e e-mail quando possível, reunindo prazos, troca e devolução e contato, com a ajuda sempre na mesma posição.
- **Critério de aceite:** A partir da confirmação, a pessoa chega ao status do pedido e à política de troca em até dois cliques, e o canal de ajuda ocupa a mesma posição nas páginas visitadas.
- **Preservar:** políticas e prazos legais de troca e devolução.
- **Dependência externa:** pendente — políticas e prazos são definidos pelo jurídico e pela operação.
- **Métrica a monitorar:** contatos do tipo "onde está meu pedido".
- **Fonte:** WCAG 2.2 SC 3.2.6 Consistent Help — github.com/w3c/wcag@9b94e18, guidelines/sc/22/consistent-help.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana
