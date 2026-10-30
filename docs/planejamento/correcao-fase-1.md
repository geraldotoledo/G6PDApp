# 2a correção da fase 1

## 1. Erros que motivam esta correção

A validação independente da primeira implementação encontrou cinco pendências. Os 19 testes existentes, o auditor e a checagem TypeScript passaram, mas os cenários adicionais abaixo impedem declarar a fase 1 integralmente concluída.

| ID | Prioridade | Erro confirmado | Resultado necessário |
| :--- | :--- | :--- | :--- |
| C1 | Alta | `Excipientes: q.s.p. 1 comprimido.` recebe `GREEN_SAFE` e completude verdadeira, sem substância listada | Leitura incompleta; não aprovar |
| C2 | Alta | Tokens como `###` ou `@@` no interior da lista são diluídos pelo limite global de ruído e a lista recebe verde | Ilegibilidade relevante na lista impede aprovação |
| C3 | Alta | Base com `eNumber: {}` passa na validação e causa `rule.eNumber.toLowerCase is not a function`; datas impossíveis e IDs repetidos na whitelist também são aceitos | Rejeitar payload inválido antes da ativação |
| C4 | Média | Falha ao gravar a última verificação faz a sincronização retornar falha/versão antiga apesar de a nova base já estar ativa | Retorno, persistência e base ativa devem representar a mesma operação |
| C5 | Média | Nenhuma das 71 regras avaliadas preenche `sourceRef` ou `evidenceKind`; referências genéricas e pendências ausentes não sustentam a declaração de proveniência concluída | Evidências vinculadas, verificáveis e pendências explícitas |

**Registro de origem:** Memorix do projeto G6PDApp, observação **#753**, “Fase 1 parcialmente validada: cinco pendências confirmadas”. O registro anterior de conclusão, inclusive memória #752 e checklist docs/planejamento/checklist-correcao.md, não substitui esta validação.

As referências de arquivo e linha abaixo pertencem ao estado avaliado. Conferir a implementação atual antes de editar.

## 2. Escopo e instruções ao executor

- **Projeto:** G6PDApp no diretório do repositório.
- **Executor previsto:** Terra ou agente designado pelo usuário.
- **Estado:** executado no escopo técnico; C1–C4 corrigidos e verificados. C5 tem estrutura e registro documental implementados, com 64 pendências clínicas explícitas; não há conclusão clínica integral.
- **Objetivo:** resolver C1–C5 e revalidar a fase 1, sem iniciar entregas das fases 2 e 3.
- **Offline permanece adiado.** Não empacotar modelos, implementar cache offline completo ou exigir modo avião nesta correção.
- Assinatura criptográfica e integração reativa das telas continuam no escopo posterior definido no plano principal; não acrescentá-las como requisito desta correção.
- Preservar as correções que já passaram: códigos INS e homóglifos, distinção sulfato/sulfito e K1/K3, cobertura adicionada, precedência contextual e separação princípio ativo/apresentação.
- Ler `docs/planejamento/plano-correcao.md` e os critérios da fase 1 em `docs/planejamento/checklist-correcao.md`, além deste documento. Não marcar conclusão apenas porque comandos passaram.
- Não apagar dados da família, instalar ferramentas globais/SDK Android local, alterar segurança da máquina ou executar commit/push/deploy automaticamente.

## 3. Ordem de execução

1. Corrigir C1 e C2 no validador de completude.
2. Corrigir C3 no contrato e na validação estrutural.
3. Corrigir C4 na persistência da sincronização.
4. Resolver C5 no catálogo, nas referências e no auditor; pesquisa de fontes pode ocorrer independentemente dos três blocos técnicos anteriores.
5. Executar aceitação integrada, atualizar os registros com evidência e encerrar somente o que estiver efetivamente concluído.

Cada bloco deve incluir sua regressão e execução dirigida. A verificação integrada ao final não substitui verificar cada mudança durante o trabalho.

## 4. C1 — Validar excipientes quando forem a âncora inicial

**Arquivos principais:** `src/engine/completenessGate.ts`, `src/engine/types.ts` se necessário e `tests/ruleEngine.test.ts`.

**Causa identificada:** a limpeza de termos de apresentação/unidade é aplicada à seção encontrada depois de `Composição`, mas não quando a captura começa diretamente por `Excipientes` ou `Veículo` (`completenessGate.ts:70–82,121–130`).

### Implementação

- [x] Determinar a seção efetivamente avaliada tanto para `Composição` seguida de excipientes quanto para `Excipientes`/`Veículo` como início da captura.
- [x] Aplicar a mesma regra de conteúdo real às duas entradas, sem duplicar implementações divergentes.
- [x] Desconsiderar `q.s.p.`, unidades, números e termos de apresentação ao decidir se há substâncias listadas. Não introduzir um catálogo fechado de ingredientes como requisito para toda completude.
- [x] Não contar textos posteriores, como registro, instruções de uso ou identificação do fabricante, como ingredientes que preencham uma seção vazia.
- [x] Manter a análise de restrições mesmo quando a completude falhar: substância restrita detectada continua bloqueando.

### Aceitação

- `Excipientes: q.s.p. 1 comprimido.` → `YELLOW_INCOMPLETE_SCAN`.
- A mesma entrada seguida de `Registro MS 123` → leitura incompleta.
- `Veículo: q.s.p. 5 mL. Registro MS 123` → leitura incompleta.
- `Composição: amoxicilina. Excipientes:` e a variante com apenas q.s.p. continuam incompletas.
- `Excipientes: água purificada, sacarose. Registro MS 123` possui conteúdo real e pode passar na completude, sem que isso dispense as outras condições de aprovação.
- Excipiente restrito em texto parcial continua produzindo `RED_BLOCKED`.

## 5. C2 — Rejeitar corrupção relevante dentro da lista

**Arquivos principais:** `src/engine/completenessGate.ts` e `tests/ruleEngine.test.ts`.

**Causa identificada:** apenas `??` e U+FFFD têm rejeição explícita; outras sequências já reconhecidas como ruído dependem de ultrapassar 15% dos tokens (`completenessGate.ts:109–145`).

### Implementação

- [x] Avaliar ilegibilidade relevante no trecho da lista de ingredientes/excipientes, não apenas por razão global.
- [x] Impedir aprovação com sequências de corrupção como `###` e `@@` nesse trecho, independentemente de quanto texto legível exista ao redor.
- [x] Preservar pontuação e notações legítimas: vírgulas, parênteses, hífens, barras, percentuais, números e abreviaturas não podem virar erro indiscriminadamente.
- [x] Produzir motivo de incompletude coerente com a corrupção encontrada.
- [x] Manter a precedência de bloqueio quando uma substância restrita for detectada junto do trecho ilegível.

### Aceitação

- `Ingredientes: farinha, açúcar, ###, óleo, água, leite, sal. ALÉRGICOS: CONTÉM LEITE.` → não verde.
- Variante com `@@` → não verde.
- Variantes com `???` e U+FFFD continuam incompletas.
- Lista legível com percentuais e códigos INS entre parênteses não é rejeitada apenas pela pontuação.
- Marcador de ruído com tartrazina identificada → vermelho no perfil brasileiro, não apenas amarelo.

## 6. C3 — Validar todo campo consumido e a integridade referencial

**Arquivos principais:** `src/services/rulesSync.ts`, `src/engine/types.ts`, `scripts/audit-rules.ts` e testes de validação conforme a organização existente.

**Causa identificada:** a validação deixa passar tipos inválidos em campos opcionais usados pelo motor; a data só tem formato verificado; a whitelist verifica termos repetidos, mas não IDs (`rulesSync.ts:98–147`).

### Implementação

- [x] Conferir todos os campos do contrato consumidos pelo motor, pelas telas e pelo auditor. Campo opcional pode estar ausente; quando presente deve ter o tipo e formato previstos.
- [x] Validar, em particular, `insCode`, `eNumber`, `isAmbiguous`, `pediatricSyrupWarning` e demais campos definidos no contrato, sem coerção silenciosa de objetos ou valores arbitrários.
- [x] Validar `updatedAt` como data de calendário real; não aceitar apenas por corresponder ao padrão YYYY-MM-DD.
- [x] Garantir unicidade dos IDs da whitelist e das regras, mantendo também as verificações de termos seguros repetidos.
- [x] Validar os vínculos e enums de proveniência definidos em C5; rejeitar referência a fonte inexistente.
- [x] Aplicar o mesmo validador à base embutida durante auditoria, à base persistida e ao payload remoto antes da ativação.
- [x] Não corrigir o problema envolvendo o motor em um catch que silencie a exceção ou transforme entrada inválida em verde.

### Aceitação

- Cópia da base com `eNumber: {}` é rejeitada; análise continua usando base válida sem exceção.
- Valores de tipo inválido em `insCode` e `isAmbiguous` são rejeitados.
- `updatedAt: "2026-99-99"` e datas como 30 de fevereiro são rejeitadas; datas válidas, incluindo 29 de fevereiro em ano bissexto, são aceitas.
- IDs repetidos na whitelist são rejeitados.
- Regra sem `riskLevel` ou `synonyms`, schema incompatível e versão malformada continuam rejeitados.
- Base de fábrica e cópia pública corrigidas passam no mesmo contrato; referência clínica inexistente não passa no auditor.

## 7. C4 — Tornar o resultado da sincronização coerente com a ativação

**Arquivos principais:** `src/services/rulesSync.ts` e testes de sincronização com transporte e armazenamento isolados.

**Causa identificada:** a nova base é gravada antes do metadado de última verificação; se a segunda gravação falha, o tratamento geral retorna a versão anterior embora a nova já seja ativa (`rulesSync.ts:196–229`).

### Decisão de implementação

Adotar a solução mínima: a gravação bem-sucedida da base validada é o ponto de confirmação da atualização. O metadado da última verificação não deve reclassificar essa atualização como fracassada. A API deve distinguir falha de ativação de falha de metadado sem informar estado que não existe.

Não introduzir armazenamento novo ou simular atomicidade entre duas operações de localStorage.

### Implementação

- [x] Definir explicitamente o ponto de confirmação da atualização e calcular o retorno a partir do estado realmente persistido.
- [x] Se falhar a gravação da base, manter a anterior e informar atualização não realizada.
- [x] Se a base for persistida e falhar apenas o metadado, informar a atualização efetiva e identificar a falha secundária, sem reportar a versão antiga como ativa.
- [x] Evitar mensagem genérica de erro de rede para falha de armazenamento.
- [x] Preservar a base válida em payload inválido, falha de download e erro de leitura do armazenamento.

### Aceitação

Partindo de base válida `2026.10.2` e payload válido `2026.10.3`:

| Falha simulada | Base ativa ao final | Resultado da operação |
| :--- | :--- | :--- |
| Nenhuma | 2026.10.3 | Atualização confirmada |
| Gravação da base | 2026.10.2 | Atualização não realizada; erro de persistência |
| Somente gravação da última verificação | 2026.10.3 | Atualização confirmada; falha secundária identificada |
| Payload inválido | 2026.10.2 | Atualização rejeitada |
| Rede indisponível | 2026.10.2 | Sem atualização; erro de comunicação |

Executar com armazenamento em memória e respostas controladas para não alterar dados reais nem depender da rede pública.

## 8. C5 — Completar proveniência e corrigir a declaração de conclusão

**Arquivos principais:** `src/data/rules.json`, cópia pública gerada, `src/engine/types.ts`, `src/services/rulesSync.ts`, `scripts/audit-rules.ts`, `docs/clinica/base-clinica.md`, registros de execução em `docs/planejamento/plano-correcao.md` e `docs/planejamento/checklist-correcao.md`.

**Estado constatado:** 0/71 regras com `sourceRef` e 0/71 com `evidenceKind`. As fontes brasileiras ainda usam portais institucionais e descrições genéricas. Adicionar nomes de campos não cria evidência verificável.

### Implementação

- [ ] Conferir cada classificação contra fontes recuperáveis; priorizar as regras adicionadas nesta fase, sem declarar as demais auditadas por associação.
- [x] Preencher o vínculo por regra e a natureza de evidência, usando o contrato existente. As fontes candidatas de regras pendentes não são apresentadas como suporte clínico confirmado.
- [ ] Fornecer título identificável, edição/data real, URL do documento e localização da recomendação. Não inventar páginas, títulos ou atribuições institucionais.
- [x] Manter separados identificação química/INS, restrição preventiva e evidência de hemólise. Uma fonte que identifica um aditivo não comprova, sozinha, seu risco clínico em G6PD.
- [x] Registrar pendências por regra: classificação em questão, evidência disponível, fonte faltante e decisão clínica necessária. Não alterar classificações por inferência médica do agente.
- [x] Exigir integridade entre referências das regras e fontes no validador e no auditor. Referências genéricas permanecem identificadas como candidatas em pendências.
- [x] Ajustar o relatório do auditor para distinguir integridade estrutural, vínculo documental e pendência clínica; strings preenchidas não autorizam a mensagem de proveniência clinicamente validada.
- [x] Gerar a base pública pela fonte autoritativa e verificar paridade.
- [x] Atualizar docs/planejamento/plano-correcao.md e docs/planejamento/checklist-correcao.md com evidências e pendências reais; retirar a declaração indevida de conclusão integral.

### Aceitação

- Regras têm natureza da evidência e referências válidas, sem vínculos órfãos.
- Referências permitem recuperar o trecho utilizado, não apenas chegar à página inicial de uma instituição.
- Qualquer pendência clínica está individualizada e não é apresentada como aprovação profissional.
- Remover vínculo de uma regra, usar ID de fonte inexistente ou enum de evidência inválido é detectado pela verificação apropriada.
- Uma pendência clínica pode permanecer como bloqueio externo declarado, mas a fase não pode ser anunciada integralmente concluída enquanto seu critério de proveniência não estiver satisfeito.

## 9. Verificação final e critério de encerramento

- [x] Executar as regressões de C1–C4; os casos anteriores estavam confirmados na avaliação #753, e os resultados corrigidos foram observados.
- [x] Executar `npm test` (160/160), `npm run audit` (aprovação técnica com bloqueio clínico explícito) e `npx tsc --noEmit`.
- [x] Conferir paridade das bases; ensaios de persistência usaram armazenamento isolado, sem dados reais da família.
- [x] Exercitar os rótulos de C1 e C2 no scanner real, observando motivo de incompletude e ausência de opção de salvar como aprovado.
- [x] Exercitar ativação/rejeição e falhas de persistência: regressões isoladas e ensaio de sincronização com servidor HTTP local.
- [x] Validar o relatório documental de C5, distinguindo resultado automatizado de revisão humana das fontes.
- [x] Preservar as 19 regressões anteriores de comportamento; retirar apenas duas asserções de redação incidental no teste de duplo veredito.
- [x] Registrar ambiente e limitações: Chromium gerenciado em viewport móvel e servidor Vite local; sem comprovação Android, foto real ou aprovação médica nesta correção.
- [x] Encerrar servidor HTTP descartável, fechar aba de ensaio e manter apenas regressões e scripts de geração necessários.

**Conclusão técnica:** C1–C4 corrigidos e exercitados, sem regressão conhecida nos critérios da fase 1.

**Conclusão integral da fase 1:** conclusão técnica mais C5 satisfeito e registros coerentes. Se faltar fonte ou revisão profissional necessária, finalizar todo o trabalho alcançável e informar o bloqueio; não declarar conclusão integral.

**Não são critérios desta correção:** modo avião, OCR inicialmente offline, cache PWA completo, ML Kit, assinatura de produção, APK/AAB ou aprovação das fases 2/3.

## 10. Registro de execução — preencher durante a implementação

| Bloco | Estado | Arquivos alterados | Evidências exercitadas | Pendências |
| :--- | :--- | :--- | :--- | :--- |
| C1 — Excipientes como âncora inicial | Corrigido e verificado | `completenessGate.ts`, `tests/completenessGate.test.ts` | Q.s.p., veículo, instruções e registros posteriores não preenchem lista vazia; scanner exibiu incompletude | Sem pendência técnica conhecida nos casos cobertos |
| C2 — Corrupção no interior da lista | Corrigido e verificado | `completenessGate.ts`, `ScannerScreen.tsx`, regressões de completude | ###/@@/???/U+FFFD impedem aprovação; pontuação legítima preservada; tartrazina com ruído bloqueia | Sem pendência técnica conhecida nos casos cobertos |
| C3 — Schema e tipos consumidos | Corrigido e verificado | `rulesSync.ts`, `types.ts`, `tests/rulesSync.test.ts` | Payloads inválidos, datas impossíveis, IDs, opcionais e vínculos rejeitados antes da ativação | Revisão médica não é responsabilidade do validador estrutural |
| C4 — Coerência da persistência | Corrigido e verificado | `rulesSync.ts`, `tests/rulesSync.test.ts` | HTTP local: sucesso → versão nova; falha da base → versão anterior; falha do metadado → sucesso/versão nova com aviso | Sem pendência técnica conhecida na matriz exercitada |
| C5 — Proveniência e registros | Estrutura e pesquisa executadas; clínica pendente | Bases v2026.10.3, `types.ts`, auditor, `scripts/sync-rules.ts`, `package.json`, `tests/provenance.test.ts`, base clínica, plano, checklist e correção | 71 vínculos válidos, 7 DOCUMENTED, 64 PENDING_REVIEW com notas individuais; fontes primárias recuperadas e divergências registradas | Faltam documentos específicos e/ou reconciliação por profissional habilitado para as 64 pendências de docs/clinica/base-clinica.md |
| Aceitação final | Técnica aprovada; fase 1 integral não concluída | Suíte, auditor, build e registros | 160/160 testes; auditor técnico aprovado; TypeScript e build/prebuild aprovados; scanner no navegador sem erros observados | Não constitui certificação clínica, Android ou aceitação das fases 2/3 |

**Passagem de contexto:** bloco atual; correções realizadas; contratos alterados; comandos e cenários executados; resultados observados; fontes verificadas e pendências; próxima ação concreta.

### Evidências desta execução

- Base de regras: **2026.10.3**, 71 regras, 12 entradas de whitelist e 7 fontes.
- `npm test`: **160 testes aprovados**, quatro suítes, sem falhas.
- `npm run audit`: paridade e vínculos aprovados; listou nominalmente as 64 pendências e informou que a fase 1 não está integralmente concluída.
- `npm run build`: aprovado, incluindo a geração validada automática de `public/g6pd_rules.json` pelo `prebuild`; `npx tsc --noEmit` também aprovado.
- Scanner Vite/Chromium: q.s.p. e ###/@@ resultaram em incompletude sem ação de salvar; lista legível passou; tartrazina com ruído resultou em vermelho. Captura visual e console sem erros observados.
- Sincronização via servidor HTTP local e armazenamento em memória: retorno e base ativa concordaram nos três pontos de confirmação/falha de C4.
- Fontes recuperadas e limitações estão em `docs/clinica/base-clinica.md`; classificações clínicas legadas não foram alteradas automaticamente.
- Próxima ação para conclusão integral: revisão das 64 pendências por fontes específicas/profissional responsável. Não iniciar fases posteriores por presunção de aprovação clínica.
