# Contrato de entrada

Feche estes cinco pontos antes de implementar. Preencha o que o contexto já responde e pergunte apenas o que mudaria o resultado.

## 1. Fonte da referência

O relatório de `audit-frontend-designer-konvert` também pode ser a fonte principal da tarefa. Trate os achados P0–P3 marcados `approved_for_implementation: true` como escopo; os campos `preserve` do relatório são a lista de intocáveis. Implemente somente achados aprovados cuja `external_dependency.status` seja `not_applicable` ou `resolved`; `pending` bloqueia o achado mesmo com aprovação. Em relatórios `schema_version: 1`, qualquer texto em `requires_external_data_or_approval` conta como pendente. Achados sem aprovação explícita, dependências em aberto e recomendações sem critério de aceite não autorizam edição. Preserve os IDs para ligar mudanças e verificações ao relatório. O formato canônico está em [`contrato de relatório do auditor`](../../audit-frontend-designer-konvert/references/contrato-de-relatorio.md). Um pedido direto do usuário para ajustar um alvo existente é outra entrada válida; ele não aprova automaticamente achados que ficaram fora do pedido.

| Tipo | Como tratar |
| --- | --- |
| Pedido direto de refinamento | Use a tela, o componente ou o comportamento nomeado como escopo. Registre o resultado esperado e o que deve ser preservado; sem referência visual, não invente valores a extrair nem declare fidelidade a uma fonte ausente. Siga [refinamento de interface](refinamento-de-interface.md). |
| Relatório de auditoria Markdown + JSON | O handoff formal exige a auditora com contrato e validadores disponíveis. Valide e filtre com `validate-report.mjs <relatorio.json> --markdown <md> --implementable --approved-ids <ids>`; os IDs devem corresponder à autorização do usuário, não apenas ao relatório. Confira o Markdown e mantenha IDs, evidências, critérios de aceite e itens a preservar. Relatório inválido ou sem achados implementáveis não autoriza edição. Se os recursos da auditora faltarem, registre o gate como bloqueado e não afirme validação; uma tarefa direta separadamente autorizada pode prosseguir no seu próprio escopo sem se apresentar como handoff validado. |
| Arquivo ou texto de design (DESIGN.md, guia de estilo) | Fonte principal; leia inteiro antes de extrair. |
| URL pública ou site em execução | Capture e meça conforme [captura e inspeção](captura-e-inspecao.md): estilos computados e CSS viram valores **medidos**; capturas viram leitura visual. Registre a data da consulta. Não leia só o HTML. |
| Captura de tela | Extraia o que é visível; tipografia e valores exatos ficam **inferidos**. |
| Estilo descrito em palavras | Trate como briefing: as decisões de valor são **suas** e devem ser declaradas. |
| Nenhuma | Use os tokens do projeto; não crie referência inexistente. |

Se a fonte não abrir ou não for possível renderizar, use primeiro uma ferramenta de navegador autorizada ou capturas já fornecidas. Quando insuficientes, prossiga com a evidência e os tokens locais apenas no escopo viável, registre o que não foi observado e não declare fidelidade sem comparação. Peça acesso ou capturas somente se indispensáveis e ausentes.

## 2. Nível de fidelidade

Esta escala se aplica quando há referência visual. Em pedido direto de refinamento sem referência, use o resultado observável e os limites do pedido no lugar de uma promessa de fidelidade.

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

Como o usuário reconhecerá que ficou certo: telas conferidas, viewports, estados, contraste mínimo e comparação com o estado anterior ou com a referência disponível. Se não estiver dito, escolha `rapido` para mudança pontual, `tela` para até três telas e `completo` para site inteiro ou réplica estrutural. Compare a implementação nas mesmas larguras selecionadas, confira foco/hover e contraste dos controles principais, overflow e erros novos no console. Use a matriz completa de larguras (320, 375, 768, 1024 e 1440 px) quando o escopo ou uma mudança de breakpoint justificar; claro e escuro quando ambos existirem.

## Perguntas mínimas

Faça no máximo cinco perguntas objetivas, de uma vez, com a opção recomendada indicada. Se não houver como perguntar, adote a suposição segura e registre-a no relatório.

- Procure a resposta no projeto, na referência e nas capturas antes de perguntar; só a decisão é do usuário.
- Agrupe apenas perguntas independentes. Se a resposta de uma altera outra (por exemplo, o nível de fidelidade define se o conteúdo pode mudar), deixe a dependente para a rodada seguinte.
- Numere as perguntas e formule cada uma de modo que "sim" aceite a opção recomendada.
- Não edite a parte que depende de uma resposta pendente; avance no que não depende.
