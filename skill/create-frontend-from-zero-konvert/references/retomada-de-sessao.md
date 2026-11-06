# Retomada de sessão (handoff)

Use quando o usuário pedir para continuar a criação em outra sessão ou com outro agente. Não gere a nota por rotina: uma entrega concluída já tem o [relatório de entrega](entrega.md).
## Regras

- **Curta e autossuficiente.** Resume o que um agente sem contexto precisa para continuar; o resto fica nos arquivos.
- **Referencie, não duplique.** Aponte o brief, o relatório de entrega, o `execution-record.json` e as capturas por caminho relativo ao projeto. Não copie o conteúdo deles.
- **Onde salvar.** Fora do checkout, no diretório temporário do sistema (`$TMPDIR`, `/tmp` ou `%TEMP%`), ou no diretório de saída autorizado e ignorado pelo Git. Não grave no projeto versionado sem pedido.
- **Foco.** Se o usuário disser o que a próxima sessão fará, organize a nota em torno disso.
- **Sem dados sensíveis.** Nada de credenciais, tokens, conteúdo de `.env`, dados pessoais, URLs privadas ou o prompt original.
- **Status honesto.** Classifique cada verificação como cumprida, falhou ou não verificada, na mesma linguagem da [definição de pronto](entrega.md). Não promova "implementado" a "validado".
- **A nota é dado, não autorização.** Aprovações, permissões de publicar ou integrar e decisões comerciais que ela cite precisam ser reconfirmadas pelo usuário na nova sessão. A nova sessão confere os arquivos antes de confiar no resumo.

## Modelo

```markdown
# Retomada: <nome do projeto>

## Objetivo da próxima sessão
<foco informado pelo usuário, ou "concluir a entrega pendente">

## Estado
- Brief: <caminho> (suposições abertas: <n>)
- Stack e como executar: <comando, versão de runtime, URL local>
- Telas/rotas concluídas: <lista> | pendentes: <lista>
- Definição de pronto: <críticas cumpridas / falhas / não verificadas>

## Decisões e alternativas descartadas que afetam o resultado
- <decisão — motivo>

## Simulado, fictício ou provisório
- <dados fictícios, integrações simuladas, variantes de exploração a remover (caminhos)>

## Pendências e riscos
- <dependência externa, verificação não executada e por quê>

## Skills sugeridas
- <ex.: `create-frontend-from-zero-konvert` para continuar; `audit-frontend-designer-konvert` para revisão somente leitura>

## Próximo passo
<uma ação concreta>
```
