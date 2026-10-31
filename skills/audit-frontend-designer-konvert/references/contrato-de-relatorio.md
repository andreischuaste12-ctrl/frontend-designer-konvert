# Contrato de relatório de auditoria

Toda auditoria de design UX/UI concluída produz um relatório em Markdown e outro em JSON, com IDs de achados iguais e conteúdo equivalente. Cubra necessidades do público, jornadas, design visual, interação e psicologia do design. O Markdown serve à revisão; o JSON é a entrada estruturada do handoff para `design-por-referencia-konvert`. As chaves do JSON permanecem em inglês (esquema estável); os valores seguem o idioma do relatório.

## Campos obrigatórios do relatório

O nível superior contém:

- `schema_version`: versão inteira do esquema (`2` neste contrato). Relatórios `1` ainda são lidos, mas toda dependência descrita neles conta como pendente.
- `report_id`: ID estável e não identificável do relatório.
- `project`: rótulo curto do projeto; não inclua URLs privadas, caminhos pessoais, IDs de conta nem dados de clientes.
- `scope`: rotas, tarefas, viewports, estados e dimensões da auditoria cobertos.
- `evidence_limits`: ferramentas, dados ou verificações indisponíveis e seu efeito na confiança.
- `preserve`: pontos fortes e contratos do projeto inteiro que devem ficar intactos.
- `findings`: lista de achados com os campos abaixo.
- `handoff`: objeto com `proposed_skill` (`design-por-referencia-konvert`), `summary` conciso e `implementation_performed: false`; isso não autoriza mudanças não aprovadas.

## Campos obrigatórios de cada achado

Cada achado deve conter:

| Campo | Valor obrigatório |
| --- | --- |
| `id` | Identificador estável e único no relatório, como `UX-001`. |
| `priority` | Um entre `P0`, `P1`, `P2`, `P3`. |
| `location` | Rota/componente/elemento/viewport ou caminho relativo no código; use `unknown` se indisponível. |
| `evidence_observed` | Evidência direta e sua fonte. Rotule claramente inferência ou hipótese. |
| `probable_impact` | Efeito provável na compreensão, percepção, confiança, esforço ou capacidade de concluir uma tarefa. Marque como hipótese os efeitos psicológicos não testados. |
| `confidence` | Objeto com `level` (`high`, `medium` ou `low`) e `reason` curto. |
| `preserve` | Comportamento, conteúdo, componente, marca, integração ou contrato que não deve mudar neste achado. |
| `next_step` | Ação concreta proposta. Uma recomendação não é aprovação. |
| `acceptance_criteria` | Condição observável de uma mudança bem-sucedida. |
| `external_dependency` | Objeto com `status` e, conforme o estado, `detail` e `resolution` (tabela abaixo). |
| `approved_for_implementation` | Booleano. Padrão `false`; só `true` quando o usuário aprova explicitamente este achado ou a mudança exata. |

## Dependência externa

| `status` | Quando usar | Campos exigidos |
| --- | --- | --- |
| `not_applicable` | O achado não depende de dado, conteúdo, pesquisa ou aprovação de terceiros. | nenhum |
| `pending` | Falta um dado ou uma decisão de outra pessoa. | `detail`: o que falta e de quem é |
| `resolved` | A dependência foi atendida. | `detail` e `resolution`: a decisão tomada e quem decidiu |

Um achado só é implementável quando `approved_for_implementation` é `true` **e** `external_dependency.status` não é `pending`. Aprovação não resolve dependência, e dependência resolvida não equivale a aprovação. Só registre `resolved` com a decisão vinda do usuário ou do responsável indicado; não deduza a resolução.

O significado de P0–P3 e as regras de evidência estão na [orientação de relatório e handoff](../knowledge-base/03-relatorio-e-handoff.md).

## Validação

Antes de entregar, valide os dois arquivos:

```bash
node .agents/skills/audit-frontend-designer-konvert/scripts/validate-report.mjs .audit/audit-report.json --markdown .audit/audit-report.md
```

Execute na raiz do projeto auditado, trocando `.agents/skills` pela pasta onde a skill foi instalada (por exemplo `.claude/skills`). O script só lê arquivos e não precisa de dependências além do Node.js 20+. O validador confere campos, estados de dependência, IDs únicos, o espelhamento dos IDs no Markdown e sinais de dados privados (emails, tokens e parâmetros sensíveis bloqueiam; caminhos pessoais geram aviso). `--implementable` lista em JSON os achados que a executora pode implementar e o motivo de cada bloqueio. Ele não julga a qualidade do conteúdo; isso continua exigindo revisão.

## Renderização em Markdown

Inclua o contexto do relatório e os limites de evidência, depois uma seção por achado com todos os campos obrigatórios, seguida dos itens a preservar do projeto inteiro e do handoff proposto. Mantenha IDs e valores do Markdown alinhados ao JSON. Mantenha os achados estritamente sobre UX/UI e psicologia do design. Não inclua edições de código-fonte nem descreva recomendações como trabalho concluído.

## Exemplo

Veja o [relatório em Markdown](../examples/audit-report.example.md) sintético e o [relatório em JSON](../examples/audit-report.example.json) correspondente. Ambos usam detalhes de produto fictícios e não contêm pesquisa real nem resultados de usuário medidos.
