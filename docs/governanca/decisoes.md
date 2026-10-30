# Registro de decisões

Somente escolhas com autorização identificável. Registrar uma proposta não a aprova; aprovação de produto não comprova validade clínica. Processo em [CONTRIBUTING](../../CONTRIBUTING.md).

## D-001 — Estrutura documental simplificada

- Estado: aprovada para implementação documental.
- Data e responsável: 30/10/2026, responsável pelo produto, nesta conversa.
- Evidência: após solicitar estrutura profissional simplificada e plano, o usuário instruiu “implementar”; pausou para trazer contexto e solicitou usar a conversa de origem na contextualização.
- Escolha: índice, contexto, estado atual, propostas, decisões e revisão local com critérios de aceite e evidências; reaproveitar o acervo sem mover ou duplicar transcrições.
- Motivo: permitir continuidade entre conversas, distinguir intenção de aprovação e evitar documentação concorrente.
- Consequências: atualizar documentos responsáveis a cada mudança; manter histórico identificável; registrar aprovação e execução separadamente.
- Implementação: [RL-001](../revisoes/001-estrutura-documental.md). Revisão humana do resultado permanece pendente.
- Limites: não aprova reclassificações, propostas funcionais, instalações, commits, operações remotas ou publicação.

## D-002 — Organizar documentos ativos por assunto

- Estado: aprovada para organização documental.
- Data e responsável: 30/10/2026, responsável pelo produto, nesta conversa.
- Evidência: após discutir a inconsistência dos nomes, o usuário pediu uniformizar e evitar arquivos na raiz de `docs/` sem necessidade.
- Escolha: manter `docs/index.md` como entrada; agrupar documentos ativos em `produto/`, `clinica/`, `planejamento/` e `governanca/`, com nomes descritivos. Preservar `init/` e IDs estáveis de propostas, decisões e revisões.
- Motivo: facilitar a navegação sem confundir números antigos de arquivo com ordem de execução.
- Implementação e mapa dos nomes anteriores: [RL-003](../revisoes/003-organizacao-documentacao.md).
- Limites: não aprova mudanças funcionais, reclassificações clínicas ou publicação.

## Decisões anteriores com referência existente

O adiamento do offline integral e o plano conectado estão registrados em [docs/planejamento/plano-correcao.md](../planejamento/plano-correcao.md) e [docs/planejamento/checklist-correcao.md](../planejamento/checklist-correcao.md). São decisões herdadas, não novas aprovações nesta entrega. A motivação original está no [contexto](../produto/contexto.md); os detalhes ainda abertos estão em [propostas](propostas.md).
