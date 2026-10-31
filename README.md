# Frontend Designer

Skill para avaliar e aprimorar interfaces front-end com foco em estética, clareza, usabilidade e contexto real de uso. Antes de propor um redesign ou editar código, ela orienta o agente a entender o projeto, identificar o público e a tarefa principal, auditar o que já funciona e registrar oportunidades com evidências e hipóteses separadas.

## O que vem na skill

- Auditoria estética ligada à compreensão, leitura, confiança e conclusão de tarefas.
- Investigação do público provável e do contexto de consumo, sem inventar personas.
- Catálogo organizado de referências para ecommerce, landing pages, fluxos, direção visual, componentes, tipografia, usabilidade e acessibilidade.
- Orientações para propor, implementar e verificar melhorias na stack existente.

## Gatilho de uso

Use a skill `frontend-designer` quando a tarefa pedir para analisar ou auditar um site ou aplicação front-end, avaliar sua estética e usabilidade, entender seu público, pesquisar referências, melhorar uma landing page, revisar uma jornada ou implementar melhorias visuais e responsivas.

Exemplos de pedido que devem ativá-la:

- “Audite a experiência e o visual desta página antes de mexer no código.”
- “Analise quem usa este site e proponha melhorias de usabilidade.”
- “Compare esta landing page com referências do segmento e implemente os ajustes prioritários.”
- “Revise esta interface em desktop e mobile, preservando o que já funciona.”

## Baixar e instalar

Clone somente a pasta da skill para a pasta de skills do projeto. Com Git e Bash:

```bash
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/andreischuaste12-ctrl/frontend-designer-konvert.git \
  /tmp/frontend-designer-konvert
git -C /tmp/frontend-designer-konvert sparse-checkout set skills/frontend-designer
mkdir -p .agents/skills
cp -R /tmp/frontend-designer-konvert/skills/frontend-designer .agents/skills/
```

O resultado esperado é `.agents/skills/frontend-designer/SKILL.md` junto da pasta `knowledge-base`. Se seu agente usa outro diretório de skills, copie `skills/frontend-designer` para o local reconhecido por ele. Após instalar, reinicie ou atualize o agente se ele não detectar a skill automaticamente.

## Estrutura

```text
skills/frontend-designer/
├── SKILL.md
└── knowledge-base/
    ├── 01-auditoria-estetica-e-publico.md
    └── 02-catalogo-de-referencias.md
```

## Autor e licença

Criado por **Andrei Schuaste**. Este projeto é distribuído sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para os termos completos.
