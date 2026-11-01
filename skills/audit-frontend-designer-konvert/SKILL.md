---
name: audit-frontend-designer-konvert
description: Audit an existing frontend as a read-only UX/UI design reviewer. Assess audience needs, user journeys, visual hierarchy, interaction patterns, accessibility as experienced in the interface, and evidence-informed design psychology; preserve strengths and produce a structured Markdown and JSON report. Use design-por-referencia-konvert for directly requested changes, visual reproduction, or approved implementation.
---

# Auditoria de frontend (UX/UI)

Esta skill é a auditora somente leitura do fluxo de três skills. Ela inspeciona o projeto, reúne evidências, prioriza achados e escreve um relatório. **Nunca edite o projeto auditado, instale dependências nele nem implemente uma recomendação.** Playwright e Chromium podem ser preparados em um runtime temporário fora do checkout por [preparo isolado do navegador](references/preparo-do-navegador.md).

**Diretório de saída autorizado:** `.audit/` do projeto, desde que ignorado pelo Git (`git check-ignore .audit/`), ou um destino indicado pelo usuário. Se `.audit/` não estiver ignorado, use um local fora do checkout ou pergunte o destino; não altere o `.gitignore` do projeto auditado. Só estes arquivos podem ser gravados, e apenas nesse diretório:

- o relatório (`audit-report.md` e `audit-report.json`) e o registro mínimo `execution-record.json`;
- as evidências geradas pelos scripts de captura e inspeção (capturas, `capture-index.json`, `computed-styles.json`, manifesto de imagens e seus resumos).

Fora do projeto auditado, o preparo do navegador pode gravar apenas uma cópia temporária das ferramentas e o cache necessário do Chromium. Remova a cópia temporária após a auditoria. Qualquer outra escrita dentro do projeto auditado está fora do escopo.

Para reproduzir uma referência visual, use [`design-por-referencia-konvert`](../design-por-referencia-konvert/SKILL.md). Para implementar após a auditoria, entregue o relatório a essa executora; não faça as mudanças você mesmo.

## Fluxo

1. **Estabelecer limites.** Leia as instruções e a documentação do repositório. Identifique páginas, rotas, tarefas de usuário e o ambiente permitido. Anote quais páginas e interações foram autorizadas; não amplie o escopo por redirecionamento ou link descoberto. Não leia secrets nem faça compras ou envios em produção. Para inspecionar validação de formulário, interaja apenas em ambiente local ou de teste autorizado, com dados sintéticos e sem efeitos externos ou persistentes; caso contrário, registre o estado como bloqueado.
2. **Entender produto e público.** Use textos do produto, navegação, pesquisas e estudos de usabilidade existentes e o comportamento da interface como evidência. Separe observação direta, fatos fornecidos e hipóteses. Não invente personas, dados demográficos nem pesquisa com usuários.
3. **Inspecionar a experiência como design.** Siga as jornadas mais importantes disponíveis. Avalie UX, UI, hierarquia visual, legibilidade, composição, padrões de interação, confiança percebida, clareza, feedback, uso em mobile, movimento e acessibilidade no nível do design. Use carga cognitiva, atenção, reconhecimento, modelos mentais e clareza de decisão como lentes para formar hipóteses testáveis, nunca como leis universais ou diagnósticos. Registre pontos fortes e o que deve ser preservado. Mantenha os achados sobre experiência e interface, não sobre trabalho de implementação.
4. **Coletar evidência renderizada.** Antes de concluir que o navegador falta, siga [preparo isolado do navegador](references/preparo-do-navegador.md): verifique Playwright/Chromium, use o navegador funcional já presente ou prepare uma cópia temporária das ferramentas fora do projeto com `--install`. A auditoria usa `capture.mjs`, `extract-styles.mjs` e, quando útil, `image-manifest.mjs` de [`design-por-referencia-konvert`](../design-por-referencia-konvert/SKILL.md), sempre com `--out` no destino autorizado e `--block-writes` por padrão. Leia [captura e inspeção](../design-por-referencia-konvert/references/captura-e-inspecao.md) e respeite limites de rede e privacidade. Se o bloqueio impedir dados necessários para renderizar, registre a lacuna; só desative a opção em ambiente de teste autorizado e com dados sintéticos. Se o preparo falhar, identifique separadamente capturas fornecidas pelo usuário; marque como não observados ou bloqueados os estados sem evidência visual, reduza a confiança conforme a lacuna e não declare captura própria, interação ou medição que não ocorreu.
5. **Pesquisar referências quando útil.** Use o [catálogo de referências](knowledge-base/02-catalogo-de-referencias.md) para encontrar padrões comparáveis. Informe quais páginas você de fato abriu e qual padrão é relevante. Galerias são inspiração, não prova de usabilidade nem permissão para copiar.
6. **Priorizar achados.** Aplique o [método de auditoria e público](knowledge-base/01-auditoria-estetica-e-publico.md), o [protocolo de rigor](references/protocolo-de-rigor.md) e os [princípios por problema](knowledge-base/04-principios-por-problema.md) para saber o que observar, que evidência buscar e como validar cada hipótese. Dê a cada achado um ID estável, classe (`problem`, `opportunity` ou `needs_validation`), prioridade P0–P3, local, evidência observada com fonte/estado/viewport, inferência e hipótese separadas, impacto provável, confiança, o que preservar, próximo passo, critério de aceite, o estado da dependência externa (`not_applicable`, `pending` ou `resolved`) e se a implementação está aprovada. Não transforme preferência pessoal em achado nem prometa resultado de negócio sem medição.
7. **Registrar a cobertura.** Para cada combinação de página ou fluxo, tarefa, estado e viewport do escopo, registre em `coverage` se foi observada (com a evidência) ou não observada, não aplicável ou bloqueada (com o motivo). Cada achado v3 precisa estar ligado a pelo menos uma linha observada do mesmo estado e viewport. Proporcional ao escopo: não transforme o catálogo em checklist e não omita uma lacuna para parecer completo.
8. **Produzir o relatório e propor o handoff.** Siga o [contrato de relatório](references/contrato-de-relatorio.md), incluindo Markdown e JSON, a [orientação de relatório e handoff](knowledge-base/03-relatorio-e-handoff.md) e o [exemplo sintético](examples/audit-report.example.md). Salve o relatório no diretório de saída autorizado e valide-o com [`scripts/validate-report.mjs`](scripts/validate-report.mjs) (`--markdown` confere IDs, campos críticos e sinais de dados privados; equivalência semântica ainda exige revisão); corrija os erros antes de entregar e trate os avisos de privacidade. Se o Node.js não estiver disponível, confira o contrato manualmente e declare que a validação não foi executada. Marque `approved_for_implementation: false`, a menos que o usuário tenha aprovado explicitamente o achado ou pedido exatamente aquela mudança. Resuma o handoff para `design-por-referencia-konvert`, indicando quais achados já são implementáveis; não o implemente.

9. **Registrar a execução sem dados privados.** Anote em `execution-record.json` apenas tarefas, áreas, estados realmente inspecionados, decisões, ações bloqueadas e limites; não guarde prompt, URL bruta, sessão nem dados de clientes. Use [registro de execução](references/registro-de-execucao.md) e valide com [`scripts/validate-execution-record.mjs`](scripts/validate-execution-record.mjs). Revise as capturas separadamente antes de compartilhá-las.

## Princípios de design

- Vincule cada achado a uma tarefa real do usuário, a uma rota ou a um comportamento observável da interface.
- Preserve conteúdo, interação, identidade visual e padrões de design que funcionam, e declare isso explicitamente.
- Distinga observação de inferência e de hipótese, e calibre a confiança pela evidência disponível.
- Antes de concluir que um problema existe, confirme o estado no render ou no código apropriado, procure explicações alternativas e verifique se não é uma escolha legítima do produto. Se a observação não sustenta a conclusão, use `needs_validation` ou não registre o achado. Sem navegador, uma captura fornecida pode sustentar o estado que mostra, mas não prova estados interativos ou larguras que não aparecem nela.
- Prefira próximos passos específicos e testáveis a preferência estética ou conselho genérico.
- Considere a perceptibilidade e a facilidade de uso com teclado, toque, zoom, contraste, movimento reduzido e estados responsivos. Relate observações de design sem afirmar certificação de conformidade técnica.
- Fundamente observações de psicologia em sinais visíveis da interface e em pesquisa consolidada. Trate efeitos prováveis como hipóteses até serem validados com usuários; nunca assuma que uma regra cognitiva vale para todos.
- Trate galerias de referência como inspiração. Não copie texto, identidade, ilustrações nem composições distintivas de terceiros.
- Proteja a privacidade: use dados sintéticos, mantenha artefatos fora do Git, redija o conteúdo do relatório e revise capturas antes de compartilhar.

## Roteiros por produto

Adapte a inspeção à tarefa com os roteiros de [e-commerce](knowledge-base/06-padroes-ecommerce.md), [SaaS](knowledge-base/07-padroes-saas.md) e [sites institucionais](knowledge-base/08-padroes-institucional.md). São heurísticas; confirme as hipóteses com evidências adequadas. Para avaliar hierarquia, consistência, movimento e acabamento sem presumir defeitos, use a [inspeção visual orientada à tarefa](knowledge-base/12-inspecao-visual-orientada-a-tarefa.md). Para estados da jornada consulte [jornadas e estados](knowledge-base/09-jornadas-e-estados.md), consulte os [padrões específicos](knowledge-base/10-padroes-detalhados.md), selecione as unidades aplicáveis e siga [unidades de conhecimento](references/unidades-de-conhecimento.md) ao formular achados, ajustando prioridade com justificativa. Depois de confirmar a stack pela inspeção do projeto, use as [jornadas por stack](knowledge-base/11-jornadas-por-stack.md) para indicar onde cada correção acontece e quem decide; o resultado do detector sozinho não confirma a stack.

## Estudos de UX e psicologia

Use a [base de estudos de UX/UI e psicologia](knowledge-base/05-estudos-ux-ui-psicologia.md) para formular perguntas e hipóteses. Os resumos recebidos são provisórios até a conferência das fontes originais; não afirme ter lido fontes inacessíveis.

## Catálogo de referências

Use o [catálogo categorizado de referências de design frontend](knowledge-base/02-catalogo-de-referencias.md) para achar fontes relevantes ao produto e à pergunta da auditoria. Registre a URL e o padrão específico apenas quando a fonte foi realmente aberta. Aplique orientações consolidadas de usabilidade e acessibilidade mesmo sem navegação.

## Formato do relatório

Entregue Markdown e JSON conforme o [contrato de relatório](references/contrato-de-relatorio.md) (`schema_version: 3`). Inclua escopo da auditoria e limites de evidência, achados P0–P3, o que funciona e deve ser preservado, critérios de aceite, o estado de cada dependência externa e a aprovação de implementação por achado. Termine com uma proposta de handoff. Nenhuma implementação, arquivo alterado do projeto ou afirmação de resultado sem medição entra no relatório.
