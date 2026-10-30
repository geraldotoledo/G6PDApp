# RL-001 — Estruturação documental simplificada

- Data: 30/10/2026.
- Categoria: `documentation_governance_only`.
- Execução: implementada; validação documental concluída com ressalva na comparação de hashes descrita abaixo.
- Revisão humana: pendente; não presumida pela autorização de execução.
- Revisão clínica: não realizada; esta entrega não altera classificações.
- Publicação: não realizada.

## Problema, autorização e base observada

Documentos numerados misturavam desenho inicial, execução e correções; o README ainda afirmava offline integral e agrupava fontes clínicas como consensos. Faltava rota simples para propostas, decisões e avaliação local.

Autorização: pedido do responsável para implementar a organização documental e usar a conversa inicial Gemini/Agy na contextualização. Vínculo: [D-001](../governanca/decisoes.md). Propostas funcionais permanecem pendentes.

Base recuperada pelo Memorix: branch `master`, HEAD abreviado `406ec3e`, checkout alterado. `git status --short` confirmou alterações preexistentes em base, motor, scanner, sincronização, testes, scripts, pacote e documentos. Não foram incorporadas como trabalho desta revisão.

## Antes e depois

Antes: entrada pelo README com promessas antigas e índice parcial. Depois: leitura por assunto, contexto de produto, estado com limites, decisões aprovadas separadas de propostas e modelo de revisão local. Os documentos 01–08 permanecem preservados, com alcance explicado no índice.

## Plano e critérios de aceite

1. Inventariar documentação e recuperar intenção original sem copiar dados pessoais.
2. Definir referências por assunto, processo mínimo e estados separados.
3. Consolidar propostas e registrar apenas a decisão documental autorizada.
4. Corrigir a entrada do projeto, verificar links/consistência e preservação.

- [x] Contexto diferencia necessidade do usuário de sugestões e promessas dos assistentes.
- [x] Índice identifica documentação vigente, histórico e conflitos conhecidos.
- [x] Processo cobre discussão, decisão, implementação, revisão e passagem de contexto.
- [x] Propostas funcionais não aparecem como aprovadas/implementadas.
- [x] Links locais novos/alterados verificados: 51 destinos existentes em nove documentos.
- [ ] Comparação SHA-256 dos arquivos preexistentes: não concluída, pois a baseline temporária não ficou acessível na chamada seguinte.
- [x] Escopo e formatação verificados; alterações preexistentes continuam listadas, sem novos caminhos de runtime modificados nesta tarefa.

## Arquivos desta entrega

- Alterado: `README.md`.
- Criados: `AGENTS.md`, `CONTRIBUTING.md`, `docs/index.md`, `docs/contexto-do-produto.md`, `docs/estado-atual.md`, `docs/decisoes.md`, `docs/propostas.md` e este registro.

Nenhum arquivo de runtime, base clínica, teste, dependência ou configuração de publicação faz parte desta mudança.

## Execução e evidências

- Leitura dirigida do anexo de origem: motivação, requisitos de acesso/custo/IA e narrativa histórica; não se declara auditoria de todas as afirmações ou referências do anexo.
- Leitura do README, partes pertinentes de docs/01, docs/02, docs/05, docs/06 e docs/08; inventário dos oito documentos.
- Contagem direta do JSON: versão 2026.10.3, 7 regras `DOCUMENTED` e 64 `PENDING_REVIEW`.
- Baseline SHA-256 de 50 arquivos preexistentes em docs, src, tests, scripts, public, .github e manifests de pacote, para comparação após a mudança. Baseline temporária fora do repositório.
- Verificador local em Node: nove documentos, 51 links locais e oito IDs de proposta (P-001 a P-008); nenhum link inexistente, espaço final ou ocorrência dos padrões pessoais/locais pesquisados. A inspeção editorial também preservou o contexto sem copiar a transcrição.
- `git diff --check -- README.md`: sem erros de whitespace. Git avisou sobre futura conversão LF/CRLF; nenhum ajuste de configuração foi feito. Nos arquivos novos, a checagem de whitespace foi feita pelo verificador local, pois ainda não são rastreados.
- `git status --short` antes/depois: única alteração adicional em arquivo já rastreado foi README; oito documentos novos fazem parte desta entrega. Os demais caminhos alterados já apareciam no estado inicial. Isso verifica escopo, não identidade byte a byte.
- A tentativa de comparar SHA-256 falhou com `ENOENT` ao reabrir a baseline temporária; a busca limitada pelo mesmo nome não a encontrou. Não declarar a comparação como aprovada. As edições desta tarefa se limitaram aos nove arquivos explicitados acima.
- Retentativa em 30/10/2026 após mudança para acesso completo: a baseline não foi localizada nos diretórios temporários consultados nem no caminho informado no erro anterior. Não há base para concluir por que está ausente. O `git status --short` continua listando os mesmos caminhos registrados após a entrega, o que não comprova igualdade de conteúdo. A comparação SHA-256 permanece pendente por falta da referência anterior.

Testes de runtime, auditoria, TypeScript e build omitidos: não há alteração executável e o build escreve a cópia pública da base. Não houve consulta externa para revalidar fontes clínicas, teste móvel, verificação de produção ou revisão completa do acervo histórico.

## Avaliação e passagem

Comentários humanos: pendentes. Nenhuma aprovação clínica ou editorial inventada.

Próxima ação: revisar contexto e P-001/P-002/P-003 para escolher o primeiro piloto, sem aprovar em bloco todas as propostas. A arquitetura inicial ainda precisa de revisão futura vinculada às decisões de produto e evidência.

Não realizados: instalação, commit, push, PR remoto, merge, publicação, alteração de classificação clínica ou cópia da transcrição privada. As alterações preexistentes continuam sob responsabilidade do trabalho anterior.
