# Preparo isolado do navegador para auditoria

A auditoria pode usar Playwright e Chromium para observar o frontend. O projeto auditado continua somente leitura: não execute `npm ci`, `playwright install` nem altere configuração dentro dele. Os scripts de captura pertencem à skill executora instalada ao lado da auditora; o preparo abaixo lê essa instalação e, se necessário, cria uma cópia temporária das ferramentas fora do checkout.

## Preflight antes de declarar que o navegador está ausente

Execute a partir da raiz do projeto auditado, ajustando a pasta das skills conforme a instalação:

```bash
node .agents/skills/audit-frontend-designer-konvert/scripts/prepare-browser.mjs \
  --executor .agents/skills/design-por-referencia-konvert --install
```

O script primeiro tenta o Playwright já instalado com o Chromium gerenciado ou com um navegador do sistema. Se isso não funcionar, `--install` copia somente o pacote e os scripts da executora para uma pasta temporária externa ao projeto, executa `npm ci --ignore-scripts` nessa cópia e tenta novamente. O cache do npm fica nessa pasta temporária. Se não houver navegador funcional, tenta baixar o Chromium fixado para um cache nessa mesma pasta. A política de rede pode bloquear o download; nesse caso, registra a falha sem contornar a política. Não instala dependências do projeto auditado nem altera a skill original.

Uma resposta `status: "ready"` inclui `scriptsDir` para chamar `capture.mjs`, `extract-styles.mjs` e `image-manifest.mjs`. Se `source` for `system`, use `executablePath` em `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` apenas nos comandos de captura. Se vier `browserCacheDir`, defina `PLAYWRIGHT_BROWSERS_PATH` com esse valor nos comandos de captura. Se `isolated` for `true`, remova `cleanupDir` depois da inspeção. Essas rotas locais são dados operacionais privados: não as copie para o relatório ou para o registro de execução. Passe `--out` apontando para `.audit/` ignorado pelo Git ou outro destino autorizado e use `--block-writes` por padrão. Essa opção bloqueia POST e WebSocket, mas GET ainda pode ter efeitos no servidor; se a aplicação depender de POST para ler dados, marque o render incompleto. Desative o bloqueio apenas em ambiente de teste autorizado com dados sintéticos.

`status: "unavailable"` exige diagnóstico honesto. Confira Node.js, a presença da skill executora e do lockfile, a disponibilidade de npm, navegador de sistema e a política de rede. Se o app local não puder subir porque faltam dependências do próprio projeto, não as instale como parte da auditoria: use um ambiente já preparado, uma URL autorizada ou capturas fornecidas. Se nenhuma evidência renderizada existir, marque as linhas de cobertura visual como `not_observed` ou `blocked`, explique o motivo e não atribua a elas achados visuais confirmados.

O preflight apenas demonstra que o navegador abre; não demonstra que o site foi carregado, que o estado correto apareceu ou que a captura foi inspecionada. Após capturar, confira status, erros e recursos ausentes no índice, abra as imagens relevantes e relacione cada achado à observação. Scripts de captura não enviam formulários. A auditora pode inspecionar validação por interação separada apenas em ambiente local ou de teste autorizado, com dados sintéticos e sem efeitos externos ou persistentes. Estados de sucesso ou erro que não puderem ser reproduzidos com segurança ficam explícitos como lacunas.
