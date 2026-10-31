---
name: audit-frontend-designer-konvert
description: Audit an existing frontend as a read-only UX/UI design reviewer. Assess audience needs, user journeys, visual hierarchy, interaction patterns, accessibility as experienced in the interface, and evidence-informed design psychology; preserve strengths and produce a structured Markdown and JSON report. This skill is limited to experience and interface design; use design-por-referencia-konvert to reproduce or implement a visual reference.
---

# Auditoria de frontend (UX/UI)

Esta skill é a auditora somente leitura de um fluxo com duas skills. Ela inspeciona o projeto, reúne evidências, prioriza achados e escreve um relatório. **Nunca edite o projeto auditado, instale dependências nem implemente uma recomendação.**

**Diretório de saída autorizado:** `.audit/` do projeto, desde que ignorado pelo Git (`git check-ignore .audit/`), ou um destino indicado pelo usuário. Se `.audit/` não estiver ignorado, use um local fora do checkout ou pergunte o destino; não altere o `.gitignore` do projeto auditado. Só estes arquivos podem ser gravados, e apenas nesse diretório:

- o relatório (`audit-report.md` e `audit-report.json`);
- as evidências geradas pelos scripts de captura e inspeção (capturas, `capture-index.json`, `computed-styles.json`, manifesto de imagens e seus resumos).

Qualquer outra escrita, inclusive dentro do projeto auditado, está fora do escopo.

Para reproduzir uma referência visual, use [`design-por-referencia-konvert`](../design-por-referencia-konvert/SKILL.md). Para implementar após a auditoria, entregue o relatório a essa executora; não faça as mudanças você mesmo.

## Fluxo

1. **Estabelecer limites.** Leia as instruções e a documentação do repositório. Identifique páginas, rotas, tarefas de usuário e o ambiente permitido. Não leia secrets, não envie formulários, não faça compras nem dispare ações em produção.
2. **Entender produto e público.** Use textos do produto, navegação, pesquisas e estudos de usabilidade existentes e o comportamento da interface como evidência. Separe observação direta, fatos fornecidos e hipóteses. Não invente personas, dados demográficos nem pesquisa com usuários.
3. **Inspecionar a experiência como design.** Siga as jornadas mais importantes disponíveis. Avalie UX, UI, hierarquia visual, legibilidade, composição, padrões de interação, confiança percebida, clareza, feedback, uso em mobile, movimento e acessibilidade no nível do design. Use carga cognitiva, atenção, reconhecimento, modelos mentais e clareza de decisão como lentes para formar hipóteses testáveis, nunca como leis universais ou diagnósticos. Registre pontos fortes e o que deve ser preservado. Mantenha os achados sobre experiência e interface, não sobre trabalho de implementação.
4. **Coletar evidência renderizada.** Quando houver evidência renderizada relevante, a auditoria depende dos scripts de captura e inspeção de [`design-por-referencia-konvert`](../design-por-referencia-konvert/SKILL.md). Use `capture.mjs`, `extract-styles.mjs` e, quando útil, `image-manifest.mjs`, sempre com `--out` apontando para o diretório de saída autorizado. Leia [captura e inspeção](../design-por-referencia-konvert/references/captura-e-inspecao.md) e respeite seus limites de rede e privacidade. Se a skill ou os scripts não estiverem instalados ou não rodarem, não os instale automaticamente: use a inspeção somente leitura disponível, registre a evidência ausente e o efeito na confiança, e nunca declare que uma captura ou medição foi feita.
5. **Pesquisar referências quando útil.** Use o [catálogo de referências](knowledge-base/02-catalogo-de-referencias.md) para encontrar padrões comparáveis. Informe quais páginas você de fato abriu e qual padrão é relevante. Galerias são inspiração, não prova de usabilidade nem permissão para copiar.
6. **Priorizar achados.** Aplique o [método de auditoria e público](knowledge-base/01-auditoria-estetica-e-publico.md) e use os [princípios por problema](knowledge-base/04-principios-por-problema.md) para saber o que observar, que evidência buscar e como validar cada hipótese. Dê a cada achado um ID estável, prioridade P0–P3, local, evidência observada, impacto provável, confiança, o que preservar, próximo passo, critério de aceite, o estado da dependência externa (`not_applicable`, `pending` ou `resolved`) e se a implementação está aprovada. Não prometa resultado de negócio sem medição.
7. **Produzir o relatório e propor o handoff.** Siga o [contrato de relatório](references/contrato-de-relatorio.md), incluindo Markdown e JSON, a [orientação de relatório e handoff](knowledge-base/03-relatorio-e-handoff.md) e o [exemplo sintético](examples/audit-report.example.md). Salve o relatório no diretório de saída autorizado e valide-o com [`scripts/validate-report.mjs`](scripts/validate-report.mjs) (`--markdown` confere o espelhamento dos IDs); corrija os erros antes de entregar e trate os avisos de privacidade. Se o Node.js não estiver disponível, confira o contrato manualmente e declare que a validação não foi executada. Marque `approved_for_implementation: false`, a menos que o usuário tenha aprovado explicitamente o achado ou pedido exatamente aquela mudança. Resuma o handoff para `design-por-referencia-konvert`, indicando quais achados já são implementáveis; não o implemente.

## Princípios de design

- Vincule cada achado a uma tarefa real do usuário, a uma rota ou a um comportamento observável da interface.
- Preserve conteúdo, interação, identidade visual e padrões de design que funcionam, e declare isso explicitamente.
- Distinga observação de inferência e de hipótese, e calibre a confiança pela evidência disponível.
- Prefira próximos passos específicos e testáveis a preferência estética ou conselho genérico.
- Considere a perceptibilidade e a facilidade de uso com teclado, toque, zoom, contraste, movimento reduzido e estados responsivos. Relate observações de design sem afirmar certificação de conformidade técnica.
- Fundamente observações de psicologia em sinais visíveis da interface e em pesquisa consolidada. Trate efeitos prováveis como hipóteses até serem validados com usuários; nunca assuma que uma regra cognitiva vale para todos.
- Trate galerias de referência como inspiração. Não copie texto, identidade, ilustrações nem composições distintivas de terceiros.
- Proteja a privacidade: use dados sintéticos, mantenha artefatos fora do Git, redija o conteúdo do relatório e revise capturas antes de compartilhar.

## Estudos de UX e psicologia

Use a [base de estudos de UX/UI e psicologia](knowledge-base/05-estudos-ux-ui-psicologia.md) para formular perguntas e hipóteses. Os resumos recebidos são provisórios até a conferência das fontes originais; não afirme ter lido fontes inacessíveis.

## Catálogo de referências

Use o [catálogo categorizado de referências de design frontend](knowledge-base/02-catalogo-de-referencias.md) para achar fontes relevantes ao produto e à pergunta da auditoria. Registre a URL e o padrão específico apenas quando a fonte foi realmente aberta. Aplique orientações consolidadas de usabilidade e acessibilidade mesmo sem navegação.

## Formato do relatório

Entregue Markdown e JSON conforme o [contrato de relatório](references/contrato-de-relatorio.md) (`schema_version: 2`). Inclua escopo da auditoria e limites de evidência, achados P0–P3, o que funciona e deve ser preservado, critérios de aceite, o estado de cada dependência externa e a aprovação de implementação por achado. Termine com uma proposta de handoff. Nenhuma implementação, arquivo alterado do projeto ou afirmação de resultado sem medição entra no relatório.
