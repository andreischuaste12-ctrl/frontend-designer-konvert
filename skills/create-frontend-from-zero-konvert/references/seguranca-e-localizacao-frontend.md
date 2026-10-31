# Segurança e localização no frontend

Aplique as orientações de segurança pertinentes a qualquer frontend, inclusive páginas estáticas. As verificações de conteúdo variável se aplicam quando a interface recebe dados de usuários, APIs, CMS, URLs, armazenamento local ou integrações. Use a seção de localização quando o brief incluir mais de um idioma ou região. Este guia orienta decisões do frontend; controles de backend, hospedagem e revisão jurídica exigem responsáveis próprios.

## Conteúdo variável e segurança

Quando houver conteúdo variável, trate como não confiáveis os dados vindos de formulários, APIs, CMS, parâmetros de URL, armazenamento do navegador e integrações, mesmo quando a origem pertence ao próprio produto. Em páginas estáticas, confira igualmente recursos externos e o que a build entrega ao navegador.

- Mostre texto com os mecanismos padrão de interpolação segura da stack confirmada. Não converta dados em HTML executável nem use sinks de HTML direto para conteúdo variável.
- Se a tarefa realmente exigir rich text, use um sanitizador mantido e adequado à stack, com uma lista explícita de elementos e atributos permitidos. Valide também os esquemas e destinos de links antes de torná-los navegáveis.
- Não confunda validação de formulário com proteção contra injeção. Valide para orientar a pessoa e preserve mensagens acessíveis; registre validação, autorização e limites que dependem do servidor como responsabilidade da integração.
- Considere configuração enviada ao navegador como pública. Não coloque chaves privadas, senhas ou tokens de servidor em variáveis, arquivos estáticos ou bundles do cliente. Confirme a convenção da stack antes de escolher nomes de variáveis públicas.
- Carregue scripts, iframes e recursos externos apenas quando fizerem parte do escopo e houver uma origem autorizada. Não introduza serviços, rastreadores ou scripts remotos por conveniência visual.

### Verificação segura

1. Siga os dados variáveis desde a origem até o componente que os exibe. Confirme que texto continua sendo texto e que conteúdo rico passa por sanitização antes de chegar ao renderizador.
2. Para links gerados por dados, confira que esquemas e destinos permitidos correspondem ao comportamento do produto; rejeite ou torne inerte o restante.
3. Revise a configuração e o resultado de build para conferir o que é enviado ao navegador. Nunca leia ou imprima `.env` ou valores de credenciais; para testar a filtragem do build, use somente um marcador sintético sem valor secreto. Sem revisão apropriada dos segredos reais, registre o limite da verificação em vez de declarar ausência absoluta de vazamento.
4. Teste formulários com dados sintéticos em ambiente local. Não envie dados reais nem trate a validação visual como proteção do servidor.
5. Registre como não verificado qualquer controle de backend, cabeçalho HTTP ou configuração de hospedagem fora do escopo e da evidência disponível. Não afirme que a aplicação está segura com base apenas nesta revisão.

## Mais de um idioma ou região

Ative esta seção quando o brief incluir múltiplos locales, páginas traduzidas, mercados distintos ou idiomas com direção de escrita diferente. Não gere traduções, moedas, URLs ou mercados que o projeto não definiu.

- Registre os locales suportados e a origem das traduções. Defina o idioma principal do documento e marque trechos em outro idioma quando necessário; aplique direção de escrita conforme o conteúdo.
- Formate datas, horários, números e valores monetários com o locale apropriado e as regras de negócio fornecidas. Obtenha moeda e fuso horário das regras do produto; não os deduza apenas do idioma. Use `Intl` ou a biblioteca de internacionalização já adotada no projeto; não monte a formatação com separadores ou símbolos concatenados.
- Escolha plurais e mensagens variáveis por regra linguística ou catálogo de mensagens da stack. Evite concatenar palavras em torno de um número quando a ordem ou a forma puder mudar entre idiomas.
- Use propriedades CSS lógicas quando o layout precisar funcionar em direções distintas. Não resolva RTL invertendo a página inteira sem verificar a ordem semântica, ícones direcionais, navegação e posição dos controles.
- Permita que rótulos, mensagens de erro, títulos, preços e botões cresçam sem clipping ou sobreposição. Evite larguras fixas que dependam do comprimento de uma tradução.
- Configure metadados de idioma e alternância entre URLs somente para variantes que realmente existem. Não invente rotas traduzidas ou conteúdo localizado.

### Verificação por locale

Para cada locale incluído no escopo, confira em viewport estreito e desktop:

- título, navegação, botões, validação, estados vazio/erro/sucesso e conteúdo de maior comprimento;
- singular, plural e valores de fronteira relevantes ao produto;
- moeda, número, data, horário e fuso conforme os dados fornecidos;
- ordem de leitura, foco, ícones direcionais e reflow quando houver RTL;
- idioma declarado no documento e correspondência entre texto, locale e rota.

Use dados sintéticos e registre os locales, viewports e estados efetivamente verificados. Se traduções ou regras comerciais estiverem pendentes, marque a dependência e não trate o placeholder como conteúdo validado.
