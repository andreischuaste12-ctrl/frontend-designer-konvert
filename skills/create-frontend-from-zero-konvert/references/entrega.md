# Definição de pronto e entrega

Uma entrega está pronta quando a tarefa principal funciona de ponta a ponta no escopo combinado e cada afirmação do relatório tem evidência. A aparência sozinha não conta como pronto.

## Definição de pronto

Marque cada item como cumprido, não aplicável (com motivo) ou não verificado (com motivo). Não marque como cumprido o que não foi executado.

| Área | Critério |
| --- | --- |
| Execução | Instala e roda localmente com os comandos documentados; build e testes existentes passam. |
| Tarefa principal | A pessoa conclui a tarefa principal do brief, do início ao fim, nos dados de demonstração. |
| Estados | Cada estado listado em [estados e componentes](estados-e-componentes.md) é alcançável e atende ao critério de aceite da unidade correspondente. |
| Responsividade | Funciona em 320 ou 375 px e em desktop (1440 px) sem rolagem horizontal da página. |
| Teclado e foco | Todas as ações funcionam por teclado, na ordem de leitura, com foco visível e não encoberto. |
| Formulários | Rótulos visíveis, erros em texto junto ao campo, valores preservados após erro. |
| Contraste e alvos | Medidos no render: texto 4,5:1 (3:1 para texto grande), não textual 3:1, alvos de toque de 24 px CSS ou mais. |
| Movimento | `prefers-reduced-motion` respeitado. |
| Conteúdo | Nada de dado comercial, depoimento ou integração inventados; conteúdo fictício identificado. |
| SEO e performance | Itens básicos de [conteúdo, SEO e performance](conteudo-seo-performance.md) aplicados às páginas públicas; métricas locais registradas como locais. |
| Privacidade | Nenhum analytics, credencial ou dado pessoal sem pedido; capturas revisadas antes de compartilhar. |
| Escopo | Nenhum arquivo fora da área autorizada foi alterado. Em projetos existentes, código e integrações anteriores foram preservados. |

## Relatório de entrega

Use este formato, preenchendo só o que se aplica. O [exemplo de relatório](../examples/relatorio-de-entrega.md) mostra o nível de detalhe esperado.

```markdown
# Entrega: <nome>

## Resumo
<o que foi construído, para quem e qual tarefa principal resolve, em 2 ou 3 frases>

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
