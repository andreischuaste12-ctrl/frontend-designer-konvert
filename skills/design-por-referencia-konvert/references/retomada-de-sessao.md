# Retomada de sessão (handoff)

Use quando o usuário pedir para continuar uma implementação em outra sessão ou com outro agente. Não gere a nota por rotina: o relatório final e o `execution-record.json` já cobrem uma tarefa concluída.
## Regras

- **Curta e autossuficiente.** Resume o que um agente sem contexto precisa; o resto fica nos arquivos.
- **Referencie, não duplique.** Aponte relatório de auditoria, `DESIGN.md`, `capture-index.json`, `computed-styles.json` e `execution-record.json` por caminho relativo. Não copie o conteúdo.
- **Onde salvar.** Fora do checkout, no diretório temporário do sistema (`$TMPDIR`, `/tmp` ou `%TEMP%`), ou no diretório de saída autorizado e ignorado pelo Git. Não grave no projeto sem pedido.
- **Foco.** Se o usuário disser o que a próxima sessão fará, organize a nota em torno disso.
- **Sem dados sensíveis.** Nada de credenciais, tokens, `.env`, dados pessoais, URLs privadas com query string ou o prompt original.
- **Status honesto.** Marque cada verificação como passou, falhou, bloqueada ou não executada. Critério sem verificação efetiva não vira `passed`.
- **A nota não carrega autorização.** Os IDs de achados aprovados, o nível de fidelidade e o escopo que ela cite são o que o usuário disse na sessão anterior. Reconfirme com o usuário antes de editar e valide de novo o relatório com `--approved-ids`.
- **Linha de base "antes".** Se a edição já começou, registre o diretório das capturas "antes" como baseline imutável. A nova sessão não recaptura o "antes" sobre um projeto já alterado: ela compara o "depois" com aquele diretório.

## Modelo

```markdown
# Retomada: <alvo>

## Objetivo da próxima sessão
<foco informado pelo usuário, ou "concluir o escopo pendente">

## Entrada e escopo
- Fonte: <pedido direto | referência | relatório> (<caminho>)
- Fidelidade: <nível>, quando houver referência
- IDs aprovados segundo o usuário: <IDs> (reconfirmar)
- Intocável (`preserve`): <lista>

## Estado da implementação
- Baseline "antes": <diretório>; rotas, larguras e temas: <lista>
- Arquivos alterados: <caminhos>
- Papéis e tokens mapeados: <resumo ou caminho>
- Feito: <itens> | pendente: <itens>

## Verificações
| Critério ou ID | Resultado | Evidência |
| --- | --- | --- |

## Pendências e riscos
- <dependência externa, estado interativo não medido, limitação de render>

## Skills sugeridas
- <ex.: `design-por-referencia-konvert` para continuar; `audit-frontend-designer-konvert` para nova auditoria somente leitura>

## Próximo passo
<uma ação concreta>
```
