# Como usar unidades de conhecimento

Selecione unidades aplicáveis à tarefa e ao produto; são roteiros de inspeção, não achados nem prova de problema. Capture apenas evidência autorizada e separe o observado da hipótese. Estados inacessíveis ficam nos limites do relatório. Não invente pesquisas nem afirme ter consultado fontes marcadas como não verificadas.

| Unidade | Relatório |
| --- | --- |
| Evidência a coletar | `evidence_observed`, somente após coleta real |
| Prioridade padrão | `priority`, ajustável com justificativa contextual |
| Recomendação | `next_step` |
| Critério de aceite | `acceptance_criteria` |
| Preservar | `preserve` |
| Dependência externa | `external_dependency`, com responsável quando pendente |

Para método `hipótese`, use confiança `low` ou `medium`, registre em `confidence.reason` que exige teste com pessoas e nunca atribua P0 apenas pela hipótese. Em contexto `[comercial]`, comece com dependência pendente; somente o responsável autorizado pode aprovar e resolver condições. Unidades não substituem a aprovação de implementação. O formato completo e os estados do achado estão no [contrato de relatório](contrato-de-relatorio.md).
