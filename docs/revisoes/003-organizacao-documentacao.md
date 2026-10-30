# RL-003 — Organização da documentação por assunto

- Data: 30/10/2026; categoria: `documentation_governance_only`.
- Autorização: pedido explícito para uniformizar nomes e evitar arquivos na raiz de `docs/` quando não necessários; decisão [D-002](../governanca/decisoes.md).
- Execução: implementada; revisão humana pendente. Revisão clínica: não realizada. Publicação: não realizada.
- Base observada: branch `master`, HEAD `406ec3e`, checkout com alterações preexistentes. A [RL-001](001-estrutura-documental.md) mantém sua ressalva sobre a baseline anterior indisponível.

## Mapeamento dos documentos ativos

| Nome anterior na raiz `docs/` | Nome atual |
| --- | --- |
| `contexto-do-produto.md` | [produto/contexto.md](../produto/contexto.md) |
| `arquitetura.md` | [produto/arquitetura.md](../produto/arquitetura.md) |
| `02-base-clinica-referencia.md` | [clinica/base-clinica.md](../clinica/base-clinica.md) |
| `05-plano-correcao-achados-avaliacao.md` | [planejamento/plano-correcao.md](../planejamento/plano-correcao.md) |
| `06-checklist-implementacao-3-fases.md` | [planejamento/checklist-correcao.md](../planejamento/checklist-correcao.md) |
| `08-2a-correcao-da-fase-1.md` | [planejamento/correcao-fase-1.md](../planejamento/correcao-fase-1.md) |
| `estado-atual.md` | [governanca/estado-atual.md](../governanca/estado-atual.md) |
| `propostas.md` | [governanca/propostas.md](../governanca/propostas.md) |
| `decisoes.md` | [governanca/decisoes.md](../governanca/decisoes.md) |

`docs/index.md` permanece na raiz como roteador. `docs/init/` mantém os nomes históricos; `docs/revisoes/` e os IDs P/D/RL permanecem estáveis. Os registros RL-001 e RL-002 descrevem a organização no momento de sua execução, com caminhos históricos; este mapa é a atualização.

## Execução e verificação

- Os nove arquivos foram movidos sem sobrescrita; o SHA-256 de cada um foi comparado imediatamente antes e depois do movimento, antes das edições de links e referências.
- Links relativos e referências textuais foram atualizados no README, documentos ativos, índices e avisos históricos. Os registros históricos não passaram a comprovar fatos clínicos por terem sido movidos.
- Um agente auxiliar fez inventário somente de leitura: não identificou referências aos documentos em `src/`, `tests/`, `scripts/` ou `package.json`; alterações foram feitas sequencialmente pelo agente principal.
- Em 21 documentos Markdown, 137 destinos locais foram verificados: nenhum quebrado ou `file://` legado. A raiz de `docs/` contém somente `index.md`.
- Foram comparados por SHA-256 118 arquivos fora do escopo, incluindo código, testes, regras, configurações e pacote de transferência: nenhuma divergência. Esta referência é desta tarefa e não recupera a baseline anterior da RL-001.
- A comparação da base clínica com a fotografia já existente mostrou apenas alteração do título e da referência ao registro da fase 1. `git diff --check -- README.md` não apontou erro; Git avisou sobre possível conversão LF/CRLF.
- Sem staging, o Git mostra remoções nos nomes antigos rastreados e arquivos não rastreados nas novas pastas; os conteúdos foram movidos, não descartados. O checkout já tinha alterações independentes.

## Limites e passagem

Nenhuma classificação clínica, código executável, dado de aplicativo ou pacote de transferência faz parte desta mudança. Testes de runtime e build não são exigidos por esta alteração documental. Sem instalação, commit, push ou publicação.

Próximo passo de produto: discutir as propostas e a reconciliação clínica pendente. A revisão humana desta reorganização permanece pendente.
