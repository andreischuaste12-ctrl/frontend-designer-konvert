# Refinamento de interface existente

Use este guia para uma mudança visual ou de interação delimitada que o usuário pediu diretamente, para uma referência fornecida ou para achados implementáveis de um relatório. A instrução direta delimita tela, componente ou comportamento; ela não transforma achados de uma auditoria em aprovados. Se o usuário pediu para descobrir problemas antes de corrigir, siga a auditora e seu handoff.

## Estabelecer o ponto de partida

1. Leia a tarefa da pessoa, a marca, os tokens, os componentes, a copy, as integrações e os estados do alvo. Não trate ausência de um arquivo de design como autorização para redesenhar o produto.
2. Registre o que pode mudar e o que deve ficar. Para pedido pontual, preserve o restante da página. Para uma direção nova expressamente solicitada, preserve a verdade do produto, o conteúdo factual e o comportamento contratado.
3. Observe a interface renderizada antes de editar. Use rota, viewport, tema e estado que permitam repetir a comparação depois. Se não for possível renderizar, explique a evidência substituta e sua limitação.
4. Escolha uma hipótese de melhoria ligada à tarefa. Liste o resultado observável que distinguirá uma correção de uma troca de gosto.

## Escolher a intervenção

| Objetivo solicitado | Mudança a considerar | Conferência mínima |
| --- | --- | --- |
| Hierarquia e composição | agrupamento, largura, alinhamento, ritmo e posição da ação | leitura e tarefa nas larguras afetadas |
| Tipografia | papéis, contraste, quebras, comprimento de linha e pesos carregados | texto real, zoom e conteúdo longo |
| Cor e ênfase | papéis semânticos, estados e contraste | claro/escuro quando existirem; estado sem depender só de cor |
| Intensidade visual | aumentar ou reduzir ênfase sem perder a identidade definida | ação principal identificável e conteúdo preservado |
| Simplificação | remover redundância, reorganizar decisões e reduzir passos desnecessários | informação e ações necessárias continuam acessíveis |
| Personalidade | detalhes visuais ou microinterações ligados à marca e ao momento da tarefa | nenhum atraso, distração ou dependência de movimento para concluir |
| Movimento | feedback, transição e continuidade espacial com duração proporcional | teclado, interrupção, movimento reduzido e tarefa sem animação |
| Linguagem da interface | rótulos, instruções, erros, confirmação e próximos passos | significado factual aprovado, leitura e tradução quando aplicável |
| Primeira utilização | entrada na tarefa, estado vazio e ajuda contextual | caminho para valor sem bloqueio desnecessário |
| Adaptação | reflow e reorganização por conteúdo, orientação e tamanho | nenhuma perda de função, foco ou informação |
| Robustez | erro, espera, texto variável, recuperação e dados ausentes | entrada sintética, estados e preservação do progresso |
| Sistema compartilhado | identificar padrões repetidos e consolidar tokens ou componentes quando solicitado | usos migrados sem mudar API, aparência ou comportamento fora do escopo |
| Desempenho da interface | imagens, fontes, renderização ou trabalho de JavaScript apontados por medição | mesma rota, dispositivo e condição antes/depois |

Uma mudança expressiva precisa servir ao produto e ao público. Efeitos, imagens, fontes ou dependências novas exigem motivo concreto, direitos de uso e custo aceitável. Não altere preço, promessa, consentimento ou mensagem jurídica para melhorar aparência.

Em trabalho de acabamento, percorra o fluxo afetado inteiro: alinhamento, consistência de estados, densidade, texto, ícones e comportamento. Para efeitos avançados, implemente uma versão funcional sem o efeito e meça custo de carregamento e fluidez antes de adotá-lo. Um problema técnico fora da interface deve ser encaminhado à responsabilidade correta, sem transformar esta skill em revisão de backend.

## Comparar alternativas

Quando a direção ainda não está decidida e o pedido comporta exploração, prepare duas ou três alternativas **somente para o alvo autorizado**. Varie uma decisão material de cada vez ou explique o conjunto de diferenças; mantenha conteúdo, tarefa e condições de captura comparáveis. Registre para cada opção a intenção, o custo, o que preserva e os estados ainda não verificados. Escolha a melhor opção com base no briefing e na evidência disponível; peça decisão do usuário somente se a preferência mudar materialmente o resultado e não puder ser inferida.

Use os scripts existentes de captura, extração de estilos e comparação para inspecionar alternativas renderizadas em um projeto local autorizado. Eles produzem arquivos para revisão; não oferecem seleção interativa no navegador nem aplicam automaticamente uma variante. Nunca execute o lançador ou os scripts do material de referência externo para preencher essa lacuna.

Para movimento, confirme o comportamento no navegador e sob `prefers-reduced-motion`. Uma captura estática só registra um quadro e não comprova duração, continuidade ou interrupção; relate a observação manual ou a falta dela.

## Registrar o sistema existente quando solicitado

Se a tarefa for documentar a linguagem visual atual, extraia dos arquivos e do render os papéis de cor, tipo, espaço, forma, imagens, componentes e estados. Distinga valores medidos, valores declarados no código e decisões novas. Registre divergências entre tokens e interface; não sobrescreva componentes apenas para fazer a documentação parecer coerente. Crie ou atualize um documento de design somente quando isso fizer parte do pedido, usando o [modelo local](modelo-design-md.md) e o caminho indicado pelo projeto.

## Fechar a entrega

Repita as capturas e medições nas mesmas condições, abra o resultado e teste a tarefa principal, foco, estados afetados, reflow e movimento reduzido quando pertinente. Descreva a mudança em termos do efeito observado, não de uma nota estética inventada. Se houve relatório de auditoria, associe cada arquivo alterado ao ID aprovado e informe qualquer dependência que permaneceu bloqueada.
