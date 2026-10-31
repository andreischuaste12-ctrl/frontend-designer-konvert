# Contrato de relatório de auditoria

Toda auditoria de design UX/UI concluída produz um relatório em Markdown e outro em JSON, com IDs de achados iguais e conteúdo equivalente. Cubra necessidades do público, jornadas, design visual, interação e psicologia do design. O Markdown serve à revisão; o JSON é a entrada estruturada do handoff para `design-por-referencia-konvert`. As chaves do JSON permanecem em inglês (esquema estável); os valores seguem o idioma do relatório.

## Campos obrigatórios do relatório

O nível superior contém:

- `schema_version`: versão inteira do esquema (`1` neste contrato).
- `report_id`: ID estável e não identificável do relatório.
- `project`: rótulo curto do projeto; não inclua URLs privadas, caminhos pessoais, IDs de conta nem dados de clientes.
- `scope`: rotas, tarefas, viewports, estados e dimensões da auditoria cobertos.
- `evidence_limits`: ferramentas, dados ou verificações indisponíveis e seu efeito na confiança.
- `preserve`: pontos fortes e contratos do projeto inteiro que devem ficar intactos.
- `findings`: lista de achados com os campos abaixo.
- `handoff`: próxima skill proposta e um resumo conciso; isso não autoriza mudanças não aprovadas.

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
| `requires_external_data_or_approval` | `false` ou a descrição do dado/aprovação necessária e de quem é. |
| `approved_for_implementation` | Booleano. Padrão `false`; só `true` quando o usuário aprova explicitamente este achado ou a mudança exata. |

O significado de P0–P3 e as regras de evidência estão na [orientação de relatório e handoff](../knowledge-base/03-relatorio-e-handoff.md). Uma dependência externa deve ser resolvida antes da implementação, mesmo que a aprovação esteja registrada.

## Renderização em Markdown

Inclua o contexto do relatório e os limites de evidência, depois uma seção por achado com todos os campos obrigatórios, seguida dos itens a preservar do projeto inteiro e do handoff proposto. Mantenha IDs e valores do Markdown alinhados ao JSON. Mantenha os achados estritamente sobre UX/UI e psicologia do design. Não inclua edições de código-fonte nem descreva recomendações como trabalho concluído.

## Exemplo

Veja o [relatório em Markdown](../examples/audit-report.example.md) sintético e o [relatório em JSON](../examples/audit-report.example.json) correspondente. Ambos usam detalhes de produto fictícios e não contêm pesquisa real nem resultados de usuário medidos.
