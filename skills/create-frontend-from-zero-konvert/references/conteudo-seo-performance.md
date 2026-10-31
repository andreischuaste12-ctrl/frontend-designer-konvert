# Conteúdo, SEO, performance e medição

Uma interface nova nasce com decisões que custam caro corrigir depois: estrutura de conteúdo, indexação, peso da página e o que é medido. Trate cada uma como parte da construção, dentro do escopo pedido.

## Conteúdo

- Escreva para a tarefa principal: título que diz o que a página oferece, ação principal com verbo e objeto ("Ver aulas", "Calcular frete").
- Conteúdo sintético fica claramente fictício (nomes, endereços, preços de exemplo). Não invente depoimentos, selos, avaliações, números de clientes ou certificações.
- Microtexto dos estados: o que aconteceu, o que foi preservado e o que fazer agora. Ver as unidades de erro e vazio da auditora em [jornadas e estados](../../audit-frontend-designer-konvert/knowledge-base/09-jornadas-e-estados.md).
- Formatos brasileiros quando o público for o Brasil: moeda com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`, datas com `Intl.DateTimeFormat('pt-BR')`, CEP e CPF com máscara que aceita colar o valor com ou sem pontuação.
- Defina o idioma da página em `<html lang>` (WCAG 2.2 SC 3.1.1).

## SEO técnico

Aplique o básico em páginas públicas; páginas internas ou de conta podem ficar fora da indexação.

| Item | O que fazer |
| --- | --- |
| Estrutura | Um `h1` por página, hierarquia de títulos sem saltos, landmarks (`header`, `nav`, `main`, `footer`). |
| Título e descrição | `title` único e descritivo por rota (também usado por leitores de tela e pelo anúncio de rota do Next.js) e `meta name="description"` por página. |
| URLs | Legíveis, estáveis e sem parâmetros desnecessários; `link rel="canonical"` quando a mesma página tiver mais de uma URL. |
| Indexação | Página 404 com status HTTP 404; páginas de teste, demonstração ou com dados sintéticos com `noindex` quando forem publicadas. |
| Compartilhamento | Open Graph apenas com título, descrição e imagem reais da página. |
| Dados estruturados | Só com dados verdadeiros da página (produto, preço, avaliação). Nunca preencha com valores fictícios em produção. |

## Performance

Os limites abaixo vêm do código-fonte da biblioteca `web-vitals` (github.com/GoogleChrome/web-vitals@e773747, `src/onLCP.ts`, `src/onINP.ts` e `src/onCLS.ts`), lido em 2026-10-31. O critério "bom" corresponde a:

| Métrica | Bom | Ruim |
| --- | --- | --- |
| LCP (maior elemento visível) | até 2500 ms | acima de 4000 ms |
| INP (resposta à interação) | até 200 ms | acima de 500 ms |
| CLS (estabilidade do layout) | até 0,1 | acima de 0,25 |

As medições de campo dependem de usuários reais. Num ambiente local, meça o que der (a captura registra LCP e CLS do render) e declare que não é dado de campo.

Práticas que evitam os problemas mais comuns:

- Imagem principal com dimensões declaradas, formato moderno quando suportado e carregamento prioritário; imagens abaixo da dobra com `loading="lazy"`.
- Reserve espaço para imagens, anúncios e conteúdo assíncrono, para não deslocar o layout.
- Fontes: poucas famílias e pesos e `font-display` definido; prefira fontes do sistema quando a marca permitir.
- JavaScript: só o necessário para a interação; nada de bibliotecas pesadas para efeitos que CSS resolve.
- Use o [inventário de imagens](../../design-por-referencia-konvert/references/inventario-de-imagens.md) para conferir peso, dimensões e `alt` das imagens.

## Medição e privacidade

- Não adicione analytics, pixels, tags ou eventos de `dataLayer` sem pedido explícito. Nomes de evento, parâmetros e IDs vêm do plano de medição do projeto, nunca de suposição.
- Quando a medição for pedida e houver dados pessoais, o consentimento e a política de privacidade (LGPD) precisam existir antes da coleta; registre a dependência para o responsável.
- Formulários de teste usam dados sintéticos e não enviam para serviços reais.
