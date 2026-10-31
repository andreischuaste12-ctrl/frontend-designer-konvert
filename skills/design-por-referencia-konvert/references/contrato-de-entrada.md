# Contrato de entrada

Feche estes cinco pontos antes de implementar. Preencha o que o contexto já responde e pergunte apenas o que mudaria o resultado.

## 1. Fonte da referência

O relatório de `audit-frontend-designer-konvert` também pode ser a fonte principal da tarefa. Trate os achados P0–P3 marcados `approved_for_implementation: true` como escopo; os campos `preserve` do relatório são a lista de intocáveis. Implemente somente achados aprovados sem dependência externa pendente. Achados sem aprovação explícita, dependências em aberto e recomendações sem critério de aceite não autorizam edição. Preserve os IDs para ligar mudanças e verificações ao relatório. O formato canônico está em [`contrato de relatório do auditor`](../../audit-frontend-designer-konvert/references/contrato-de-relatorio.md).

| Tipo | Como tratar |
| --- | --- |
| Relatório de auditoria Markdown + JSON | Use o JSON para filtrar escopo e aprovação; confira o Markdown e mantenha IDs, evidências, critérios de aceite e itens a preservar. Pause somente para dependência ou aprovação pendente que altere a implementação. |
| Arquivo ou texto de design (DESIGN.md, guia de estilo) | Fonte principal; leia inteiro antes de extrair. |
| URL pública ou site em execução | Capture e meça conforme [captura e inspeção](captura-e-inspecao.md): estilos computados e CSS viram valores **medidos**; capturas viram leitura visual. Registre a data da consulta. Não leia só o HTML. |
| Captura de tela | Extraia o que é visível; tipografia e valores exatos ficam **inferidos**. |
| Estilo descrito em palavras | Trate como briefing: as decisões de valor são **suas** e devem ser declaradas. |
| Nenhuma | Use os tokens do projeto; não crie referência inexistente. |

Se a fonte não abrir ou não for possível renderizar, diga isso e prossiga com tokens locais. Peça o arquivo, a URL ou as capturas somente se a fidelidade for indispensável.

## 2. Nível de fidelidade

| Nível | Significado | O que pode mudar |
| --- | --- | --- |
| **Inspiração** | Capturar clima e hierarquia. | Quase tudo, desde que a sensação se mantenha. |
| **Adaptação** (padrão) | Reproduzir papéis de cor, tipo, espaço e composição, ajustados ao produto. | Valores que conflitem com tokens, acessibilidade ou conteúdo reais. |
| **Réplica estrutural** | Seguir a referência o mais perto possível em estrutura e valores. | Só marca, textos, imagens e o que for de terceiros. |

Réplica estrutural nunca inclui copiar marca, logotipo, imagens, textos ou dados.

## 3. Escopo

Telas, componentes ou o site inteiro. Liste o que entra e o que fica de fora. Em ajuste pontual, aplique a referência só ao que foi pedido. Para telas, liste as rotas.

## 4. O que é intocável

Marca, copy, tokens, componentes, rotas, contratos de dados e comportamentos que o usuário ou o projeto já fixaram. Em conflito, vale a ordem de precedência do `SKILL.md`.

## 5. Critério de pronto

Como o usuário reconhecerá que ficou certo: telas conferidas, viewports, estados, contraste mínimo, comparação com captura. Se não estiver dito, escolha `rapido` para mudança pontual, `tela` para até três telas e `completo` para site inteiro ou réplica estrutural. Compare a implementação com a referência nas mesmas larguras selecionadas, confira foco/hover e contraste dos controles principais, overflow e erros novos no console. Use a matriz completa de larguras (320, 375, 768, 1024 e 1440 px) quando o escopo ou uma mudança de breakpoint justificar; claro e escuro quando ambos existirem.

## Perguntas mínimas

Faça no máximo cinco perguntas objetivas, de uma vez, com a opção recomendada indicada. Se não houver como perguntar, adote a suposição segura e registre-a no relatório.
