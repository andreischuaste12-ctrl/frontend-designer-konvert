# Auditoria de design para SaaS

Estes pontos são **heurísticas**, não resultados comprovados. Identifique público, familiaridade e tarefa; use [princípios por problema](04-principios-por-problema.md) e separe evidência observada de hipótese.

| Jornada | Observar | Preservar e validar |
| --- | --- | --- |
| Apresentação | A proposta explica a tarefa e o público sem depender de jargão? O próximo passo é previsível? | Preserve capacidades reais. Teste compreensão sem apresentar a resposta. |
| Planos | Preços, período, diferenças, limites e cancelamento são comparáveis? Destaques têm critério compreensível? | Preserve valores e condições. Peça que a pessoa escolha um plano para um cenário fictício. |
| Cadastro e onboarding | Rótulos, feedback, etapas e requisitos são claros? A primeira tarefa tem orientação contextual? | Não envie dados nem crie conta real. Teste com ambiente sintético autorizado. |
| Estado vazio e erro | A interface explica o que falta, como avançar e como recuperar o trabalho? | Preserve estados existentes. Avalie capturas ou código disponível e informe o que não foi observado. |
| Dashboard e uso recorrente | Hierarquia, filtros, unidades, densidade e atalhos ajudam a tarefa de iniciantes e especialistas? | Preserve dados, semântica e ações. Teste tarefas típicas com públicos representativos. |

Não suponha que menos informação seja sempre melhor. Resultados de pesquisa e exemplos visuais precisam ser relevantes ao contexto e efetivamente consultados antes de serem citados.


## Unidades de inspeção

### UXK-GEN-002 — Proposta compreendida na primeira dobra
- **Contexto:** SaaS · página inicial e landing · todas as stacks · mobile e desktop
- **Estados:** normal
- **Quando se aplica:** página de apresentação para quem ainda não conhece o produto.
- **Exceções:** páginas destinadas a clientes que já usam o produto, como login.
- **Evidência a coletar:** captura da primeira dobra em 1440 e 375 px; texto do título, do subtítulo e da ação principal; quando autorizado, teste de cinco segundos com pessoas do público.
- **Método:** hipótese
- **Prioridade padrão:** P2
- **Recomendação:** Dizer na primeira dobra para quem é o produto, que tarefa resolve e qual o próximo passo, com uma única ação principal.
- **Critério de aceite:** Em teste com pessoas do público, a maioria descreve corretamente o que o produto faz depois de ver a primeira dobra.
- **Preservar:** posicionamento e mensagens aprovados pela marca.
- **Dependência externa:** pendente — o posicionamento é decisão de marketing.
- **Métrica a monitorar:** taxa de clique na ação principal.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-GEN-003 — Planos comparáveis sem depender de tooltip
- **Contexto:** SaaS · preços e planos · todas as stacks · mobile e desktop · [comercial]
- **Estados:** normal
- **Quando se aplica:** página de preços com mais de um plano.
- **Exceções:** preço sob consulta; avalie o caminho até o contato comercial.
- **Evidência a coletar:** captura da tabela de planos em 375 e 1440 px; período de cobrança, impostos, limites e condições de cancelamento; conteúdo escondido em tooltip.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Mostrar preço com período e impostos, diferenças em linhas comparáveis e condições de cancelamento perto da ação de assinar, sem informação essencial só em tooltip.
- **Critério de aceite:** Em 375 px, cada plano mostra preço com período e o que muda entre os planos sem abrir tooltip; tooltips existentes podem ser dispensados e mantidos sob o ponteiro.
- **Preservar:** preços, limites e textos legais.
- **Dependência externa:** pendente — preços e limites vêm do comercial.
- **Métrica a monitorar:** conversão na página de preços e chamados sobre cobrança.
- **Fonte:** WCAG 2.2 SC 1.4.13 Content on Hover or Focus — github.com/w3c/wcag@9b94e18, guidelines/sc/21/content-on-hover-or-focus.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-FRM-001 — Cadastro curto que leva à primeira tarefa
- **Contexto:** SaaS · cadastro e onboarding · todas as stacks · mobile e desktop
- **Estados:** normal, sucesso
- **Quando se aplica:** criação de conta seguida da primeira tarefa no produto.
- **Exceções:** contas criadas por um administrador.
- **Evidência a coletar:** número de campos do cadastro; captura da primeira tela depois do cadastro em conta de teste; existência de teste cognitivo no login, como quebra-cabeça.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Pedir no cadastro só o necessário para a primeira tarefa, levar direto a ela com exemplo ou guia curto dispensável e não exigir teste cognitivo sem alternativa.
- **Critério de aceite:** Depois do cadastro de teste, a primeira tarefa principal começa sem preencher perfil completo, e o login não exige quebra-cabeça sem alternativa.
- **Preservar:** consentimentos e verificação de e-mail exigidos.
- **Dependência externa:** pendente — campos obrigatórios são definidos por produto e jurídico.
- **Métrica a monitorar:** ativação, medida pela primeira tarefa concluída.
- **Fonte:** WCAG 2.2 SC 3.3.8 Accessible Authentication (Minimum) — github.com/w3c/wcag@9b94e18, guidelines/sc/22/accessible-authentication-minimum.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-ERR-001 — Limite do plano atingido com alternativas
- **Contexto:** SaaS · limites e cotas · todas as stacks · mobile e desktop · [comercial]
- **Estados:** erro
- **Quando se aplica:** uma ação é bloqueada por limite de plano ou cota.
- **Exceções:** limites técnicos sem relação com o plano (ver UXK-ERR-004).
- **Evidência a coletar:** em conta de teste no limite, captura da mensagem ao tentar a ação; registrar se o trabalho em andamento é perdido.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Explicar qual limite foi atingido, o que continua funcionando e as opções disponíveis, como liberar espaço, mudar de plano ou falar com vendas, sem perder o trabalho feito.
- **Critério de aceite:** Ao atingir o limite de teste, a mensagem nomeia o limite, mantém o trabalho em andamento e oferece pelo menos uma opção além de mudar de plano, quando existir.
- **Preservar:** regras de cobrança e limites contratados.
- **Dependência externa:** pendente — limites e ofertas são definidos pelo comercial.
- **Métrica a monitorar:** mudanças de plano e cancelamentos após o limite.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-DSH-001 — Tarefas frequentes a partir do painel
- **Contexto:** SaaS · uso recorrente · todas as stacks · desktop
- **Estados:** normal
- **Quando se aplica:** pessoas voltam ao painel todos os dias.
- **Exceções:** painéis consultados raramente.
- **Evidência a coletar:** as três tarefas mais frequentes, informadas pelo responsável ou por dados autorizados, e o número de interações até cada uma a partir do painel.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Dar acesso direto às tarefas frequentes a partir do painel e lembrar filtros e visões escolhidos.
- **Critério de aceite:** Cada uma das três tarefas frequentes começa em até duas interações a partir do painel, e o filtro escolhido continua aplicado ao voltar.
- **Preservar:** permissões e indicadores obrigatórios.
- **Dependência externa:** pendente — a lista de tarefas frequentes vem do produto.
- **Métrica a monitorar:** tempo até iniciar a tarefa principal.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada
