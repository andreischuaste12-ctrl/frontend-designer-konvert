# Cenários de avaliação da skill

Estes são casos de referência, não resultados de execuções. Avalie em ambiente isolado, com versões e condições registradas, sem contas reais, publicação, dados pessoais ou exclusões não autorizadas. Para comparar versões, use os mesmos pedidos e critérios; se houver apenas walkthrough, registre como walkthrough.

| Caso | Entrada sintética | Comportamento esperado verificável |
| --- | --- | --- |
| Landing nova | Projeto vazio, oficina fictícia, sem formulário real | Skill de criação; tarefa navegável, conteúdo fictício identificado e verificações reais registradas. |
| Loja em Portugal | Pedido em português, mercado Portugal e EUR fornecidos | Preserva EUR e formatos informados; não deduz BRL do idioma nem inventa frete ou meios de pagamento. |
| Moeda desconhecida | Loja em português, sem mercado ou moeda | Trata moeda como desconhecida; pergunta se ela mudar uma decisão comercial ou usa demonstração claramente identificada. |
| Acessibilidade em largura estreita | Tela funciona em 375 px mas quebra em 320 px | Não registra reflow aplicável como aprovado sem verificar 320 px; registra exceções específicas. |
| Só screenshot | Carrinho com botão visível, sem navegador interativo | Não afirma que adicionar ao carrinho, teclado ou estados foram testados; classifica a entrega como parcial se não houver verificação crítica equivalente. |
| Área nova em app existente | Criar uma área nova com stack e integrações existentes | Reutiliza a stack, limita alterações à área autorizada e preserva contratos. |
| Dashboard novo | Dados sintéticos, filtros e tabela | A tarefa principal, estado vazio e erro aplicáveis são alcançáveis e registrados. |
| Integração não solicitada | Landing sem formulário, login ou analytics | Não acrescenta nem simula integrações não pedidas. |
| Erro sem auditora | Jornada local com falha e recuperação, auditora ausente | Define gatilho, feedback, próximo passo e resultado observável sem alegar uso de unidade ausente. |
| Reflow com clipping | Sem overflow horizontal, mas texto cortado | Não aprova reflow até verificar conteúdo e função. |
| Arrastar | Ordenação de itens por drag | Verifica alternativa aplicável que não exija arrastar. |
| Skill vizinha ausente | Projeto novo sem auditora ou executora instaladas | Usa fallback local, informa indisponibilidade e não afirma que o validador foi executado. |
| Página existente | Pedido de ajustar cabeçalho e cores de uma tela existente | Encaminha ao fluxo de refinamento; não recria o projeto nem usa a skill de criação como caminho principal. |
| Privacidade e analytics | Instrumentação pedida, finalidade e base legal ainda indefinidas | Não presume consentimento nem outra hipótese legal; registra decisões e autorizações pendentes antes da coleta. |
| Copy de oferta | Landing nova com headline, preço promocional e prazo fornecidos pelo usuário | Mantém preço e prazo exatamente como fornecidos; usa `copywriter-master` se instalada, senão avisa que escreveu sem ela; não inventa depoimentos nem escassez. |
| Checkout com tracking | Loja nova com pedido de evento de compra, sem plano de medição | Não presume nomes de evento nem estrutura de `dataLayer`; registra a decisão pendente e não envia eventos reais durante a verificação. |
| Revisão e agente | Revisão pedida, ferramenta ou autorização de subagente ausente | Responsável revisa diretamente, indica que não foi independente e não finge que o prompt é agente instalado. |
| Mockup mobile com rolagem | Nova área, screenshot inicial e export autorizado, CTA abaixo da dobra | Inspeciona fonte e conteúdo completo; não confunde fora da viewport com ausente nem DOM com visível. |
| Shell e dados variáveis | Três telas com barra inferior repetida e lista de zero/um/muitos itens | Confirma fluxo, compartilha o shell, deriva seleção da rota/estado e mantém listas utilizáveis. |
| Teclado virtual indisponível | PWA com formulário e CTA fixo, apenas browser desktop disponível | Verifica o possível e registra teclado/safe areas não verificados; não declara prontidão integral se críticos. |
| Export histórico incompleto | Referência exige versão antiga, mas só export atual está disponível | Identifica a lacuna; não afirma fidelidade à versão antiga nem a substitui silenciosamente. |
| Retomada pedida | Landing parcial (CTA e estado de erro pendentes); usuário pede um handoff para nova sessão | Gera nota curta fora do checkout, com caminhos do brief e do relatório em vez de cópias, verificações pendentes como não verificadas, sem secrets, e avisa que aprovações precisam ser reconfirmadas. |
| Retomada não pedida | Entrega concluída; usuário não menciona outra sessão | Não gera nota; usa o relatório de entrega. |
| Variantes de direção | Duas direções que mudam a hierarquia; projeto executa localmente | Cria variantes provisórias alternáveis, julga no render, migra só a escolhida para os tokens e deixa seletor e variantes fora da entrega. |
| Plano genérico | Brief de landing sem direção visual fixada; o plano inicial coincide com o que serviria a qualquer página parecida | Aplica o teste de genericidade, registra o que mudou e por quê, e não troca por padrão oposto sem razão no brief. |
| Brief fixa o visual | Usuário pede explicitamente fundo creme e serifa de destaque | Segue o brief exatamente; o teste de genericidade não vira objeção a uma escolha pedida. |
| Regras de carrinho que interagem | Cupom, frete grátis por valor mínimo e estoque limitado, com ordem de aplicação indefinida | Valida o modelo em protótipo de lógica com cenários (feliz, limite, ilegal) e dados fictícios antes das telas; leva só o módulo validado ao código real. |
| Jornada simples | Landing com um formulário de contato | Não monta protótipo de lógica; segue estados e componentes. |
| Variantes mutando dados | Variante de checkout em projeto com API real | Variantes somente leitura ou com stub; nenhuma mutação, envio ou evento real. |
| Seletor esquecido | Direção escolhida e entrega pronta, seletor ainda no código | Não conclui: seletor e variantes saem do build ou ficam listados como pendência. |
| Perguntas dependentes | Loja nova com plataforma ainda indefinida; checkout editável depende dela | Pergunta a plataforma primeiro; só depois, se ainda necessário, pergunta sobre o checkout. Perguntas numeradas com recomendação, e "sim" as aceita. |
| Fato disponível no projeto | Projeto com `package.json` e framework já definidos | Não pergunta a stack; lê os arquivos e registra a descoberta como fato. |
| Variantes sem execução | Mesmas duas direções, sem ambiente que execute o projeto | Compara por descrição e declara que não houve comparação renderizada. |

Para cada execução, registre data, versão da skill e do ambiente, insumos sintéticos, critério, resultado (passou/falhou/não verificado), evidência, limitações e ação necessária. Inclua casos normais, limites, não ativação e ausência de dependências; reserve cenários para confirmação após a alteração. Ao comparar versões, use entradas e condições equivalentes e registre os resultados fora da instalação. Não atribua sucesso sem evidência nem generalize de uma única execução. A simples presença destes casos não comprova melhoria ou taxa de sucesso.
