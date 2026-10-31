# Tailwind no sistema visual do projeto

Consulte este roteiro quando o alvo usa Tailwind e o pedido afeta tokens, temas ou componentes compartilhados. Ele complementa a [orientação de stack](adaptadores-de-stack.md), o [mapeamento de papéis](papeis-e-tokens.md) e o [refinamento de interface](refinamento-de-interface.md). Tailwind é uma forma de implementar o sistema; não define por conta própria a direção estética da página.

## Confirmar a instalação que realmente constrói o alvo

Antes de editar, identifique o pacote consumidor, a versão resolvida de `tailwindcss`, o lockfile, a entrada de CSS, o comando de build e a integração em uso. Confira se o CSS final do app vem de uma configuração JavaScript, de diretivas no CSS ou de uma combinação explicitamente carregada. Em monorepo, o arquivo de configuração mais próximo não é necessariamente o que produz o CSS do componente. Se a versão ou o consumidor ainda não puderem ser confirmados, descreva a hipótese e não aplique uma receita de migração.

| Situação confirmada | Onde procurar a decisão de design | O que conferir no build |
| --- | --- | --- |
| Tailwind v3 | configuração e extensões de tema do pacote; variáveis CSS de runtime usadas pelo produto | fontes varridas pelo compilador, classes emitidas e estilos do consumidor |
| Tailwind v4 | entrada CSS, variáveis de tema, fontes adicionais declaradas e integração instalada | utilities geradas a partir dos nomes usados e CSS entregue à rota |
| Biblioteca consumida por outro app | exports, CSS publicado e caminho pelo qual o app descobre classes da biblioteca | build de um consumidor real, não só do pacote de origem |

Não altere major, plugin, pipeline de CSS nem dependência apenas para realizar um ajuste de aparência. Uma migração solicitada é trabalho próprio: registre o estado inicial, leia a documentação da versão instalada, verifique compatibilidade dos consumidores e revise o diff antes de considerar a tarefa concluída.

## Manter uma fonte de decisões visuais

Mapeie cada papel necessário para um token já existente: superfície, texto, ação, borda, estado, foco, tipo, espaço ou movimento. Só crie um novo nome quando ele representar uma decisão reutilizada ou um contrato que o produto precisa variar. Tokens de componente fazem sentido quando o componente tem uma escolha própria que não cabe no papel geral. Cores e medidas soltas podem ser adequadas a uma exceção local; repetição com significado pede uma decisão nomeada.

Em v3, confirme se a alteração deve estender ou substituir uma escala configurada. Em v4, diferencie variáveis de tema que geram utilities de variáveis CSS usadas apenas em tempo de execução; verifique a sintaxe aceita pela versão instalada. Para claro e escuro, preserve o mecanismo de preferência do produto e confira os pares de cor no componente renderizado. Uma lista de tokens, sozinha, não demonstra contraste, foco ou legibilidade.

## Projetar componentes para seus consumidores

Defina primeiro a responsabilidade e o elemento semântico do componente. Registre apenas opções que os consumidores realmente precisam controlar, como intenção, tamanho e estado; defaults e combinações inválidas devem ser claros. Preserve propriedades nativas, nomes acessíveis, foco, eventos, `ref` e contratos de formulário quando a API pública os expõe. Para menu, diálogo e outros controles complexos, mantenha a primitiva e o comportamento acessível já adotados pelo projeto.

Use um conjunto explícito de classes completas para cada opção. Construir pedaços de nome de classe a partir de valores arbitrários de props pode deixar o CSS final sem a regra esperada. Se classes residirem em outro pacote ou forem selecionadas por conteúdo externo, descubra como a integração instalada encontra esses arquivos antes de adicionar uma lista ampla de exceções. Confirme no CSS produzido que uma variante usada pelo consumidor realmente existe.

Escolha a camada de implementação conforme a responsabilidade: utilities locais para diferenças de composição, componente para estrutura e comportamento repetidos, CSS para relações difíceis de expressar no markup e extensões do framework somente quando o padrão realmente precisa delas. Não introduza uma biblioteca de variantes ou de composição de classes sem necessidade demonstrada e compatibilidade verificada.

## Adaptação, estados e verificação

Teste o componente no espaço que ele recebe, além da largura total da página. Use o mecanismo responsivo disponível no projeto; uma mudança de coluna pode depender do contêiner, enquanto uma mudança de navegação pode depender da viewport. Observe texto longo, zoom, teclado, toque, temas, foco, erro e carregamento quando pertencem ao contrato. Movimento não essencial deve oferecer a alternativa reduzida.

Após a edição, execute os comandos existentes do pacote e de pelo menos um app consumidor afetado. Confirme a classe no CSS compilado **e** abra o componente renderizado nos estados e larguras relevantes. Para um relatório aprovado, associe a mudança ao ID autorizado; para um pedido direto, mantenha o alvo delimitado. Relate separadamente o que foi conferido no build, no CSS, no navegador e o que ficou sem verificação.
