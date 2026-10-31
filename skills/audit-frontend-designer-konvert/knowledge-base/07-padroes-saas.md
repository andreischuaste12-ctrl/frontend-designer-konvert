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

### UXK-GEN-002 — Apresentação do produto
- **Contexto:** saas · interfaces web
- **Estados:** normal
- **Quando se aplica:** proposta e tarefa principal
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** título, proposta e ação principal
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Explicar tarefa e próximo passo sem pressupor familiaridade.
- **Critério de aceite:** A proposta informa o que a ferramenta ajuda a fazer.
- **Preservar:** capacidades reais e identidade
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-GEN-003 — Comparação de planos
- **Contexto:** saas · interfaces web · [comercial]
- **Estados:** normal
- **Quando se aplica:** preços, períodos e recursos
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** tabela e condições de planos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Apresentar diferenças e condições comparáveis.
- **Critério de aceite:** O período e as condições aprovadas estão identificáveis.
- **Preservar:** preços e limites aprovados
- **Dependência externa:** pendente — responsável comercial deve confirmar valores e regras.
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-FRM-001 — Cadastro e onboarding
- **Contexto:** saas · interfaces web
- **Estados:** normal
- **Quando se aplica:** cadastro e primeira tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** campos, etapas e requisitos visíveis
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Oferecer rótulos e orientação para a primeira tarefa.
- **Critério de aceite:** Campos e próxima etapa são compreensíveis sem enviar dados reais.
- **Preservar:** contrato do cadastro e capacidades
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-ERR-001 — Estado vazio ou erro em SaaS
- **Contexto:** saas · interfaces web
- **Estados:** normal
- **Quando se aplica:** recuperação de uma tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** mensagem e ações disponíveis
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Explicar o estado e oferecer caminho aplicável.
- **Critério de aceite:** O estado informa uma próxima ação disponível.
- **Preservar:** dados e estados existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-DSH-001 — Dashboard recorrente
- **Contexto:** saas · interfaces web
- **Estados:** normal
- **Quando se aplica:** informações e filtros para tarefas recorrentes
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** hierarquia, unidades e filtros
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Associar valores a unidades e tarefas.
- **Critério de aceite:** Unidades e filtros relevantes estão identificáveis.
- **Preservar:** dados, semântica e ações
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.
