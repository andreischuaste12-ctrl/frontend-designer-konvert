# Auditoria de design para sites institucionais e serviços

Use estas **heurísticas** para estudar a jornada até uma informação ou contato, sem presumir perfil demográfico ou intenção. Aplique os [princípios por problema](04-principios-por-problema.md) e registre limites de evidência.

| Jornada | Observar | Preservar e validar |
| --- | --- | --- |
| Chegada | É possível entender quem presta o serviço, o que é oferecido e para quem? A hierarquia facilita a leitura? | Preserve identidade e conteúdo comprovado. Teste a compreensão inicial com pessoas representativas. |
| Serviços | Categorias e descrições ajudam a encontrar uma solução? Links explicam seus destinos? | Preserve rotas e informações relevantes; não trate diversidade visual como defeito por si só. |
| Confiança | Equipe, qualificações, políticas, provas e condições são identificáveis e verificáveis? | Não invente selos, resultados, depoimentos ou garantias. Confirme informações com o responsável. |
| Contato | Botões, telefone, horário e canais descrevem o próximo passo? Formulários têm rótulos e recuperação de erros? | Preserve canais e contratos. Não envie formulário real; use ambiente sintético autorizado. |
| Mobile e acesso | Navegação, foco, contraste, zoom, movimento e leitura funcionam nos estados observáveis? | Registre dispositivo e método; não declare conformidade integral sem avaliação apropriada. |

Uma aparência formal, uma fonte serifada ou uma seção longa não são problemas automaticamente; relacione cada achado à tarefa e a evidência observável.


## Unidades de inspeção

### UXK-GEN-004 — Chegada ao serviço
- **Contexto:** institucional · interfaces web
- **Estados:** normal
- **Quando se aplica:** identidade e proposta
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** texto de entrada e ação
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Explicar quem presta o serviço e qual tarefa apoia.
- **Critério de aceite:** Identidade e serviço são identificáveis.
- **Preservar:** identidade e conteúdo comprovado
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-NAV-003 — Encontrar serviços
- **Contexto:** institucional · interfaces web
- **Estados:** normal
- **Quando se aplica:** categorias e destinos
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** rótulos e rotas de serviços
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Tornar destinos de serviços compreensíveis.
- **Critério de aceite:** Cada destino relevante tem rótulo compreensível.
- **Preservar:** rotas e informações relevantes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-GEN-005 — Sinais de confiança
- **Contexto:** institucional · interfaces web
- **Estados:** normal
- **Quando se aplica:** credenciais e condições verificáveis
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** conteúdo de equipe, políticas e condições
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Apresentar apenas informações confirmadas pelo responsável.
- **Critério de aceite:** Informações apresentadas correspondem às aprovadas.
- **Preservar:** provas e qualificações reais
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-FRM-002 — Contato e solicitação
- **Contexto:** institucional · interfaces web
- **Estados:** normal
- **Quando se aplica:** canais, formulários e próximos passos
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** rótulos e canais de contato
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Identificar canal e próximo passo sem enviar dados reais.
- **Critério de aceite:** Os campos e canal estão identificados.
- **Preservar:** canais e contratos de integração
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-NAV-004 — Acesso em telas menores
- **Contexto:** institucional · interfaces web
- **Estados:** normal
- **Quando se aplica:** navegação, foco, leitura e movimento
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** capturas e navegação por teclado nos estados acessíveis
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Garantir que navegação e foco permaneçam compreensíveis.
- **Critério de aceite:** Controles observados podem ser localizados com teclado.
- **Preservar:** conteúdo e preferências de movimento
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.
