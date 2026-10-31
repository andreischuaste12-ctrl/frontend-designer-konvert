---
name: create-frontend-from-zero-konvert
description: Create a new frontend from an empty project or an explicitly requested new interface, from product brief and audience through interaction design, implementation, and rendered verification. Use for building a landing page, storefront, dashboard, or application interface from scratch, including when visual references inform the new build. Do not use for a read-only audit of an existing interface or for an existing project's approved audit findings or reference reproduction; use audit-frontend-designer-konvert or design-por-referencia-konvert respectively.
---

# Criar frontend do zero

Transforme uma necessidade de produto em uma interface funcional, acessível e verificável. Esta skill lidera quando o objetivo principal é construir um frontend novo, em projeto vazio ou em uma área nova explicitamente solicitada. Ela implementa, executa o projeto quando viável e relata o que realmente verificou.

## Fronteiras e colaboração

- **Novo frontend:** esta skill lidera, inclusive quando uma referência ajuda a orientar uma criação original. Extraia princípios, sem copiar marca, conteúdo ou assets de terceiros.
- **Auditar interface existente:** use `audit-frontend-designer-konvert`, que é somente leitura. Para "audite e corrija", comece por ela e siga o contrato de aprovação.
- **Aplicar referência, refinar diretamente uma interface existente ou implementar relatório aprovado:** use `design-por-referencia-konvert` e respeite suas regras de escopo, aprovação e dependência externa.
- Em projetos mistos, implemente apenas a nova área autorizada; identifique e preserve integrações e interfaces existentes. Consulte o [guia de colaboração](references/colaboracao.md) para aproveitar o conhecimento e as ferramentas das outras skills sem duplicá-los.

## Fluxo

1. **Entender o pedido e o contexto.** Leia instruções do projeto, arquivos relevantes, stack e convenções existentes. Identifique produto, público, tarefa principal, páginas, dados, identidade, restrições e onde o trabalho será entregue. Distinga fatos fornecidos de hipóteses; não invente personas ou resultados de pesquisa. Se uma escolha indispensável não puder ser inferida e tiver impacto irreversível, peça esclarecimento; nas demais decisões, declare a suposição e avance. Registre o resultado no brief de [descoberta e brief](references/descoberta-e-brief.md).
2. **Definir uma proposta concreta.** Escolha a jornada e os estados relevantes: inicial, carregamento, vazio, sucesso, erro e recuperação quando aplicáveis. Liste componentes e estados por tela com [estados e componentes](references/estados-e-componentes.md), usando as unidades da auditora como critério de pronto. Para projetos com múltiplas páginas ou categorias, defina caminhos com [estrutura de conteúdo e navegação](references/estrutura-de-conteudo-e-navegacao.md). Defina conteúdo, hierarquia, navegação e direção visual coerentes com público e objetivo, com tokens decididos conforme a [fundação visual](references/fundacao-visual.md). Use a [exploração de direção visual](references/exploracao-de-direcao-visual.md) quando duas opções mudarem materialmente o resultado. Use os materiais locais existentes e, se disponíveis e pertinentes, os catálogos e unidades de conhecimento da auditora. Cite somente referências realmente consultadas. Uma referência visual é inspiração, não evidência de usabilidade.
3. **Planejar a construção.** Reutilize framework, roteamento, componentes e tokens existentes. Em um projeto vazio, escolha a solução mais simples adequada ao pedido e ao ambiente com a [escolha de stack](references/escolha-de-stack.md); justifique dependências novas, verifique versões e scripts antes de executá-los. Não suponha autorização para serviços pagos, publicação, contas externas ou dados reais. Mantenha escopo de backend, autenticação e integrações conforme o pedido; quando ausentes, use dados sintéticos e indique claramente a limitação.
4. **Implementar.** Construa conteúdo, estrutura semântica, estilos, componentes e interações reais dentro do escopo autorizado. Evite botões sem comportamento ou links fictícios apresentados como funcionais: implemente a ação solicitada ou indique claramente sua indisponibilidade. Use tokens coerentes, estados visíveis e layouts responsivos. Aplique as regras de [conteúdo, SEO, performance e medição](references/conteudo-seo-performance.md): conteúdo fictício identificado, básico de SEO nas páginas públicas e nenhum analytics sem pedido. Consulte [segurança e localização](references/seguranca-e-localizacao-frontend.md) para proteger o frontend e, quando o produto tiver múltiplos idiomas ou regiões, adaptar a interface aos locales definidos. Não remova nem substitua código, dados, integrações ou arquivos do usuário sem necessidade e autorização aplicável.
5. **Verificar.** Execute as verificações pertinentes ao projeto, rode a interface localmente quando possível e abra o resultado renderizado. Verifique tarefas principais, conteúdo, navegação, teclado, foco, formulários, estados pertinentes, tela estreita e desktop; avalie contraste e movimento reduzido quando aplicável. Use os scripts da skill de referência quando estiverem disponíveis, com saída autorizada e dados sintéticos. Para uma criação sem versão anterior, não invente um antes/depois: registre a primeira captura como referência inicial e compare somente estados ou versões realmente existentes. Consulte [verificação](references/verificacao.md).
6. **Entregar e relatar.** Confira a [definição de pronto](references/entrega.md) e use o modelo de relatório dela. Informe arquivos alterados, decisões e suposições relevantes, como executar, verificações executadas e seus resultados, funcionalidades simuladas e o que não foi possível validar. Registre tarefas, áreas inspecionadas, decisões e critérios verificados em `execution-record.json` no diretório de saída autorizado, seguindo [registro de execução](../audit-frontend-designer-konvert/references/registro-de-execucao.md) e seu validador. Não armazene prompt ou URLs privadas. Não alegue testes com usuários, conformidade integral, desempenho ou resultados comerciais sem evidência. Se o navegador não estiver disponível, relate explicitamente que a interface não foi inspecionada visualmente.

## Privacidade e segurança

Use apenas alvos e ambientes autorizados. Nunca leia ou exponha `.env`, credenciais, sessões ou dados pessoais desnecessários; use conteúdo sintético e revise capturas antes de compartilhar. Respeite as proteções e limitações da ferramenta de captura: a inspeção executa JavaScript e não é sandbox para sites não confiáveis. Grave artefatos somente em diretório autorizado e ignorado pelo Git, ou fora do checkout; não altere a configuração de privacidade do projeto sem necessidade. Não envie dados a terceiros, não crie contas nem publique sem autorização.

## Critérios de qualidade

A interface deve sustentar a tarefa principal com clareza, hierarquia visual, conteúdo coerente e feedback útil. Cuide de semântica, foco, nomes acessíveis, rótulos e reflow conforme o contexto; não afirme certificação de acessibilidade apenas com verificações automáticas. Não invente métricas de conversão, depoimentos, selos, preços, integrações ou funcionalidades. Prefira uma implementação completa e testável no escopo a uma aparência convincente com ações quebradas.

## Definição de pronto

A entrega só está pronta quando a tarefa principal funciona de ponta a ponta no escopo combinado e cada item da [definição de pronto](references/entrega.md) está cumprido, não aplicável com motivo ou não verificado com motivo. Pontos que mais falham em criações do zero:

- estados além do normal (carregando, erro, vazio, sucesso e recuperação) sem forma de serem observados;
- foco removido ou encoberto, rótulo só no placeholder e erro indicado só por cor;
- contraste e alvos de toque não medidos no render;
- botões e links que parecem funcionar, mas não fazem nada;
- dados comerciais, depoimentos ou integrações inventados;
- analytics ou fontes externas adicionados sem decisão registrada.

## Referências e exemplos

| Material | Quando usar |
| --- | --- |
| [Descoberta e brief](references/descoberta-e-brief.md) | Antes de construir: perguntas com padrões e registro de suposições. |
| [Escolha de stack](references/escolha-de-stack.md) | Projeto vazio, sem plataforma definida. |
| [Fundação visual](references/fundacao-visual.md) | Tokens e restrições verificáveis de contraste, alvo e foco. |
| [Exploração de direção visual](references/exploracao-de-direcao-visual.md) | Direção original, opções materiais e conferência no render. |
| [Estrutura de conteúdo e navegação](references/estrutura-de-conteudo-e-navegacao.md) | Caminhos, rótulos e organização de páginas em projetos novos. |
| [Estados e componentes](references/estados-e-componentes.md) | Inventário por tela e unidades da auditora como critério de pronto. |
| [Conteúdo, SEO, performance e medição](references/conteudo-seo-performance.md) | Páginas públicas, formatos brasileiros, Core Web Vitals e privacidade. |
| [Segurança e localização](references/seguranca-e-localizacao-frontend.md) | Conteúdo variável, recursos externos e, quando aplicável, vários idiomas ou regiões. |
| [Verificação](references/verificacao.md) | Como executar e registrar as verificações. |
| [Colaboração](references/colaboracao.md) | Quando usar a auditora e a executora. |
| [Definição de pronto e entrega](references/entrega.md) | Antes de relatar a entrega. |
| [Brief de landing](examples/brief-sintetico.md), [brief de e-commerce](examples/brief-ecommerce.md) e [relatório de entrega](examples/relatorio-de-entrega.md) | Exemplos sintéticos do nível de detalhe esperado. |
