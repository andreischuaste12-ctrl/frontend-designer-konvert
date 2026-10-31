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
| `evals/evals-visao.proposta.json` | Proposta de cenários para avaliação manual da skill; não é uma suíte executável. |
| `tests/` | Testes unitários e smoke test local dos três scripts. |
| `package.json` e `package-lock.json` | Runtime mínimo, Playwright fixado e comandos reproduzíveis de validação. |

## Requisitos dos scripts

Node 20 ou superior e Chromium do Playwright. As dependências estão fixadas no lockfile; instale e valide a partir desta pasta:

```bash
npm ci
npx playwright install chromium
npm run check
npm test
```

Os scripts não instalam dependências nem clicam ou enviam formulários. Eles carregam a página em Chromium, que executa o JavaScript do site. Use apenas URLs de projetos que você está autorizado a inspecionar e prefira dados fictícios. Credenciais, parâmetros de consulta e fragmentos são removidos dos URLs gravados nos relatórios; mensagens de erro também passam por sanitização. As saídas ficam em `.audit/`, ignorada pelo `.gitignore` raiz.

O inventário de imagens não copia arquivos por padrão. Use `--save-images` apenas quando precisar revisar cópias locais; não versione nem redistribua imagens sem conferir os direitos. Capturas podem revelar texto e informações presentes na tela, portanto revise os arquivos antes de compartilhar.

Exemplos, a partir da raiz do projeto (`<skill>` é a pasta da skill):

```bash
node <skill>/scripts/capture.mjs --url http://localhost:3000 --routes /,/produto
node <skill>/scripts/extract-styles.mjs --url http://localhost:3000 --width 1440
node <skill>/scripts/image-manifest.mjs --root . --url http://localhost:3000
# Para copiar imagens do render explicitamente, acrescente: --save-images
```

## Instalação

Copie a pasta inteira (incluindo `references/`, `scripts/`, `tests/` e `examples/`) para o diretório de skills da ferramenta. O arquivo `evals-visao.proposta.json` é uma proposta de cenários, não um runner.

| Ferramenta | Projeto | Usuário |
| --- | --- | --- |
| Claude Code | `.claude/skills/design-por-referencia-konvert/` | `~/.claude/skills/design-por-referencia-konvert/` |
| Codex | `.agents/skills/design-por-referencia-konvert/` | `~/.agents/skills/design-por-referencia-konvert/` |

Reinicie ou atualize o agente se a skill não for detectada. Se a instalação for feita em outro projeto, proteja `.audit/` no `.gitignore` desse projeto antes de executar os scripts.

## Quando usar

Exemplos de pedidos que devem ativá-la:

- "Aplique o DESIGN.md desta pasta na página de produto."
- "Deixe o checkout no estilo deste site: <URL>."
- "Replique a hierarquia e o clima desta captura, respeitando nossos tokens."

Não use para revisão sem edição, para animação como objetivo central nem para corrigir apenas overflow ou responsividade sem referência.

## Licença

MIT. Veja o arquivo `LICENSE`.
