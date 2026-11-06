# Diagnóstico de desempenho da interface

Ative este roteiro quando houver lentidão observada ou um pedido explícito de melhoria de desempenho. A meta é identificar uma causa ligada à tarefa e verificar uma mudança comparável. Um score, uma regra genérica ou uma captura isolada não demonstram causa nem ganho para usuários reais.

## Medir o sintoma certo

Registre rota, tarefa, estado, dispositivo, navegador, versão do build, consentimento, cache e condições de rede antes de comparar. Para lentidão de carregamento, investigue resposta, recursos críticos, imagem principal, fontes e deslocamentos. Para atraso após ação, investigue trabalho de JavaScript, renderização e componentes afetados. Dados de campo, quando disponíveis, descrevem a experiência de um segmento real; medição local ajuda a isolar hipótese e não a substitui.

As ferramentas de captura deste repositório mediam requisições para proteção de rede e podem alterar tempos. Use suas capturas para inspecionar layout e recursos, não como benchmark definitivo de produção. Para tempos de carregamento ou interação, use instrumentação apropriada no ambiente autorizado e registre as condições. Sem medição, classifique a proposta como hipótese.

## Mudar uma causa por vez

Relacione a intervenção ao gargalo observado: dimensões e prioridade de imagens, peso e fallback de fontes, código carregado sem necessidade, atualização excessiva de componentes ou trabalho bloqueante durante interação. Preserve conteúdo, função, analytics e consentimento quando afetados. Não introduza cache de dados pessoais nem altere servidor ou arquitetura de rede apenas para melhorar um número de laboratório sem escopo próprio.

Depois da alteração, repita a medição em condições equivalentes e confira a tarefa, os estados, a estabilidade visual e a qualidade das imagens. Registre valores medidos com unidade, ferramenta e limite de interpretação; se as condições diferirem, não apresente a diferença como ganho causal. Informe também regressões ou etapas ainda sem evidência.
