# Auditoria de design para sites institucionais e serviços

Use estas **heurísticas** para estudar a jornada até uma informação ou contato, sem presumir perfil demográfico ou intenção. Aplique os [princípios por problema](04-principios-por-problema.md) e registre limites de evidência.

| Jornada | Observar | Preservar e validar |
| --- | --- | --- |
| Chegada | É possível entender quem presta o serviço, o que é oferecido e para quem? A hierarquia facilita a leitura? | Preserve identidade e conteúdo comprovado. Teste a compreensão inicial com pessoas representativas. |
| Serviços | Categorias e descrições ajudam a encontrar uma solução? Links explicam seus destinos? | Preserve rotas e informações relevantes; não trate diversidade visual como defeito por si só. |
| Confiança | Equipe, qualificações, políticas, provas e condições são identificáveis e verificáveis? | Não invente selos, resultados, depoimentos ou garantias. Confirme informações com o responsável. |
| Contato | Botões, telefone, horário e canais descrevem o próximo passo? Formulários têm rótulos e recuperação de erros? | Preserve canais e contratos. Não envie formulário real; use ambiente sintético autorizado. |
| Mobile e acesso | Navegação, foco, contraste, zoom, movimento e leitura funcionam nos estados observáveis? | Registre dispositivo e método; não declare conformidade integral sem avaliação apropriada. |

Uma aparência formal, uma fonte serifada ou uma seção longa não são problemas automaticamente; relacione cada achado à tarefa e a evidência observável.


## Unidades de inspeção

### UXK-GEN-004 — Serviço, região e contato na chegada
- **Contexto:** institucional · página inicial de serviços · todas as stacks · mobile e desktop
- **Estados:** normal
- **Quando se aplica:** página inicial de prestador de serviço.
- **Exceções:** páginas de campanha voltadas a público já qualificado.
- **Evidência a coletar:** captura da primeira dobra em 375 e 1440 px; presença do serviço oferecido, da região ou modalidade de atendimento e de um canal de contato.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Mostrar na primeira dobra o serviço, a região ou modalidade de atendimento e o canal de contato principal.
- **Critério de aceite:** Em 375 px, serviço, região ou modalidade e um canal de contato aparecem sem rolagem.
- **Preservar:** identidade visual e textos institucionais aprovados.
- **Dependência externa:** pendente — serviços e regiões atendidas são confirmados pelo responsável.
- **Métrica a monitorar:** cliques em contato a partir da página inicial.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-NAV-003 — Links de serviço nomeados pelo destino
- **Contexto:** institucional · menu e página de serviços · todas as stacks · mobile e desktop
- **Estados:** normal
- **Quando se aplica:** o site oferece vários serviços.
- **Exceções:** sites de serviço único.
- **Evidência a coletar:** lista dos textos de link do menu e da página de serviços; contagem de "Saiba mais" ou "Clique aqui" sem contexto programático.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Nomear os links pelo destino, como "Contabilidade para MEI", e agrupar os serviços pela necessidade do cliente.
- **Critério de aceite:** Nenhum link de serviço depende apenas de "Saiba mais" ou "Clique aqui" sem contexto programático que identifique o destino.
- **Preservar:** URLs existentes, por causa do SEO.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** navegação até as páginas de serviço.
- **Fonte:** WCAG 2.2 SC 2.4.4 Link Purpose (In Context) — github.com/w3c/wcag@9b94e18, guidelines/sc/20/link-purpose-in-context.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana

### UXK-GEN-005 — Dados verificáveis do prestador
- **Contexto:** institucional · confiança · todas as stacks · mobile e desktop
- **Estados:** normal
- **Quando se aplica:** serviços que dependem de confiança, como saúde, finanças e jurídico.
- **Exceções:** sites internos sem público externo.
- **Evidência a coletar:** lista dos sinais presentes, como razão social, CNPJ, registro profissional, endereço, políticas e depoimentos com origem identificável.
- **Método:** inspeção
- **Prioridade padrão:** P2
- **Recomendação:** Exibir dados verificáveis, como razão social, CNPJ, registro profissional e endereço, no rodapé ou na página "Sobre", e mostrar a origem dos depoimentos.
- **Critério de aceite:** Razão social e CNPJ, ou o registro profissional, podem ser encontrados a partir de qualquer página, e nenhum selo ou depoimento sem origem foi adicionado.
- **Preservar:** depoimentos e selos reais existentes; nunca inventar novos.
- **Dependência externa:** pendente — dados cadastrais e registros vêm do responsável.
- **Métrica a monitorar:** conversão de contato.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-FRM-002 — Contato com prazo informado e canal direto
- **Contexto:** institucional · contato e orçamento · todas as stacks · mobile e desktop
- **Estados:** normal, erro, sucesso
- **Quando se aplica:** formulário de contato ou pedido de orçamento.
- **Exceções:** contato apenas por telefone ou WhatsApp; avalie os links.
- **Evidência a coletar:** captura do formulário e do retorno após envio de teste; links `tel:` e de WhatsApp; prazo de resposta exibido.
- **Método:** inspeção
- **Prioridade padrão:** P1
- **Recomendação:** Usar poucos campos com rótulos visíveis, informar o prazo de resposta e oferecer ao lado um canal direto, como telefone com `tel:` ou WhatsApp.
- **Critério de aceite:** O formulário informa o prazo de resposta e, em 375 px, o link de telefone abre o discador.
- **Preservar:** integração com o CRM e o consentimento exigido pela LGPD.
- **Dependência externa:** pendente — o prazo de resposta é definido pelo atendimento.
- **Métrica a monitorar:** leads enviados e abandono do formulário.
- **Fonte:** não verificada — heurística editorial do projeto; sem pesquisa consultada

### UXK-NAV-004 — Refluxo em 320 px sem rolagem horizontal
- **Contexto:** institucional e demais sites · telas pequenas e zoom · todas as stacks · mobile
- **Estados:** normal
- **Quando se aplica:** qualquer página pública.
- **Exceções:** conteúdo que exige layout bidimensional, como mapas, diagramas, vídeos e tabelas de dados.
- **Evidência a coletar:** captura com `capture.mjs --widths 320`; o índice registra `horizontalOverflow` por largura.
- **Método:** automático
- **Prioridade padrão:** P1
- **Recomendação:** Garantir que o layout reflua em 320 px CSS sem rolagem horizontal e sem perda de conteúdo ou de função.
- **Critério de aceite:** Em 320 px CSS, a captura registra `horizontalOverflow` falso, ou o excesso vem apenas de uma exceção registrada.
- **Preservar:** hierarquia de conteúdo e identidade visual.
- **Dependência externa:** não aplicável
- **Métrica a monitorar:** rejeição em dispositivos móveis.
- **Fonte:** WCAG 2.2 SC 1.4.10 Reflow — github.com/w3c/wcag@9b94e18, guidelines/sc/21/reflow.html · verificado em 2026-10-31 · revisão: agente de IA, pendente de revisão humana
