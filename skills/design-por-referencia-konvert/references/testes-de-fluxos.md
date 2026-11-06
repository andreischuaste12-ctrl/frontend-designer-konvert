# Verificação de fluxos no navegador

Use este roteiro quando a implementação afetar uma tarefa que precisa ser concluída por interações, ou quando o usuário pedir uma regressão reproduzível. Os scripts de captura desta skill são somente leitura da navegação: eles não clicam nem enviam formulários. Um teste de fluxo precisa do runner já adotado pelo projeto ou de uma sessão de navegador autorizada.

## Escolher a evidência

Identifique a tarefa, a rota inicial, os dados sintéticos, o estado esperado e o ambiente de teste. Reaproveite o runner, as fixtures e os comandos existentes. Um teste permanente faz sentido quando protege comportamento que pode regredir; para uma observação pontual, uma verificação manual registrada pode ser suficiente. Não crie uma segunda pilha de testes só para provar uma alteração pequena.

Em um teste automatizado, encontre controles por papel, nome e estado que a pessoa consegue perceber. Espere uma mudança observável em vez de um atraso fixo. Verifique resultado e recuperação, não apenas que um clique ocorreu. Isole dados e sessão entre casos; quando uma integração for simulada, declare a fronteira que o teste não cobre. Capturas, traces e logs podem conter dados visíveis e exigem revisão antes de compartilhar.

## Fronteiras de segurança

Use loopback ou ambiente de teste autorizado, com contas e dados sintéticos. Não envie compras, formulários ou conversões reais para obter uma captura de sucesso. Um pedido de teste não autoriza alterar banco, credenciais, infraestrutura ou configuração de produção. Se não houver como produzir um estado com segurança, valide o componente por leitura e registre o estado como não observado.

## Diagnosticar falha

Repita a falha com a mesma versão, viewport, tema, dados e condição de rede. Diferencie regressão do produto, teste frágil e ambiente indisponível antes de mudar código. Não silencie a falha com retries ou espera maior sem identificar a condição que falta. Ao entregar, informe o comando ou procedimento executado, o comportamento observado, os estados cobertos e os limites de integração.
