# Jornadas por stack

Estas unidades complementam as unidades gerais quando a stack muda **onde** o problema é corrigido ou **quem** decide. Use-as somente depois de confirmar a stack pela inspeção do projeto; o detector entrega apenas `signal` ou `likely`. Caminhos citados vêm de temas e documentação de referência no commit indicado. Cada projeto pode ter outra estrutura: confirme o arquivo real antes de apontá-lo no relatório. Combinações sem unidade aparecem como lacuna ou "não se aplica" no mapa de cobertura do repositório.

## Shopify

### UXK-CHK-101 — Shopify: checkout fora do tema, carrinho dentro
- **Contexto:** e-commerce · checkout e carrinho · Shopify · [comercial]
- **Estados:** normal, vazio
- **Quando se aplica:** loja Shopify com tema Online Store 2.0.
- **Exceções:** lojas com extensões de checkout instaladas; avalie o que a extensão exibe, mas trate a correção como fora do tema.
- **Evidência a coletar:** arquivos `templates/cart.json`, `sections/main-cart-items.liquid` e `sections/main-cart-footer.liquid`, ou os equivalentes do tema; capturas do carrinho cheio e vazio.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Registrar achados das etapas de checkout como dependência da plataforma ou do app de checkout; no tema, propor correções apenas no carrinho e nos textos de `locales/*.json`.
- **Critério de aceite:** Nenhum achado de checkout aponta arquivo do tema como local de correção, e os achados de carrinho citam a seção e a chave de tradução envolvidas.
- **Preservar:** configurações de checkout no admin e apps instalados.
- **Dependência externa:** pendente — mudanças no checkout dependem da plataforma, do app e do responsável comercial.
- **Métrica a monitorar:** passagem do carrinho para o checkout.
- **Fonte:** tema de referência Shopify Dawn — github.com/Shopify/dawn@0522253: não existe `layout/checkout.liquid`; carrinho em `templates/cart.json` e `sections/main-cart-items.liquid` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-FRM-101 — Shopify: textos de formulário nas chaves de tradução
- **Contexto:** formulários · contato e newsletter · Shopify
- **Estados:** normal, erro, sucesso
- **Quando se aplica:** formulários renderizados pelo próprio tema.
- **Exceções:** formulários de apps de terceiros, que ficam fora do tema.
- **Evidência a coletar:** `sections/contact-form.liquid` (tag `{% form 'contact' %}`) e as chaves `templates.contact.form.*` em `locales/pt-BR.json`; capturas dos estados de erro e de sucesso.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Corrigir rótulos e mensagens nas chaves de `locales/*.json` de todas as línguas ativas e a marcação na seção, sem fixar texto no Liquid.
- **Critério de aceite:** Cada mudança de texto proposta cita a chave de tradução e existe em todas as línguas ativas do tema.
- **Preservar:** chaves compartilhadas com outras seções e traduções editadas pelo lojista.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** envios do formulário de contato.
- **Fonte:** Shopify Dawn — github.com/Shopify/dawn@0522253, `sections/contact-form.liquid` usa `{% form 'contact' %}` e `'templates.contact.form.*' | t` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-NAV-101 — Shopify: itens do menu são conteúdo do admin
- **Contexto:** navegação · cabeçalho e gaveta · Shopify
- **Estados:** normal
- **Quando se aplica:** cabeçalho e menu mobile do tema.
- **Exceções:** temas com menu fixo no código; registre esse caso.
- **Evidência a coletar:** configuração `menu` da seção `sections/header.liquid` (lista de links, padrão `main-menu`) e uso de `section.settings.menu.links` em `snippets/header-drawer.liquid`; captura do menu aberto em 375 px.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Separar achados sobre itens, nomes e ordem do menu, que o lojista edita no admin, de achados de interação e estilo, que ficam na seção e no snippet do tema.
- **Critério de aceite:** Achados sobre itens do menu têm dependência pendente com o lojista, e achados de teclado ou foco apontam `sections/header.liquid` ou o snippet da gaveta.
- **Preservar:** menus configurados no admin.
- **Dependência externa:** pendente — a estrutura de navegação é decisão do lojista.
- **Métrica a monitorar:** uso do menu comparado ao uso da busca.
- **Fonte:** Shopify Dawn — github.com/Shopify/dawn@0522253, `sections/header.liquid` (setting `menu`, padrão `main-menu`) e `snippets/header-drawer.liquid` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-ERR-101 — Shopify: página 404 e carrinho vazio em seções
- **Contexto:** erros e estados vazios · Shopify
- **Estados:** erro, vazio
- **Quando se aplica:** tema Shopify com páginas de erro e carrinho padrão.
- **Exceções:** apps que substituem a página 404.
- **Evidência a coletar:** `templates/404.json` com `sections/main-404.liquid`; condição `cart == empty` em `sections/main-cart-items.liquid` com o texto `sections.cart.empty`; capturas dos dois estados.
- **Método:** inspeção
- **Prioridade padrão:** P3
- **Recomendação:** Ajustar a página 404 e o carrinho vazio nessas seções e nas chaves de tradução, oferecendo busca e caminho para coleções.
- **Critério de aceite:** A página 404 e o carrinho vazio oferecem pelo menos uma ação para continuar, com textos vindos de `locales`.
- **Preservar:** configurações de seção editáveis pelo lojista.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** saídas a partir da página 404 da loja.
- **Fonte:** Shopify Dawn — github.com/Shopify/dawn@0522253, `templates/404.json`, `sections/main-404.liquid` e `sections/main-cart-items.liquid` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

## VTEX IO

### UXK-CHK-201 — VTEX IO: minicart no tema, checkout fora dele
- **Contexto:** e-commerce · minicart e checkout · VTEX IO · [comercial]
- **Estados:** normal, vazio
- **Quando se aplica:** loja VTEX IO com store theme.
- **Exceções:** checkout customizado em app próprio; trate como fora do tema.
- **Evidência a coletar:** `manifest.json` com builders `styles` e `store`, sem builder de checkout; blocos `minicart.v2`, `minicart-empty-state` e `minicart-checkout-button` em `store/blocks/minicart.jsonc`; capturas do minicart cheio e vazio.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Auditar minicart e estado vazio nos blocos do tema e registrar achados das etapas de checkout como dependência da plataforma.
- **Critério de aceite:** Achados de pagamento não apontam arquivos do store theme, e achados do minicart citam o bloco afetado.
- **Preservar:** configuração de checkout da conta.
- **Dependência externa:** pendente — o checkout é configurado fora do tema, com o responsável comercial.
- **Métrica a monitorar:** passagem do minicart para o checkout.
- **Fonte:** VTEX store-theme — github.com/vtex-apps/store-theme@c46492d, `manifest.json` (builders `styles`, `store`, `sitemap`, `docs`) e `store/blocks/minicart.jsonc` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-FRM-201 — VTEX IO: cores de erro e sucesso nos tokens semânticos
- **Contexto:** formulários · mensagens de estado · VTEX IO
- **Estados:** erro, sucesso
- **Quando se aplica:** mensagens de erro, aviso e sucesso usam as cores do tema.
- **Exceções:** componentes de terceiros com estilo próprio.
- **Evidência a coletar:** `styles/configs/style.json`, chaves `semanticColors.background.danger`, `success`, `warning` e variantes `--faded`; contraste medido com `extract-styles` nas mensagens.
- **Método:** automático
- **Prioridade padrão:** P1
- **Recomendação:** Corrigir o contraste das mensagens de estado nos tokens semânticos, conferindo a combinação de texto e fundo, e não em CSS avulso.
- **Critério de aceite:** Mensagens de erro e sucesso medidas atingem 4,5:1 para texto normal, e a correção proposta altera `semanticColors`.
- **Preservar:** demais chaves da paleta da marca.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** erros de preenchimento corrigidos na primeira tentativa.
- **Fonte:** VTEX store-theme — github.com/vtex-apps/store-theme@c46492d, `styles/configs/style.json`; WCAG 2.2 SC 1.4.3 Contrast (Minimum) — github.com/w3c/wcag@9b94e18 · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-NAV-201 — VTEX IO: busca, filtros e ordenação em blocos com variante mobile
- **Contexto:** navegação · busca e categoria · VTEX IO
- **Estados:** normal
- **Quando se aplica:** páginas de busca e categoria do store theme.
- **Exceções:** busca customizada em app próprio.
- **Evidência a coletar:** `store/blocks/search.jsonc` com `search-result-layout.desktop`, `search-result-layout.mobile`, `filter-navigator.v3` e `order-by.v2`; capturas em 375 e 1440 px.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Ajustar a composição da busca nos blocos e conferir separadamente as variantes desktop e mobile.
- **Critério de aceite:** Cada achado de busca cita o bloco e a variante, desktop ou mobile, em que aparece.
- **Preservar:** configuração do motor de busca da conta.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** uso de filtros na busca mobile.
- **Fonte:** VTEX store-theme — github.com/vtex-apps/store-theme@c46492d, `store/blocks/search.jsonc` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-ERR-201 — VTEX IO: busca sem resultado em bloco próprio
- **Contexto:** erros e estados vazios · busca · VTEX IO
- **Estados:** vazio
- **Quando se aplica:** a busca do store theme não encontra produtos.
- **Exceções:** lojas que redirecionam buscas vazias para outra página.
- **Evidência a coletar:** bloco `search-not-found-layout` em `store/blocks/search.jsonc`; captura com termo sintético inexistente.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Compor no bloco de "não encontrado" o termo buscado, sugestões e caminhos para categorias.
- **Critério de aceite:** A proposta de correção altera `search-not-found-layout` e, com termo inexistente, a página mostra pelo menos uma ação para continuar.
- **Preservar:** redirecionamentos de busca configurados na conta.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** saídas após busca vazia na loja VTEX.
- **Fonte:** VTEX store-theme — github.com/vtex-apps/store-theme@c46492d, `store/blocks/search.jsonc` (`search-not-found-layout`) · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

## WordPress e WooCommerce

### UXK-CHK-301 — WooCommerce: identificar checkout em blocos ou clássico
- **Contexto:** e-commerce · checkout · WordPress/WooCommerce · [comercial]
- **Estados:** normal, erro
- **Quando se aplica:** loja WooCommerce.
- **Exceções:** checkout substituído por gateway externo; avalie a transição.
- **Evidência a coletar:** em tema de blocos, `templates/page-checkout.html` com o bloco Checkout no conteúdo da página; em tema clássico, override `woocommerce/checkout/form-checkout.php` no tema ou no tema filho.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Confirmar qual checkout está ativo antes de propor mudança; em blocos, ajustar o template ao redor e manter o bloco Checkout no conteúdo da página; no clássico, usar override no tema filho, nunca editar o plugin.
- **Critério de aceite:** Cada achado de checkout informa se é em blocos ou clássico e aponta template ou override do tema, nunca arquivo em `wp-content/plugins/woocommerce`.
- **Preservar:** gateways e plugins de pagamento.
- **Dependência externa:** pendente — condições comerciais e gateways pertencem ao responsável pela loja.
- **Métrica a monitorar:** abandono no checkout WooCommerce.
- **Fonte:** WooCommerce — github.com/woocommerce/woocommerce@b9cfe5f, `docs/theming/block-theme-development/theming-woo-blocks.md` e `docs/theming/theme-development/template-structure.md` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-FRM-301 — WordPress: estilo de campos pelos presets do theme.json
- **Contexto:** formulários · tema de blocos · WordPress/WooCommerce
- **Estados:** normal, erro
- **Quando se aplica:** tema de blocos com `theme.json`.
- **Exceções:** formulários de plugins com CSS próprio; registre a dependência do plugin.
- **Evidência a coletar:** `theme.json`, chaves `settings.color.palette` e `settings.typography.fontFamilies`; em tema clássico com WooCommerce, override `woocommerce/myaccount/form-login.php`.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Ajustar cores e tipografia dos campos pelos presets do `theme.json`; para formulários de plugin, propor override suportado ou CSS do tema, sem editar o plugin.
- **Critério de aceite:** Cada achado de estilo de formulário aponta um preset do `theme.json`, um override do tema ou CSS do tema.
- **Preservar:** presets usados por outros blocos.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** erros de preenchimento no login e no cadastro.
- **Fonte:** WordPress Twenty Twenty-Four — github.com/WordPress/twentytwentyfour@a382244, `theme.json` (versão 2, `settings.color.palette`); WooCommerce@b9cfe5f, `plugins/woocommerce/templates/myaccount/form-login.php` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-NAV-301 — WordPress: itens do menu vêm do conteúdo do site
- **Contexto:** navegação · cabeçalho · WordPress/WooCommerce
- **Estados:** normal
- **Quando se aplica:** tema de blocos com bloco Navigation no cabeçalho.
- **Exceções:** temas clássicos com menus registrados em PHP, não verificados nesta base.
- **Evidência a coletar:** `parts/header.html` com o bloco `wp:navigation` sem itens no arquivo; captura do menu mobile aberto.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Separar achados de itens do menu, que são conteúdo editado no site, de achados de layout e estilo, que ficam no template part e no `theme.json`.
- **Critério de aceite:** Achados sobre itens do menu têm dependência pendente com quem edita o site, e achados de layout apontam `parts/header.html`.
- **Preservar:** menus publicados.
- **Dependência externa:** pendente — o conteúdo do menu é responsabilidade de quem edita o site.
- **Métrica a monitorar:** uso do menu mobile.
- **Fonte:** WordPress Twenty Twenty-Four — github.com/WordPress/twentytwentyfour@a382244, `parts/header.html` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-ERR-301 — WordPress e WooCommerce: 404 e carrinho vazio
- **Contexto:** erros e estados vazios · WordPress/WooCommerce
- **Estados:** erro, vazio
- **Quando se aplica:** site WordPress, com ou sem WooCommerce.
- **Exceções:** plugins que substituem a página 404.
- **Evidência a coletar:** `templates/404.html` no tema de blocos; em WooCommerce clássico, `cart/cart-empty.php` e override equivalente no tema; capturas dos estados.
- **Método:** inspeção
- **Prioridade padrão:** P3
- **Recomendação:** Ajustar a página 404 no template do tema e o carrinho vazio por override do tema, oferecendo busca e caminhos de volta.
- **Critério de aceite:** As propostas apontam `templates/404.html` ou o override em `woocommerce/cart/cart-empty.php` do tema, e as duas telas oferecem ação para continuar.
- **Preservar:** redirecionamentos configurados por plugins de SEO.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** saídas a partir da 404 do WordPress.
- **Fonte:** WordPress Twenty Twenty-Four@a382244, `templates/404.html`; WooCommerce@b9cfe5f, `plugins/woocommerce/templates/cart/cart-empty.php` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

## React, Next.js e Tailwind CSS

### UXK-CHK-401 — React: envio do pagamento bloqueado durante o pending
- **Contexto:** e-commerce · checkout · React/Next.js
- **Estados:** carregando
- **Quando se aplica:** formulário de pagamento em React que usa `<form action>`.
- **Exceções:** formulários com manipulador próprio de envio; confira o estado de envio implementado no código.
- **Evidência a coletar:** componente do botão de pagar; uso de `useFormStatus` e de `pending` para desabilitar o botão e exibir o andamento.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Desabilitar o botão e trocar seu texto enquanto `pending` for verdadeiro, combinando com região de status para o anúncio (ver UXK-CHK-005).
- **Critério de aceite:** O botão de pagar usa o estado `pending` do formulário, ou estado equivalente, para impedir novo envio e mostrar o andamento.
- **Preservar:** integração com o SDK de pagamento.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** pedidos duplicados no checkout React.
- **Fonte:** React — github.com/reactjs/react.dev@0821e7d, `src/content/reference/react-dom/hooks/useFormStatus.md` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-FRM-401 — React: rótulo com htmlFor e ID gerado por useId
- **Contexto:** formulários · componentes reutilizáveis · React/Next.js
- **Estados:** normal
- **Quando se aplica:** componentes de campo reutilizados mais de uma vez na mesma página.
- **Exceções:** campos aninhados dentro do próprio `<label>`, que dispensam ID.
- **Evidência a coletar:** código do componente de campo; uso de `htmlFor` e de IDs fixos que se repetem; regra `duplicate-id` ou `label` do axe.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Associar `<label htmlFor>` ao `id` do campo gerado com `useId`, para que instâncias repetidas não compartilhem o mesmo ID.
- **Critério de aceite:** Com duas instâncias do componente na mesma página, cada rótulo aponta para o próprio campo, e o axe não acusa ID duplicado nem campo sem rótulo.
- **Preservar:** API pública do componente de campo.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** erros de preenchimento nos formulários em React.
- **Fonte:** React — github.com/reactjs/react.dev@0821e7d, `src/content/reference/react-dom/components/input.md` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-NAV-401 — Next.js: título único para o anúncio de rota
- **Contexto:** navegação · transições no cliente · React/Next.js
- **Estados:** normal
- **Quando se aplica:** app Next.js com navegação por `next/link`.
- **Exceções:** páginas renderizadas sempre por navegação completa, sem transição no cliente.
- **Evidência a coletar:** títulos de cada rota (`document.title`) e o `<h1>`; navegação entre duas rotas com leitor de tela.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Dar a cada rota um título único e descritivo, porque o anunciador de rotas do Next.js usa primeiro `document.title`, depois o `<h1>` e por fim o caminho da URL.
- **Critério de aceite:** Cada rota auditada tem `document.title` único e descritivo, e a navegação entre duas rotas é anunciada pelo título.
- **Preservar:** metadados de SEO por rota.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** navegações abandonadas logo após a transição.
- **Fonte:** Next.js — github.com/vercel/next.js@fac5fc8, `docs/03-architecture/accessibility.mdx` (Route Announcements) · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-ERR-401 — Next.js: error.js com nova tentativa por segmento
- **Contexto:** erros · App Router · React/Next.js
- **Estados:** erro, recuperação
- **Quando se aplica:** app Next.js com App Router e segmentos que carregam dados remotos.
- **Exceções:** projetos com Pages Router, que usam outras convenções.
- **Evidência a coletar:** arquivos `error.js` por segmento; presença de ação de nova tentativa com `retry()`; captura do estado de erro com a falha de um segmento simulada em ambiente de teste.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Criar `error.js` nos segmentos com dados remotos, com mensagem compreensível e ação de nova tentativa, para que a falha de um segmento não derrube a página inteira.
- **Critério de aceite:** Com a falha simulada de um segmento, a interface mostra a mensagem do `error.js` daquele segmento, mantém visível o layout acima dele e oferece nova tentativa.
- **Preservar:** `global-error.js` e o layout raiz.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** erros de renderização registrados por segmento.
- **Fonte:** Next.js — github.com/vercel/next.js@fac5fc8, `docs/01-app/03-api-reference/03-file-conventions/error.mdx` (o `error.js` envolve o segmento e não o layout acima dele; `retry()` tenta renderizar de novo) · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-DSH-401 — Next.js: loading.js por segmento do painel
- **Contexto:** dashboards · carregamento · React/Next.js
- **Estados:** carregando
- **Quando se aplica:** painel em Next.js com App Router e dados lentos.
- **Exceções:** dados já em cache no cliente.
- **Evidência a coletar:** arquivos `loading.js` e limites de `Suspense` nos segmentos do painel; capturas do carregamento com rede limitada.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Usar `loading.js` ou `Suspense` por segmento para que cada bloco do painel mostre o próprio estado de carregamento, sem bloquear o painel inteiro (ver UXK-DSH-003).
- **Critério de aceite:** Com rede limitada, os blocos já carregados ficam visíveis enquanto os lentos mostram estado de carregamento próprio.
- **Preservar:** estratégia de cache e de revalidação dos dados.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** tempo até o primeiro bloco útil do painel.
- **Fonte:** Next.js — github.com/vercel/next.js@fac5fc8, `docs/01-app/03-api-reference/03-file-conventions/loading.mdx` · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

## HTML estático

### UXK-FRM-501 — HTML: mensagens nativas de validação dependem do navegador
- **Contexto:** formulários · validação nativa · HTML
- **Estados:** erro
- **Quando se aplica:** formulário HTML com `required`, `type` ou `pattern` sem mensagens próprias.
- **Exceções:** formulários que já desativam a validação nativa e exibem mensagens próprias acessíveis.
- **Evidência a coletar:** atributos de validação no HTML; capturas do erro em dois navegadores ou idiomas de navegador diferentes.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Quando a mensagem precisa seguir o idioma e o tom da página, usar `setCustomValidity` ou mensagens próprias ligadas ao campo (ver UXK-FRM-005).
- **Critério de aceite:** O erro do campo aparece no idioma da página, independentemente do idioma do navegador, e continua ligado ao campo.
- **Preservar:** validação no servidor.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** envios com erro no formulário estático.
- **Fonte:** MDN — github.com/mdn/content@a0ba038, `files/en-us/learn_web_development/extensions/forms/form_validation/index.md` (mensagens dependem do navegador e do idioma) · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-NAV-501 — HTML: cabeçalho copiado em cada página e navegação consistente
- **Contexto:** navegação · sites sem template compartilhado · HTML
- **Estados:** normal
- **Quando se aplica:** site estático com o cabeçalho repetido manualmente em vários arquivos `.html`.
- **Exceções:** sites estáticos gerados com includes ou gerador de site.
- **Evidência a coletar:** comparação do bloco de navegação entre os arquivos HTML do projeto (ordem dos links, rótulos e destinos).
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Manter a mesma ordem e os mesmos rótulos dos links em todas as páginas e propor um include ou gerador quando a duplicação causar divergência.
- **Critério de aceite:** Os links de navegação aparecem na mesma ordem relativa em todas as páginas auditadas.
- **Preservar:** URLs e nomes de arquivos existentes.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** navegação entre páginas do site estático.
- **Fonte:** WCAG 2.2 SC 3.2.3 Consistent Navigation — github.com/w3c/wcag@9b94e18, guidelines/sc/20/consistent-navigation.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-ERR-501 — HTML: página de endereço não encontrado própria do site
- **Contexto:** erros · hospedagem estática · HTML
- **Estados:** erro
- **Quando se aplica:** site estático publicado em servidor ou serviço de hospedagem.
- **Exceções:** sites servidos por aplicação que gera as próprias páginas de erro.
- **Evidência a coletar:** existência de `404.html` no projeto; captura de uma rota inexistente no preview ou no ambiente publicado autorizado.
- **Método:** inspeção
- **Prioridade padrão:** P3
- **Recomendação:** Criar `404.html` com o cabeçalho do site, mensagem clara e links ou busca, e confirmar com quem mantém a hospedagem como essa página é servida.
- **Critério de aceite:** Uma rota inexistente no ambiente auditado mostra a página do próprio site, com mensagem em texto e links para continuar, em vez da página genérica do servidor.
- **Preservar:** configuração de hospedagem e redirecionamentos.
- **Dependência externa:** pendente — a configuração do servidor pertence a quem mantém a hospedagem.
- **Métrica a monitorar:** saídas a partir de links quebrados.
- **Fonte:** não verificada — a convenção de `404.html` varia por hospedagem e não foi consultada
