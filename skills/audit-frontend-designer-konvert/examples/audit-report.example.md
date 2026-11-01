# Auditoria sintética de frontend

> Exemplo fictício. Nenhum site real, cliente, conta ou estudo com usuários foi usado. Só o achado UX-003 está aprovado e desbloqueado; os demais não autorizam implementação.

## Contexto do relatório

- ID do relatório: `SYNTH-001`
- Projeto: página de produto fictícia
- Stack: HTML sintético — confirmada pela inspeção dos arquivos do exemplo.
- Escopo: comparar opções de produto e adicionar um item ao carrinho; revisão visual em mobile e desktop
- Limites de evidência: apenas briefing sintético e exemplo renderizado; sem pesquisa com usuários representativos

## Decisão recomendada

Para a tarefa sintética de comparar opções e adicionar ao carrinho, a prioridade é esclarecer a apresentação do frete (UX-001), após decisão do responsável pelo produto. A compreensão dos códigos das opções exige validação (UX-002). Apenas o refinamento UX-003 está aprovado e desbloqueado. Preserve regras comerciais e o contrato de compra. O público é uma hipótese do briefing; sem pesquisa representativa, não há conclusão sobre conversão. A matriz abaixo explicita os estados observados e as lacunas.

## Cobertura

Somente o que estava no escopo. Lacunas ficam explícitas; o catálogo de conhecimento não é uma checklist obrigatória.

| Página ou fluxo | Tarefa | Estado | Viewport | Stack | Resultado | Evidência ou motivo | Achados |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Página de produto | Comparar opções | normal | 375 px | HTML sintético | observado | Captura sintética route-01__375__light.png e leitura dos rótulos do seletor. | UX-002 |
| Página de produto | Comparar opções | normal | 1440 px | HTML sintético | observado | Captura sintética route-01__1440__light.png. | UX-002 |
| Página de produto | Comparar opções | vazio | todos | — | não se aplica | O produto sintético sempre tem opções; não existe estado sem opções. | — |
| Página de produto | Adicionar ao carrinho | normal | 375 px | HTML sintético | observado | Captura sintética e percurso por teclado até o botão de compra. | UX-001, UX-003 |
| Página de produto | Adicionar ao carrinho | sucesso | 375 px | HTML sintético | observado | Captura do carrinho com o item sintético adicionado. | — |
| Página de produto | Adicionar ao carrinho | carregando | 375 px | — | não observado | A resposta sintética é instantânea; o estado de carregamento não aparece sem simular rede lenta, o que ficou fora deste exemplo. | — |
| Página de produto | Adicionar ao carrinho | erro | 375 px | — | bloqueado | O exemplo não oferece forma autorizada de provocar falha ao adicionar ao carrinho. | — |

## Achados

### UX-001 — O custo de entrega só aparece depois do carrinho

- **Classe:** problema
- **Prioridade:** P1
- **Local:** página de produto fictícia, painel de preço e compra
- **Evidência observada:** No fluxo sintético, o custo de entrega só aparece depois de adicionar o item ao carrinho.
- **Fonte da evidência:** interação — fluxo sintético de compra; estado normal; viewport 375 px
- **Inferência:** A sequência exige adicionar ao carrinho para descobrir como o frete é apresentado.
- **Hipótese:** A ausência da informação antecipada pode gerar surpresa; não houve teste com compradores.
- **Impacto provável:** Compradores podem adiar a decisão ou se surpreender com um custo inesperado; este efeito é uma hipótese, não um resultado medido.
- **Confiança:** média — a sequência é visível no fluxo sintético fornecido; o impacto no usuário é hipótese.
- **Preservar:** Regras de frete existentes, cálculo do preço total, contrato do checkout e ação de compra.
- **Próximo passo:** Pedir ao responsável pelo produto as regras aprovadas de estimativa de frete e, se autorizado, mostrar uma estimativa perto do preço.
- **Critério de aceite:** A página de produto informa como o custo de entrega é determinado antes do carrinho, usando as regras de frete aprovadas; as verificações de teclado e mobile passam.
- **Dependência externa:** pendente — o responsável pelo produto precisa confirmar as regras de frete.
- **Aprovado para implementação:** false

### UX-002 — Códigos internos das opções precisam de explicação

- **Classe:** a validar
- **Prioridade:** P2
- **Local:** página de produto fictícia, seletor de opções
- **Evidência observada:** Os rótulos das opções contêm códigos internos de papel, sem explicação no briefing sintético.
- **Fonte da evidência:** captura — captura sintética route-01__375__light.png; estado normal; viewport 375 px
- **Inferência:** O briefing sintético não define o significado dos códigos exibidos.
- **Hipótese:** Compradores de primeira viagem podem ter dificuldade para comparar opções; falta validação com usuários.
- **Impacto provável:** Compradores de primeira viagem podem não comparar as opções com confiança; a compreensão não foi testada.
- **Confiança:** baixa — os rótulos com código foram observados, mas a compreensão dos compradores não foi testada.
- **Preservar:** Opções disponíveis, valores dos dados do produto e comportamento de seleção.
- **Próximo passo:** Solicitar atributos aprovados em linguagem simples e validar a compreensão com compradores representativos.
- **Critério de aceite:** Cada opção expõe um atributo aprovado e compreensível, sem alterar o valor de produto subjacente.
- **Dependência externa:** pendente — nomes de atributos aprovados e validação com usuários.
- **Aprovado para implementação:** false

### UX-003 — Botão de compra sem destaque em mobile

- **Classe:** problema
- **Prioridade:** P2
- **Local:** página de produto fictícia, botão de compra em mobile (375 px)
- **Evidência observada:** Na captura sintética, o botão de compra usa texto cinza-claro sobre fundo cinza e tem o mesmo peso visual dos links secundários ao lado.
- **Fonte da evidência:** captura — captura sintética route-01__375__light.png; estado normal; viewport 375 px
- **Inferência:** O controle principal não se diferencia visualmente dos links secundários no painel.
- **Hipótese:** O reconhecimento da ação pode ser mais lento; o efeito em compras não foi medido.
- **Impacto provável:** A ação principal pode demorar mais a ser reconhecida; o efeito na conclusão da compra é uma hipótese não medida.
- **Confiança:** média — contraste e peso visual foram observados na captura sintética; o comportamento dos compradores não foi testado.
- **Preservar:** Texto do botão, nome acessível e evento de adicionar ao carrinho.
- **Próximo passo:** Aplicar ao botão de compra a cor primária aprovada pela marca e diferenciá-lo dos links secundários.
- **Critério de aceite:** O botão de compra é o controle de maior destaque no painel em 375 px e 1440 px, com contraste de texto de pelo menos 4,5:1 e foco visível; texto, nome acessível e evento permanecem iguais.
- **Dependência externa:** resolvida — a cor primária para ações precisava de aprovação da marca; o responsável pela marca (fictício) aprovou o token de cor primária existente.
- **Aprovado para implementação:** true

## O que preservar

- Dados atuais do produto e comportamento de seleção.
- Cálculos existentes de preço e checkout.
- Controle de compra e seu nome acessível.

## Handoff proposto

Entregue este relatório a `design-por-referencia-konvert`. Hoje só UX-003 pode ser implementado (aprovado, dependência resolvida). UX-001 e UX-002 ficam fora da alteração até as dependências serem resolvidas e o usuário aprovar cada um. Preserve os itens acima e verifique cada critério de aceite. Nenhuma implementação foi realizada.
