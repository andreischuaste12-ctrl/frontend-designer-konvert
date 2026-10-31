---
name: create-frontend-from-zero-konvert
description: Create a new frontend from an empty project or an explicitly requested new interface, from product brief and audience through interaction design, implementation, and rendered verification. Use for building a landing page, storefront, dashboard, or application interface from scratch, including when visual references inform the new build. Do not use for a read-only audit of an existing interface or for an existing project's approved audit findings or reference reproduction; use audit-frontend-designer-konvert or design-por-referencia-konvert respectively.
---

# Criar frontend do zero

Transforme uma necessidade de produto em uma interface funcional, acessível e verificável. Esta skill lidera quando o objetivo principal é construir um frontend novo, em projeto vazio ou em uma área nova explicitamente solicitada. Ela implementa, executa o projeto quando viável e relata o que realmente verificou.

## Fronteiras e colaboração

- **Novo frontend:** esta skill lidera, inclusive quando uma referência ajuda a orientar uma criação original. Extraia princípios, sem copiar marca, conteúdo ou assets de terceiros.
- **Auditar interface existente:** use `audit-frontend-designer-konvert`, que é somente leitura. Para "audite e corrija", comece por ela e siga o contrato de aprovação.
- **Aplicar referência a uma interface existente ou implementar relatório aprovado:** use `design-por-referencia-konvert` e respeite suas regras de aprovação e dependência externa.
- Em projetos mistos, implemente apenas a nova área autorizada; identifique e preserve integrações e interfaces existentes. Consulte o [guia de colaboração](references/colaboracao.md) para aproveitar o conhecimento e as ferramentas das outras skills sem duplicá-los.

## Fluxo

1. **Entender o pedido e o contexto.** Leia instruções do projeto, arquivos relevantes, stack e convenções existentes. Identifique produto, público, tarefa principal, páginas, dados, identidade, restrições e onde o trabalho será entregue. Distinga fatos fornecidos de hipóteses; não invente personas ou resultados de pesquisa. Se uma escolha indispensável não puder ser inferida e tiver impacto irreversível, peça esclarecimento; nas demais decisões, declare a suposição e avance.
2. **Definir uma proposta concreta.** Escolha a jornada e os estados relevantes: inicial, carregamento, vazio, sucesso, erro e recuperação quando aplicáveis. Defina conteúdo, hierarquia, navegação, componentes e direção visual coerentes com público e objetivo. Use os materiais locais existentes e, se disponíveis e pertinentes, os catálogos e unidades de conhecimento da auditora. Cite somente referências realmente consultadas. Uma referência visual é inspiração, não evidência de usabilidade.
3. **Planejar a construção.** Reutilize framework, roteamento, componentes e tokens existentes. Em um projeto vazio, escolha a solução mais simples adequada ao pedido e ao ambiente; justifique dependências novas, verifique versões e scripts antes de executá-los. Não suponha autorização para serviços pagos, publicação, contas externas ou dados reais. Mantenha escopo de backend, autenticação e integrações conforme o pedido; quando ausentes, use dados sintéticos e indique claramente a limitação.
4. **Implementar.** Construa conteúdo, estrutura semântica, estilos, componentes e interações reais dentro do escopo autorizado. Evite botões sem comportamento ou links fictícios apresentados como funcionais: implemente a ação solicitada ou indique claramente sua indisponibilidade. Use tokens coerentes, estados visíveis e layouts responsivos. Não remova nem substitua código, dados, integrações ou arquivos do usuário sem necessidade e autorização aplicável.
5. **Verificar.** Execute as verificações pertinentes ao projeto, rode a interface localmente quando possível e abra o resultado renderizado. Verifique tarefas principais, conteúdo, navegação, teclado, foco, formulários, estados pertinentes, tela estreita e desktop; avalie contraste e movimento reduzido quando aplicável. Use os scripts da skill de referência quando estiverem disponíveis, com saída autorizada e dados sintéticos. Para uma criação sem versão anterior, não invente um antes/depois: registre a primeira captura como referência inicial e compare somente estados ou versões realmente existentes. Consulte [verificação](references/verificacao.md).
6. **Entregar e relatar.** Informe arquivos alterados, decisões e suposições relevantes, como executar, verificações executadas e seus resultados, funcionalidades simuladas e o que não foi possível validar. Não alegue testes com usuários, conformidade integral, desempenho ou resultados comerciais sem evidência. Se o navegador não estiver disponível, relate explicitamente que a interface não foi inspecionada visualmente.

## Privacidade e segurança

Use apenas alvos e ambientes autorizados. Nunca leia ou exponha `.env`, credenciais, sessões ou dados pessoais desnecessários; use conteúdo sintético e revise capturas antes de compartilhar. Respeite as proteções e limitações da ferramenta de captura: a inspeção executa JavaScript e não é sandbox para sites não confiáveis. Grave artefatos somente em diretório autorizado e ignorado pelo Git, ou fora do checkout; não altere a configuração de privacidade do projeto sem necessidade. Não envie dados a terceiros, não crie contas nem publique sem autorização.

## Critérios de qualidade

A interface deve sustentar a tarefa principal com clareza, hierarquia visual, conteúdo coerente e feedback útil. Cuide de semântica, foco, nomes acessíveis, rótulos e reflow conforme o contexto; não afirme certificação de acessibilidade apenas com verificações automáticas. Não invente métricas de conversão, depoimentos, selos, preços, integrações ou funcionalidades. Prefira uma implementação completa e testável no escopo a uma aparência convincente com ações quebradas.
