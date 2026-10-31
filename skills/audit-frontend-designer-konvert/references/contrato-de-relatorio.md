# Contrato de relatório de auditoria

Toda auditoria de design UX/UI concluída produz um relatório em Markdown e outro em JSON, com IDs de achados iguais e conteúdo equivalente. Cubra necessidades do público, jornadas, design visual, interação e psicologia do design. O Markdown serve à revisão; o JSON é a entrada estruturada do handoff para `design-por-referencia-konvert`. As chaves do JSON permanecem em inglês (esquema estável); os valores seguem o idioma do relatório.

## Campos obrigatórios do relatório

O nível superior contém:

- `schema_version`: versão inteira do esquema (`3` para relatórios novos). Relatórios `2` continuam aceitos sem metadados estruturados; relatórios `1` também são lidos, mas toda dependência descrita neles conta como pendente. Uma versão antiga não ganha evidência inventada na migração.
- `report_id`: ID estável e não identificável do relatório.
- `project`: rótulo curto do projeto; não inclua URLs privadas, caminhos pessoais, IDs de conta nem dados de clientes.
- `scope`: rotas, tarefas, viewports, estados e dimensões da auditoria cobertos.
- `evidence_limits`: ferramentas, dados ou verificações indisponíveis e seu efeito na confiança.
- `coverage` (opcional, recomendado): matriz do que foi realmente examinado; ver [matriz de cobertura](#matriz-de-cobertura).
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
| `finding_kind` | Na versão 3: `problem` para barreira demonstrada, `opportunity` para melhoria observável, ou `needs_validation` para hipótese ainda não verificada. Preferência pessoal sem relação com a tarefa não é achado. |
| `evidence` | Na versão 3: objeto com `type` (`rendered_capture`, `interaction`, `dom`, `source_code` ou `provided_material`), `source` sanitizada, `state` e `viewport`. Não cite artefato não criado ou não inspecionado. |
| `inference` e `hypothesis` | Na versão 3: texto ou `null` para cada campo. Separe a interpretação da observação do efeito que depende de teste ou dados. |
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

Um achado só é implementável quando `approved_for_implementation` é `true`, `external_dependency.status` não é `pending` **e** o ID corresponde à autorização independente do usuário. Aprovação não resolve dependência, e dependência resolvida não equivale a aprovação. Só registre `resolved` com a decisão vinda do usuário ou do responsável indicado; não deduza a resolução.

Na versão 3, `needs_validation` não pode ser marcado como aprovado para implementação. Primeiro obtenha a validação e reclassifique o achado com nova evidência. `opportunity` ainda exige aprovação e critério de aceite; não o apresente como defeito confirmado.

O significado de P0–P3 e as regras de evidência estão na [orientação de relatório e handoff](../knowledge-base/03-relatorio-e-handoff.md).

## Validação

Antes de entregar, valide os dois arquivos:

```bash
node .agents/skills/audit-frontend-designer-konvert/scripts/validate-report.mjs .audit/audit-report.json --markdown .audit/audit-report.md
```

Execute na raiz do projeto auditado, trocando `.agents/skills` pela pasta onde a skill foi instalada (por exemplo `.claude/skills`). O script só lê arquivos e não precisa de dependências além do Node.js 20+. O validador confere campos, estados de dependência, IDs únicos, o espelhamento dos IDs no Markdown e sinais de dados privados (emails, tokens e parâmetros sensíveis bloqueiam; caminhos pessoais geram aviso). `--implementable --approved-ids UX-001,UX-002` lista a interseção entre achados elegíveis e IDs autorizados diretamente pelo usuário; sem IDs independentes, nenhum achado é liberado. A ferramenta não autentica a autorização, que deve ser confirmada na conversa. Ele não julga a qualidade do conteúdo; isso continua exigindo revisão.

## Matriz de cobertura

`scope` diz o que a auditoria pretendia cobrir; `coverage` registra o que foi **realmente examinado**, para que lacunas e omissões fiquem demonstráveis. É proporcional ao escopo combinado: inclua só as combinações de página ou fluxo, tarefa, estado e viewport que estavam no escopo, nunca o catálogo inteiro. Ausente, o relatório continua válido em `schema_version: 2`.

| Campo | Valor |
| --- | --- |
| `area` | Página ou fluxo, como "Página de produto" ou "Checkout". |
| `task` | Tarefa ou jornada, como "Comparar opções" ou "Recuperar de erro". |
| `state` | `normal`, `carregando`, `erro`, `sucesso`, `vazio` ou `recuperação`. |
| `viewport` | Largura ou classe de dispositivo, como "375 px", "1440 px" ou "todos". |
| `stack` | Opcional; só quando identificada e relevante. |
| `result` | `observed`, `not_observed`, `not_applicable` ou `blocked`. |
| `evidence` | Obrigatório quando `observed`: captura, interação testada ou arquivo lido. |
| `reason` | Obrigatório nos demais resultados: por que não foi observado, não se aplica ou ficou bloqueado. |
| `findings` | Opcional; IDs de achados ligados à linha, somente com `observed`. |

Use `not_observed` quando o estado existe mas não foi examinado (tempo, ferramenta, dado sintético), e `blocked` quando foi impedido (acesso, autorização, ambiente). Uma linha `observed` sem achado registra que nada relevante foi encontrado ali, e isso também é informação. Cada combinação de página, tarefa, estado e viewport aparece uma vez.

## Renderização em Markdown

Para a versão 3, cada achado também traz `- **Classe:** problema|oportunidade|a validar`, `- **Fonte da evidência:** <tipo> — <fonte>; estado <estado>; viewport <viewport>`, `- **Inferência:** <texto|nenhuma>` e `- **Hipótese:** <texto|nenhuma>`. Os tipos em português são `captura`, `interação`, `DOM`, `código` e `material fornecido`. Esses campos espelham o JSON; não substituem a evidência observada.

Cada achado usa um cabeçalho `### UX-001` seguido de itens `- **Rótulo:** valor`. Os rótulos verificados são `Prioridade`, `Local`, `Evidência observada`, `Impacto provável`, `Próximo passo`, `Critério de aceite`, `Dependência externa` e `Aprovado para implementação`. O validador normaliza espaços e quebras de linha nos campos textuais e aceita escapes Markdown comuns; os valores devem corresponder ao JSON. O estado da dependência usa `pendente`, `resolvida` ou `não aplicável`; aprovação usa `true` ou `false`. `Confiança` começa com `alta`, `média` ou `baixa`, seguida de ` — ` e do motivo do JSON; `Preservar` lista, em uma linha, todos os itens do `preserve` do achado. A seção `## O que preservar` contém todos os itens do `preserve` geral. Com `coverage`, a seção `## Cobertura` traz uma tabela com as colunas Página ou fluxo, Tarefa, Estado, Viewport, Stack, Resultado (`observado`, `não observado`, `não se aplica`, `bloqueado`), Evidência ou motivo e Achados, uma linha por item do JSON.

Inclua o contexto do relatório e os limites de evidência, depois uma seção por achado com todos os campos obrigatórios, seguida dos itens a preservar do projeto inteiro e do handoff proposto. Mantenha IDs e valores do Markdown alinhados ao JSON. Mantenha os achados estritamente sobre UX/UI e psicologia do design. Não inclua edições de código-fonte nem descreva recomendações como trabalho concluído.

## Exemplo

Veja o [relatório em Markdown](../examples/audit-report.example.md) sintético e o [relatório em JSON](../examples/audit-report.example.json) correspondente. Ambos usam detalhes de produto fictícios e não contêm pesquisa real nem resultados de usuário medidos.

O Markdown e o JSON são verificados por ID, prioridade, aprovação, dependência, campos textuais principais, confiança, listas de preservação (de cada achado e geral) e linhas de cobertura. Na versão 3, classe, fonte da evidência, inferência e hipótese também precisam coincidir. A pessoa aprova lendo o Markdown e a executora lê o JSON, então divergências bloqueiam a validação. Equivalência semântica ainda exige revisão humana. A checagem de privacidade é melhor esforço, não garantia.

As [unidades de conhecimento](unidades-de-conhecimento.md) orientam a inspeção e a correspondência com os campos; apenas evidência efetivamente coletada pode integrar um achado.

O campo opcional de nível superior `stack` tem `name` e `reason` não vazios e `level` igual a `signal`, `likely` ou `confirmed`. Confirme apenas por inspeção real do projeto; o detector nunca confirma e a justificativa deve indicar evidência, sem dados privados. Relatórios v2 sem esse campo continuam válidos.
