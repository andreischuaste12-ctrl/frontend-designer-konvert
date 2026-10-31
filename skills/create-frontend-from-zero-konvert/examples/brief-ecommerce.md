# Exemplo sintético: página de produto para loja de cafés

- **Tarefa principal:** escolher a moagem e o tamanho, conferir o frete pelo CEP e adicionar ao carrinho.
- **Público e dispositivo:** compradores recorrentes e novos; mobile primeiro (suposto).
- **Escopo desta entrega:** página de produto e carrinho lateral, com estados normal, carregando (frete), erro (CEP inválido, variação esgotada), sucesso (item adicionado) e vazio (carrinho).
- **Fora do escopo:** checkout, pagamento, login e cálculo real de frete.
- **Conteúdo:** produto fictício "Café Serra Azul 250 g"; preço de exemplo R$ 39,90 marcado como fictício; parcelamento ilustrativo "3x de R$ 13,30 sem juros", marcado como exemplo.
- **Marca e tokens:** nenhuma identidade fornecida; direção original documentada em tokens CSS.
- **Stack:** HTML, CSS e JavaScript sem framework, porque é uma página com interação local simples; alternativa descartada: React, por não haver estado compartilhado entre páginas.
- **Integrações simuladas:** frete calculado por tabela fictícia local, com atraso artificial para exibir o estado carregando.

## Suposições registradas
| Suposição | Motivo | Impacto se estiver errada |
| --- | --- | --- |
| A loja aceita Pix e cartão | Comum no varejo brasileiro | Ajustar os selos de pagamento exibidos. |
| Frete grátis acima de R$ 150 | Exemplo para exercitar a mensagem de frete | Remover a mensagem; o dado real vem do comercial. |

## Critérios usados
Unidades UXK-GEN-001, UXK-CHK-001, UXK-CHK-008, UXK-CHK-051 e UXK-CHK-053 da auditora, como critério de pronto dos estados.
