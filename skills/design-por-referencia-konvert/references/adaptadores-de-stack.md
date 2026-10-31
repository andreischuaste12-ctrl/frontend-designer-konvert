# Adaptação ao projeto e à stack

O detector `node <skill>/scripts/detect-stack.mjs --root .` lê apenas marcadores locais limitados. `signal` indica um marcador; `likely`, dois ou mais. Nenhum é probabilidade calibrada ou confirmação: marcadores podem estar correlacionados ou ser falsos positivos. Confirme pelo projeto antes de editar e registre o motivo. Não leia `.env`, credenciais ou dados reais; não execute scripts desconhecidos. Há monorepos, versões e configurações próprias.

**Fontes:** os links oficiais abaixo são pontos de partida **não verificados nesta atualização**. Caminhos e comandos são hipóteses de inspeção, não confirmação documental. Confira versão, documentação e instruções do projeto antes de usá-los; não afirme que leu uma fonte inacessível.

## Shopify theme

- **Sinais:** `layout/theme.liquid`, `config/settings_schema.json`, `shopify.theme.toml`.
- **Tokens:** inspecione configurações do tema e estilos em `config/` e `assets/`, quando existirem.
- **Templates e componentes:** verifique `templates/`, `sections/`, `blocks/` e `snippets/` conforme o tema.
- **Comandos seguros:** leitura de arquivos; lint e preview apenas depois de revisar documentação e ambiente de desenvolvimento autorizado.
- **Comandos proibidos neste fluxo:** publicar ou enviar alterações ao tema ativo, por exemplo `theme push` ou `theme publish`.
- **Como validar:** testes locais existentes e comparação visual em preview autorizado, sem criar pedidos.
- **Intocável:** checkout, apps, traduções, integrações e configurações comerciais fora do escopo aprovado.
- **Fontes:** https://shopify.dev/docs/storefronts/themes — não verificada.

## VTEX IO

- **Sinais:** `manifest.json` com builders e diretórios declarados pelo projeto.
- **Tokens:** procure configurações de estilo e tokens do tema em `styles/`, se existirem.
- **Templates e componentes:** inspecione `store/`, builders e componentes locais `react/` conforme o manifesto.
- **Comandos seguros:** leitura; preview remoto ou link somente em workspace de desenvolvimento autorizado e após revisar instruções.
- **Comandos proibidos neste fluxo:** publicar, fazer deploy ou promover workspace, inclusive `vtex publish`, `vtex deploy`, `vtex workspace promote`.
- **Como validar:** testes e preview existentes em ambiente autorizado, sem transações.
- **Intocável:** checkout, contratos de componentes, integrações e configuração comercial fora do escopo.
- **Fontes:** https://developers.vtex.com/docs/guides/vtex-io-documentation — não verificada.

## WordPress e WooCommerce

- **Sinais:** `theme.json` com `style.css`, `wp-content/themes`, diretório `woocommerce/` no tema.
- **Tokens:** confira `theme.json` e estilos do tema; não presuma que todos os temas usem blocos.
- **Templates e componentes:** examine `templates/`, `parts/`, `patterns/` e possíveis overrides de WooCommerce.
- **Comandos seguros:** leitura; ambiente local somente após conferir requisitos e scripts do projeto.
- **Comandos proibidos neste fluxo:** importar ou resetar banco, `wp search-replace`, atualizar ou remover plugins sem autorização específica.
- **Como validar:** testes e preview local existentes com dados fictícios; diferencie blocos e shortcodes.
- **Intocável:** conteúdo, gateways, dados reais, plugins e configurações fora do escopo.
- **Fontes:** https://developer.wordpress.org/themes/ e https://developer.woocommerce.com/docs/ — não verificadas.

## React, Next.js e Tailwind CSS

- **Sinais:** dependências declaradas e configurações locais; React, Next e Tailwind são sinais distintos.
- **Tokens:** procure CSS e configurações existentes; a localização pode mudar entre versões do Tailwind.
- **Templates e componentes:** inspecione componentes e rotas existentes, como `app/` ou `pages/` quando aplicável.
- **Comandos seguros:** scripts de desenvolvimento, build e teste apenas depois de lê-los e avaliar seus efeitos e ambiente.
- **Comandos proibidos neste fluxo:** scripts de deploy, modificar `.env` ou executar scripts desconhecidos.
- **Como validar:** scripts aprovados e comparação visual antes/depois em ambiente local autorizado.
- **Intocável:** contratos, dados e integrações existentes fora do escopo aprovado.
- **Fontes:** https://react.dev/learn, https://nextjs.org/docs e https://tailwindcss.com/docs — não verificadas.

## HTML estático

- **Sinais:** `index.html`, CSS, JavaScript e assets presentes; um arquivo HTML isolado não prova a ausência de framework.
- **Tokens:** procure variáveis CSS e estilos existentes.
- **Templates e componentes:** inspecione estrutura HTML e includes disponíveis.
- **Comandos seguros:** leitura e, quando necessário, servidor local estático em diretório autorizado, após conferir os efeitos.
- **Comandos proibidos neste fluxo:** publicação ou instalação não autorizada.
- **Como validar:** abra o preview local e compare capturas com largura e estado correspondentes.
- **Intocável:** conteúdo, semântica, rotas e comportamento existentes fora do escopo.
- **Fontes:** https://developer.mozilla.org/en-US/docs/Web/HTML — não verificada.

Use [captura e inspeção](captura-e-inspecao.md) para os registros antes/depois. A auditoria é somente leitura; não faça transações nem valide em produção com dados pessoais.
