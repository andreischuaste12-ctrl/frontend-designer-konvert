# Base de conhecimento 01 — Auditoria estética e compreensão do público

## Objetivo desta etapa

Antes de sugerir uma nova direção visual ou alterar código, entender quem precisa usar o site, em que contexto, para fazer o quê, e como a interface atual ajuda ou atrapalha essa tarefa. A auditoria estética avalia a aparência junto com o efeito dela sobre compreensão, leitura, confiança, orientação e ação.

O resultado desta etapa é um diagnóstico verificável: contexto e público provável, jornada prioritária, qualidades que merecem ser preservadas, problemas observados, hipóteses ainda incertas e oportunidades ordenadas por impacto. Não é uma nota de beleza, uma pesquisa de mercado completa nem uma promessa de conversão.

## Regra de trabalho

**Observar antes de interpretar; interpretar antes de recomendar; recomendar antes de implementar.**

Mantenha distintas estas categorias:

- **Observação:** algo que pode ser apontado diretamente na página ou no código. Ex.: o botão principal tem o mesmo peso visual que três links secundários.
- **Interpretação:** efeito plausível sobre a tarefa. Ex.: a pessoa pode ter dificuldade para reconhecer o próximo passo.
- **Hipótese:** explicação que precisa de validação. Ex.: novos visitantes não entendem a diferença entre dois planos.
- **Evidência externa:** dado, estudo ou padrão documentado por uma fonte identificável.
- **Resultado medido:** comportamento observado em teste, analytics ou pesquisa real, com método e contexto.

Uma inspeção de interface pode levantar hipóteses; sozinha, não demonstra o que usuários pensam ou fazem.

## 1. Reconhecer o site antes de avaliar

Leia o projeto e percorra o site para estabelecer contexto. Não use apenas o nome da empresa, a primeira dobra ou o aspecto visual como substitutos do entendimento do produto.

Registre, se possível:

1. **Tipo de produto:** institucional, serviço, ecommerce, SaaS, portfólio, publicação, comunidade, ferramenta interna ou combinação.
2. **Modelo de uso:** aquisição, descoberta, comparação, compra, cadastro, tarefa recorrente, suporte, leitura, entretenimento ou aprendizagem.
3. **Páginas e entradas:** página inicial, página de campanha, busca, deep link, anúncio, indicação, acesso autenticado.
4. **Ação de maior valor para a pessoa:** encontrar informação, avaliar uma opção, concluir uma transação, entrar em contato, criar algo etc.
5. **Ação de maior valor para o negócio:** registrar como objetivo do produto, sem deixar que apague as necessidades do usuário.
6. **Restrições conhecidas:** conteúdo disponível, identidade visual, stack, integrações, região, idioma, dispositivos e limitações técnicas.
7. **Estado do produto:** protótipo, produto lançado, redesign, landing page nova ou manutenção de sistema existente.

Se uma informação importante não estiver disponível, marque como desconhecida. Faça perguntas apenas quando a resposta puder mudar a prioridade ou a direção do trabalho; caso contrário, assuma explicitamente e continue.

## 2. Entender público sem inventar personas

### O que buscar

Descreva os usuários por necessidades, familiaridade, motivação e situação de uso, não por estereótipos demográficos. Pergunte:

- Quem chega ao site pela primeira vez e quem já conhece o produto?
- O que essa pessoa quer resolver agora?
- O que ela sabe antes de chegar? Que termos conhece?
- O que precisa comparar, confirmar ou confiar antes de agir?
- O que pode causar hesitação, erro ou abandono?
- Está com pressa, em movimento, distraída, usando uma tela pequena ou conexão lenta?
- Usa teclado, leitor de tela, zoom, ditado, toque ou preferências de movimento reduzido?
- Está comprando para si, para outra pessoa ou para uma organização?
- Qual o custo de uma decisão incorreta ou de perder o progresso?

### Segmentos por intenção e conhecimento

Uma segmentação inicial pode combinar:

| Dimensão | Exemplos de grupos úteis | Impacto possível na interface |
|---|---|---|
| Familiaridade | primeira visita, comparador, usuário recorrente | Explicações iniciais versus atalhos e acesso rápido |
| Intenção | explorar, comparar, decidir, concluir, resolver um problema | Conteúdo e ação principal apropriados à etapa |
| Conhecimento do domínio | iniciante, intermediário, especialista | Termos simples, ajuda contextual ou informação detalhada |
| Contexto | tarefa planejada, urgência, mobile em trânsito, uso prolongado | Densidade, tamanho dos controles, persistência e prioridade |
| Relação com a decisão | baixo risco, alto valor, impacto financeiro ou pessoal | Transparência, confirmação, comparação e recuperação |
| Capacidade e preferência | diferentes sentidos, mobilidade, cognição e configurações | Alternativas de entrada, saída, leitura e movimento |

Esses grupos são lentes para inspecionar a experiência, não personas confirmadas. Não invente idade, renda, profissão, intenção ou preferência sem pesquisa ou fonte do produto.

### Escada de evidência sobre o público

Registre o nível de confiança junto às conclusões:

1. **Evidência direta:** pesquisa com participantes, suporte observado, entrevistas, testes de tarefa ou analytics interpretados com contexto.
2. **Evidência do produto:** brief, documentação, conteúdo, requisitos e objetivos fornecidos pela equipe.
3. **Indício da interface:** rótulos, fluxos, estrutura e funcionalidades sugerem um público ou necessidade.
4. **Hipótese do auditor:** interpretação razoável, ainda sem confirmação.

Não descreva nível 3 ou 4 como fato sobre clientes. Recomende a forma mais simples de validar hipóteses relevantes: teste de compreensão, teste de tarefa, conversa com suporte/vendas, análise de busca, revisão de dados existentes ou experimento apropriado.

## 3. Entender consumo e situação de uso

“Consumo” aqui inclui como as pessoas percebem, percorrem, leem, comparam e usam conteúdo e funções. A interface precisa funcionar para mais de um ritmo:

- **Varredura rápida:** títulos, rótulos, resumos, números e chamadas devem comunicar estrutura sem exigir leitura integral.
- **Leitura aprofundada:** texto longo precisa de ordem, largura confortável, hierarquia e referências claras.
- **Comparação:** opções devem expor diferenças relevantes com unidades e condições consistentes.
- **Decisão:** preço, disponibilidade, requisitos, limites e consequências devem aparecer antes do compromisso.
- **Tarefa repetida:** atalhos e consistência podem ser mais úteis do que explicações repetidas.
- **Descoberta:** navegação, categorias, busca e sinais de orientação ajudam a explorar sem se perder.
- **Consumo visual ou audiovisual:** imagens, gráficos e vídeo precisam de contexto, controles, alternativa e comportamento de carregamento.

Observe a relação entre densidade e propósito: pouco conteúdo pode esconder informação necessária; muito conteúdo pode dificultar encontrar o essencial. A solução não é sempre reduzir. Pode ser reorganizar, resumir com acesso a detalhes, permitir comparação ou revelar informações no momento certo.

Considere contexto real de dispositivo e atenção. Não presuma que todas as pessoas estão sentadas diante de um monitor, têm conexão rápida, som ligado, visão perfeita ou tempo para explorar. Ao mesmo tempo, não desenhe só para o menor viewport se a tarefa depende de comparação ou trabalho extenso.

## 4. Método de auditoria estética

Faça a avaliação numa jornada concreta. Comece pela entrada mais provável, identifique a tarefa e percorra até um resultado ou bloqueio. Avalie cada critério abaixo como **funciona**, **atenção** ou **problema observado**, sempre anotando evidência e efeito provável.

### A. Primeira impressão e orientação

- Em poucos segundos, é possível dizer o que é oferecido e para quem?
- A página comunica onde a pessoa está e qual conteúdo encontrará?
- A marca parece apropriada ao produto e ao nível de confiança necessário?
- A ação principal fica visível no contexto, sem competir com chamadas equivalentes?
- A introdução responde ao que a página promete no link, busca ou anúncio que trouxe a pessoa?

### B. Hierarquia e leitura

- Os títulos descrevem conteúdo real ou são apenas slogans vagos?
- Tamanho, peso, contraste, espaço e posição formam uma ordem coerente?
- É fácil distinguir título, corpo, legenda, controle e ação?
- Parágrafos, listas, tabelas e imagens ajudam a varrer ou comparar conteúdo?
- Comprimento de linha, tamanho de texto e espaçamento permitem leitura confortável?
- Informação crítica está próxima da ação que depende dela?

### C. Composição, espaço e consistência

- Alinhamentos e margens indicam agrupamento e relação entre elementos?
- A distribuição de espaço enfatiza o que importa e evita aglomeração ou vazios sem função?
- Componentes equivalentes têm aparência e comportamento equivalentes?
- Cor, tipo, raio, sombra e ícones parecem formar um sistema intencional?
- Exceções visuais são justificadas pela tarefa ou apenas acrescentam ruído?

### D. Cor, imagem e identidade

- Cor comunica hierarquia e estado além de decorar?
- Texto e controles têm contraste suficiente no uso real?
- Imagens ajudam a compreender, avaliar ou confiar no produto?
- Imagens de pessoas, produtos ou resultados são autênticas e representativas do que se promete?
- Cortes, proporções, resolução e carregamento mantêm o significado em telas diferentes?
- Ícones são reconhecíveis e acompanhados por rótulo quando a forma não é óbvia?

### E. Ação e feedback

- A aparência indica o que é clicável, editável, selecionável ou apenas informativo?
- A linguagem do botão antecipa o resultado (“Criar conta”, em vez de “Continuar”, quando apropriado)?
- Estados hover, foco, ativo, carregamento, erro e sucesso são perceptíveis?
- Após uma ação, fica claro o que aconteceu e qual é o próximo passo?
- A pessoa pode revisar, corrigir, cancelar ou recuperar-se de uma ação relevante?

### F. Confiança e redução de risco

- A página explica preço, condições, privacidade, disponibilidade e limitações no momento da decisão?
- Provas, selos, logos e depoimentos têm fonte e contexto legítimos?
- A interface pede apenas informação necessária e explica pedidos sensíveis?
- O design evita pressão enganosa, urgência falsa, opções escondidas e cancelamento difícil?
- Erros de linguagem, inconsistência ou elementos quebrados prejudicam credibilidade?

### G. Responsividade e acessibilidade visual

- Hierarquia e conteúdo continuam completos em viewport estreito e com zoom?
- Texto e controle continuam legíveis, sem sobreposição ou rolagem horizontal indevida?
- Foco visível, teclado e ordem de leitura acompanham a estrutura visual?
- Cor não é o único meio para identificar estado ou diferença?
- Movimento pode ser reduzido e conteúdo essencial não depende da animação?
- O design continua compreensível com imagens bloqueadas, sem áudio ou em alto contraste?

## 5. Consumo por tipo de página

Adapte a auditoria à intenção. A mesma escolha visual pode ser adequada em um contexto e prejudicial em outro.

### Landing page ou marketing

Observe se a proposta de valor é específica, se o público se reconhece, se há caminho para avaliar adequação e se a chamada leva a uma etapa previsível. Avalie a sequência do argumento: promessa, explicação, evidência, objeções, condições e ação. Uma página não precisa seguir um template universal; precisa responder às dúvidas reais sem esconder condições.

### Ecommerce

Observe descoberta, busca, filtros, comparação, informação de produto, preço total, frete, devolução, estoque, carrinho, checkout e confirmação. Em cada passo, procure custos surpresa, perda de progresso, erro difícil de corrigir e falta de segurança percebida. Use pesquisa especializada do domínio e dados da loja quando disponíveis.

### SaaS ou produto digital

Observe entendimento da capacidade, adequação do plano, cadastro, onboarding, primeira tarefa bem-sucedida, estados vazios e uso recorrente. A estética precisa apoiar compreensão do produto e não apenas parecer moderna. Analise se demonstrações e exemplos são fiéis ao sistema real.

### Dashboard e ferramenta profissional

Observe escaneabilidade, densidade, nomenclatura, comparação temporal, filtros, hierarquia de alertas, confiabilidade de dados e eficiência de uso recorrente. Menos elementos não significa necessariamente melhor: densidade pode ser essencial ao trabalho especializado.

### Conteúdo editorial ou educativo

Observe descoberta, navegação entre tópicos, leitura longa, legibilidade, autoria, data, fontes, referências, acessibilidade de mídia e continuidade de leitura. Publicidade e recomendações não devem se confundir com conteúdo principal.

## 6. Priorização sem falsa precisão

Não transforme impressões subjetivas em pontuação matemática sem dados. Para cada achado, atribua rótulos simples:

- **Impacto:** alto, médio, baixo — qual parte da tarefa, compreensão, confiança ou acesso é afetada?
- **Alcance:** central, frequente, ocasional — quantas rotas ou momentos parecem envolvidos?
- **Confiança:** evidência direta, indício, hipótese — quão sustentada é a explicação?
- **Esforço/dependência:** pequeno, moderado, grande; há conteúdo, produto ou backend necessário?
- **Urgência:** bloqueia tarefa/acesso, cria risco, degrada qualidade, oportunidade visual.

Ordem sugerida: barreiras de acesso e falhas que bloqueiam a tarefa; clareza e confiança para decisões; problemas frequentes de navegação e conteúdo; consistência e refinamento estético; experimentações de baixo impacto. Revise a ordem conforme o contexto do produto e o risco real.

## 7. Como registrar uma oportunidade

Use uma linha por achado:

> **Local:** página, componente ou passo  
> **Observação:** elemento e comportamento verificável  
> **Efeito provável:** impacto na tarefa ou no entendimento  
> **Público/contexto:** quem pode ser mais afetado e em que situação  
> **Evidência/confiança:** fonte e nível de confiança  
> **Recomendação:** mudança concreta, sem escolher estética antes do problema  
> **Validação:** como saber se a mudança ajudou

### Exemplo hipotético

> **Local:** página de planos, bloco acima da tabela  
> **Observação:** três planos têm botões igualmente destacados, mas a página não explica para quem cada um serve.  
> **Efeito provável:** pessoas precisam inferir diferenças antes de escolher e podem adiar a decisão.  
> **Público/contexto:** visitantes novos que ainda não conhecem os limites do produto.  
> **Evidência/confiança:** observação da interface; hipótese sobre hesitação, ainda não confirmada.  
> **Recomendação:** explicar o caso de uso e o limite principal de cada plano perto do nome e do preço; manter comparação detalhada acessível.  
> **Validação:** teste de compreensão da diferença entre planos; depois, observar avanço para a etapa seguinte sem aumentar seleção inadequada.

## 8. Padrões de erro na auditoria

- Chamar uma interface de “feia” sem apontar qual tarefa ou percepção é prejudicada.
- Tratar gosto pessoal como necessidade do público.
- Inferir público por fotografia, cores, segmento aparente ou preço sem evidência.
- Redesenhar antes de entender conteúdo, fluxo, marca e stack.
- Copiar um site de galeria sem checar se é adequado ao público, conteúdo e comportamento do produto.
- Confundir novidade, minimalismo ou animação com qualidade.
- Reduzir conteúdo sem verificar o que a pessoa precisa para decidir.
- Usar uma nota geral de UX/estética que esconde problemas críticos e diferenças entre páginas.
- Prometer aumento de conversão sem hipótese mensurável e validação.
- Fazer apenas uma auditoria desktop, visual e com mouse.

## 9. Modelo de síntese para entregar antes do redesign

### Contexto

- Produto e tipo de página:
- Tarefa principal:
- Público provável e evidência disponível:
- Contexto de uso relevante:
- Limitações e desconhecidos:

### O que está funcionando e deve ser preservado

- Elemento/padrão:
- Por que ajuda a tarefa ou representa bem o produto:
- Evidência:

### O que pode melhorar

| Prioridade | Local e observação | Impacto provável | Confiança | Próximo passo |
|---|---|---|---|---|
| P1/P2/P3 | Achado observável | Tarefa/público/contexto | Evidência/indício/hipótese | Ajuste ou validação |

### Próxima decisão

Declare quais problemas estão prontos para solução, quais dependem de validação e quais não devem ser alterados nesta rodada. Depois disso, conecte cada proposta visual a um achado do diagnóstico.

## 10. Referências para aprofundar esta camada

Fontes primárias e orientação geral:

- Nielsen Norman Group — heurísticas e avaliação de usabilidade: https://www.nngroup.com/articles/ten-usability-heuristics/
- Nielsen Norman Group — personas e evidência de pesquisa: https://www.nngroup.com/articles/persona/
- GOV.UK Service Manual — pesquisa com usuários: https://www.gov.uk/service-manual/user-research
- GOV.UK Service Manual — acessibilidade: https://www.gov.uk/service-manual/helping-people-to-use-your-service/making-your-service-accessible
- W3C WAI — introdução à acessibilidade web: https://www.w3.org/WAI/fundamentals/accessibility-intro/
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- MDN — princípios de design responsivo: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design
- Baymard Institute — pesquisa de UX para ecommerce: https://baymard.com/research
- Nielsen Norman Group — leitura e escaneabilidade: https://www.nngroup.com/articles/how-users-read-on-the-web/

As URLs devem ser verificadas antes de uma pesquisa formal ou citação em entrega externa. Não atribua a uma fonte afirmações que não foram consultadas diretamente.
