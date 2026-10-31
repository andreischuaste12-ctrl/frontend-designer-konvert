# Padrões específicos de jornadas

Estas unidades são hipóteses de inspeção editorial, sem fontes originais conferidas nesta atualização. Aplicam-se apenas quando a função existe. Use dados fictícios, não faça transações e não infira certificação, resultados ou comportamento de usuários. Prioridades devem ser ajustadas ao risco e à evidência real.

### UXK-CHK-051 — CEP e entrega
- **Contexto:** interface web · CEP e entrega · [comercial]
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** entrada de CEP em ambiente de teste
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Confira rótulo, erro e carregamento sem consultar CEP real.
- **Critério de aceite:** O campo informa o erro e o andamento quando existentes.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** pendente — responsável comercial deve confirmar condições.
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-CHK-052 — Pix e expiração
- **Contexto:** interface web · Pix e expiração · [comercial]
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** pagamento por Pix efetivamente oferecido
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Inspecione cópia, validade e confirmação com dados sintéticos.
- **Critério de aceite:** O estado informado permite identificar validade e confirmação.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** pendente — responsável comercial deve confirmar condições.
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-CHK-053 — Parcelamento e juros
- **Contexto:** interface web · Parcelamento e juros · [comercial]
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** parcelamento efetivamente oferecido
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Compare parcelas, juros e total com regras aprovadas.
- **Critério de aceite:** Parcelas e custo total correspondem às regras aprovadas.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** pendente — responsável comercial deve confirmar condições.
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-CHK-054 — Compra como convidado
- **Contexto:** interface web · Compra como convidado
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** opção de compra sem conta quando oferecida
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Localize a opção e seus requisitos sem criar pedidos.
- **Critério de aceite:** A opção disponível é identificável no fluxo.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-CHK-055 — Duplo envio
- **Contexto:** interface web · Duplo envio
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** ação de pagamento no estado de processamento
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Observe feedback e bloqueio de reenvio em ambiente autorizado.
- **Critério de aceite:** O processamento indica que uma ação está em andamento.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-FRM-051 — Rótulo de campo
- **Contexto:** interface web · Rótulo de campo
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** campo de entrada com placeholder
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Identifique o nome acessível e o rótulo visível.
- **Critério de aceite:** O propósito do campo permanece visível após a digitação.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-FRM-052 — Erro associado
- **Contexto:** interface web · Erro associado
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** erro de validação em campo
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Observe mensagem e associação programática quando possível.
- **Critério de aceite:** O campo com erro e a orientação correspondente são identificáveis.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-FRM-053 — Momento da validação
- **Contexto:** interface web · Momento da validação
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** campo com validação interativa
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Observe quando o erro aparece durante digitação e ao sair do campo.
- **Critério de aceite:** A orientação de erro não impede concluir a digitação.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-FRM-054 — Teclado e preenchimento
- **Contexto:** interface web · Teclado e preenchimento
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** campo móvel com tipo de dado específico
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Inspecione tipo, inputmode e autocomplete conforme finalidade.
- **Critério de aceite:** O campo apresenta tipo coerente com a informação solicitada.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-FRM-055 — Requisitos de senha
- **Contexto:** interface web · Requisitos de senha
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** criação de senha disponível
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Confira requisitos e opção de mostrar senha sem usar senha real.
- **Critério de aceite:** Os requisitos são visíveis antes da submissão.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-NAV-051 — Menu operável
- **Contexto:** interface web · Menu operável
- **Estados:** normal, vazio, carregando
- **Quando se aplica:** menu responsivo presente
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Teste abertura, fechamento e foco por teclado e toque.
- **Critério de aceite:** O menu pode ser aberto e fechado pelos métodos testados.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-NAV-052 — Filtros selecionados
- **Contexto:** interface web · Filtros selecionados
- **Estados:** normal, vazio, carregando
- **Quando se aplica:** lista de produtos com filtros
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Observe estado selecionado e recurso de limpar filtros.
- **Critério de aceite:** Filtros ativos e opção de limpar são identificáveis quando oferecidos.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-NAV-053 — Ordenação
- **Contexto:** interface web · Ordenação
- **Estados:** normal, vazio, carregando
- **Quando se aplica:** listagem com ordenação
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Observe rótulo e manutenção da escolha ao alterar filtros.
- **Critério de aceite:** A ordenação em vigor é identificável.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-NAV-054 — Alvos de toque
- **Contexto:** interface web · Alvos de toque
- **Estados:** normal, vazio, carregando
- **Quando se aplica:** controles em tela sensível ao toque
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Meça os controles e consulte critério aplicável ao padrão e plataforma declarados.
- **Critério de aceite:** Controles atendem ao critério e às exceções confirmadas para o escopo.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-ERR-051 — Página não encontrada
- **Contexto:** interface web · Página não encontrada
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** rota inexistente em ambiente autorizado
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Inspecione mensagem e caminho de saída sem dados privados.
- **Critério de aceite:** A página informa indisponibilidade e oferece destino útil.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-ERR-052 — Interrupção de conexão
- **Contexto:** interface web · Interrupção de conexão
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** fluxo de teste autorizado com dados fictícios
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Observe o trabalho após interrupção e restauração.
- **Critério de aceite:** O estado de recuperação explica o próximo passo disponível.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-DSH-051 — Tabela larga
- **Contexto:** interface web · Tabela larga
- **Estados:** normal, vazio, carregando
- **Quando se aplica:** tabela visualizada em tela estreita
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Observe cabeçalhos, rolagem e acesso por teclado.
- **Critério de aceite:** As colunas relevantes continuam acessíveis na largura testada.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-DSH-052 — Unidades e períodos
- **Contexto:** interface web · Unidades e períodos
- **Estados:** normal, vazio, carregando
- **Quando se aplica:** indicadores em gráficos ou tabelas
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Registre rótulos, unidades, período e filtros apresentados.
- **Critério de aceite:** Cada valor inspecionado apresenta unidade e período aplicáveis.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-DSH-053 — Densidade de informação
- **Contexto:** interface web · Densidade de informação
- **Estados:** normal, vazio, carregando
- **Quando se aplica:** painel com tarefas para níveis de experiência distintos
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Observe organização e eventuais modos disponíveis; teste com pessoas para validar preferência.
- **Critério de aceite:** Controles e dados da tarefa prioritária podem ser identificados.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.

### UXK-DSH-054 — Carregamento progressivo
- **Contexto:** interface web · Carregamento progressivo
- **Estados:** normal, vazio, carregando
- **Quando se aplica:** painel com dados assíncronos
- **Exceções:** Não aplicável quando a função ou estado não existe ou está fora do escopo; declare ausência de evidência.
- **Evidência a coletar:** Estado ou código autorizado relevante, registrando viewport e método; sem dados reais.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Observe os estados visíveis durante carregamento autorizado.
- **Critério de aceite:** O painel indica quais dados ainda estão carregando.
- **Preservar:** Comportamento, conteúdo, integrações e condições existentes aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Dificuldades na tarefa, quando existirem dados autorizados.
- **Fonte:** não verificada — heurística editorial; confirmar norma e plataforma antes de citar.
