# design-por-referencia-konvert

Skill para agentes de código que converte uma referência visual (DESIGN.md, URL, captura ou estilo descrito) em interface implementada no projeto, com decisões rastreáveis e fidelidade verificada na interface renderizada: capturas fatiadas em várias larguras, valores medidos e inventário de imagens.

## Estrutura

| Arquivo | Conteúdo |
| --- | --- |
| `SKILL.md` | Precedência, fluxo em sete passos, evidência visual e limites. |
| `references/contrato-de-entrada.md` | Fonte, nível de fidelidade, escopo, itens intocáveis e critério de pronto. |
| `references/papeis-e-tokens.md` | Papéis a extrair (inclui imagens e responsividade), origem de cada valor (extraído, medido, inferido, decidido, ausente) e mapeamento ao projeto. |
| `references/captura-e-inspecao.md` | Como renderizar, capturar, ler as capturas em fatias e medir estilos. |
| `references/inventario-de-imagens.md` | Manifesto de imagens, alertas e roteiro de revisão visual. |
| `references/validacao.md` | Checklist de fidelidade, acessibilidade (WCAG 2.2), estados, tamanhos de tela, imagens e integração. |
| `references/modelo-design-md.md` | Modelo opcional de DESIGN.md. |
| `scripts/capture.mjs` | Capturas por rota, largura e esquema de cor, em fatias, com recortes de foco e hover. |
| `scripts/extract-styles.mjs` | Estilos computados, variáveis CSS, fontes, escala tipográfica, contraste e alvos de toque. |
| `scripts/image-manifest.mjs` | Inventário de imagens do projeto e do render, e roteiro de revisão. |
| `scripts/_common.mjs` | Utilitários compartilhados pelos scripts. |
| `evals/evals.json` | Casos de teste de ativação e comportamento. |
| `evals/evals-visao.proposta.json` | Casos novos de captura e visão, para mesclar a `evals.json`. |

## Requisitos dos scripts

Node 18 ou superior e Playwright com Chromium. Os scripts não instalam nada e só leem: navegação GET, sem cliques nem envio de formulários. Saídas vão para `.audit/` (mantenha fora do Git).

```bash
npm i -D playwright
npx playwright install chromium
```

Exemplos, a partir da raiz do projeto (`<skill>` é a pasta da skill):

```bash
node <skill>/scripts/capture.mjs --url http://localhost:3000 --routes /,/produto
node <skill>/scripts/extract-styles.mjs --url http://localhost:3000 --width 1440
node <skill>/scripts/image-manifest.mjs --root . --url http://localhost:3000
```

## Instalação

Copie a pasta inteira (com `references/`, `scripts/` e `evals/`) para o diretório de skills da ferramenta:

| Ferramenta | Projeto | Usuário |
| --- | --- | --- |
| Claude Code | `.claude/skills/design-por-referencia-konvert/` | `~/.claude/skills/design-por-referencia-konvert/` |
| Codex | `.agents/skills/design-por-referencia-konvert/` | `~/.agents/skills/design-por-referencia-konvert/` |

Os caminhos do Codex devem ser confirmados na versão instalada. Reinicie ou atualize o agente se a skill não for detectada.

## Quando usar

Exemplos de pedidos que devem ativá-la:

- "Aplique o DESIGN.md desta pasta na página de produto."
- "Deixe o checkout no estilo deste site: <URL>."
- "Replique a hierarquia e o clima desta captura, respeitando nossos tokens."

Não use para revisão sem edição, para animação como objetivo central nem para corrigir apenas overflow ou responsividade sem referência.

## Licença

MIT. Veja o arquivo `LICENSE`.
