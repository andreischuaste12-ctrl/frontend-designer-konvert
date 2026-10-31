# Next.js na implementação da interface

Use este guia quando uma mudança visual ou de interação depender de uma convenção do Next.js. Ele complementa a [orientação de stack](adaptadores-de-stack.md); não substitui a documentação da versão instalada nem autoriza refatoração de dados, autenticação ou deploy fora do pedido.

## Localizar a rota e a versão

Identifique no pacote que atende a página: versão resolvida de `next` e React, scripts do projeto, configuração, diretório da rota e router em uso. Um repositório pode ter `app/` e `pages/` simultaneamente; encontre a rota alvo antes de aplicar uma convenção. Consulte a documentação oficial correspondente à versão quando um comportamento de API, cache, imagem, fonte ou build for decisivo. Não transforme um ajuste de interface em migração de router ou major.

## Manter a fronteira de interação clara

No App Router, separe a parte que apresenta dados da parte que precisa de estado, eventos ou APIs do navegador. Adicione uma fronteira cliente apenas ao componente que precisa dela e confira as dependências que esse componente leva para o bundle. Preserve os dados e contratos que a página já recebe; não envie segredos ou objetos internos ao navegador. No Pages Router, siga o modelo de dados e composição existente, sem transpor regras de outro router.

Se o primeiro render do navegador divergir do HTML entregue pelo servidor, investigue o valor que mudou: data ou locale, conteúdo aleatório, acesso precoce a armazenamento/browser, marcação inválida ou estado dependente de sessão. Não esconda o aviso de hidratação como solução. Para uma mudança visual, preserve título, conteúdo importante e controles utilizáveis antes de depender de JavaScript quando a arquitetura permitir.

## Tratar estados como parte da página

Confirme onde a rota coloca estados de espera, erro e ausência e como eles aparecem ao usuário. Mantenha informação de progresso ligada à tarefa, recuperação próxima da falha e foco previsível após navegação ou ação. Uma tela de carregamento não deve apresentar valor final falso; uma mensagem de erro não deve expor detalhes internos. Respeite os limites de segmento e os componentes já utilizados pelo app.

Se a mudança tocar envio ou mutação, preserve validação, autenticação, autorização e contratos de dados já existentes. A proteção de uma ação deve ocorrer onde ela é executada; desabilitar um botão é feedback de interface, não controle de acesso. Alterações de cache, invalidação ou endpoint exigem escopo e verificação próprios, conforme a versão e a arquitetura do projeto.

## Recursos que afetam o render

- **Imagens:** confira dimensões, proporção, `sizes`, custo da imagem principal e compatibilidade da otimização com o ambiente de execução. Restrinja origens remotas conforme o produto e use apenas assets autorizados.
- **Fontes:** verifique pesos e subconjuntos realmente usados, fallback e disponibilidade no build. Não adicione fonte remota por conveniência sem avaliar privacidade e rede.
- **Título e metadados:** mantenha título descritivo da rota e dados de compartilhamento coerentes com o conteúdo real. Mudança de aparência não autoriza inventar descrição, promessa ou URL publicada.
- **Scripts:** preserve consentimento, ordem e necessidade das integrações existentes. Não introduza rastreadores para medir um refinamento visual.

## Conferir no projeto consumidor

Leia os scripts antes de executá-los. Rode testes e verificações relevantes já configurados; não presuma que o build executa lint ou que o preview reproduz o runtime de produção. Abra a rota e os estados alterados, repita largura estreita e desktop, foco e movimento reduzido quando pertinente, e compare antes/depois com as ferramentas da executora. Registre separadamente o que foi confirmado em código, build, render e integração. Se um recurso da versão estiver incerto, marque esse ponto como não verificado em vez de afirmar compatibilidade.
