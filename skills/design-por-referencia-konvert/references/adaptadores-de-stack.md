# Adaptação ao projeto e à stack

O detector `node <skill>/scripts/detect-stack.mjs --root .` procura sinais locais limitados e retorna **possibilidades**, não uma identificação garantida. Ele não executa comandos de projeto, não lê arquivos `.env` e não consulta a rede. Só leia documentação e arquivos relevantes ao escopo autorizado. Há projetos híbridos, monorepos e convenções próprias: confirme cada hipótese antes de editar. Caminhos e instruções abaixo são pontos de partida, não regras universais.

| Possibilidade | Onde procurar, se existir | Cuidados para o executor |
| --- | --- | --- |
| Shopify theme | `layout`, `sections`, `snippets`, `templates`, `assets` e `config` | Respeite templates, configurações, traduções e componentes da loja. Confirme tema e ambiente antes de qualquer preview. |
| VTEX IO | `manifest.json`, `store`, `react` e estilos relacionados | Confirme builders, componentes e dependências no projeto. Preserve integrações e contratos; não altere ambientes ou publique. |
| WordPress com blocos / WooCommerce | `theme.json`, `style.css`, `templates`, `parts`, diretórios de templates do WooCommerce | Distinga tema de plugin e preserve conteúdo, estilos e configuração existentes. Não leia arquivos de credenciais. |
| React / Next.js | dependências declaradas, componentes, rotas e estilos locais | Identifique roteamento, componentes e tokens reais; não suponha que toda aplicação React use Next. |
| Tailwind CSS | dependência e configuração, quando existirem, além dos estilos do projeto | Confira a versão e a fonte local de tokens; não presuma um arquivo de configuração específico. |
| HTML estático | HTML, CSS, JS e assets presentes | Preserve semântica, rotas e conteúdo; não introduza framework apenas por estética. |

## Preview e validação

Leia as instruções do projeto e os scripts declarados antes de recomendar um comando. Não execute scripts desconhecidos ou instalações apenas porque uma stack foi detectada; inicie o preview adequado ao projeto autorizado e relate o que realmente executou. Use capturas e estilos antes/depois conforme [captura e inspeção](captura-e-inspecao.md), preservando achados aprovados, conteúdo e comportamentos. A auditoria continua somente leitura.

## Fontes para consulta posterior

Os links abaixo são pontos de partida informados para consulta **não verificada nesta atualização**: o acesso externo não estava disponível. Não afirme ter lido uma fonte que não abriu; verifique versão, data e aplicabilidade antes de adotar detalhes.

- Shopify: https://shopify.dev/docs/storefronts/themes
- VTEX IO: https://developers.vtex.com/docs/guides/vtex-io-documentation
- WordPress themes: https://developer.wordpress.org/themes/
- WooCommerce developer documentation: https://developer.woocommerce.com/docs/
- React: https://react.dev/learn
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- HTML: https://developer.mozilla.org/en-US/docs/Web/HTML
