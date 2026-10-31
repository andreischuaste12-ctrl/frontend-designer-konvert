# Implementação e verificação

## Partir do diagnóstico

Para cada mudança, ligue um achado observado a uma tarefa, um componente e um critério de aceitação. Exemplo: quando o CTA principal compete com links secundários, ajuste hierarquia e valide se o próximo passo fica compreensível; não prometa aumento de conversão sem medir. Preserve os pontos fortes registrados na auditoria.

Antes de editar, identifique framework, estilos, roteamento, formulários, contratos de dados, componentes e comandos reais do projeto. React, Next.js, Vue, Svelte, templates de loja e HTML estático exigem soluções diferentes. Reutilize a arquitetura local; não migre framework nem introduza uma biblioteca para resolver um detalhe visual.

## Layout e tokens

- Use tokens existentes para cor, espaço, tipografia, forma, elevação e movimento. Crie novos somente quando houver um papel ausente. Não duplique tokens por tela.
- Comece pelo conteúdo real e pela ordem semântica do DOM. Use grid/flex antes de posicionamento absoluto para estrutura. Evite reordenar visualmente elementos interativos de forma diferente da ordem de teclado.
- Propriedades lógicas como `margin-inline` e `padding-block` facilitam RTL e internacionalização. Teste textos extensos, tradução, números e unidades.
- `clamp()` pode limitar uma escala fluida; confira mínimos e máximos e preserve zoom. Não esconda conteúdo para fazê-lo caber.
- Container queries servem para componentes reutilizados em larguras distintas. Use o suporte de navegadores do projeto e um layout básico funcional como fallback.
- `:has()`, `color-mix()` e view transitions são escolhas condicionais, não requisitos de modernidade. Consulte compatibilidade antes de adotar e use `@supports` quando necessário. Sem suporte, o fluxo principal precisa continuar funcionando.
- No modo escuro, valide superfícies, contraste, imagens, estados e foco. Não basta inverter as cores.

## Componentes, formulários e estados

Use elementos nativos: link para navegação, botão para ação, label associado ao campo. Preserve nomes acessíveis, semântica e ordem de leitura. Considere padrão, hover, foco, selecionado, desabilitado, carregando, vazio, erro e sucesso conforme o componente realmente possui.

Erros devem dizer o que aconteceu e como corrigir, aparecer próximos ao campo e ser associados a ele. Preserve dados já preenchidos após erro; não use placeholder como label. Evite submissão duplicada sem remover feedback de carregamento e recuperação. Teste com dados sintéticos e nunca conclua uma transação real durante auditoria.

Para diálogos e menus, use a implementação acessível do projeto ou padrões nativos adequados. Verifique abertura por teclado, escape, contenção de foco quando necessária e retorno de foco ao fechar. Não substitua um controle robusto por um exemplo decorativo de galeria.

## E-commerce, analytics e SEO

Antes de alterar markup, procure integrações reais: `dataLayer`, eventos, atributos `data-*`, seletores utilizados por scripts, IDs e contratos de checkout. Registre o que precisa ser preservado; não invente nomes de evento. Teste instrumentação em staging usando o modo de diagnóstico existente, sem disparar conversões de produção.

Confira canonical, metadados, dados estruturados, hierarquia de títulos, `lang`, links e renderização de conteúdo indexável quando forem afetados. Uma melhoria visual não deve criar URLs duplicadas, retirar conteúdo útil do HTML ou trocar links navegáveis por handlers sem destino.

Preserve preço total, frete, condições, consentimento, pagamento e recuperação de erros. Mudanças nesses fluxos devem estar dentro do pedido do usuário e considerar os contratos do produto. Não oculte condições para destacar o CTA nem altere a decisão de consentimento durante testes.

Associe achados a resultados observáveis: compreensão de planos, erros no formulário, avanço no checkout ou leitura de conteúdo. Nomeie uma métrica de negócio somente quando ela for relevante e marque o impacto como hipótese até haver medição.

## Desempenho e movimento

Declare dimensões ou `aspect-ratio` de mídia para reduzir saltos. Dimensione imagens para o papel e a densidade de tela, com formatos e fontes que o projeto já suporta. A imagem principal candidata a LCP normalmente não deve usar lazy loading; confirme o candidato no render antes de aplicar prioridade.

Fontes e bibliotecas também têm custo. Reutilize famílias locais, limite variantes e evite baixar bibliotecas inteiras por um efeito. Relacione regressões de LCP/CLS/INP a decisões concretas, distinguindo laboratório e dados reais. Respeite `prefers-reduced-motion`; animação não pode bloquear uma tarefa ou ser o único meio de transmitir informação.

## Verificação e correção

1. Execute os checks relevantes do projeto e abra o fluxo alterado.
2. Verifique desktop e mobile, pontos de quebra afetados, teclado, foco, contraste, zoom e estados relevantes.
3. Quando as ferramentas de `design-por-referencia-konvert` estiverem instaladas, capture antes/depois com os mesmos perfis. Use `compare.mjs` para explicitar diferenças de amostras ou pixels; seletores diferentes exigem mapeamento humano.
4. Corrija regressões observadas e repita apenas as verificações afetadas pela correção.
5. Entregue arquivos alterados, achados resolvidos, evidências, limitações e hipóteses pendentes. Uma captura bonita não prova usabilidade nem conformidade WCAG.

## Fontes a consultar conforme a mudança

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Padrões de interação: https://www.w3.org/WAI/ARIA/apg/
- Compatibilidade CSS: https://developer.mozilla.org/en-US/docs/Web/CSS
- Core Web Vitals: https://web.dev/articles/vitals

Estas URLs são referências de consulta, não evidência de que foram abertas nesta execução.
