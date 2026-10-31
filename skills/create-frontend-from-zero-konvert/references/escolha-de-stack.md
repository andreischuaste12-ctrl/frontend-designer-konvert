# Escolha de stack em projeto vazio

Em projeto existente, a stack já está escolhida: siga-a e use o [guia de adaptação de stack](../../design-por-referencia-konvert/references/adaptadores-de-stack.md) para localizar tokens, templates e comandos seguros. Este guia vale apenas quando não há frontend nem plataforma definida.

## Critérios

Escolha a opção mais simples que atenda ao pedido. Cada dependência nova precisa de um motivo ligado a um requisito, não a preferência.

| Necessidade do pedido | Opção mais simples | Quando subir de nível |
| --- | --- | --- |
| Página institucional ou landing com pouca interação | HTML, CSS e JavaScript sem framework | Várias páginas com cabeçalho repetido: um gerador estático ou includes evitam divergência entre páginas. |
| Várias páginas de conteúdo com SEO | Gerador de site estático ou framework com renderização no servidor | Conteúdo editado por terceiros: considerar CMS, com autorização. |
| Interface com estado no cliente (filtros, formulários longos, dashboard) | Vite com React, ou o framework já usado pela equipe | Rotas com dados no servidor e SEO: framework com renderização no servidor, como Next.js. |
| Loja com catálogo, carrinho e pagamento | A plataforma de comércio já contratada (Shopify, VTEX, WooCommerce) | Nunca construir checkout próprio sem pedido explícito, plataforma de pagamento e responsável pela segurança. |
| Protótipo navegável para validar ideia | A opção de menor setup que rode localmente | Quando o protótipo virar produto, reavaliar a stack em vez de herdar atalhos. |

## Regras

- Confirme a versão de cada ferramenta na documentação oficial ou no registro de pacotes antes de instalar; não fixe versões de memória.
- Prefira ferramentas que rodem localmente sem conta, chave ou serviço pago. Contas, deploy e publicação exigem autorização explícita.
- Leia os scripts gerados por inicializadores antes de executá-los e instale com o mínimo de efeitos colaterais (por exemplo, `npm ci --ignore-scripts` quando a dependência permitir).
- Estilo: CSS com variáveis em `:root` atende a maioria dos casos. Um framework utilitário como Tailwind só se a equipe o usar ou o pedido o citar; em Tailwind v4 os tokens ficam em `@theme`, em v3 em `tailwind.config.*`.
- Registre a escolha e a alternativa descartada no brief e na entrega, com o motivo em uma frase.
- Em plataformas de comércio, o checkout normalmente fica fora do tema. Consulte as unidades por stack da auditora ([jornadas por stack](../../audit-frontend-designer-konvert/knowledge-base/11-jornadas-por-stack.md)) antes de prometer qualquer mudança nessa etapa.
