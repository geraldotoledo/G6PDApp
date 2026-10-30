# RL-002 — Consolidação do acervo documental

- Data: 30/10/2026; categoria: `documentation_governance_only`.
- Autorização: o responsável pediu revisar, incorporar o necessário, remover apenas o que estivesse integralmente incorporado e mover remanescentes históricos para `docs/init` ou equivalente.
- Estado: implementado; revisão humana pendente. Revisão clínica: não realizada. Publicação: não realizada.
- Base: branch `master`, HEAD `406ec3e`, com alterações preexistentes em documentos, código, regras, testes e pacote de transferência. A ressalva da [RL-001](001-estrutura-documental.md) sobre sua baseline indisponível permanece.

## Avaliação e destino

| Origem | Resultado |
| --- | --- |
| 01 — desenho inicial | Preservado em `docs/init/`; intenções e limites incorporados ao contexto, às propostas e ao novo mapa `docs/arquitetura.md`. Garantias e classificações antigas não foram promovidas como fatos. |
| 03 — plano inicial de cinco fases | Preservado em `docs/init/`; o plano vigente de correção é 05. A cronologia original continua consultável. |
| 04 — pontos de controle iniciais | Preservado em `docs/init/`; as marcas de execução antigas não substituem os achados e evidências de 05/08. |
| 07 — handoff anterior | Preservado em `docs/init/`; plano e achados atuais estão em 05/08 e no estado atual. Detalhes circunstanciais da avaliação antiga ainda têm valor histórico e não foram integralmente incorporados; por isso não foi apagado. |
| 02, 05, 06 e 08 | Permanecem referências ativas na raiz de `docs/`; 05 e 06 tiveram apenas as referências e tarefas documentais adaptadas à nova localização. |
| Pacote de transferência | Mantido intacto como fotografia independente, com seu próprio manifesto e limitações; não equivale à sessão OMP integral nem à documentação corrente. |

Nenhum arquivo histórico foi removido: a incorporação é seletiva e não se comprovou que todo conteúdo histórico fosse dispensável. Não se deve entender a mudança de pasta como aprovação dos conteúdos antigos.

## Execução e proteção

- Os quatro arquivos movidos foram comparados por SHA-256 com suas cópias preexistentes no pacote de transferência e tiveram os hashes conferidos imediatamente após cada movimento; os quatro coincidiram. Essa verificação é específica desta movimentação e não recupera a baseline ausente da RL-001.
- Após a verificação, os quatro receberam aviso histórico; 03 e 07 tiveram referências locais e identificadores omitidos na cópia arquivada. Os originais conferidos no pacote de transferência não foram editados.
- Atualizados: `CONTRIBUTING.md`, `docs/index.md`, `docs/estado-atual.md`, referências dos documentos 05/06 e os quatro arquivos arquivados. Criados: `docs/arquitetura.md`, `docs/init/README.md` e esta revisão.
- Um conjunto de 125 arquivos fora do escopo, incluindo fontes, testes, regras e pacote de transferência, foi comparado por SHA-256 com a referência capturada em memória antes do movimento: nenhuma divergência. A referência é desta tarefa, não a baseline perdida da RL-001.
- Arquitetura fundamentada em leitura estática das entradas e serviços relevantes. Não houve reclassificação clínica, implementação funcional ou avaliação de dispositivo.

## Verificações e passagem

- Os 37 links `file://` do checklist 06 foram convertidos para caminhos relativos ao repositório. Verificação em 20 documentos Markdown: 115 destinos locais existentes, nenhum `file://` remanescente e nenhum link local quebrado detectado.
- `git diff --check` da alteração rastreada do README não apontou erros de whitespace; Git informou possível conversão LF/CRLF. Os documentos ainda não rastreados exigem verificação textual própria.
- Omitidos testes de runtime, auditoria clínica, build e testes móveis: esta alteração é documental e não os demonstra. Sem instalação, commit, push, PR remoto ou publicação.
- Próxima ação de produto: discutir P-001/P-002/P-003 e critérios de revisão clínica. O projeto ainda tem 64 regras com `PENDING_REVIEW` segundo o registro de base da entrega anterior; não se afirma revisão clínica nesta tarefa.
