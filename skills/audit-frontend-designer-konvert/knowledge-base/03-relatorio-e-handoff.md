# Relatório e handoff

O relatório transforma observações da auditoria em um escopo revisável. Ele não altera nem autoriza mudanças no projeto por conta própria.

## Prioridade e confiança

- **P0 — bloqueador crítico:** a tarefa principal está indisponível, há risco grave para pessoas/dados, ou uma falha crítica de acessibilidade impede o uso.
- **P1 — alto:** uma barreira importante afeta uma tarefa central ou grande parte do público.
- **P2 — moderado:** há atrito ou inconsistência que prejudica uma tarefa, com alternativa disponível.
- **P3 — baixo:** melhoria localizada, acabamento ou hipótese que precisa de validação.

Prioridade descreve gravidade provável, não esforço. Registre confiança como `high`, `medium` ou `low` e explique a base: render observado, código, documentação fornecida, pesquisa existente ou hipótese. Não converta prioridade em promessa de resultado.

## Evidência e localização

Use rota, componente, viewport, estado e referência de arquivo quando forem conhecidos. Descreva o que foi observado, sem inferir intenção como fato. Inclua caminhos relativos e nomes de arquivo; não inclua caminhos pessoais absolutos, segredos, conteúdo de cliente ou identificadores de sessão. Uma captura ou medição só conta como evidência se foi gerada e inspecionada nesta auditoria.

## O que preservar

Registre componentes, conteúdo, comportamento, tokens, contratos de dados, integrações, estado de consentimento e decisões de marca que funcionam ou foram explicitamente fixados. O executor trata essa lista como intocável, salvo instrução posterior do usuário.

## Aprovação e dependências

Cada achado deve informar `approved_for_implementation`. Use `false` por padrão. Só marque `true` quando o usuário tiver aprovado aquele achado ou pedido explicitamente a mudança correspondente. Se uma decisão depende de conteúdo, diretrizes da marca, pesquisa com usuários ou aprovação de outra pessoa, registre `external_dependency` com `status: "pending"` e descreva em `detail` o que falta e de quem é. Quando a dependência for atendida, mude para `resolved` e registre em `resolution` a decisão e quem decidiu; sem dependência, use `not_applicable`. A executora só implementa achados aprovados cuja dependência não esteja pendente.

O próximo passo descreve uma ação possível; sua presença não significa autorização. Critérios de aceite devem ser observáveis e ligados à compreensão, percepção, esforço ou conclusão da tarefa. Efeitos psicológicos não testados permanecem hipóteses, nunca fatos sobre todas as pessoas.

## Arquivos e handoff

Entregue `audit-report.md` e `audit-report.json` com o mesmo conjunto de IDs e conteúdo equivalente, e rode `scripts/validate-report.mjs` sobre os dois antes de entregar. Use `.audit/` somente se o diretório estiver ignorado pelo Git; caso contrário, escolha uma saída fora do checkout ou use a pasta indicada pelo usuário. Antes de compartilhar, revise os dois arquivos e as capturas quanto a dados privados.

No handoff, o auditor propõe o executor e destaca achados aprovados, prioridades, itens a preservar, critérios de aceite e dependências. O executor implementa apenas achados aprovados; achados pendentes ficam fora da alteração até o usuário decidir.
