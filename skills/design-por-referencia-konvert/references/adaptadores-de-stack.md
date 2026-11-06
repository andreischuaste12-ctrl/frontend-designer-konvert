# Adaptação ao projeto e à stack

O detector `node <skill>/scripts/detect-stack.mjs --root .` lê apenas marcadores locais limitados. `signal` indica um marcador; `likely`, dois ou mais. Nenhum é probabilidade calibrada ou confirmação: marcadores podem estar correlacionados ou ser falsos positivos. Confirme a stack pelo projeto antes de editar, registre o motivo e só então use os caminhos abaixo.

**Como ler as fontes.** Os caminhos vêm de temas e documentação de referência lidos no commit indicado, em 2026-10-31, por agente de IA e com revisão humana pendente. São a estrutura **do projeto de referência**: confirme o arquivo equivalente no projeto auditado antes de apontá-lo. Comandos marcados "não executado" foram conferidos na documentação, não rodados aqui.

## Shopify (Online Store 2.0)

- **Sinais:** `layout/theme.liquid`, `config/settings_schema.json`, `shopify.theme.toml`.
- **Tokens:** `config/settings_schema.json` define as configurações do tema (no Dawn: `color_schemes`, `type_header_font`, `type_body_font`, `page_width`, `buttons_radius` e outras); `config/settings_data.json` guarda os valores escolhidos pelo lojista; `layout/theme.liquid` transforma as configurações em variáveis CSS como `--color-background` e `--buttons-radius`.
- **Templates e componentes:** templates JSON em `templates/` (por exemplo `templates/cart.json`, `templates/product.json`, `templates/404.json`), seções em `sections/`, snippets em `snippets/` e textos em `locales/*.json` (por exemplo `locales/pt-BR.json`).
- **Comandos seguros:** leitura de arquivos; `shopify theme check --path <tema>` para validar o tema; `shopify theme dev` para preview em loja de desenvolvimento autorizada (não executados aqui).
- **Comandos proibidos neste fluxo:** `shopify theme push`, que envia arquivos e pode sobrescrever o tema remoto, e `shopify theme publish`, que define o tema publicado.
- **Como validar:** `theme check` e comparação visual antes/depois no preview autorizado, sem criar pedidos.
- **Intocável:** checkout (o Dawn não contém `layout/checkout.liquid`; trate como fora do tema), apps, configurações do admin, traduções do lojista e menus, que vêm da lista de links escolhida em `sections/header.liquid`.
- **Fontes:** github.com/Shopify/dawn@0522253 (`config/settings_schema.json`, `layout/theme.liquid`, `templates/`, `sections/header.liquid`); github.com/Shopify/cli@a25396e, `packages/cli/README.md` (`theme check`, `theme dev`, `theme push`, `theme publish`) · verificado em 2026-10-31

## VTEX IO

- **Sinais:** `manifest.json` com `builders` (no store-theme: `styles`, `store`, `sitemap`, `docs`) e diretório `store/`.
- **Tokens:** `styles/configs/style.json`, com chaves `typeScale`, `spacing`, `colors`, `semanticColors` (por exemplo `background.action-primary`, `background.danger`, `background.success`), `borderRadius` e `typography`.
- **Templates e componentes:** blocos em `store/blocks.jsonc` e em arquivos dentro de `store/blocks/` (por exemplo `store/blocks/header/header.jsonc`, `store/blocks/search.jsonc`, `store/blocks/minicart.jsonc`); CSS por app em `styles/css/`, como `styles/css/vtex.store-components.css`.
- **Comandos seguros:** leitura; `vtex link` apenas em workspace de desenvolvimento autorizado (não executado aqui).
- **Comandos proibidos neste fluxo:** `vtex publish`, que publica o app, e `vtex promote`, que promove o workspace para `master` e torna a mudança pública.
- **Como validar:** preview do workspace de desenvolvimento, conferindo as variantes desktop e mobile dos blocos, sem transações.
- **Intocável:** checkout, configurado fora do store theme; configuração do motor de busca e redirecionamentos da conta.
- **Fontes:** github.com/vtex-apps/store-theme@c46492d (`manifest.json`, `styles/configs/style.json`, `store/blocks/`); github.com/vtex/toolbelt, `README.md` na branch `master` (`link`, `publish`, `promote`) · verificado em 2026-10-31

## WordPress e WooCommerce

- **Sinais:** `theme.json` com `style.css`; `wp-content/themes`; diretório `woocommerce/` no tema.
- **Tokens:** `theme.json` (no Twenty Twenty-Four, `version: 2`), com `settings.color.palette`, `settings.typography.fontFamilies` e `settings.spacing`. Temas clássicos sem `theme.json` guardam estilos em `style.css` e PHP.
- **Templates e componentes:** `templates/*.html` (por exemplo `templates/404.html`), `parts/*.html` (por exemplo `parts/header.html`, com o bloco `wp:navigation`) e `patterns/`. WooCommerce em tema de blocos: sobrescreva o template com o mesmo nome em `templates/`, como `templates/page-checkout.html`, mantendo os blocos Cart e Checkout no conteúdo da página. Em tema clássico: override em `<tema-filho>/woocommerce/<caminho>`, sem o subdiretório `templates/`, por exemplo `woocommerce/checkout/form-checkout.php`.
- **Comandos seguros:** leitura; `wp-env start` para ambiente local, que por padrão exige Docker (não executado aqui).
- **Comandos proibidos neste fluxo:** importar ou resetar banco, `wp search-replace`, atualizar ou remover plugins e editar arquivos em `wp-content/plugins/`.
- **Como validar:** preview local com dados fictícios; registre se o checkout é em blocos ou clássico.
- **Intocável:** conteúdo publicado, menus (itens editados no site), gateways, plugins e dados reais.
- **Fontes:** github.com/WordPress/twentytwentyfour@a382244 (`theme.json`, `templates/`, `parts/header.html`); github.com/woocommerce/woocommerce@b9cfe5f (`docs/theming/block-theme-development/theming-woo-blocks.md`, `docs/theming/theme-development/template-structure.md`, `plugins/woocommerce/templates/`); github.com/WordPress/gutenberg@aad2cfb, `packages/env/README.md` · verificado em 2026-10-31

## React, Next.js e Tailwind CSS

- **Sinais:** dependências `react`, `next` e `tailwindcss` no `package.json`; arquivos de configuração do Tailwind. São sinais independentes: React sem Next é comum.
- **Tokens:** Tailwind v4 define tokens com a diretiva `@theme` no CSS (use `:root` para variáveis que não devem gerar utilitários). Tailwind v3 usa `tailwind.config.*`, como na fixture `evaluations/fixtures/react-tailwind` deste repositório. Confira a versão instalada antes de escolher.
- **Templates e componentes:** Next.js App Router em `app/`, com convenções `loading.js`, `error.js` e `not-found.js` por segmento; Pages Router em `pages/`. Em React, rótulos usam `htmlFor` com IDs gerados por `useId`, e `useFormStatus` expõe `pending` durante o envio de `<form action>`.
- **Comandos seguros:** scripts declarados no `package.json` (`dev`, `build`, `test`), depois de lê-los; instalação com `npm ci --ignore-scripts` quando autorizada.
- **Comandos proibidos neste fluxo:** scripts de deploy, alterações em `.env` e scripts desconhecidos.
- **Como validar:** build e preview local, captura antes/depois e conferência do anúncio de rota (o Next.js anuncia `document.title`, depois o `<h1>`, depois o caminho).
- **Intocável:** contratos de API, SDKs de pagamento e dados.
- **Fontes:** github.com/tailwindlabs/tailwindcss.com@7f92c22, `src/docs/theme.mdx`; github.com/vercel/next.js@fac5fc8, `docs/01-app/03-api-reference/03-file-conventions/` e `docs/03-architecture/accessibility.mdx`; github.com/reactjs/react.dev@0821e7d, `useFormStatus.md` e `input.md` · verificado em 2026-10-31

## HTML estático

- **Sinais:** `index.html`, CSS, JavaScript e assets presentes; um arquivo HTML isolado não prova ausência de framework.
- **Tokens:** variáveis CSS em `:root` e estilos existentes.
- **Templates e componentes:** cada página `.html` costuma repetir cabeçalho e rodapé; compare a navegação entre páginas.
- **Comandos seguros:** leitura e servidor estático local no diretório autorizado, sem instalar pacotes.
- **Comandos proibidos neste fluxo:** publicação e instalação não autorizadas.
- **Como validar:** preview local e capturas com largura e estado correspondentes.
- **Intocável:** conteúdo, URLs e nomes de arquivos existentes.
- **Fontes:** mensagens de validação nativa dependem do navegador e do idioma: github.com/mdn/content@a0ba038, `files/en-us/learn_web_development/extensions/forms/form_validation/index.md` · verificado em 2026-10-31. A convenção de `404.html` varia por hospedagem e não foi verificada.

Use [captura e inspeção](captura-e-inspecao.md) para os registros antes/depois. A auditoria é somente leitura; não faça transações nem valide em produção com dados pessoais.
