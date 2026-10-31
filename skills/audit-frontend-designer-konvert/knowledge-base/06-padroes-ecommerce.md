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

### UXK-NAV-001 — Descoberta e listagem
- **Contexto:** ecommerce · interfaces web
- **Estados:** normal
- **Quando se aplica:** categorias, filtros e ordenação; comparação de atributos
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** rotas e estados de filtro
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Identificar categorias e estado dos filtros durante a comparação.
- **Critério de aceite:** A pessoa consegue identificar e alterar o filtro aplicado.
- **Preservar:** rotas, filtros e conteúdo existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-NAV-002 — Busca de produtos
- **Contexto:** ecommerce · interfaces web
- **Estados:** normal
- **Quando se aplica:** busca por termos relevantes
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** consulta sintética e resultados ou estado vazio
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Explicar o resultado e oferecer próximo passo quando não houver itens.
- **Critério de aceite:** A busca informa o resultado e apresenta caminho utilizável.
- **Preservar:** consultas e filtros existentes
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-GEN-001 — Escolha do produto
- **Contexto:** ecommerce · interfaces web · [comercial]
- **Estados:** normal
- **Quando se aplica:** imagem, variante, disponibilidade e condições
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** opções, rótulos e condições apresentadas
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Tornar as variações compreensíveis sem depender apenas de cor.
- **Critério de aceite:** Cada opção disponível pode ser identificada pelo seu nome.
- **Preservar:** variantes, preço e conteúdo do produto
- **Dependência externa:** pendente — responsável comercial deve confirmar valores e regras.
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-CHK-001 — Revisão do carrinho
- **Contexto:** ecommerce · interfaces web · [comercial]
- **Estados:** normal
- **Quando se aplica:** quantidade, remoção, total e próximo passo
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** controles e resumo do carrinho
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Permitir revisar itens e condições antes de avançar.
- **Critério de aceite:** O resumo e o próximo passo são identificáveis.
- **Preservar:** itens e cálculos existentes
- **Dependência externa:** pendente — responsável comercial deve confirmar valores e regras.
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-CHK-002 — Compreensão do checkout
- **Contexto:** ecommerce · interfaces web · [comercial]
- **Estados:** normal
- **Quando se aplica:** campos, frete e compromisso de pagamento
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** rótulos e custo apresentado antes do pagamento
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Explicar os campos e o custo aprovado antes do compromisso.
- **Critério de aceite:** Condições aprovadas são apresentadas antes do pagamento.
- **Preservar:** cálculos, prazos e regras comerciais
- **Dependência externa:** pendente — responsável comercial deve confirmar valores e regras.
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.

### UXK-CHK-003 — Confirmação após compra
- **Contexto:** ecommerce · interfaces web
- **Estados:** normal
- **Quando se aplica:** confirmação e próximos passos
- **Exceções:** Não se aplica quando a funcionalidade não existe no escopo; registre estados inacessíveis.
- **Evidência a coletar:** captura sintética ou estado disponibilizado
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Apresentar confirmação e próximos passos sem criar pedidos reais.
- **Critério de aceite:** A confirmação informa o próximo passo disponível.
- **Preservar:** políticas e contatos aprovados
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** Conclusão da tarefa e dificuldades observadas, se houver dados autorizados.
- **Fonte:** não verificada — heurística editorial; não representa pesquisa consultada.
