# Definição de pronto e entrega

Uma entrega está pronta quando a tarefa principal funciona de ponta a ponta no escopo combinado e cada afirmação do relatório tem evidência. A aparência sozinha não conta como pronto.

## Definição de pronto

Marque cada item como cumprido, falhou, não aplicável (com motivo) ou não verificado (com motivo). Não marque como cumprido o que não foi executado. Defina no brief quais verificações são críticas conforme a jornada e os riscos. No mínimo, são críticas a execução da tarefa principal no ambiente disponível, as ações e estados essenciais, teclado e foco aplicáveis, responsividade relevante e build/testes pertinentes quando existirem.

Use **implementado** para código concluído sem alegar teste; **validado** apenas para o comportamento efetivamente executado com evidência; **parcial** quando faltar validação crítica ou houver falha relevante. Use **pronto** somente quando a jornada principal e as verificações críticas aplicáveis tiverem passado e as demais pendências forem explicitadas. Captura isolada não comprova uma interação. Uma entrega parcial pode ser apresentada com instruções, limitações e próximo passo; não afirme funcionamento ponta a ponta sem observá-lo.

| Área | Critério |
| --- | --- |
| Execução | Instala e roda localmente com os comandos documentados; build e testes existentes passam. |
| Tarefa principal | A pessoa conclui a tarefa principal do brief, do início ao fim, nos dados de demonstração. |
| Estados | Cada estado aplicável do inventário em [estados e componentes](estados-e-componentes.md) é alcançável e atende a critério observável da unidade correspondente ou ao critério local de fallback. |
| Responsividade | Verifique reflow em 320 px CSS quando aplicável e desktop; 375 px é complementar, não substitui 320 px. Confira zoom e documente exceções específicas para conteúdo que exige duas dimensões. |
| Teclado e foco | Todas as ações funcionam por teclado, na ordem de leitura, com foco visível e não encoberto. |
| Formulários | Rótulos visíveis, erros em texto junto ao campo, valores preservados após erro. |
| Contraste e alvos | Avaliados no render com critérios e exceções aplicáveis: texto 4,5:1 (3:1 para texto grande), não textual 3:1 e tamanho ou exceção de alvos. Registre amostra, limites e resultados indeterminados; teste automático não comprova cobertura integral. |
| Movimento | Confira comportamento normal e com `prefers-reduced-motion: reduce`; registre estados não observados. |
| Conteúdo | Nada de dado comercial, depoimento ou integração inventados; conteúdo fictício identificado. |
| SEO e performance | Itens básicos de [conteúdo, SEO e performance](conteudo-seo-performance.md) aplicados às páginas públicas; métricas locais registradas como locais. |
| Privacidade | Nenhum analytics, credencial ou dado pessoal sem pedido; capturas revisadas antes de compartilhar. |
| Segurança do frontend e localização | Aplicar os controles pertinentes de [segurança e localização](seguranca-e-localizacao-frontend.md); quando houver múltiplos locales, verificar apenas os idiomas, formatos e estados incluídos no escopo. Registrar como não verificados os controles de backend e hospedagem fora do alcance. |
| Escopo | Nenhum arquivo fora da área autorizada foi alterado. Em projetos existentes, código e integrações anteriores foram preservados. Variantes e seletores de [exploração visual](exploracao-de-direcao-visual.md) estão fora do build ou removidos. |

## Relatório de entrega

Use este formato, preenchendo só o que se aplica. O [exemplo de relatório](../examples/relatorio-de-entrega.md) mostra o nível de detalhe esperado.

```markdown
# Entrega: <nome>

## Resumo
<status: pronto ou parcial; o que foi implementado e o que foi efetivamente validado>

## Como executar
<comandos exatos, versão de runtime necessária, URL local>

## Arquivos
| Arquivo | O que contém |
| --- | --- |

## Decisões
| Decisão | Alternativa descartada | Motivo |
| --- | --- | --- |

## Suposições mantidas
| Suposição | Impacto se estiver errada |
| --- | --- |

## Verificações executadas
| Verificação | Ferramenta ou método | Resultado |
| --- | --- | --- |

## Simulado ou fora do escopo
- <integrações simuladas, dados fictícios, funcionalidades não implementadas>

## Não verificado
- <o que não foi possível verificar e por quê>
```

## Regras

- Relate o resultado de cada verificação, não apenas o comando. Uma verificação que falhou aparece como falha, com o que foi feito a seguir.
- Uma primeira captura de interface nova é **referência inicial**, não "antes/depois".
- Sem navegador disponível, diga que a interface não foi inspecionada visualmente.
- Não afirme conformidade WCAG, testes com usuários, ganho de conversão ou desempenho em produção sem evidência própria.
