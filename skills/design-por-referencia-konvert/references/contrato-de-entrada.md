# Contrato de entrada

Feche estes cinco pontos antes de implementar. Preencha o que o contexto já responde e pergunte apenas o que mudaria o resultado.

## 1. Fonte da referência

| Tipo | Como tratar |
| --- | --- |
| Arquivo ou texto de design (DESIGN.md, guia de estilo) | Fonte principal; leia inteiro antes de extrair. |
| URL pública ou site em execução | Capture e meça conforme [captura e inspeção](captura-e-inspecao.md): estilos computados e CSS viram valores **medidos**; capturas viram leitura visual. Registre a data da consulta. Não leia só o HTML. |
| Captura de tela | Extraia o que é visível; tipografia e valores exatos ficam **inferidos**. |
| Estilo descrito em palavras | Trate como briefing: as decisões de valor são **suas** e devem ser declaradas. |
| Nenhuma | Use os tokens do projeto; não crie referência inexistente. |

Se a fonte não abrir ou não for possível renderizar, diga isso e prossiga com tokens locais. Peça o arquivo, a URL ou as capturas somente se a fidelidade for indispensável.

## 2. Nível de fidelidade

| Nível | Significado | O que pode mudar |
| --- | --- | --- |
| **Inspiração** | Capturar clima e hierarquia. | Quase tudo, desde que a sensação se mantenha. |
| **Adaptação** (padrão) | Reproduzir papéis de cor, tipo, espaço e composição, ajustados ao produto. | Valores que conflitem com tokens, acessibilidade ou conteúdo reais. |
| **Réplica estrutural** | Seguir a referência o mais perto possível em estrutura e valores. | Só marca, textos, imagens e o que for de terceiros. |

Réplica estrutural nunca inclui copiar marca, logotipo, imagens, textos ou dados.

## 3. Escopo

Telas, componentes ou o site inteiro. Liste o que entra e o que fica de fora. Em ajuste pontual, aplique a referência só ao que foi pedido. Para telas, liste as rotas.

## 4. O que é intocável

Marca, copy, tokens, componentes, rotas, contratos de dados e comportamentos que o usuário ou o projeto já fixaram. Em conflito, vale a ordem de precedência do `SKILL.md`.

## 5. Critério de pronto

Como o usuário reconhecerá que ficou certo: telas conferidas, viewports, estados, contraste mínimo, comparação com captura. Se não estiver dito, proponha este critério curto e siga: rotas do escopo conferidas em 320, 375, 768, 1024 e 1440 px (claro e escuro se existirem), hover e foco dos controles principais, contraste e alvos de toque medidos, sem overflow horizontal nem erros novos no console, e comparação com a referência nas mesmas larguras.

## Perguntas mínimas

Faça no máximo cinco perguntas objetivas, de uma vez, com a opção recomendada indicada. Se não houver como perguntar, adote a suposição segura e registre-a no relatório.
