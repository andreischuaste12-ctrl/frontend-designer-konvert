# Movimento de interface com propósito

Use este roteiro quando o pedido envolve transição, feedback animado ou mudança de estado em uma interface web. Comece pela ação da pessoa e pela informação que o movimento deve comunicar. Uma animação sem função clara pode ser omitida; uma animação bonita não corrige falta de rótulo, foco ou estado final.

## Definir o comportamento antes do efeito

Registre o componente, o evento que inicia a mudança, os estados inicial e final e o que acontece se a pessoa repetir, inverter ou interromper a ação. Identifique quem controla foco, teclado, desmontagem do componente e anúncio de status. Para modal, menu, aba ou acordeão, preserve a semântica e a primitiva já adotadas pelo projeto; aparência e comportamento devem evoluir juntos.

Escolha a técnica de acordo com o que já existe. Transições simples podem ficar no CSS; sequências que exigem cancelamento ou controle em tempo de execução podem precisar de uma API de animação ou da biblioteca já instalada. Não adicione uma dependência para um único efeito sem demonstrar necessidade. Valores de duração, distância e curva devem respeitar os tokens do produto quando houver.

## Conferir estados difíceis

- **Entrada e saída:** o conteúdo aparece e desaparece sem ficar inacessível ou preso em estado intermediário.
- **Ações rápidas:** abrir, fechar e abrir novamente não duplicam controles, timers ou listeners.
- **Interrupção:** cancelar ou navegar para outra rota deixa a interface em estado coerente.
- **Preferência reduzida:** a função e o feedback continuam disponíveis com movimento não essencial reduzido.
- **Foco e teclado:** o foco chega ao destino correto, não acompanha um elemento removido e retorna quando a interação exige.
- **Custo:** se houver travamento, meça o estado e o dispositivo afetados antes de atribuir a causa à animação.

Observe a interação no navegador quando for possível. Uma captura estática mostra o resultado, não a continuidade, a duração ou o cancelamento. Registre o que foi visto e o que não pôde ser testado. Não reutilize receitas, CSS ou scripts de bibliotecas de terceiros apenas porque foram fornecidos como inspiração.
