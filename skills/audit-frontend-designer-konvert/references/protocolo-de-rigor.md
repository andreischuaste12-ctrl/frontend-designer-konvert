# Protocolo de rigor da auditoria

A auditoria deve ser reproduzível e proporcional ao escopo, sem prometer ausência absoluta de erros. Um relatório passa pelo validador estrutural e por revisão crítica da evidência; nenhum dos dois substitui pesquisa com usuários, navegador real ou julgamento contextual.

## Antes de registrar um achado

1. **Defina a tarefa e a pessoa afetada.** Use público e objetivos fornecidos ou observáveis. Marque suposições; não invente dados de uso, conversão ou pesquisa.
2. **Fixe a condição observada.** Anote página ou fluxo, estado, viewport, tema, autenticação e data quando fizerem diferença. Confirme que o conteúdo esperado carregou e que erros de recurso não tornaram a captura incompleta.
3. **Reproduza a observação.** Abra o render ou leia o trecho de código pertinente. Uma regra de CSS isolada pode ser sobrescrita; uma captura isolada não prova o estado de foco, erro ou movimento. Use uma segunda fonte quando a conclusão depender disso.
4. **Procure uma explicação alternativa.** Verifique semântica nativa, componentes compartilhados, estilos herdados, variantes e uma possível escolha legítima do produto. Não transforme preferência estética em defeito.
5. **Separe fato, interpretação e hipótese.** `evidence_observed` descreve o fato; `inference` explica a relação com a tarefa; `hypothesis` guarda efeitos ainda não medidos. Se a evidência não sustentar a conclusão, classifique como `needs_validation` ou omita o achado.
6. **Calibre prioridade e confiança.** P0/P1 exigem consequência clara para uma tarefa importante; não use severidade alta por pertencer a uma categoria da base. Confiança alta exige evidência direta da condição descrita, não confiança no impacto comercial ou psicológico.
7. **Escreva um aceite observável.** Diga qual estado deve mudar, como verificar e o que preservar. Não recomende mudar regras comerciais, dados, marca ou integrações sem a decisão do responsável.

## Antes de entregar

- Compare cada achado com uma linha `coverage` marcada `observed` no mesmo estado e viewport. Linhas bloqueadas e não observadas explicam lacunas; não sustentam defeitos visuais confirmados.
- Confira evidências citadas: arquivo existe, captura foi aberta, leitura de código corresponde à versão analisada e valores medidos são da condição declarada. O validador não consegue verificar a veracidade de frases ou arquivos externos.
- Para formulários, diferencie edição, validação, erro, foco, recuperação e sucesso. Não conclua que um estado funciona apenas por existir no código; não envie dados reais ou uma submissão de produção para produzi-lo. Se não houver ambiente de teste seguro, marque o estado como lacuna.
- Revise o relatório Markdown, o JSON, o registro de execução e as imagens para dados privados. Use IDs e rótulos sanitizados, sem URLs de sessão ou nomes de clientes.
- Execute os validadores de relatório e registro. Trate erro como bloqueio da entrega; trate aviso ou limitação como informação a resolver ou explicar. Não marque teste como passado se não foi executado.
- Registre explicitamente o que ficou fora do escopo, quais estados não puderam ser reproduzidos e que decisões dependem de pesquisa, conteúdo ou aprovação externa.
