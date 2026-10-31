# Pesquisa: designer de front-end no contexto moderno

## Escopo e limite desta pesquisa

Este documento organiza conceitos, práticas e fontes para orientar uma skill de design e implementação de interfaces web. A sessão não dispõe de busca web funcional: a tentativa de abrir uma fonte pública falhou porque o proxy do ambiente não conectou. Portanto, as referências abaixo são pontos de partida reconhecidos, não uma revisão ao vivo de atualizações publicadas em 2026. Antes de transformar uma recomendação normativa em requisito, consulte a versão vigente da fonte indicada.

## 1. O que é o trabalho hoje

O designer de front-end atua na interseção entre experiência do usuário, design visual, conteúdo, acessibilidade e implementação. O trabalho não termina num mockup: precisa entender a tarefa do usuário, modelar a interface, colaborar com engenharia, verificar o comportamento real no navegador e melhorar a solução com evidências.

É uma função que pode combinar três perspectivas:

- **UX e produto:** entender usuários, contexto, objetivos, jornadas, fricções e critérios de sucesso.
- **UI e direção visual:** construir hierarquia, tipografia, cor, composição, componentes e estados.
- **Front-end e qualidade:** traduzir intenção para HTML, CSS e JavaScript dentro da stack do projeto, garantindo responsividade, acessibilidade, desempenho e funcionamento.

O título varia entre empresas. Algumas separam Product Designer, UX Designer, UI Designer e Front-end Engineer; equipes menores podem esperar que uma pessoa cubra partes dessas funções. A skill deve examinar o escopo real do pedido e do repositório, em vez de presumir que todo designer é responsável por pesquisa de usuários, arquitetura de sistema e código de produção.

## 2. Princípios que orientam boas decisões

### Utilidade antes de decoração

Uma interface deve ajudar uma pessoa a cumprir uma tarefa. Identifique a tarefa principal, torne a ação seguinte compreensível e reduza ambiguidades. Animação e originalidade visual podem reforçar identidade e compreensão, mas não compensam navegação confusa ou conteúdo pouco claro.

### Consistência com flexibilidade

Padrões previsíveis reduzem esforço de aprendizagem. Componentes e tokens compartilhados ajudam a preservar consistência, enquanto exceções devem existir quando atendem a uma necessidade real de contexto.

### Conteúdo faz parte do design

Rótulos, títulos, instruções, mensagens de erro e chamadas para ação influenciam a usabilidade. Escreva com precisão e linguagem simples. Não invente prova social, números, depoimentos ou funcionalidades para preencher um layout.

### Acessibilidade desde o início

Acessibilidade inclui conteúdo, estrutura semântica, teclado, foco, contraste, tamanho de alvos, zoom, leitores de tela, movimento e mensagens de estado. Use WCAG 2.2 AA como referência geral quando apropriado, validando cada critério no contexto e consultando a especificação vigente.

### Evidência e honestidade

Separe observação, hipótese e resultado. Uma inspeção heurística não equivale a teste com usuários; uma galeria de sites não comprova conversão; uma pontuação automatizada não demonstra acessibilidade integral. Registre o que foi realmente inspecionado e testado.

## 3. Competências importantes

| Área | O que envolve | Exemplos de evidência |
|---|---|---|
| Pesquisa e enquadramento | Identificar público, tarefa, contexto, restrições e riscos | Hipóteses explícitas, perguntas de descoberta, jornada prioritária |
| Arquitetura e conteúdo | Organizar informação, navegação, rótulos e mensagens | Navegação compreensível, hierarquia de conteúdo, estados de erro úteis |
| Design visual | Hierarquia, tipografia, composição, cores, imagens e marca | Ação principal visível, leitura confortável, consistência visual |
| Interação | Estados, feedback, validação, transições e recuperação | Controle responde, processo comunica progresso e permite corrigir erros |
| Responsividade | Layouts que se adaptam a espaço, entrada e contexto | Uso em telas estreitas, sem rolagem horizontal acidental |
| Acessibilidade | Percepção, operação, compreensão e robustez | Teclado, foco, semântica, contraste, zoom e movimento reduzido |
| Front-end | HTML semântico, CSS, JS, componentes, integração e manutenção | Código coerente com a stack, estados funcionais, sem regressão observável |
| Desempenho | Percepção de carregamento e resposta a interações | Core Web Vitals medidos, imagens e scripts adequados ao contexto |
| Colaboração | Trabalhar com produto, conteúdo, engenharia e pesquisa | Decisões documentadas, trade-offs claros e handoff verificável |
| Avaliação | Inspeção, testes e iteração | Problemas priorizados por impacto, checagens reproduzíveis |

## 4. Fluxo recomendado para analisar e melhorar um projeto

### Fase A — Reconhecimento

1. Leia instruções locais, README, manifesto, rotas e estrutura de componentes.
2. Identifique stack, comandos existentes, tokens, padrões de interface e alterações preexistentes.
3. Execute o projeto conforme a documentação, se o ambiente permitir.
4. Determine o fluxo solicitado, quem o utiliza e o resultado esperado.

**Saída:** resumo curto do contexto, stack, tela/fluxo e objetivo principal. Não edite às cegas antes de entender como a aplicação é organizada.

### Fase B — Avaliação da experiência atual

Percorra o fluxo como usuário. Observe:

- O propósito da página fica claro rapidamente?
- A navegação e a localização atual são compreensíveis?
- A ação principal se destaca e explica o resultado esperado?
- A interface oferece feedback após ações, erros, carregamento e sucesso?
- Há termos ambíguos, excesso de conteúdo ou etapas que podem ser simplificadas?
- A página funciona em diferentes larguras e com teclado?
- Há controles sem rótulos, foco invisível, contraste insuficiente ou movimento excessivo?
- O conteúdo e a identidade correspondem ao produto real?

Anote cada achado com localização, evidência observada, impacto para a tarefa e gravidade. Classifique sugestões como problema confirmado, hipótese a validar ou oportunidade estética.

### Fase C — Pesquisa de referências

1. Defina o tipo de experiência: marketing, SaaS, comércio eletrônico, dashboard, conteúdo editorial, onboarding, checkout etc.
2. Selecione poucas referências que resolvam um problema comparável.
3. Registre URL, data de consulta, tela ou etapa observada e padrão específico aprendido.
4. Compare conteúdo, estrutura, hierarquia, resposta a estados e comportamento em mobile.
5. Adapte o princípio ao produto atual; não replique a identidade, texto ou composição distintiva.

Use galerias para direção visual e descoberta. Use exemplos de produtos reais, gravações de fluxo e pesquisa de usabilidade para compreender comportamento. Use documentação normativa para requisitos de acessibilidade e plataforma.

### Fase D — Priorização e proposta

Priorize mudanças que reduzem bloqueios para a tarefa principal, erros, esforço cognitivo e exclusão de usuários. Considere alcance, gravidade, confiança na evidência, custo e dependências. Um ajuste pequeno que esclarece o próximo passo pode ser mais valioso que uma reformulação completa.

Antes de implementar, resuma: problema observado, mudança proposta, benefício esperado, evidência ou hipótese, e risco/trade-off relevante.

### Fase E — Implementação

- Preserve framework, padrões, componentes e ferramentas existentes.
- Reaproveite tokens antes de criar valores isolados.
- Mantenha HTML semântico e controles nativos quando apropriado.
- Implemente estados de foco, hover, ativo, desabilitado, carregamento, vazio, erro e sucesso que façam sentido.
- Valide formulários no campo e no envio, com mensagens específicas e recuperáveis.
- Use animações com propósito e respeite `prefers-reduced-motion`.
- Evite dependências, refatorações amplas e conteúdo fictício sem necessidade.

### Fase F — Verificação

- Execute os comandos relevantes documentados pelo projeto.
- Abra a aplicação e percorra o fluxo alterado quando um navegador estiver disponível.
- Inspecione desktop e uma largura estreita de mobile.
- Teste teclado: ordem, acesso, operação e foco visível.
- Verifique semântica, rótulos, contraste e mensagens de estado.
- Confira console, overflow e regressões na área afetada.
- Use ferramentas automatizadas como apoio, não como única prova.

Relate os comandos realmente executados, o que passou/falhou, as verificações indisponíveis e limitações conhecidas. Não descreva um build ou uma inspeção visual como concluídos se não foram executados.

## 5. Como escolher referências

| Necessidade | Fontes úteis | Como usar |
|---|---|---|
| Direção visual para sites | Awwwards, Godly, Siteinspire, Httpster, Minimal Gallery, Savee | Explorar composição, tipografia, cor, imagem e movimento; validar legibilidade e propósito |
| Landing pages e marketing | Land-book, Lapa Ninja, One Page Love, SaaS Landing Page | Comparar estrutura, proposta de valor, prova e chamadas para ação sem copiar copy |
| Produto e fluxos | Mobbin, Refero, Page Flows, UXArchive | Estudar sequência, estados, padrões e consistência entre telas |
| Exploração conceitual | Dribbble, Behance | Usar como inspiração visual; mockups podem não refletir um produto funcional |
| Usabilidade | Nielsen Norman Group, Baymard Institute | Consultar orientação e estudos de acordo com tipo de tarefa e domínio |
| Acessibilidade | W3C WCAG, WAI-ARIA APG, WebAIM, A11Y Project | Confirmar critérios e padrões; testar implementação concreta |
| Plataforma e desempenho | MDN, web.dev, documentação do framework em uso | Implementar e medir usando documentação técnica primária |
| Sistemas de design | GOV.UK Design System, Material Design, Apple Human Interface Guidelines | Aprender princípios e componentes; adaptar às regras do produto/plataforma |

Diretórios de inspiração são seletivos e podem favorecer novidade visual. Eles não devem ser tratados como amostra representativa do que usuários preferem nem como prova de melhores resultados de negócio.

## 6. Acessibilidade e qualidade: lista mínima

- **Estrutura:** landmarks, títulos em ordem lógica, idioma da página e nomes acessíveis.
- **Teclado:** todos os controles funcionam sem mouse; foco é visível e não fica preso.
- **Contraste:** texto e controles têm contraste verificável; cor não é o único indicador.
- **Formulários:** rótulos persistentes, instruções claras, erros associados ao campo e resumo recuperável quando necessário.
- **Zoom e reflow:** conteúdo permanece utilizável com ampliação e em viewport estreita, sem perda de informação ou função.
- **Alvos:** controles são fáceis de tocar e não ficam excessivamente próximos.
- **Movimento:** transições não bloqueiam tarefas; preferência por movimento reduzido é respeitada.
- **Estados dinâmicos:** mudanças importantes são comunicadas a tecnologias assistivas sem anúncios excessivos.
- **Conteúdo:** linguagem direta; links fazem sentido fora do contexto imediato; imagens informativas têm alternativa apropriada.

Consulte os critérios e exceções na especificação WCAG vigente. Uma checklist resumida não substitui avaliação especializada para contextos de alto risco.

## 7. Design responsivo, desempenho e experiências atuais

### Responsividade

Projete para conteúdo e espaço disponível, não para uma lista fixa de aparelhos. Considere mouse, toque, teclado, orientação, zoom e preferências do usuário. Garanta que hierarquia, foco e ação principal sobrevivam à reorganização da tela.

### Desempenho percebido

Carregamento, resposta e estabilidade visual fazem parte da experiência. Core Web Vitals são indicadores úteis em campo: LCP para carregamento, INP para responsividade e CLS para estabilidade visual. Verifique medições reais e use os limites oficiais vigentes; resultados variam conforme dados, dispositivo e conexão.

### IA e interfaces generativas

Use IA para acelerar exploração, protótipos, documentação e variações, mantendo revisão humana de conteúdo, acessibilidade, consistência e comportamento. Para funcionalidades de IA no produto, comunique incerteza, origem/limites relevantes, estados de espera, revisão e possibilidade de correção. Não use conteúdo gerado para inventar evidências ou fazer promessas não verificadas.

### Design tokens e componentes

Tokens e componentes compartilhados reduzem inconsistência e facilitam manutenção. Um sistema de design deve incluir regras de uso e estados, não apenas uma biblioteca visual. Componentes devem continuar acessíveis quando integrados ao produto e devem poder atender exceções legítimas sem criar variantes desnecessárias.

### Movimento e experiências imersivas

Movimento pode orientar atenção, mostrar relação espacial e comunicar resultado. Use com parcimônia, evite conteúdo essencial escondido em animação, respeite redução de movimento e teste desempenho em dispositivos modestos.

## 8. Métricas e validação

Escolha indicadores ligados à tarefa, por exemplo taxa de conclusão, abandono por etapa, erros, tempo para completar, uso de busca, sucesso de navegação ou chamados de suporte. Defina população, período, denominador e segmento antes de comparar. Combine dados quantitativos com observação qualitativa; uma métrica isolada não explica causa.

Quando não há analytics ou pesquisa, use inspeção e teste técnico como diagnóstico inicial e identifique hipóteses a validar. Não atribua aumento de conversão a uma mudança sem desenho de medição compatível.

## 9. Fontes recomendadas

### Normas e documentação primária

- W3C, **Web Content Accessibility Guidelines (WCAG) 2.2**: https://www.w3.org/TR/WCAG22/
- W3C WAI, **ARIA Authoring Practices Guide**: https://www.w3.org/WAI/ARIA/apg/
- MDN Web Docs, **Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- web.dev, **Learn Accessibility**: https://web.dev/learn/accessibility/
- web.dev, **Web Vitals**: https://web.dev/articles/vitals
- GOV.UK, **Design System**: https://design-system.service.gov.uk/
- Material Design: https://m3.material.io/
- Apple, **Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/

### Pesquisa e orientação de UX

- Nielsen Norman Group: https://www.nngroup.com/articles/
- Baymard Institute: https://baymard.com/research
- Laws of UX: https://lawsofux.com/
- The A11Y Project: https://www.a11yproject.com/
- WebAIM: https://webaim.org/resources/

### Referências visuais e de produto

- Awwwards: https://www.awwwards.com/
- Godly: https://godly.website/
- Land-book: https://land-book.com/
- Lapa Ninja: https://www.lapa.ninja/
- Siteinspire: https://www.siteinspire.com/
- Httpster: https://httpster.net/
- Minimal Gallery: https://minimal.gallery/
- One Page Love: https://onepagelove.com/
- CSS Design Awards: https://www.cssdesignawards.com/
- SaaS Landing Page: https://saaslandingpage.com/
- Mobbin: https://mobbin.com/
- Dribbble: https://dribbble.com/
- Behance: https://www.behance.net/
- Savee: https://savee.com/
- Refero: https://refero.design/
- Page Flows: https://pageflows.com/
- UXArchive: https://uxarchive.com/

## 10. Síntese para a skill

Uma skill eficaz de designer de front-end deve fazer o agente:

1. Entender projeto, usuário, tarefa e limites técnicos antes de propor mudanças.
2. Inspecionar o fluxo real e distinguir achados de hipóteses.
3. Escolher poucas referências comparáveis e explicar o princípio adaptado.
4. Priorizar clareza, conclusão da tarefa, acessibilidade, responsividade e desempenho.
5. Implementar mudanças coesas dentro da stack e padrões existentes.
6. Verificar o resultado com comandos e ferramentas realmente disponíveis.
7. Comunicar decisões, evidências, limites e próximos testes sem exagerar resultados.

O sinal de qualidade não é quantas referências foram reunidas nem o quanto uma tela chama atenção. É se as pessoas conseguem compreender e concluir suas tarefas com menos barreiras, e se a equipe consegue manter a solução.
