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
