# Papéis e tokens

Use esta tabela para extrair a referência e para mapeá-la ao projeto. Cada linha responde: qual papel, qual valor, de onde veio e onde vai no código.

## Origem de cada valor

- **Extraído:** lido diretamente da fonte (arquivo de design, CSS ou código da referência).
- **Medido:** obtido do render por script (estilo computado, dimensões, bytes). É exato para aquele viewport e estado; registre-os.
- **Inferido:** deduzido de uma captura ou de padrão repetido; informe a margem de erro.
- **Decidido:** escolha sua, porque a fonte não cobre ou conflita com o projeto.
- **Ausente:** a fonte não informa e nada foi inventado.

Prefira **medido** a **inferido** sempre que o render estiver acessível (ver [captura e inspeção](captura-e-inspecao.md)).

## Papéis a cobrir

| Papel | O que registrar |
| --- | --- |
| Cor | Fundo, superfície, texto primário e secundário, borda, ação principal, estados (sucesso, aviso, erro), modo claro e escuro se existirem. |
| Tipografia | Famílias, pesos, escala de tamanhos, altura de linha, espaçamento entre letras, uso por nível (título, corpo, rótulo, número), fontes realmente carregadas. |
| Espaçamento | Unidade-base, escala, ritmo vertical, largura máxima de leitura e de contêiner. |
| Forma | Raios, espessura de borda, tratamento de divisores. |
| Elevação | Sombras, camadas, transparência e desfoque, quando houver. |
| Movimento | Durações, curvas, o que anima e o que não anima. |
| Composição | Grade, alinhamento, densidade, proporção entre texto e imagem, ponto de maior destaque. |
| Imagens e ícones | Tipo (foto, ilustração, ícone, fundo), proporção e recorte por breakpoint, tratamento (filtro, overlay, cantos), estilo de ícone (traço, preenchido, espessura), formato e peso, `alt`. Fatos medidos vêm do [inventário de imagens](inventario-de-imagens.md); direitos de uso ficam fora do que se copia. |
| Responsividade | Como grade, navegação, tipografia e imagens mudam por largura (320, 375, 768, 1024, 1440), onde o conteúdo quebra. |
| Componentes | Botão, campo, cartão, navegação, tabela, aviso: variantes e estados que a referência mostra. |

## Registro

Mantenha o registro em uma tabela simples, no relatório ou em um arquivo de apoio quando o trabalho for longo:

| Papel | Valor | Origem | Destino no projeto |
| --- | --- | --- | --- |
| Texto primário | `#1a1a1a` | extraído | `--color-text` |
| Corpo | 16px / 400 / 24px | medido (1440 px, light) | `--font-size-body` |
| Raio de cartão | 12px | inferido (captura) | `--radius-card` |
| Cor de aviso | `#b45309` | decidido (contraste) | `--color-warning` |
| Sombra de modal | não informada | ausente | manter a do projeto |

Os valores acima são exemplos de formato, não de conteúdo.

## Mapeamento ao projeto

1. Procure primeiro um token, variável ou componente existente que cumpra o papel.
2. Se o valor da referência for próximo ao existente, prefira o existente e registre a diferença.
3. Crie um token novo apenas quando a referência exigir a diferença e nada existente servir; siga a convenção de nomes do projeto.
4. Quando o valor extraído ou medido falhar em contraste ou legibilidade, ajuste-o e marque como **decidido**, com o motivo.
5. Mantenha a fonte única de tokens; não duplique valores em arquivos de componente.
6. Valor **medido** em um viewport não vale para todos: registre em qual largura e esquema de cor foi medido.
