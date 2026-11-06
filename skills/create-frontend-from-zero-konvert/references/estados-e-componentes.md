# Estados e componentes

Uma interface nova costuma parecer pronta no estado normal e falhar nos outros. Antes de implementar, liste por tela os componentes e os estados que a jornada exige; durante a verificação, use essa lista como checklist.

## Estados por jornada

Para cada jornada no escopo, cubra os seis estados quando existirem: normal, carregando, erro, sucesso, vazio e recuperação. As unidades de conhecimento da auditora trazem critério de aceite observável para cada um. Use-as como **critério de pronto da construção**, não como achados.

| Jornada | Unidades para usar como critério |
| --- | --- |
| Checkout e pagamento | UXK-CHK-004 a UXK-CHK-009 e UXK-CHK-051 a UXK-CHK-054 em [jornadas e estados](../../audit-frontend-designer-konvert/knowledge-base/09-jornadas-e-estados.md) e [padrões detalhados](../../audit-frontend-designer-konvert/knowledge-base/10-padroes-detalhados.md) |
| Formulários e cadastro | UXK-FRM-003 a UXK-FRM-008 e UXK-FRM-053 a UXK-FRM-055 |
| Navegação, busca e listagem | UXK-NAV-005 a UXK-NAV-010 e UXK-NAV-051 a UXK-NAV-054 |
| Erros, vazios e recuperação | UXK-ERR-002 a UXK-ERR-007, UXK-ERR-051 e UXK-ERR-052 |
| Tabelas e dashboards | UXK-DSH-002 a UXK-DSH-007, UXK-DSH-051, UXK-DSH-053 e UXK-DSH-054 |
| Por tipo de produto | [e-commerce](../../audit-frontend-designer-konvert/knowledge-base/06-padroes-ecommerce.md), [SaaS](../../audit-frontend-designer-konvert/knowledge-base/07-padroes-saas.md) e [institucional](../../audit-frontend-designer-konvert/knowledge-base/08-padroes-institucional.md) |

Se a auditora não estiver instalada ou não houver unidade aplicável, registre a ausência e defina critérios locais para os estados pertinentes; não exija estados que não existam na jornada. Para cada um, registre gatilho sintético, feedback, ação seguinte e resultado esperado.

| Estado aplicável | Exemplo de critério local observável |
| --- | --- |
| Normal | A tarefa e a ação principal estão disponíveis com dados válidos. |
| Carregando | Uma operação simulada pendente apresenta feedback identificável e evita envio duplicado quando necessário. |
| Erro | A falha sintética é identificada em texto e oferece próximo passo; dados relevantes são preservados. |
| Sucesso | O resultado da ação é apresentado e corresponde ao dado enviado. |
| Vazio | A ausência de dados é explicada e há próximo passo quando pertinente. |
| Recuperação | Após falha, corrigir ou tentar novamente permite prosseguir sem perda indevida. |

## Inventário de componentes

| Tipo de página | Componentes típicos | Estados que costumam faltar |
| --- | --- | --- |
| Landing ou institucional | Cabeçalho com navegação, seção principal com uma ação, prova verificável, contato, rodapé com dados do responsável | Menu mobile aberto, foco no menu, envio do contato com erro e sucesso |
| Listagem de produtos | Busca, filtros, ordenação, card de produto, paginação | Filtro sem resultado, filtros aplicados visíveis, carregando mais itens |
| Página de produto | Galeria, seletor de variação, preço e parcelamento, disponibilidade, frete por CEP, botão de compra | Variação esgotada, CEP inválido, carregando frete |
| Carrinho e checkout | Itens, quantidades, resumo de valores, etapas, formulários de endereço e pagamento | Carrinho vazio, pagamento recusado, envio em andamento, retomada após falha |
| Dashboard | Indicadores, gráficos, tabela, filtros de período | Período sem dados, falha de um bloco, tabela larga em tela estreita |
| Formulário longo | Campos agrupados, progresso, resumo final | Erro por campo, valores preservados após erro, sessão expirando |

## Regras de construção

- Quando as regras de uma jornada interagem entre si (carrinho com cupom, frete e estoque; checkout em etapas; filtros combinados), valide o modelo de estado antes das telas com o [protótipo de lógica de estado](prototipo-de-logica-de-estado.md).
- Cada estado precisa ser alcançável para verificação: dados sintéticos, um parâmetro de demonstração ou um controle de desenvolvimento documentado. Um estado que não pode ser observado não foi verificado.
- Componentes interativos usam elementos nativos (`button`, `a`, `input`, `select`, `dialog`) antes de papéis ARIA; ARIA só quando o nativo não resolve.
- Uma ação que não funciona de verdade fica desabilitada com explicação ou é marcada como demonstração. Não use botões e links que parecem funcionar sem fazer nada.
- Para mensagens de status que não mudam o contexto, use `role="status"` ou `aria-live` apropriado sem roubar foco (WCAG 2.2 SC 4.1.3). Para diálogos, resumo de erros e outras mudanças de contexto, escolha gestão de foco e anúncio conforme a interação; evite anúncios duplicados e verifique com tecnologia assistiva quando disponível.
