# Inventário de imagens

Imagens definem boa parte da fidelidade visual e do desempenho percebido. Este roteiro junta fatos medidos (script) com leitura visual (agente), sem misturar os dois.

## 1. Gerar o inventário

```bash
# Projeto (estático): formato, dimensões, peso, onde é referenciada, alt no markup
node <skill>/scripts/image-manifest.mjs --root .

# Render: tamanho natural x renderizado, alt, lazy, LCP, bytes, formato; salva cópias para abrir
node <skill>/scripts/image-manifest.mjs --url http://localhost:3000 --width 1440
node <skill>/scripts/image-manifest.mjs --url http://localhost:3000 --width 375
```

Saída em `.audit/images/`: `images-static.md/.json`, `images-rendered.md/.json`, `files/` (cópias das imagens vistas no render, até 60) e `imagens-revisao.md` (roteiro de revisão em lotes de 8). Use `--no-save` para não copiar arquivos e `--skip pasta1,pasta2` para ignorar pastas. O script ignora `node_modules`, `.git`, builds, caches, `.audit`, links simbólicos e arquivos `.env`/chaves.

Rode o render em 375 e 1440 px: `srcset` e `sizes` podem escolher arquivos diferentes.

## 2. Alertas e o que significam

| Alerta | Regra | Observação |
| --- | --- | --- |
| `peso>200KB` | Raster acima de 200 KB | Limiar de triagem, não regra. |
| `natural N× o renderizado` | Largura natural maior que 2× a renderizada com DPR 1 | Em telas 2× é desejável até ~2×; acima disso há desperdício. |
| `pode borrar` | Largura natural menor que a renderizada | Em telas de alta densidade piora. |
| `considerar WebP/AVIF` / `sem-webp/avif-irmão` | PNG/JPG/GIF pesado sem alternativa moderna | Verifique antes se o servidor já negocia o formato. |
| `alt-ausente` | `<img>` sem atributo `alt` e não decorativa | `alt=""` é válido para imagem decorativa; confirme olhando a imagem. |
| `é o elemento LCP`, `LCP com loading=lazy`, `LCP sem fetchpriority=high` | LCP de laboratório | O último é hipótese de otimização, não falha comprovada. |
| `abaixo da dobra sem lazy` | Imagem além de 2 telas sem `loading=lazy` | |
| `sem width/height` | Sem dimensões no atributo | Risco de CLS; pode estar coberto por CSS (`aspect-ratio`). Hipótese. |
| `quebrada` | Carregou e ficou com largura natural 0 | Fato. |
| `sem-referência` | Nenhum arquivo do projeto cita a imagem | Hipótese: pode ser caminho montado dinamicamente. |

## 3. Revisão visual (a parte que só o agente faz)

1. Abra `imagens-revisao.md`.
2. Abra as imagens do lote (até 8) com a ferramenta de visualização de imagens. SVG pode não abrir: use as fatias de captura.
3. Logo após cada lote, preencha o "Resumo visual" de cada item no próprio arquivo, para não perder contexto.
4. Avalie, por imagem:
   - **Assunto e papel:** o que mostra e se serve à tarefa da página (herói, produto, prova social, decoração).
   - **Recorte:** o ponto focal sobrevive nos breakpoints (compare 375 e 1440; `object-fit`, `object-position`)?
   - **Qualidade:** nitidez, artefatos de compressão, banding, ruído, resolução suficiente para o tamanho renderizado.
   - **Texto embutido:** há texto na imagem (acessibilidade, tradução, SEO)? Está legível no mobile?
   - **Consistência:** cor, iluminação, tratamento, proporção e estilo entre imagens da mesma página e frente à referência.
   - **Alt:** descreve a função da imagem no contexto, não apenas o conteúdo? Decorativa tem `alt=""`?
   - **Direitos:** banco de imagens, foto de terceiros ou marca? Não copie imagens da referência.
5. Marque como **não visto** qualquer imagem que não abriu e diga por quê.

## 4. Como registrar no relatório

- Tabela curta: imagem, papel, fatos medidos relevantes, achado visual, correção sugerida.
- Separe **fato** (medido ou visto) de **hipótese** (por exemplo, "provável ganho de LCP").
- Informe a cobertura: quantas imagens o inventário listou, quantas foram abertas, quantas ficaram sem revisão.
