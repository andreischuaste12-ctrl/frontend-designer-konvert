# Mobile web e implementação de mockups

Use quando a interface no escopo for mobile web/PWA ou quando implementar uma referência exportada por ferramenta de design. Estes critérios complementam o contrato e a validação da skill; não autorizam novas rotas, backend, migração para React Native, acesso a serviço externo ou alterações fora do alvo solicitado. Para um componente pontual, verifique somente os itens que ele afeta.

## Fonte, versão e evidência

- Quando existirem HTML/CSS, tokens ou assets exportados e autorizados, inspecione-os junto das imagens. Registre tela/componente, versão selecionada, tema, viewport e estado. Use a versão pedida pelo usuário; se ela não estiver disponível, declare a dependência em vez de substituir silenciosamente pela atual. Sem versão especificada, identifique a versão efetivamente acessível e mantenha código e captura correspondentes.
- Exporte só como material de análise até inspecionar scripts, dependências e direitos. Não execute scripts externos nem transplante o documento inteiro para o projeto. Tokens e componentes locais continuam prioritários; registre divergências entre export e render conforme o nível de fidelidade combinado.
- Separe a captura da viewport, útil para a primeira impressão, da revisão do conteúdo completo. Percorra a tela por rolagem ou fatias; uma imagem de página inteira pode não mostrar conteúdo de contêineres com rolagem própria, áreas recolhidas ou slides inativos. Não invente flags para ferramentas indisponíveis: use a captura existente ou um navegador autorizado.
- Antes de concluir que algo falta, confira a revisão completa e, quando disponível, o DOM/HTML. Presença no DOM não prova visibilidade: teste clipping, sobreposição e alcance por rolagem e interação. Em criação nova, a captura inicial continua sendo baseline, nunca um antes fictício.

## Ler as telas como um fluxo

Antes de implementar um conjunto de telas, registre uma matriz curta: tela → rota existente ou proposta autorizada → entrada/retorno → layout compartilhado → estado variável. Cabeçalho e barra inferior repetidos podem indicar um shell comum; confirme pelo comportamento e pela arquitetura, sem deduzir uma árvore de rotas apenas de ícones. Abas de conteúdo podem ser estado local; um diálogo pode pertencer à interação atual. Preserve URLs, histórico e parâmetros existentes.

Mantenha o shell no layout ou componente compartilhado correspondente, sem desenhá-lo de novo em cada tela. Reuse a navegação adotada; não troque router nem crie rotas para imitar a moldura do mockup. Confira destino, item ativo, voltar e retorno de modal quando afetados. Não copie uma barra de status ou moldura de telefone decorativa para a interface funcional, salvo pedido explícito de protótipo.

## Converter o retrato em comportamento

Para cada tela afetada, identifique quais textos são copy estática e quais números, listas, seleções ou campos variam. Os variáveis precisam de fonte de dados ou estado coerente com o escopo; dados sintéticos continuam identificados como demonstração. Uma seleção desenhada no mockup não deve continuar ativa em todas as rotas.

Teste listas com zero, um e muitos itens quando aplicável, além de espera e erro já exigidos pelo fluxo. Em edição de registro carregado de forma assíncrona, confira abrir por link direto, recarregar e reabrir: os campos devem refletir o registro certo sem trocar dados por defaults vazios nem sobrescrever edição em andamento. Use fixtures e armazenamento de teste, sem alterar registros reais. Não acrescente persistência ou API só para preencher a referência.

## Área visível, toque e teclado

- Confira a tela no navegador mobile alvo quando disponível. Em formulário, abra o teclado virtual, foque inclusive o último campo e provoque erro sintético: campo, mensagem e ação final precisam continuar visíveis ou alcançáveis por rolagem. Repita em modais com formulário quando estiverem no escopo.
- Em cabeçalhos, barras inferiores e CTAs fixos, identifique quem reserva o espaço da barra e quem aplica cada safe area. Evite dupla compensação e conteúdo encoberto. Na web, avalie `env(safe-area-inset-bottom, 0px)` conforme o layout e suporte reais; isso não substitui verificar o teclado. Veja [env() na MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env).
- Layout viewport e área visível podem diferir com zoom e teclado; consulte [VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) se um problema observado exigir medir essa diferença. Não adicione dependência ou listeners preventivamente. Confira abertura/fechamento do teclado, rolagem, zoom e orientação quando afetados.
- Preserve ícones visualmente pequenos com área de acionamento adequada aos critérios existentes de alvo e espaçamento. Uma ação de toque não pode depender de hover; confira feedback pressionado, foco, nome e estado conforme o controle usado.

## Aceite e relato

Registre por tela afetada: fonte/versão/tema quando houver referência, rota/estado, navegador/plataforma, evidência completa e da viewport quando pertinentes, passos interativos, resultado e limitações. Build ou captura não comprovam interação. Uma viewport estreita no desktop não comprova teclado virtual, recorte físico ou comportamento instalado de PWA. Sem ambiente compatível, marque esses itens como não verificados e preserve a classificação parcial quando forem críticos.

## Origem e limites da adaptação

Critérios próprios adaptados após análise de [designing.md](https://github.com/designed-by-ai/skills/blob/main/skills/design-mobile-apps/designing.md) e [implementing.md](https://github.com/designed-by-ai/skills/blob/main/skills/design-mobile-apps/implementing.md), consultados em 2026-11-05. Aproveitados: separar viewport de revisão completa, manter versão consistente, identificar shell compartilhado e testar comportamento além do estado preenchido. Não incorporados: endpoints, autenticação, créditos, instalação, versões de Expo/React Native ou reprodução obrigatória de assets. O fluxo local continua independente do Sleek.

Cenários para manutenção deste guia: [avaliação mobile e mockups](cenarios-mobile-e-mockups.md).
