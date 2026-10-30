# Estado atual e próxima ação

Referência: 30/10/2026. Atualizar ao encerrar cada bloco; detalhes de execução permanecem nos registros vinculados.

## Observado nesta estruturação

- Checkout com alterações preexistentes em código, testes, base e documentação. Foram preservadas; não atribuir esse trabalho à estruturação documental.
- Na organização documental de 30/10/2026, o `master` remoto apontava para `406ec3e`, cuja base era 2026.10.1 com 62 regras; a base 2026.10.3 com 71 regras e as correções técnicas estavam apenas no diretório local. A branch criada apenas para a documentação não incluiu essas alterações.
- Base `src/data/rules.json`: `rulesVersion` 2026.10.3; 71 regras, sendo 7 `DOCUMENTED` e 64 `PENDING_REVIEW`, contagens conferidas por leitura do JSON.
- O significado e as lacunas desses estados estão em [docs/clinica/base-clinica.md](../clinica/base-clinica.md). Cadastro documentado não certifica toda dose, sinônimo ou formulação.
- Documentação organizada nesta entrega; implementação das novas propostas de produto não iniciada por esta tarefa. Evidências da organização: [RL-001](../revisoes/001-estrutura-documental.md).
- A arquitetura corrente tem um [mapa próprio](../produto/arquitetura.md). Documentos iniciais e handoff antigo foram arquivados em [docs/init](../init/README.md); a consolidação e seus limites constam de [RL-002](../revisoes/002-consolidacao-acervo.md).
- Documentos ativos agrupados por assunto e nomes uniformizados em [RL-003](../revisoes/003-organizacao-documentacao.md); `docs/index.md` permanece a entrada da documentação.

## Estado técnico herdado, sem reexecução nesta entrega

O [plano de correção](../planejamento/plano-correcao.md) e o [registro da fase 1](../planejamento/correcao-fase-1.md) relatam correções C1–C4, 160 testes, auditoria, TypeScript, build e verificações de scanner/sincronização. Esses resultados são históricos; não foram reexecutados para editar Markdown.

A [RL-004](../revisoes/004-verificacao-candidata.md) registra a verificação da candidata para revisão pessoal em 30/10/2026, separando testes técnicos, conteúdo clínico pendente e limitações do teste visual. Consulte o Git e o pipeline para saber se houve integração e publicação após essa verificação.

A fase 1 continua com conclusão clínica pendente. Fases 2 e 3 do plano conectado não são declaradas concluídas. Offline integral permanece adiado. Não foi verificado nesta entrega o estado publicado, instaladores Android ou integração real com aplicativos externos de IA.

## Próximas escolhas

1. Revisar a contextualização e as propostas registradas, corrigindo qualquer interpretação de intenção.
2. Priorizar P-001: definir representação da evidência e síntese em um piloto pequeno, antes de reclassificar toda a base.
3. Em conjunto, decidir P-002/P-003: comportamento por fluxo e comunicação de risco versus falta de informação.
4. Transformar cada decisão aprovada em revisão local com critérios de aceite. Conciliar seu escopo com o plano de correção, sem marcar etapas anteriores como concluídas por associação.

Pendência principal: critérios clínicos e resolução das divergências. A organização documental permite continuar a pesquisa e a revisão, mas não elimina essa dependência.
