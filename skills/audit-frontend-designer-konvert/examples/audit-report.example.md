# Auditoria sintética de frontend

> Exemplo fictício. Nenhum site real, cliente, conta ou estudo com usuários foi usado. Este relatório não autoriza implementação.

## Contexto do relatório

- ID do relatório: `SYNTH-001`
- Projeto: página de produto fictícia
- Escopo: comparar opções de produto e adicionar um item ao carrinho; revisão visual em mobile e desktop
- Limites de evidência: apenas briefing sintético e exemplo renderizado; sem pesquisa com usuários representativos

## Achados

### UX-001 — O custo de entrega só aparece depois do carrinho

- **Prioridade:** P1
- **Local:** página de produto fictícia, painel de preço e compra
- **Evidência observada:** No fluxo sintético, o custo de entrega só aparece depois de adicionar o item ao carrinho.
- **Impacto provável:** Compradores podem adiar a decisão ou se surpreender com um custo inesperado; este efeito é uma hipótese, não um resultado medido.
- **Confiança:** média — a sequência é visível no fluxo sintético fornecido; o impacto no usuário é hipótese.
- **Preservar:** Regras de frete existentes, cálculo do preço total, contrato do checkout e ação de compra.
- **Próximo passo:** Pedir ao responsável pelo produto as regras aprovadas de estimativa de frete e, se autorizado, mostrar uma estimativa perto do preço.
- **Critério de aceite:** A página de produto informa como o custo de entrega é determinado antes do carrinho, usando as regras de frete aprovadas; as verificações de teclado e mobile passam.
- **Exige dado ou aprovação externa:** Sim — o responsável pelo produto precisa confirmar as regras de frete.
- **Aprovado para implementação:** false

### UX-002 — Códigos internos das opções precisam de explicação

- **Prioridade:** P2
- **Local:** página de produto fictícia, seletor de opções
- **Evidência observada:** Os rótulos das opções contêm códigos internos de papel, sem explicação no briefing sintético.
- **Impacto provável:** Compradores de primeira viagem podem não comparar as opções com confiança; a compreensão não foi testada.
- **Confiança:** baixa — os rótulos com código foram observados, mas a compreensão dos compradores não foi testada.
- **Preservar:** Opções disponíveis, valores dos dados do produto e comportamento de seleção.
- **Próximo passo:** Solicitar atributos aprovados em linguagem simples e validar a compreensão com compradores representativos.
- **Critério de aceite:** Cada opção expõe um atributo aprovado e compreensível, sem alterar o valor de produto subjacente.
- **Exige dado ou aprovação externa:** Sim — nomes de atributos aprovados e validação com usuários.
- **Aprovado para implementação:** false

## O que preservar

- Dados atuais do produto e comportamento de seleção.
- Cálculos existentes de preço e checkout.
- Controle de compra e seu nome acessível.

## Handoff proposto

Depois que o usuário aprovar achados individuais e as entradas externas necessárias estiverem disponíveis, entregue este relatório a `design-por-referencia-konvert`. Implemente apenas os achados marcados como aprovados, preserve os itens acima e verifique cada critério de aceite. Nenhuma implementação foi realizada.
