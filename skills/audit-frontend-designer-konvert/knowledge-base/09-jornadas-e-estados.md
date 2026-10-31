# Jornadas e estados de UX

Cada jornada prioritária tem uma unidade por estado: normal, carregando, erro, sucesso, vazio e recuperação. As unidades são roteiros de inspeção, não prova de problema. Colete evidência somente em ambiente autorizado, com dados sintéticos e sem transações reais; quando um estado não puder ser observado, registre a lacuna nos limites do relatório. Em toda jornada, confira também teclado, toque, 375 px e `prefers-reduced-motion`, registrando dispositivo, viewport e método.

Fontes marcadas como verificadas foram lidas no texto normativo indicado, no commit citado. Fontes "não verificadas" são heurísticas editoriais do projeto: use-as para formular hipóteses, nunca como citação de pesquisa.

## Checkout e pagamento

### UXK-CHK-004 — Revisão completa antes de pagar
- **Contexto:** e-commerce e assinaturas · checkout · todas as stacks · mobile e desktop · [comercial]
- **Estados:** normal
- **Quando se aplica:** o fluxo finaliza compra, assinatura ou outro compromisso financeiro.
- **Exceções:** doação de valor livre digitado na própria etapa final; cobrança recorrente já aceita em contrato vigente.
- **Evidência a coletar:** capturas em 375 e 1440 px da última etapa antes do botão que finaliza; lista dos blocos exibidos (itens, quantidades, endereço, prazo, frete, descontos, pagamento, total) e de quais têm ação de editar.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Reunir na etapa final itens, endereço, prazo, frete, descontos, forma de pagamento e total, cada bloco com ação de edição que volta à etapa certa sem apagar os demais dados.
- **Critério de aceite:** Em 375 px, antes do botão de finalizar, o total final está visível e é possível editar endereço e pagamento; ao voltar, os outros blocos continuam preenchidos.
- **Preservar:** valores, regras de frete e cupom, textos legais e a ordem de etapas imposta pela plataforma.
- **Dependência externa:** pendente — o responsável comercial confirma valores, prazos e textos legais exibidos.
- **Métrica a monitorar:** abandono na etapa de revisão e edições por pedido.
- **Fonte:** WCAG 2.2 SC 3.3.4 Error Prevention (Legal, Financial, Data) — github.com/w3c/wcag@9b94e18, guidelines/sc/20/error-prevention-legal-financial-data.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-CHK-005 — Processamento do pagamento sem envio duplicado
- **Contexto:** e-commerce · checkout · todas as stacks · mobile e desktop
- **Estados:** carregando
- **Quando se aplica:** a confirmação do pagamento depende de serviço externo e leva tempo perceptível.
- **Exceções:** confirmação síncrona sem espera observável em rede limitada (registre o tempo medido).
- **Evidência a coletar:** em sandbox, sequência de capturas do clique em pagar com rede limitada; atributos do botão (`disabled`, `aria-busy`) e existência de região `role="status"`; se a interação não for permitida, leitura do código do manipulador de envio.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Ao enviar, bloquear novo envio, trocar o texto do botão por um estado de andamento e anunciar o status em região de status sem mover o foco.
- **Critério de aceite:** Um segundo clique durante o processamento não dispara outra requisição de pagamento, e o leitor de tela anuncia o andamento enquanto o foco permanece no botão.
- **Preservar:** integração com o gateway, tokens de pagamento e redirecionamentos exigidos pelo provedor.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** pedidos duplicados e cliques repetidos no botão de pagar.
- **Fonte:** WCAG 2.2 SC 4.1.3 Status Messages — github.com/w3c/wcag@9b94e18, guidelines/sc/21/status-messages.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-CHK-006 — Pagamento recusado com caminho de saída
- **Contexto:** e-commerce · checkout · todas as stacks · mobile e desktop · [comercial]
- **Estados:** erro
- **Quando se aplica:** algum meio de pagamento pode ser recusado ou falhar (cartão, Pix não gerado, boleto indisponível).
- **Exceções:** pagamento conferido manualmente depois do pedido, sem resposta na sessão (registre como lacuna).
- **Evidência a coletar:** captura da recusa provocada com dado de teste do gateway em sandbox, ou leitura do componente de erro; texto exibido, destino do foco e dados que precisam ser digitados de novo.
- **Método:** inspeção
- **Prioridade padrão:** P0
- **Recomendação:** Informar a recusa em texto ligado ao formulário, manter carrinho e endereço e oferecer, na mesma tela, trocar o meio de pagamento ou tentar de novo.
- **Critério de aceite:** Depois de uma recusa simulada, a pessoa escolhe outro meio de pagamento sem refazer carrinho nem redigitar endereço, e a mensagem é lida pelo leitor de tela.
- **Preservar:** regras antifraude, limite de tentativas e mensagens obrigatórias do gateway.
- **Dependência externa:** pendente — o gateway e o responsável por pagamentos definem quais motivos de recusa podem ser exibidos.
- **Métrica a monitorar:** conversão após recusa e trocas de meio de pagamento.
- **Fonte:** WCAG 2.2 SC 3.3.1 Error Identification e SC 3.3.7 Redundant Entry — github.com/w3c/wcag@9b94e18, guidelines/sc/20/error-identification.html e guidelines/sc/22/redundant-entry.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-CHK-007 — Confirmação do pedido com próximo passo
- **Contexto:** e-commerce · pós-pagamento · todas as stacks · mobile e desktop · [comercial]
- **Estados:** sucesso
- **Quando se aplica:** a compra concluída gera um pedido com número.
- **Exceções:** plataformas que só confirmam por e-mail; avalie o e-mail fornecido e registre que a tela não existe.
- **Evidência a coletar:** captura da página de confirmação em sandbox ou do template da plataforma; presença de número do pedido, resumo pago, prazo, instruções de Pix ou boleto e canal de ajuda; título da aba.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Mostrar número do pedido, resumo do que foi pago, forma de pagamento, prazo estimado e o que acontece a seguir, com título de página que indique sucesso.
- **Critério de aceite:** A página de confirmação exibe em texto o número do pedido e o próximo passo, e o título da aba descreve a confirmação.
- **Preservar:** dados de rastreio, textos legais e integrações de pós-venda.
- **Dependência externa:** pendente — prazos e instruções de pagamento vêm da operação e do financeiro.
- **Métrica a monitorar:** contatos ao suporte perguntando se o pedido foi feito.
- **Fonte:** WCAG 2.2 SC 2.4.2 Page Titled — github.com/w3c/wcag@9b94e18, guidelines/sc/20/page-titled.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-CHK-008 — Carrinho vazio que leva de volta às compras
- **Contexto:** e-commerce · carrinho · todas as stacks · mobile e desktop
- **Estados:** vazio
- **Quando se aplica:** a pessoa abre o carrinho sem itens ou remove o último item.
- **Exceções:** lojas sem carrinho, com compra direta de um único item.
- **Evidência a coletar:** captura do carrinho vazio em 375 px e do estado logo após remover o último item; destino do foco depois da remoção.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Dizer que o carrinho está vazio, oferecer caminho para categorias ou busca e, quando possível, desfazer a remoção do último item.
- **Critério de aceite:** Após remover o último item, o foco não volta para o topo da página e há uma ação para continuar comprando visível sem rolar em 375 px.
- **Preservar:** carrinho persistente e recomendações aprovadas pelo merchandising.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** saídas a partir do carrinho vazio.
- **Fonte:** WCAG 2.2 SC 2.4.3 Focus Order — github.com/w3c/wcag@9b94e18, guidelines/sc/20/focus-order.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-CHK-009 — Retomar o checkout sem redigitar tudo
- **Contexto:** e-commerce · checkout · todas as stacks · mobile e desktop
- **Estados:** recuperação
- **Quando se aplica:** a sessão expira, a conexão cai ou a pessoa volta ao checkout depois de uma falha.
- **Exceções:** dados que devem ser pedidos de novo por segurança, como código de verificação do cartão e senha.
- **Evidência a coletar:** em sandbox, recarregar a etapa de pagamento e voltar após uma falha; listar o que ficou preservado (itens, endereço, frete) e o que foi pedido de novo.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Preservar itens, endereço e frete entre tentativas e pedir de novo apenas o que a segurança exige, explicando o motivo.
- **Critério de aceite:** Ao voltar ao checkout depois de uma falha simulada, endereço e frete continuam preenchidos ou selecionáveis; só dados de segurança são solicitados novamente.
- **Preservar:** tempo de expiração da sessão e regras de segurança do gateway.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** abandono após falha e tempo para concluir a segunda tentativa.
- **Fonte:** WCAG 2.2 SC 3.3.7 Redundant Entry — github.com/w3c/wcag@9b94e18, guidelines/sc/22/redundant-entry.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

## Formulários e cadastro

### UXK-FRM-003 — Rótulo visível e associado ao campo
- **Contexto:** formulários · todas as stacks · mobile e desktop
- **Estados:** normal
- **Quando se aplica:** o conteúdo pede entrada de dados em campos de texto, seleção ou caixas de marcação.
- **Exceções:** campo único de busca acompanhado de botão com texto "Buscar", que funciona como instrução (registre a decisão).
- **Evidência a coletar:** resultado da regra `label` do axe (`extract-styles --axe`) e captura do campo já preenchido para conferir se o rótulo continua visível.
- **Método:** automático
- **Prioridade padrão:** P1
- **Recomendação:** Usar rótulo visível fora do placeholder, associado por `for`/`htmlFor` ou por aninhamento, e indicar em texto quais campos são obrigatórios.
- **Critério de aceite:** O axe não aponta violação `label`, e com o campo preenchido o rótulo continua visível.
- **Preservar:** atributos `name` e IDs consumidos pela integração do formulário.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** erros de preenchimento por campo.
- **Fonte:** WCAG 2.2 SC 3.3.2 Labels or Instructions e SC 1.3.1 Info and Relationships — github.com/w3c/wcag@9b94e18, guidelines/sc/20/labels-or-instructions.html e guidelines/sc/20/info-and-relationships.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-FRM-004 — Envio em andamento perceptível
- **Contexto:** formulários · todas as stacks · mobile e desktop
- **Estados:** carregando
- **Quando se aplica:** o envio depende de resposta do servidor.
- **Exceções:** validação inteiramente local com resposta imediata.
- **Evidência a coletar:** capturas sequenciais do envio com rede limitada em ambiente de teste; estado do botão e região de status anunciada.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Indicar o envio em texto junto ao botão, impedir reenvio e manter os valores digitados visíveis durante a espera.
- **Critério de aceite:** Durante o envio o botão não aceita novo clique, os campos mantêm os valores e uma mensagem de andamento é anunciada.
- **Preservar:** endpoint, nomes de campos e proteções anti-spam existentes.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** envios duplicados registrados pelo back-end.
- **Fonte:** WCAG 2.2 SC 4.1.3 Status Messages — github.com/w3c/wcag@9b94e18, guidelines/sc/21/status-messages.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-FRM-005 — Erro descrito em texto junto ao campo
- **Contexto:** formulários · todas as stacks · mobile e desktop
- **Estados:** erro
- **Quando se aplica:** a validação detecta automaticamente um erro de entrada.
- **Exceções:** falha de servidor sem campo específico, que vai para o resumo de erros (ver UXK-ERR-004).
- **Evidência a coletar:** captura em 375 px após enviar um valor sintético inválido; inspeção de `aria-invalid` e `aria-describedby`; conferir se o erro aparece também sem cor.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Exibir o erro em texto junto ao campo, ligado por `aria-describedby`, com sugestão de correção quando conhecida e sem depender apenas de cor.
- **Critério de aceite:** Com um e-mail sintético inválido, a mensagem aparece junto ao campo, é lida ao focar o campo e diz como corrigir.
- **Preservar:** regras de validação e mensagens exigidas por lei ou pela plataforma.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** reenvios com erro por campo.
- **Fonte:** WCAG 2.2 SC 3.3.1, SC 3.3.3 Error Suggestion e SC 1.4.1 Use of Color — github.com/w3c/wcag@9b94e18, guidelines/sc/20/error-identification.html, guidelines/sc/20/error-suggestion.html e guidelines/sc/20/use-of-color.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-FRM-006 — Confirmação de envio que permanece visível
- **Contexto:** formulários · todas as stacks · mobile e desktop
- **Estados:** sucesso
- **Quando se aplica:** o formulário foi enviado com sucesso.
- **Exceções:** fluxo que redireciona para uma página própria de confirmação; avalie essa página.
- **Evidência a coletar:** captura após envio de teste; tempo que a mensagem fica visível; anúncio por região de status ou mudança de título.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Confirmar em texto o que foi enviado, o que acontece depois e em quanto tempo, sem esconder a confirmação automaticamente em poucos segundos.
- **Critério de aceite:** A confirmação continua visível até a pessoa sair ou fechá-la, informa o próximo passo e é anunciada sem mover o foco.
- **Preservar:** textos de consentimento e de política de privacidade.
- **Dependência externa:** pendente — o prazo de resposta é definido pelo responsável pelo atendimento.
- **Métrica a monitorar:** reenvios do mesmo formulário pela mesma pessoa.
- **Fonte:** WCAG 2.2 SC 4.1.3 Status Messages — github.com/w3c/wcag@9b94e18, guidelines/sc/21/status-messages.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-FRM-007 — Estado inicial sem erro prematuro
- **Contexto:** formulários · todas as stacks · mobile e desktop
- **Estados:** vazio
- **Quando se aplica:** primeira exibição do formulário, sem dados digitados.
- **Exceções:** formulários pré-preenchidos com dados da conta.
- **Evidência a coletar:** captura do estado inicial; existência de erros antes da primeira interação; instruções de formato para CEP, CPF, telefone e datas.
- **Método:** inspeção
- **Prioridade padrão:** P3
- **Recomendação:** Mostrar o formato esperado e exemplos antes do campo e não exibir erro antes da primeira interação.
- **Critério de aceite:** Ao abrir o formulário nenhum campo aparece como erro, e cada campo com formato específico mostra o formato esperado antes de ser preenchido.
- **Preservar:** ordem e obrigatoriedade dos campos.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** primeiro erro registrado por campo.
- **Fonte:** WCAG 2.2 SC 3.3.2 Labels or Instructions — github.com/w3c/wcag@9b94e18, guidelines/sc/20/labels-or-instructions.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-FRM-008 — Valores preservados depois do erro
- **Contexto:** formulários · todas as stacks · mobile e desktop
- **Estados:** recuperação
- **Quando se aplica:** o envio falha por validação ou por erro do servidor.
- **Exceções:** senha e códigos de uso único, que podem ser limpos por segurança.
- **Evidência a coletar:** enviar com erro sintético e registrar quais campos mantêm o valor e onde o foco é colocado.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Manter todos os valores válidos após o erro e levar o foco ao primeiro campo com erro ou a um resumo de erros com links para cada campo.
- **Critério de aceite:** Após erro simulado, os campos válidos mantêm o valor e o foco vai para o primeiro erro ou para o resumo.
- **Preservar:** limpeza de senha exigida pela política de segurança.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** abandono após o primeiro erro.
- **Fonte:** WCAG 2.2 SC 3.3.7 Redundant Entry e SC 3.3.1 Error Identification — github.com/w3c/wcag@9b94e18, guidelines/sc/22/redundant-entry.html e guidelines/sc/20/error-identification.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

## Navegação mobile, busca e listagem

### UXK-NAV-005 — Navegação por teclado com foco visível e não encoberto
- **Contexto:** navegação · todas as stacks · mobile e desktop
- **Estados:** normal
- **Quando se aplica:** a página tem menus, links e controles de navegação.
- **Exceções:** nenhuma para operação por teclado; a forma do indicador de foco pode variar com a marca.
- **Evidência a coletar:** percorrer a página com Tab em 1440 e 375 px; capturas do indicador de foco; verificar se cabeçalho fixo, banner de cookies ou chat cobrem o item focado.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Garantir que todo item de navegação receba foco pelo teclado, com indicador visível e sem ficar inteiramente encoberto por conteúdo fixo.
- **Critério de aceite:** Percorrendo a página com Tab, cada item recebe foco visível na ordem de leitura e nenhum fica totalmente escondido por elementos fixos.
- **Preservar:** estrutura do menu e identidade visual.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** uso da busca como substituto do menu, quando houver dados.
- **Fonte:** WCAG 2.2 SC 2.1.1 Keyboard, SC 2.4.7 Focus Visible e SC 2.4.11 Focus Not Obscured (Minimum) — github.com/w3c/wcag@9b94e18, guidelines/sc/20/keyboard.html, guidelines/sc/20/focus-visible.html e guidelines/sc/22/focus-not-obscured-minimum.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-NAV-006 — Busca carregando sem saltos de layout
- **Contexto:** busca e listagem · todas as stacks · mobile e desktop
- **Estados:** carregando
- **Quando se aplica:** resultados ou filtros carregam de forma assíncrona.
- **Exceções:** navegação de página inteira sem atualização parcial.
- **Evidência a coletar:** capturas sequenciais com rede limitada; existência de indicador de carregamento e de anúncio da contagem; métrica CLS registrada pela captura.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Reservar a área dos resultados enquanto carrega e anunciar a quantidade de resultados quando terminar.
- **Critério de aceite:** Na sequência de capturas, a lista não muda de posição de forma perceptível ao terminar de carregar, e a contagem final é anunciada por região de status.
- **Preservar:** motor de busca, ranking e regras de merchandising.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** refinamentos de busca por sessão.
- **Fonte:** WCAG 2.2 SC 4.1.3 Status Messages — github.com/w3c/wcag@9b94e18, guidelines/sc/21/status-messages.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-NAV-007 — Falha da busca distinta de "nenhum resultado"
- **Contexto:** busca e listagem · todas as stacks · mobile e desktop
- **Estados:** erro
- **Quando se aplica:** a busca ou a listagem pode falhar por servidor ou rede.
- **Exceções:** buscas resolvidas inteiramente no navegador sobre dados já carregados.
- **Evidência a coletar:** em ambiente de teste, bloquear a requisição de busca e capturar a tela; conferir se o termo digitado permanece.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Informar que a busca falhou, sem exibir "nenhum resultado", manter o termo digitado e oferecer tentar de novo.
- **Critério de aceite:** Com a requisição bloqueada, a tela diferencia falha de ausência de resultados e o termo continua no campo.
- **Preservar:** termo, filtros aplicados e parâmetros de URL.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** buscas repetidas com o mesmo termo em sequência.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-NAV-008 — Resultados com termo, contagem e filtros à vista
- **Contexto:** busca e listagem · todas as stacks · mobile e desktop
- **Estados:** sucesso
- **Quando se aplica:** a busca retorna itens.
- **Exceções:** resultado único com redirecionamento direto ao item (registre o comportamento).
- **Evidência a coletar:** capturas em 375 e 1440 px da página de resultados; posição do termo, da contagem, dos filtros e da ordenação.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Repetir o termo buscado, mostrar a contagem e deixar filtros e ordenação acessíveis acima dos resultados.
- **Critério de aceite:** Em 375 px, termo e contagem aparecem acima do primeiro resultado sem abrir nenhum menu.
- **Preservar:** ranking e destaques comerciais aprovados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** cliques no primeiro resultado.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-NAV-009 — Busca sem resultados com saída útil
- **Contexto:** busca e listagem · todas as stacks · mobile e desktop
- **Estados:** vazio
- **Quando se aplica:** nenhum item corresponde ao termo buscado.
- **Exceções:** catálogo vazio por definição, como pré-lançamento.
- **Evidência a coletar:** captura com termo sintético inexistente e com termo com erro de digitação comum; sugestões e ações oferecidas.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Dizer que não houve resultados para o termo, sugerir correção ou termos próximos e oferecer categorias ou contato.
- **Critério de aceite:** Com um termo inexistente, a página mostra o termo buscado e pelo menos uma ação para continuar.
- **Preservar:** sinônimos e redirecionamentos de busca configurados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** taxa de saída em buscas sem resultado.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-NAV-010 — Refinar e voltar sem perder o contexto
- **Contexto:** busca e listagem · todas as stacks · mobile e desktop
- **Estados:** recuperação
- **Quando se aplica:** a pessoa refina termo ou filtros, abre um item e volta à listagem.
- **Exceções:** listagens sem filtros nem paginação.
- **Evidência a coletar:** aplicar filtros, abrir um produto e usar o botão voltar do navegador; registrar se termo, filtros e posição de rolagem persistem.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Refletir termo e filtros na URL, permitir remover filtros um a um e restaurar a posição ao voltar de um item.
- **Critério de aceite:** Ao abrir um item e voltar, termo e filtros continuam aplicados e a lista não volta para o topo.
- **Preservar:** parâmetros de URL usados por analytics e regras de canonical para SEO.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** retornos à listagem por sessão.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

## Erros, estados vazios e recuperação

### UXK-ERR-002 — Estado de ações assíncronas sempre visível
- **Contexto:** aplicações web · todas as stacks · mobile e desktop
- **Estados:** normal
- **Quando se aplica:** a tela tem ações assíncronas, como salvar, sincronizar ou enviar.
- **Exceções:** telas somente de leitura sem ações assíncronas.
- **Evidência a coletar:** lista das ações assíncronas da tela e captura do indicador de estado de cada uma.
- **Método:** inspeção
- **Prioridade padrão:** P3
- **Recomendação:** Mostrar em texto, perto da ação, se o conteúdo está salvo, pendente ou sincronizado, e anunciar as mudanças em região de status.
- **Critério de aceite:** Cada ação assíncrona listada tem indicador textual de estado próximo a ela.
- **Preservar:** salvamento automático e intervalos de sincronização existentes.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** ações repetidas por dúvida sobre o salvamento.
- **Fonte:** WCAG 2.2 SC 4.1.3 Status Messages — github.com/w3c/wcag@9b94e18, guidelines/sc/21/status-messages.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-ERR-003 — Operação longa com progresso e cancelamento
- **Contexto:** aplicações web · todas as stacks · mobile e desktop
- **Estados:** carregando
- **Quando se aplica:** upload, exportação ou geração de relatório que leva vários segundos.
- **Exceções:** operações concluídas sem espera perceptível.
- **Evidência a coletar:** duração medida de uma operação de teste e captura do indicador durante a execução.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Mostrar progresso determinado quando o total é conhecido, permitir cancelar e dizer se a pessoa pode sair da tela enquanto espera.
- **Critério de aceite:** Uma operação de teste mostra progresso ou tempo restante e oferece ação de cancelar.
- **Preservar:** limites de tamanho e formatos aceitos.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** cancelamentos e recarregamentos durante a operação.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-ERR-004 — Mensagem de falha com causa, estado dos dados e ação
- **Contexto:** aplicações web · todas as stacks · mobile e desktop
- **Estados:** erro
- **Quando se aplica:** falha de servidor, de regra de negócio ou de entrada sem campo específico.
- **Exceções:** autenticação, em que o detalhe é omitido por segurança; mantenha uma ação de saída.
- **Evidência a coletar:** provocar a falha em ambiente de teste; registrar o texto, códigos técnicos expostos e ações oferecidas.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Dizer o que aconteceu em linguagem simples, o que foi ou não salvo e qual a próxima ação, sem mostrar código técnico como única informação.
- **Critério de aceite:** A mensagem informa a causa compreensível, se os dados foram salvos e pelo menos uma ação, como tentar de novo ou contato.
- **Preservar:** registro técnico do erro para suporte e monitoramento.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** contatos ao suporte por tipo de erro.
- **Fonte:** WCAG 2.2 SC 3.3.1 Error Identification, aplicável quando a falha é de entrada — github.com/w3c/wcag@9b94e18, guidelines/sc/20/error-identification.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-ERR-005 — Recuperação confirmada e erro antigo removido
- **Contexto:** aplicações web · todas as stacks · mobile e desktop
- **Estados:** sucesso
- **Quando se aplica:** depois de uma falha, a ação é refeita com sucesso.
- **Exceções:** reconexões automáticas que não exigiram ação da pessoa.
- **Evidência a coletar:** refazer a ação após falha simulada e capturar a tela final.
- **Método:** inspeção
- **Prioridade padrão:** P3
- **Recomendação:** Confirmar que a recuperação funcionou e retirar da tela a mensagem de erro anterior.
- **Critério de aceite:** Após o sucesso, nenhuma mensagem de erro antiga continua visível.
- **Preservar:** histórico de auditoria, quando existir.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** repetições da mesma ação depois do sucesso.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-ERR-006 — Primeiro uso que ensina a primeira ação
- **Contexto:** aplicações web · todas as stacks · mobile e desktop
- **Estados:** vazio
- **Quando se aplica:** lista, painel ou área sem conteúdo no primeiro acesso.
- **Exceções:** áreas preenchidas por terceiros sem ação da pessoa.
- **Evidência a coletar:** conta de teste nova; capturas das áreas vazias.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Explicar o que aparecerá naquela área e oferecer a primeira ação, como criar, importar ou ver um exemplo.
- **Critério de aceite:** Cada área vazia observada tem texto explicativo e uma ação principal.
- **Preservar:** dados de exemplo aprovados pelo produto.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** conclusão da primeira ação pela conta nova.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-ERR-007 — Aviso antes de expirar e trabalho preservado
- **Contexto:** aplicações web · todas as stacks · mobile e desktop
- **Estados:** recuperação
- **Quando se aplica:** a sessão expira ou a conexão cai durante tarefa longa.
- **Exceções:** dados sensíveis que a política proíbe guardar localmente; limites de tempo de eventos em tempo real.
- **Evidência a coletar:** simular expiração e queda de rede em ambiente de teste; registrar o aviso exibido, o tempo para reagir e o que foi perdido.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Avisar antes de a sessão expirar com opção de estender em uma ação simples e preservar o trabalho em andamento quando a política permitir.
- **Critério de aceite:** Uma sessão de teste avisa antes de expirar, dá pelo menos 20 segundos para estender com uma ação simples e recupera o rascunho não sensível após reconectar.
- **Preservar:** política de expiração definida pela segurança.
- **Dependência externa:** pendente — o tempo de sessão é definido por segurança ou TI.
- **Métrica a monitorar:** tarefas reiniciadas do zero.
- **Fonte:** WCAG 2.2 SC 2.2.1 Timing Adjustable — github.com/w3c/wcag@9b94e18, guidelines/sc/20/timing-adjustable.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

## Tabelas e dashboards

### UXK-DSH-002 — Indicadores com unidade, período e legenda sem cor
- **Contexto:** dashboards · todas as stacks · mobile e desktop
- **Estados:** normal
- **Quando se aplica:** painéis com números, gráficos ou tabelas.
- **Exceções:** contagens simples já rotuladas no próprio título.
- **Evidência a coletar:** captura do painel; lista de indicadores sem unidade, período, fuso ou data de atualização; séries de gráfico diferenciadas só por cor.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Exibir unidade, período, fuso e data de atualização junto a cada indicador e diferenciar séries de gráfico por rótulo ou forma, não só por cor.
- **Critério de aceite:** Cada indicador visível tem unidade e período legíveis sem passar o mouse, e as séries do gráfico se distinguem sem cor.
- **Preservar:** definições e fórmulas das métricas.
- **Dependência externa:** pendente — as definições das métricas vêm do responsável pelos dados.
- **Métrica a monitorar:** perguntas ao suporte sobre interpretação de números.
- **Fonte:** WCAG 2.2 SC 1.4.1 Use of Color — github.com/w3c/wcag@9b94e18, guidelines/sc/20/use-of-color.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-DSH-003 — Carregamento por bloco sem zeros falsos
- **Contexto:** dashboards · todas as stacks · mobile e desktop
- **Estados:** carregando
- **Quando se aplica:** painéis com consultas lentas ou várias fontes de dados.
- **Exceções:** dados em cache exibidos instantaneamente.
- **Evidência a coletar:** capturas do carregamento com rede limitada, bloco a bloco.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Carregar por bloco com espaço reservado do tamanho final e nunca exibir zero ou valor antigo como se fosse o dado atual.
- **Critério de aceite:** Durante o carregamento, nenhum indicador mostra "0" ou o valor anterior sem indicação de que ainda está carregando.
- **Preservar:** ordem e agrupamento dos blocos.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** recarregamentos manuais do painel.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-DSH-004 — Falha isolada no bloco afetado
- **Contexto:** dashboards · todas as stacks · mobile e desktop
- **Estados:** erro
- **Quando se aplica:** uma das fontes de dados do painel falha.
- **Exceções:** painéis de fonte única, em que a falha é da página inteira (ver UXK-ERR-004).
- **Evidência a coletar:** bloquear a requisição de um bloco em ambiente de teste e capturar o painel inteiro.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Limitar o erro ao bloco afetado, mostrar o horário do último dado válido e permitir tentar de novo só aquele bloco.
- **Critério de aceite:** Com uma fonte bloqueada, os outros blocos continuam visíveis, e o bloco afetado mostra o erro e o horário do último dado válido.
- **Preservar:** regras de permissão por bloco.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** abandono do painel após um erro.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-DSH-005 — Atualização sem roubar foco nem rolagem
- **Contexto:** dashboards · todas as stacks · mobile e desktop
- **Estados:** sucesso
- **Quando se aplica:** o painel atualiza dados automaticamente ou a pedido.
- **Exceções:** relatórios fechados sem atualização.
- **Evidência a coletar:** forçar uma atualização e observar anúncio, foco e posição de rolagem.
- **Método:** inspeção
- **Prioridade padrão:** P3
- **Recomendação:** Mostrar o horário da última atualização e anunciar a mudança sem mover o foco nem a rolagem.
- **Critério de aceite:** Após atualizar, o horário muda, e o foco e a posição de rolagem continuam onde estavam.
- **Preservar:** frequência de atualização configurada.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** atualizações manuais redundantes.
- **Fonte:** WCAG 2.2 SC 4.1.3 Status Messages — github.com/w3c/wcag@9b94e18, guidelines/sc/21/status-messages.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-DSH-006 — Período sem dados diferente de zero
- **Contexto:** dashboards · todas as stacks · mobile e desktop
- **Estados:** vazio
- **Quando se aplica:** filtro ou período escolhido não tem dados.
- **Exceções:** primeiro acesso sem dados (ver UXK-ERR-006).
- **Evidência a coletar:** em conta de teste, aplicar um período sem dados e capturar.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Diferenciar "sem dados no período" de zero e de erro, com ação para mudar o período.
- **Critério de aceite:** Um período sem dados mostra mensagem diferente de zero e oferece ajuste do período.
- **Preservar:** filtros escolhidos pela pessoa.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** decisões tomadas sobre zero falso, quando relatadas.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-DSH-007 — Retomada automática quando a fonte volta
- **Contexto:** dashboards · todas as stacks · mobile e desktop
- **Estados:** recuperação
- **Quando se aplica:** uma atualização falhou e a fonte volta a responder.
- **Exceções:** painéis com atualização apenas manual.
- **Evidência a coletar:** bloquear e liberar a fonte em ambiente de teste; registrar se o painel volta sozinho ou exige recarregar a página.
- **Método:** inspeção
- **Prioridade padrão:** P3
- **Recomendação:** Retomar a atualização quando a fonte volta, mantendo filtros e retirando o aviso de erro.
- **Critério de aceite:** Depois de liberar a fonte, o painel volta a atualizar sem recarregar a página e mantém os filtros.
- **Preservar:** filtros e permissões vigentes.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** recarregamentos completos da página.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada
