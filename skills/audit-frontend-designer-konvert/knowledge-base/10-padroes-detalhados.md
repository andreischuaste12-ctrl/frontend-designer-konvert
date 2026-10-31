# Padrões específicos de jornadas

Unidades para problemas recorrentes que não cabem em um único estado. Aplique apenas quando a função existe no projeto, com dados sintéticos e sem transações reais. Duplicatas de [jornadas e estados](09-jornadas-e-estados.md) foram removidas: rótulo e erro de campo estão em UXK-FRM-003 e UXK-FRM-005, envio duplicado em UXK-CHK-005 e unidades de dashboard em UXK-DSH-002.

## Checkout brasileiro

### UXK-CHK-051 — CEP e cálculo de frete
- **Contexto:** e-commerce · produto, carrinho e checkout · todas as stacks · mobile · [comercial]
- **Estados:** normal, carregando, erro
- **Quando se aplica:** a loja calcula frete ou prazo a partir do CEP.
- **Exceções:** frete fixo nacional ou somente retirada na loja.
- **Evidência a coletar:** captura em 375 px do campo de CEP aberto; atributos `inputmode`, `autocomplete` e `maxlength`; resposta para um CEP sintético inexistente; estado exibido durante a consulta.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Rotular o campo como CEP, abrir teclado numérico (`inputmode="numeric"`), aceitar o valor com ou sem hífen, usar `autocomplete="postal-code"`, oferecer ajuda para quem não sabe o CEP e mostrar preço e prazo de cada opção antes do pagamento.
- **Critério de aceite:** Em 375 px o campo abre teclado numérico, aceita "01001000" e "01001-000", e um CEP inexistente gera mensagem em texto junto ao campo.
- **Preservar:** tabelas de frete, regras de prazo e integrações com transportadoras.
- **Dependência externa:** pendente — tabelas e prazos são definidos pelo responsável logístico.
- **Métrica a monitorar:** abandono no cálculo de frete e erros de CEP por sessão.
- **Fonte:** WCAG 2.2 SC 3.3.1 Error Identification — github.com/w3c/wcag@9b94e18, guidelines/sc/20/error-identification.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-CHK-052 — Pix copia e cola, validade e novo código
- **Contexto:** e-commerce · pagamento · todas as stacks · mobile · [comercial]
- **Estados:** normal, erro, recuperação
- **Quando se aplica:** a loja oferece Pix.
- **Exceções:** Pix processado em página externa do intermediador; avalie a ida e o retorno.
- **Evidência a coletar:** captura em sandbox, em 375 px, do QR e do código copia e cola; retorno do botão Copiar; validade exibida; comportamento quando o código expira.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** No mobile, priorizar o código copia e cola com botão Copiar que confirma a cópia em texto anunciado, mostrar valor e validade e permitir gerar novo código sem refazer o pedido.
- **Critério de aceite:** Em 375 px o código aparece sem rolagem horizontal, o botão confirma a cópia em texto anunciado, e um código expirado permite gerar outro mantendo o pedido.
- **Preservar:** integração com o provedor de pagamento, valor e prazo de expiração.
- **Dependência externa:** pendente — validade e desconto do Pix são definidos pelo financeiro.
- **Métrica a monitorar:** pedidos com Pix expirado sem pagamento.
- **Fonte:** WCAG 2.2 SC 4.1.3 Status Messages (confirmação da cópia) e SC 2.2.1 Timing Adjustable (limite de tempo) — github.com/w3c/wcag@9b94e18, guidelines/sc/21/status-messages.html e guidelines/sc/20/timing-adjustable.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-CHK-053 — Parcelamento consistente entre páginas
- **Contexto:** e-commerce · produto, carrinho e checkout · todas as stacks · mobile e desktop · [comercial]
- **Estados:** normal, erro
- **Quando se aplica:** a loja oferece parcelamento.
- **Exceções:** parcelas exibidas somente dentro do iframe do gateway; avalie apenas o que é visível.
- **Evidência a coletar:** capturas da página de produto, do carrinho e do checkout para o mesmo produto sintético: número de parcelas, valor da parcela, indicação de juros e total a prazo.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Mostrar juntos o número de parcelas, o valor da parcela, se há juros e o total a prazo, com os mesmos valores na página de produto, no carrinho e no checkout.
- **Critério de aceite:** Para o mesmo produto sintético, produto, carrinho e checkout exibem a mesma quantidade de parcelas, o mesmo valor da parcela e o mesmo total.
- **Preservar:** regras do adquirente e textos legais sobre juros.
- **Dependência externa:** pendente — condições de parcelamento são do financeiro, e exigências legais devem ser confirmadas pelo jurídico.
- **Métrica a monitorar:** abandono na escolha de parcelas e contatos sobre juros.
- **Fonte:** não verificada — heurística editorial do projeto; exigências legais de informação não foram consultadas

### UXK-CHK-054 — Compra sem criar conta
- **Contexto:** e-commerce · identificação no checkout · todas as stacks · mobile e desktop
- **Estados:** normal
- **Quando se aplica:** a loja pede login ou cadastro antes do pagamento.
- **Exceções:** produtos que exigem conta por regra, como assinatura ou venda controlada.
- **Evidência a coletar:** captura da etapa de identificação; ações disponíveis; exigência de senha; se o login aceita gerenciador de senhas e colar.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Oferecer continuar como convidado com e-mail e criação de conta depois da compra, quando o negócio permitir; quando houver login, aceitar gerenciador de senhas e colar.
- **Critério de aceite:** É possível chegar ao pagamento sem criar senha, ou a tela explica por que a conta é obrigatória.
- **Preservar:** regras de cadastro e registros de consentimento.
- **Dependência externa:** pendente — permitir compra sem conta é decisão de negócio.
- **Métrica a monitorar:** abandono na etapa de identificação.
- **Fonte:** WCAG 2.2 SC 3.3.8 Accessible Authentication (Minimum), aplicável ao login — github.com/w3c/wcag@9b94e18, guidelines/sc/22/accessible-authentication-minimum.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

## Formulários

### UXK-FRM-053 — Validação no momento certo
- **Contexto:** formulários · todas as stacks · mobile e desktop
- **Estados:** erro, recuperação
- **Quando se aplica:** o formulário valida enquanto a pessoa digita.
- **Exceções:** checagens que precisam de resposta durante a digitação, como disponibilidade de nome de usuário.
- **Evidência a coletar:** digitar um e-mail sintético caractere por caractere e registrar quando o erro aparece e quando some.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Validar ao sair do campo ou ao enviar, não a cada tecla, e remover o erro assim que o valor ficar correto.
- **Critério de aceite:** Digitar um e-mail válido caractere por caractere não exibe erro antes de sair do campo, e corrigir um erro o remove sem novo envio.
- **Preservar:** regras de validação do back-end.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** correções por campo antes do envio.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-FRM-054 — Teclado e preenchimento automático corretos
- **Contexto:** formulários · dados pessoais e endereço · todas as stacks · mobile
- **Estados:** normal
- **Quando se aplica:** campos que coletam dados da própria pessoa, como nome, e-mail, telefone e endereço.
- **Exceções:** campos com dados de terceiros, como destinatário de presente; a WCAG 1.3.5 trata de dados sobre a própria pessoa.
- **Evidência a coletar:** atributos `type`, `inputmode` e `autocomplete` de cada campo no HTML renderizado; captura do teclado em dispositivo ou emulador.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Usar `type="email"` e `type="tel"`, `inputmode="numeric"` para CEP e CPF, e `autocomplete` com o token correto, como `name`, `email`, `tel` e `postal-code`.
- **Critério de aceite:** Todo campo sobre a própria pessoa tem `autocomplete` com token válido, e o teclado exibido no mobile corresponde ao tipo de dado.
- **Preservar:** nomes de campos esperados pelo back-end.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** tempo de preenchimento do formulário.
- **Fonte:** WCAG 2.2 SC 1.3.5 Identify Input Purpose — github.com/w3c/wcag@9b94e18, guidelines/sc/21/identify-input-purpose.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-FRM-055 — Senha com gerenciador, colar e requisitos visíveis
- **Contexto:** autenticação · login e criação de senha · todas as stacks · mobile e desktop
- **Estados:** normal, erro
- **Quando se aplica:** o fluxo pede senha para entrar ou cadastrar.
- **Exceções:** autenticação sem senha, como link por e-mail ou passkey; avalie o fluxo equivalente.
- **Evidência a coletar:** captura do formulário; teste de colar no campo; atributo `autocomplete` (`current-password` ou `new-password`); momento em que os requisitos aparecem.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Permitir colar e usar gerenciador de senhas, mostrar requisitos antes da digitação e oferecer mostrar e ocultar a senha.
- **Critério de aceite:** O campo aceita colar, usa `autocomplete="current-password"` ou `"new-password"`, e os requisitos estão visíveis antes do primeiro envio.
- **Preservar:** política de senha e proteções contra abuso.
- **Dependência externa:** pendente — a política de senha é definida pela segurança.
- **Métrica a monitorar:** redefinições de senha e falhas de login.
- **Fonte:** WCAG 2.2 SC 3.3.8 Accessible Authentication (Minimum), que cita gerenciadores de senha e copiar e colar como mecanismos — github.com/w3c/wcag@9b94e18, guidelines/sc/22/accessible-authentication-minimum.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

## Navegação e listagem

### UXK-NAV-051 — Menu suspenso operável por teclado e ponteiro
- **Contexto:** navegação · menus suspensos, gaveta e mega menu · todas as stacks · mobile e desktop
- **Estados:** normal
- **Quando se aplica:** o menu tem submenus, gaveta ou abre por hover.
- **Exceções:** menu de um nível sem submenus (ver UXK-NAV-005).
- **Evidência a coletar:** abrir e fechar com Enter, Esc, clique e toque; conferir `aria-expanded`, destino do foco ao fechar e se o submenu de hover some ao mover o ponteiro sobre ele.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Abrir por clique ou teclado, não só por hover, expor o estado com `aria-expanded`, fechar com Esc devolvendo o foco ao botão e manter o submenu visível enquanto o ponteiro passa sobre ele.
- **Critério de aceite:** Pelo teclado o menu abre, fecha com Esc e o foco volta ao botão; com o ponteiro, o submenu não desaparece ao mover o cursor sobre ele.
- **Preservar:** itens e hierarquia do menu.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** uso da busca logo após abrir o menu.
- **Fonte:** WCAG 2.2 SC 1.4.13 Content on Hover or Focus, SC 2.1.1 Keyboard e SC 4.1.2 Name, Role, Value — github.com/w3c/wcag@9b94e18, guidelines/sc/21/content-on-hover-or-focus.html, guidelines/sc/20/keyboard.html e guidelines/sc/20/name-role-value.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-NAV-052 — Filtros aplicados visíveis e removíveis
- **Contexto:** listagem · filtros e facetas · todas as stacks · mobile
- **Estados:** normal, recuperação
- **Quando se aplica:** listagens com filtros.
- **Exceções:** listas curtas sem filtros.
- **Evidência a coletar:** em 375 px, aplicar dois filtros, fechar a gaveta e capturar; verificar ação de limpar e remoção individual.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Mostrar os filtros aplicados como itens removíveis acima dos resultados, com contagem e ação para limpar todos.
- **Critério de aceite:** Em 375 px, depois de fechar a gaveta de filtros, os filtros aplicados continuam visíveis e cada um pode ser removido isoladamente.
- **Preservar:** lógica de facetas e contagens do motor de busca.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** filtros removidos por sessão.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-NAV-053 — Ordenação atual exposta e persistente
- **Contexto:** listagem · ordenação · todas as stacks · mobile e desktop
- **Estados:** normal
- **Quando se aplica:** listagens que podem ser ordenadas.
- **Exceções:** listas com ordem editorial fixa.
- **Evidência a coletar:** captura do controle de ordenação; nome acessível; comportamento ao paginar e voltar.
- **Método:** inspeção
- **Prioridade padrão:** P3
- **Recomendação:** Mostrar a ordem atual no próprio controle e manter a escolha ao paginar e ao voltar de um item.
- **Critério de aceite:** A ordem escolhida aparece no controle e continua aplicada ao avançar uma página e voltar.
- **Preservar:** ordem padrão definida pelo merchandising.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** trocas de ordenação por sessão.
- **Fonte:** WCAG 2.2 SC 4.1.2 Name, Role, Value (estado do controle exposto) — github.com/w3c/wcag@9b94e18, guidelines/sc/20/name-role-value.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-NAV-054 — Alvos de toque conforme o nível declarado
- **Contexto:** navegação e formulários · alvos de ponteiro e toque · todas as stacks · mobile
- **Estados:** normal
- **Quando se aplica:** controles acionados por ponteiro ou toque em páginas web.
- **Exceções:** pela WCAG 2.5.8: espaçamento em que círculos de 24 px centrados nos alvos não se cruzam; controle equivalente na mesma página que atende ao critério; alvo dentro de frase; tamanho definido pelo navegador sem estilo do autor; apresentação essencial ou exigida legalmente.
- **Evidência a coletar:** dimensões renderizadas dos controles em 375 px (`extract-styles`, campos `rect.w` e `rect.h`) e captura da área.
- **Método:** automático
- **Prioridade padrão:** P2
- **Recomendação:** Na web, garantir alvo de pelo menos 24×24 px CSS para o nível AA (SC 2.5.8) e 44×44 px CSS quando o escopo declara AAA (SC 2.5.5). Apps nativos seguem as diretrizes da plataforma, que não foram verificadas nesta base.
- **Critério de aceite:** Nenhum controle medido em 375 px fica abaixo de 24×24 px CSS sem uma exceção registrada; com escopo AAA, o limite é 44×44 px CSS.
- **Preservar:** hierarquia visual e densidade aprovadas pela marca.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** toques repetidos ou errados, quando houver dados.
- **Fonte:** WCAG 2.2 SC 2.5.8 Target Size (Minimum) e SC 2.5.5 Target Size (Enhanced) — github.com/w3c/wcag@9b94e18, guidelines/sc/22/target-size-minimum.html e guidelines/sc/21/target-size-enhanced.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

## Erros e conexão

### UXK-ERR-051 — Página não encontrada com status correto
- **Contexto:** sites e aplicações web · rotas inexistentes · todas as stacks · mobile e desktop
- **Estados:** erro
- **Quando se aplica:** uma URL inexistente é acessada.
- **Exceções:** APIs sem interface para pessoas.
- **Evidência a coletar:** status HTTP registrado pela captura (`capture-index.json`) para uma rota sintética inexistente e captura do conteúdo exibido.
- **Método:** automático
- **Prioridade padrão:** P2
- **Recomendação:** Responder com status 404, dizer em texto que a página não existe e oferecer busca e links para as seções principais.
- **Critério de aceite:** Uma rota inexistente retorna HTTP 404, não 200, e mostra busca ou links para as seções principais.
- **Preservar:** redirecionamentos 301 existentes.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** saídas a partir da página 404.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-ERR-052 — Queda de conexão sem perda do que foi digitado
- **Contexto:** aplicações web · formulários e ações online · todas as stacks · mobile
- **Estados:** erro, recuperação
- **Quando se aplica:** a pessoa digita ou age enquanto depende da rede.
- **Exceções:** sites só de leitura, sem formulários.
- **Evidência a coletar:** em ambiente de teste, desligar a rede (por exemplo `context.setOffline(true)` no Playwright) durante um envio e religar; registrar mensagens e dados mantidos.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Avisar que a conexão caiu, preservar o que foi digitado e reenviar ou orientar a pessoa quando a conexão voltar.
- **Critério de aceite:** Com a rede desligada durante um envio, a tela avisa em texto e os dados digitados continuam no formulário ao reconectar.
- **Preservar:** comportamento offline já implementado.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** envios perdidos registrados pelo suporte.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

## Dados e tabelas

### UXK-DSH-051 — Tabela larga sem rolagem horizontal da página
- **Contexto:** dashboards e relatórios · tabelas de dados · todas as stacks · mobile
- **Estados:** normal
- **Quando se aplica:** tabelas de dados exibidas em telas estreitas.
- **Exceções:** a WCAG 1.4.10 aceita rolagem bidimensional dentro de tabelas de dados, mas não na página inteira.
- **Evidência a coletar:** capturas em 320 e 375 px CSS; verificar se só o contêiner da tabela rola na horizontal e se os cabeçalhos usam `th` com `scope`.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Limitar a rolagem horizontal ao contêiner da tabela, manter cabeçalhos identificáveis e oferecer uma visão resumida quando possível.
- **Critério de aceite:** Em 320 px CSS a página não rola na horizontal, só o contêiner da tabela rola, e os cabeçalhos são `th`.
- **Preservar:** colunas e ordem definidas pelo responsável pelos dados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** exportações para planilha usadas como alternativa à tela.
- **Fonte:** WCAG 2.2 SC 1.4.10 Reflow e SC 1.3.1 Info and Relationships — github.com/w3c/wcag@9b94e18, guidelines/sc/21/reflow.html e guidelines/sc/20/info-and-relationships.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-DSH-053 — Densidade adequada a iniciantes e usuários frequentes
- **Contexto:** dashboards · densidade de informação · todas as stacks · desktop
- **Estados:** normal
- **Quando se aplica:** o mesmo painel atende quem está começando e quem usa todo dia.
- **Exceções:** telas operacionais com densidade definida por exigência do processo.
- **Evidência a coletar:** capturas em 1440 e 375 px; número de indicadores por tela; existência de controle de densidade ou de colunas.
- **Método:** hipótese
- **Prioridade padrão:** P3
- **Recomendação:** Priorizar poucos indicadores principais no topo e permitir expandir detalhes ou escolher colunas.
- **Critério de aceite:** Em teste com pessoas dos dois perfis, ambas encontram o indicador principal pedido sem ajuda; a tela oferece forma de revelar os indicadores secundários.
- **Preservar:** indicadores obrigatórios por contrato ou norma interna.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** tempo para encontrar um indicador em teste moderado.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-DSH-054 — Carregamento progressivo com contagem
- **Contexto:** dashboards e listas longas · paginação · todas as stacks · mobile e desktop
- **Estados:** carregando
- **Quando se aplica:** grandes volumes de linhas ou itens.
- **Exceções:** conjuntos pequenos carregados de uma vez.
- **Evidência a coletar:** com rede limitada, carregar mais itens e registrar a posição do foco e a contagem exibida.
- **Método:** inspeção
- **Prioridade padrão:** P3
- **Recomendação:** Carregar por páginas ou blocos informando quantos itens existem e quantos já foram exibidos.
- **Critério de aceite:** Ao carregar mais itens, o foco permanece no ponto de leitura e a contagem "X de Y" é atualizada.
- **Preservar:** paginação e limites da API.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** abandono em listas longas.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada
