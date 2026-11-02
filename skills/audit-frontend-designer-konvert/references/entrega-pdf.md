# Entrega da auditoria em PDF

O PDF é a apresentação para o cliente. Markdown e JSON continuam necessários para revisão, evidência e handoff; o PDF não aprova nem implementa mudanças. O modelo automático usa rótulos em português brasileiro; escreva os valores do relatório em português claro e descreva por achado: o que foi observado, por que importa para a tarefa, como melhorar e como verificar o resultado. Diferencie problema confirmado, oportunidade e hipótese. Não prometa ganhos, invente pesquisa ou oculte lacunas de cobertura. Use rótulos e dados sanitizados, sem dados de clientes ou URLs privadas.

1. Produza e valide `audit-report.json` e `audit-report.md` pelo [contrato](contrato-de-relatorio.md). Revise os textos, a correspondência entre os formatos e os avisos de privacidade: a validação automática não garante a qualidade ou a privacidade do conteúdo.
2. Prepare o navegador conforme [preparo isolado](preparo-do-navegador.md). Use `scriptsDir` retornado como `--browser-scripts`. Quando fornecidos pelo preparo, aplique `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` e `PLAYWRIGHT_BROWSERS_PATH` somente aos comandos que usam navegador.
3. Gere um novo arquivo no diretório autorizado (substitua os caminhos pelos retornados na instalação e no preparo):

```bash
node .agents/skills/audit-frontend-designer-konvert/scripts/render-client-pdf.mjs \
  .audit/audit-report.json --out .audit/audit-report-client.pdf \
  --browser-scripts .agents/skills/design-por-referencia-konvert/scripts
```

O comando lê apenas JSON de esquema 3 válido, renderiza localmente sem buscar recursos de rede e não sobrescreve um PDF existente. Não incorpora capturas automaticamente, pois podem conter dados sensíveis. Avisos de privacidade exigem revisão antes de compartilhar; o detector não substitui revisão humana. Se o cliente solicitar outro idioma, adapte também os rótulos do PDF por um processo de geração revisado; não entregue um documento misturado como traduzido. Se a geração falhar, não afirme ter entregue um PDF: informe a causa e disponibilize os arquivos efetivamente criados.

4. Abra o PDF gerado e confira todas as páginas: seções, texto completo, quebras, legibilidade, prioridades, hipóteses, lacunas e dados sensíveis. Corrija a fonte, valide novamente e gere outro arquivo se necessário. O PDF é uma projeção do JSON; não altera o status de aprovação. Entregue o PDF ao usuário, junto dos arquivos estruturados quando apropriado, sem enviar a terceiros por conta própria. Remova a cópia temporária do navegador após a auditoria, conforme o preparo.
