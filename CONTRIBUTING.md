# Como evoluir o G6PDApp

Este processo é local e simples: Markdown, mudanças pequenas e evidências verificáveis. Não exige plataforma de tarefas, automação adicional ou PR remoto.

## 1. Onde registrar

O [índice](docs/index.md) indica um documento responsável por cada assunto. Atualize esse documento; resumos devem apontar para ele, sem criar novas definições concorrentes.

| Registro | Conteúdo |
| --- | --- |
| [Contexto](docs/produto/contexto.md) | Motivação, público, objetivos e limites de produto |
| [Propostas](docs/governanca/propostas.md) | Discussão, alternativas, dúvidas e critérios de aceite; IDs P-xxx |
| [Decisões](docs/governanca/decisoes.md) | Escolha aprovada, responsável, data, motivo e consequências; IDs D-xxx |
| [Revisões locais](docs/revisoes/001-estrutura-documental.md) | Escopo executável, avaliação, arquivos e evidência; IDs RL-xxx |
| [Estado atual](docs/governanca/estado-atual.md) | Síntese de onde estamos e próxima ação, com referências |

## 2. Da conversa à implementação

1. Registrar a proposição com origem, necessidade, alternativas e perguntas. Distinguir pedido do usuário, sugestão de IA, observação, evidência e interpretação.
2. Submeter a escolha concreta à revisão. O responsável pelo produto aprova comportamento e escopo; afirmações clínicas exigem fontes aplicáveis e, onde necessário, reconciliação por profissional habilitado. Não presumir que revisão clínica ocorreu.
3. Registrar a decisão somente quando houver aprovação identificável. Estados de proposta: `em discussão`, `em revisão`, `aprovada`, `rejeitada`, `adiada`, `substituída`. Decisões aprovadas podem ser substituídas, com vínculo e justificativa preservados.
4. Abrir uma revisão local usando o modelo abaixo. Uma solicitação explícita de implementação pode autorizar o escopo correspondente; não autoriza automaticamente outras propostas ou publicação.
5. Executar uma mudança pequena, verificar os critérios e registrar resultado. Atualizar documentos afetados e o estado atual. Memorix pode guardar síntese e ponteiros quando autorizado, sem duplicar a documentação.
6. Manter estados de execução separados: `não iniciada`, `em execução`, `implementada`, `validada tecnicamente`. Registrar revisão clínica e publicação em campos próprios. Aprovação, implementação e publicação não são sinônimos.

## 3. Atualização e conservação

- Cada decisão/revisão informa data e evidência de aprovação. Não inventar autor, data de publicação da fonte, revisão médica ou hash.
- Em uma mudança de regra, registrar documento, edição/data, trecho, escopo (dose, via, população e formulação), interpretação e substituição explícita da posição anterior.
- Não transferir automaticamente classificações de uma categoria ou instituição para outra. Divergências permanecem visíveis até decisão fundamentada.
- Atualizar somente documentos cujo significado mudou. Documentos históricos em `docs/init/` preservam seu contexto; movimentos ou remoções exigem autorização, verificação e atualização das referências.
- Encerrar cada bloco com realizado, arquivos, verificações/resultados, pendências e próxima ação. Essa regra complementa o registro já previsto em docs/planejamento/plano-correcao.md.
- Revisão periódica da base é objetivo; periodicidade, responsáveis e execução devem ser decididos e registrados. Não anunciar atualização automática sem mecanismo verificado.

## 4. Validação proporcional

Classifique cada mudança em exatamente uma categoria: `documentation_governance_only`, `support_tooling_only`, `localized_runtime_change`, `cross_cutting_or_critical_runtime_change` ou `pre_merge_or_release_validation`.

Para documentação: verificar links locais, consistência de estados/IDs, escopo do diff e ausência de dados pessoais novos. Não executar build, auditoria clínica ou testes de runtime apenas por editar Markdown.

Para código: escolher testes focais ligados ao comportamento alterado. `npm test`, `npm run audit`, `npx tsc --noEmit` e `npm run build` têm finalidades diferentes; o build inclui sincronização da base e pode escrever arquivos. Só executar o necessário e autorizado.

Uma suíte completa exige alteração compartilhada, risco transversal concreto, falha focal que exponha risco maior, gate de pré-merge/release ou pedido explícito. Antes de executar, declarar: `Full suite justified because: <motivo técnico concreto>`.

## 5. Modelo único de revisão local

Criar `docs/revisoes/NNN-assunto.md` somente quando houver uma mudança concreta a avaliar. Linkar evidências existentes; não copiar logs inteiros nem a conversa.

```markdown
# RL-NNN — Título
Data:
Categoria:
Estado de execução:
Revisão humana: pendente / aprovada / mudanças solicitadas (autor e data)
Revisão clínica: não se aplica / pendente / realizada (referência)
Publicação: não realizada / realizada (evidência)

## Problema, autorização e vínculos
Pedido que autoriza o escopo; propostas P-xxx e decisões D-xxx.
Base observada: branch/HEAD, alterações preexistentes relevantes.

## Antes e depois
Comportamento/documentação atual e resultado esperado.

## Escopo e critérios de aceite
Arquivos pretendidos, limites e critérios observáveis.
Plano em passos pequenos; dependências ou decisões que impedem avançar.

## Execução e evidências
Arquivos efetivamente alterados; diff ou referência local.
Verificações executadas e resultados; verificações omitidas e motivo.

## Avaliação
Comentários do revisor, resposta e resolução; não preencher aprovação por ele.

## Passagem de contexto
Pendências, riscos, próxima ação concreta e ações protegidas não realizadas.
```
