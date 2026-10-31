# Jornadas e estados de UX

Estas unidades são heurísticas editoriais não verificadas; aplique apenas aos estados e tarefas existentes. Evidências inacessíveis ficam como lacuna; não simule pedidos nem envie dados reais. Sempre que pertinente, verifique teclado, toque, largura estreita (por exemplo 375 px) e preferência de movimento reduzido; registre dispositivo, viewport e método. Não infira conformidade integral.

### UXK-CHK-004 — Revisão antes de pagar
- **Contexto:** checkout e pagamento · interface web · [comercial]
- **Estados:** normal
- **Quando se aplica:** o estado normal existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado normal, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Revisar resumo e condições aprovadas.
- **Critério de aceite:** No estado normal, a interface deve revisar resumo e condições aprovadas.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** pendente — responsável comercial deve confirmar valores e regras.
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-CHK-005 — Feedback durante processamento
- **Contexto:** checkout e pagamento · interface web
- **Estados:** carregando
- **Quando se aplica:** o estado carregando existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado carregando, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Indicar processamento e evitar envio duplicado.
- **Critério de aceite:** No estado carregando, a interface deve indicar processamento e evitar envio duplicado.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-CHK-006 — Pagamento recusado
- **Contexto:** checkout e pagamento · interface web
- **Estados:** erro
- **Quando se aplica:** o estado erro existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado erro, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Explicar recusa sem expor dados sensíveis.
- **Critério de aceite:** No estado erro, a interface deve explicar recusa sem expor dados sensíveis.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-CHK-007 — Confirmação do pedido
- **Contexto:** checkout e pagamento · interface web
- **Estados:** sucesso
- **Quando se aplica:** o estado sucesso existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado sucesso, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Confirmar o pedido e os próximos passos.
- **Critério de aceite:** No estado sucesso, a interface deve confirmar o pedido e os próximos passos.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-CHK-008 — Carrinho sem itens
- **Contexto:** checkout e pagamento · interface web
- **Estados:** vazio
- **Quando se aplica:** o estado vazio existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado vazio, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Oferecer caminho para continuar comprando.
- **Critério de aceite:** No estado vazio, a interface deve oferecer caminho para continuar comprando.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-CHK-009 — Recuperação após falha
- **Contexto:** checkout e pagamento · interface web
- **Estados:** recuperação
- **Quando se aplica:** o estado recuperação existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado recuperação, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Permitir nova tentativa sem apagar dados desnecessariamente.
- **Critério de aceite:** No estado recuperação, a interface deve permitir nova tentativa sem apagar dados desnecessariamente.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-FRM-003 — Rótulo do campo
- **Contexto:** formulários e cadastro · interface web
- **Estados:** normal
- **Quando se aplica:** o estado normal existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado normal, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Identificar campo sem depender apenas de placeholder.
- **Critério de aceite:** No estado normal, a interface deve identificar campo sem depender apenas de placeholder.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-FRM-004 — Envio em andamento
- **Contexto:** formulários e cadastro · interface web
- **Estados:** carregando
- **Quando se aplica:** o estado carregando existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado carregando, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Informar andamento do envio.
- **Critério de aceite:** No estado carregando, a interface deve informar andamento do envio.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-FRM-005 — Erro associado ao campo
- **Contexto:** formulários e cadastro · interface web
- **Estados:** erro
- **Quando se aplica:** o estado erro existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado erro, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Identificar campo e correção necessária.
- **Critério de aceite:** No estado erro, a interface deve identificar campo e correção necessária.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-FRM-006 — Confirmação de envio
- **Contexto:** formulários e cadastro · interface web
- **Estados:** sucesso
- **Quando se aplica:** o estado sucesso existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado sucesso, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Confirmar o resultado observado.
- **Critério de aceite:** No estado sucesso, a interface deve confirmar o resultado observado.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-FRM-007 — Formulário sem dados
- **Contexto:** formulários e cadastro · interface web
- **Estados:** vazio
- **Quando se aplica:** o estado vazio existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado vazio, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Explicar o que preencher e o que é opcional.
- **Critério de aceite:** No estado vazio, a interface deve explicar o que preencher e o que é opcional.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-FRM-008 — Retomada após erro
- **Contexto:** formulários e cadastro · interface web
- **Estados:** recuperação
- **Quando se aplica:** o estado recuperação existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado recuperação, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Preservar entradas seguras após uma falha.
- **Critério de aceite:** No estado recuperação, a interface deve preservar entradas seguras após uma falha.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-NAV-005 — Navegação e foco
- **Contexto:** navegação, busca e listagem · interface web
- **Estados:** normal
- **Quando se aplica:** o estado normal existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado normal, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Tornar destino e foco identificáveis.
- **Critério de aceite:** No estado normal, a interface deve tornar destino e foco identificáveis.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-NAV-006 — Busca em andamento
- **Contexto:** navegação, busca e listagem · interface web
- **Estados:** carregando
- **Quando se aplica:** o estado carregando existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado carregando, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Informar que resultados estão carregando.
- **Critério de aceite:** No estado carregando, a interface deve informar que resultados estão carregando.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-NAV-007 — Erro ao carregar resultados
- **Contexto:** navegação, busca e listagem · interface web
- **Estados:** erro
- **Quando se aplica:** o estado erro existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado erro, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Explicar falha e oferecer nova tentativa.
- **Critério de aceite:** No estado erro, a interface deve explicar falha e oferecer nova tentativa.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-NAV-008 — Busca com resultados
- **Contexto:** navegação, busca e listagem · interface web
- **Estados:** sucesso
- **Quando se aplica:** o estado sucesso existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado sucesso, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Apresentar consulta e resultados coerentes.
- **Critério de aceite:** No estado sucesso, a interface deve apresentar consulta e resultados coerentes.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-NAV-009 — Busca sem resultados
- **Contexto:** navegação, busca e listagem · interface web
- **Estados:** vazio
- **Quando se aplica:** o estado vazio existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado vazio, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Indicar que não há resultados e oferecer próximos passos.
- **Critério de aceite:** No estado vazio, a interface deve indicar que não há resultados e oferecer próximos passos.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-NAV-010 — Ajuste da busca
- **Contexto:** navegação, busca e listagem · interface web
- **Estados:** recuperação
- **Quando se aplica:** o estado recuperação existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado recuperação, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Permitir alterar consulta e limpar filtros.
- **Critério de aceite:** No estado recuperação, a interface deve permitir alterar consulta e limpar filtros.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-ERR-002 — Comunicação de estado
- **Contexto:** erros, estados vazios e recuperação · interface web
- **Estados:** normal
- **Quando se aplica:** o estado normal existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado normal, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Deixar claro o estado atual.
- **Critério de aceite:** No estado normal, a interface deve deixar claro o estado atual.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-ERR-003 — Operação em andamento
- **Contexto:** erros, estados vazios e recuperação · interface web
- **Estados:** carregando
- **Quando se aplica:** o estado carregando existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado carregando, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Identificar operação em andamento.
- **Critério de aceite:** No estado carregando, a interface deve identificar operação em andamento.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-ERR-004 — Mensagem de falha
- **Contexto:** erros, estados vazios e recuperação · interface web
- **Estados:** erro
- **Quando se aplica:** o estado erro existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado erro, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Explicar falha e próximo passo disponível.
- **Critério de aceite:** No estado erro, a interface deve explicar falha e próximo passo disponível.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-ERR-005 — Conclusão da recuperação
- **Contexto:** erros, estados vazios e recuperação · interface web
- **Estados:** sucesso
- **Quando se aplica:** o estado sucesso existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado sucesso, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Confirmar quando a recuperação terminou.
- **Critério de aceite:** No estado sucesso, a interface deve confirmar quando a recuperação terminou.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-ERR-006 — Primeiro uso sem dados
- **Contexto:** erros, estados vazios e recuperação · interface web
- **Estados:** vazio
- **Quando se aplica:** o estado vazio existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado vazio, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Orientar a primeira ação possível.
- **Critério de aceite:** No estado vazio, a interface deve orientar a primeira ação possível.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-ERR-007 — Retomar após interrupção
- **Contexto:** erros, estados vazios e recuperação · interface web
- **Estados:** recuperação
- **Quando se aplica:** o estado recuperação existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado recuperação, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Preservar trabalho quando possível e permitir retomar.
- **Critério de aceite:** No estado recuperação, a interface deve preservar trabalho quando possível e permitir retomar.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-DSH-002 — Valores e períodos
- **Contexto:** tabelas e dashboards · interface web
- **Estados:** normal
- **Quando se aplica:** o estado normal existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado normal, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Identificar unidades e período dos dados.
- **Critério de aceite:** No estado normal, a interface deve identificar unidades e período dos dados.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-DSH-003 — Carregamento dos dados
- **Contexto:** tabelas e dashboards · interface web
- **Estados:** carregando
- **Quando se aplica:** o estado carregando existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado carregando, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Indicar que os dados estão carregando.
- **Critério de aceite:** No estado carregando, a interface deve indicar que os dados estão carregando.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-DSH-004 — Falha no painel
- **Contexto:** tabelas e dashboards · interface web
- **Estados:** erro
- **Quando se aplica:** o estado erro existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado erro, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Distinguir falha de ausência de dados.
- **Critério de aceite:** No estado erro, a interface deve distinguir falha de ausência de dados.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-DSH-005 — Dados atualizados
- **Contexto:** tabelas e dashboards · interface web
- **Estados:** sucesso
- **Quando se aplica:** o estado sucesso existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado sucesso, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Informar atualização concluída quando aplicável.
- **Critério de aceite:** No estado sucesso, a interface deve informar atualização concluída quando aplicável.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-DSH-006 — Painel sem dados
- **Contexto:** tabelas e dashboards · interface web
- **Estados:** vazio
- **Quando se aplica:** o estado vazio existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado vazio, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Explicar ausência de dados e próxima ação.
- **Critério de aceite:** No estado vazio, a interface deve explicar ausência de dados e próxima ação.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-DSH-007 — Retomada da atualização
- **Contexto:** tabelas e dashboards · interface web
- **Estados:** recuperação
- **Quando se aplica:** o estado recuperação existe ou foi fornecido para a tarefa
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura ou inspeção autorizada do estado recuperação, com dados sintéticos
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Oferecer nova tentativa sem esconder o último estado válido.
- **Critério de aceite:** No estado recuperação, a interface deve oferecer nova tentativa sem esconder o último estado válido.
- **Preservar:** conteúdo, comportamento e integrações existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.
